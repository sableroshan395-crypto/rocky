import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, ShieldCheck, Database, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export const AuthPage: React.FC = () => {
  const {
    hasLocalPasscode,
    setupLocalPasscode,
    unlockLocalWorkspace,
    resetLocalPasscode,
    isFirebaseConfigured,
    missingFirebaseKeys,
    loginWithFirebase,
    registerWithFirebase,
  } = useAuth();

  // Mode tab: 'local' | 'firebase'. Default to 'local' so local passcode is always primary
  const [activeTab, setActiveTab] = useState<'local' | 'firebase'>('local');

  // Local Form state
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Firebase Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

  // Handle Local Passcode Setup
  const handleSetupLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (passcode.length < 6) {
      setLocalError('Passcode must be at least 6 characters long.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setLocalError('Passcodes do not match.');
      return;
    }

    setIsLocalLoading(true);
    const result = await setupLocalPasscode(passcode);
    setIsLocalLoading(false);

    if (!result.success) {
      setLocalError(result.error || 'Failed to set passcode.');
    }
  };

  // Handle Local Passcode Unlock
  const handleUnlockLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!passcode) {
      setLocalError('Please enter your passcode.');
      return;
    }

    setIsLocalLoading(true);
    const result = await unlockLocalWorkspace(passcode);
    setIsLocalLoading(false);

    if (!result.success) {
      if (result.isLocked) {
        setLockoutSeconds(result.remainingLockSeconds || 60);
        setLocalError(
          `Too many failed attempts. Locked for ${result.remainingLockSeconds || 60} seconds.`
        );
      } else {
        const remaining = 5 - result.failedAttempts;
        setLocalError(
          `Incorrect passcode. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`
        );
      }
    }
  };

  // Handle Firebase Auth
  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError('');
    setIsFirebaseLoading(true);

    const action = isRegisterMode ? registerWithFirebase : loginWithFirebase;
    const result = await action(email, password);
    setIsFirebaseLoading(false);

    if (!result.success) {
      setFirebaseError(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3 shadow-md">
            R
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Rocky's Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Private Personal Digital Headquarters
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'local'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Local Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'firebase'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Firebase Cloud
            {isFirebaseConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>
        </div>

        {/* Local Workspace Tab */}
        {activeTab === 'local' && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              {!hasLocalPasscode ? (
                // Initial Passcode Setup
                <form onSubmit={handleSetupLocal} className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Set Local Workspace Passcode
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create a passcode to unlock your workspace. It will be securely hashed using PBKDF2 (SHA-256 with 100,000 iterations).
                  </p>

                  <Input
                    label="Create Passcode (Min. 6 chars)"
                    type="password"
                    placeholder="••••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                  />
                  <Input
                    label="Confirm Passcode"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                  />

                  {localError && <p className="text-xs text-rose-500 font-medium">{localError}</p>}

                  {/* Security Notice */}
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong>Honest Storage Notice:</strong> A local passcode locks the UI against casual screen snooping. However, data in browser localStorage is <em>unencrypted</em>. Do not store sensitive bank credentials or recovery seeds here.
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLocalLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Lock & Open Workspace
                  </Button>
                </form>
              ) : (
                // Unlock Existing Passcode
                <form onSubmit={handleUnlockLocal} className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Unlock Workspace
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your local passcode to resume your workspace session.
                  </p>

                  <Input
                    label="Workspace Passcode"
                    type="password"
                    placeholder="••••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    disabled={Boolean(lockoutSeconds)}
                    autoFocus
                  />

                  {localError && <p className="text-xs text-rose-500 font-medium">{localError}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLocalLoading}
                    disabled={Boolean(lockoutSeconds)}
                  >
                    Unlock Workspace
                  </Button>

                  {/* Passcode Reset / Recovery */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
                    <p className="text-[11px] text-slate-400 text-center">
                      Forgotten or having trouble with your passcode?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset workspace passcode? Your workspace data (projects, tools, bookmarks) will be preserved safely.')) {
                          resetLocalPasscode();
                          setPasscode('');
                          setLocalError('');
                        }
                      }}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                    >
                      Reset Passcode / Set New One
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Firebase Cloud Tab */}
        {activeTab === 'firebase' && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              {!isFirebaseConfigured ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Firebase Credentials Pending
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Firebase environment variables are not yet configured in <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-sm font-mono text-[11px]">.env</code>.
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
                    <p className="font-sans font-semibold text-slate-700 dark:text-slate-300">
                      Missing Variables:
                    </p>
                    {missingFirebaseKeys.map((key) => (
                      <div key={key} className="text-rose-500">• {key}</div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    You can use <strong>Local Workspace</strong> right now with full functionality, and configure Firebase whenever you are ready!
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('local')}
                  >
                    Switch to Local Workspace
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] text-indigo-800 dark:text-indigo-200">
                    <p className="font-semibold mb-0.5">Cloud Firestore Connected</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      If you only enabled Firestore and not <em>Authentication (Email/Password)</em> in Firebase Console, please use the <strong>Local Workspace</strong> tab.
                    </p>
                  </div>

                  <form onSubmit={handleFirebaseAuth} className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {isRegisterMode ? 'Create Owner Account' : 'Owner Sign In'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isRegisterMode ? 'Already have an account?' : 'Register account'}
                      </button>
                    </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="rocky@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {firebaseError && (
                    <p className="text-xs text-rose-500 font-medium">{firebaseError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isFirebaseLoading}
                  >
                    {isRegisterMode ? 'Create Account & Connect' : 'Sign In with Firebase'}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
