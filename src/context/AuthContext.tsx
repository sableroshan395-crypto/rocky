import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseConfigStatus } from '@/services/firebase';
import { StorageAdapter } from '@/services/storageAdapter';
import { hashPasscode, verifyPasscode, type VerificationResult } from '@/utils/crypto';
import type { StorageMode, LocalSecurityConfig } from '@/types/workspace';

interface AuthContextType {
  storageMode: StorageMode;
  isUnlocked: boolean; // For local mode: unlocked session; For Firebase: user is logged in
  hasLocalPasscode: boolean;
  currentUser: { email?: string; uid?: string; isLocalOwner?: boolean } | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConfigured: boolean;
  missingFirebaseKeys: string[];
  
  // Local Passcode Actions
  setupLocalPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  unlockLocalWorkspace: (passcode: string) => Promise<VerificationResult>;
  resetLocalPasscode: () => void;
  lockSession: () => void;
  
  // Firebase Actions
  loginWithFirebase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const LOCAL_SECURITY_KEY = 'rocky_local_security_v1';
const SESSION_UNLOCKED_KEY = 'rocky_session_unlocked_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [hasLocalPasscode, setHasLocalPasscode] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(LOCAL_SECURITY_KEY));
  });

  const [isLocalSessionUnlocked, setIsLocalSessionUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
  });

  const { missingKeys } = getFirebaseConfigStatus();
  const [storageMode, setStorageMode] = useState<StorageMode>('local');

  // Monitor Firebase Auth
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (user) {
          setStorageMode('firebase');
        } else {
          setStorageMode('local');
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Unlocked if user signed in via Firebase OR unlocked via local passcode
  const isUnlocked = Boolean(firebaseUser) || isLocalSessionUnlocked;

  const currentUser = firebaseUser
    ? { email: firebaseUser.email || undefined, uid: firebaseUser.uid, isLocalOwner: false }
    : isLocalSessionUnlocked
    ? { email: 'owner@local.workspace', uid: 'local_owner_uid', isLocalOwner: true }
    : null;

  // Setup local passcode (Initial setup flow)
  const setupLocalPasscode = useCallback(async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!passcode || passcode.length < 6) {
      return { success: false, error: 'Passcode must be at least 6 characters.' };
    }

    try {
      const { hash, salt } = await hashPasscode(passcode);
      const config: LocalSecurityConfig = {
        passcodeHash: hash,
        salt,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(LOCAL_SECURITY_KEY, JSON.stringify(config));
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
      setHasLocalPasscode(true);
      setIsLocalSessionUnlocked(true);

      StorageAdapter.addAuditLog({
        action: 'auth_unlock',
        entityType: 'auth',
        entityId: 'local_owner',
        details: { action: 'initial_passcode_configured' },
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Encryption failed';
      return { success: false, error: msg };
    }
  }, []);

  // Unlock local workspace
  const unlockLocalWorkspace = useCallback(async (passcode: string): Promise<VerificationResult> => {
    const raw = localStorage.getItem(LOCAL_SECURITY_KEY);
    if (!raw) {
      return { success: false, isLocked: false, failedAttempts: 0 };
    }

    const config: LocalSecurityConfig = JSON.parse(raw);
    const result = await verifyPasscode(
      passcode,
      config.passcodeHash || '',
      config.salt || '',
      config.failedAttempts || 0,
      config.lockUntil
    );

    if (result.success) {
      config.failedAttempts = 0;
      delete config.lockUntil;
      localStorage.setItem(LOCAL_SECURITY_KEY, JSON.stringify(config));
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
      setIsLocalSessionUnlocked(true);

      StorageAdapter.addAuditLog({
        action: 'auth_unlock',
        entityType: 'auth',
        entityId: 'local_owner',
        details: { timestamp: new Date().toISOString() },
      });
    } else {
      config.failedAttempts = result.failedAttempts;
      if (result.isLocked && result.remainingLockSeconds) {
        config.lockUntil = Date.now() + result.remainingLockSeconds * 1000;
      }
      localStorage.setItem(LOCAL_SECURITY_KEY, JSON.stringify(config));
    }

    return result;
  }, []);

  // Reset local passcode (Allows user to reset their lock without losing their data)
  const resetLocalPasscode = useCallback(() => {
    localStorage.removeItem(LOCAL_SECURITY_KEY);
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    setHasLocalPasscode(false);
    setIsLocalSessionUnlocked(false);

    StorageAdapter.addAuditLog({
      action: 'auth_lock',
      entityType: 'auth',
      entityId: 'local_owner',
      details: { action: 'local_passcode_reset' },
    });
  }, []);

  // Lock local workspace
  const lockSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    setIsLocalSessionUnlocked(false);

    StorageAdapter.addAuditLog({
      action: 'auth_lock',
      entityType: 'auth',
      entityId: 'local_owner',
      details: { timestamp: new Date().toISOString() },
    });
  }, []);

  // Firebase login
  const loginWithFirebase = useCallback(async (email: string, pass: string) => {
    if (!auth) return { success: false, error: 'Firebase is not configured.' };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(cred.user);
      setStorageMode('firebase');
      StorageAdapter.addAuditLog({
        action: 'auth_login',
        entityType: 'auth',
        entityId: cred.user.uid,
        details: { email: cred.user.email },
      });
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }, []);

  // Firebase register
  const registerWithFirebase = useCallback(async (email: string, pass: string) => {
    if (!auth) return { success: false, error: 'Firebase is not configured.' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(cred.user);
      setStorageMode('firebase');
      StorageAdapter.addAuditLog({
        action: 'auth_login',
        entityType: 'auth',
        entityId: cred.user.uid,
        details: { email: cred.user.email, isNewUser: true },
      });
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: msg };
    }
  }, []);

  // Universal Logout
  const logout = useCallback(async () => {
    if (firebaseUser && auth) {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
    }
    lockSession();
  }, [firebaseUser, lockSession]);

  return (
    <AuthContext.Provider
      value={{
        storageMode,
        isUnlocked,
        hasLocalPasscode,
        currentUser,
        firebaseUser,
        isFirebaseConfigured,
        missingFirebaseKeys: missingKeys,
        setupLocalPasscode,
        unlockLocalWorkspace,
        resetLocalPasscode,
        lockSession,
        loginWithFirebase,
        registerWithFirebase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
