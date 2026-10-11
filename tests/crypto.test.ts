import { describe, it, expect } from 'vitest';
import { hashPasscode, verifyPasscode } from '@/utils/crypto';

describe('PBKDF2 Local Passcode Security & Throttling', () => {
  it('hashes passcode with a unique cryptographic salt', async () => {
    const passcode = 'MySecurePasscode123';
    const { hash, salt } = await hashPasscode(passcode);

    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 derived 32 bytes hex = 64 chars
    expect(salt).toBeDefined();
    expect(salt.length).toBe(32); // 16 bytes hex = 32 chars
  });

  it('successfully verifies a matching passcode', async () => {
    const passcode = 'CorrectWorkspacePasscode';
    const { hash, salt } = await hashPasscode(passcode);

    const result = await verifyPasscode(passcode, hash, salt, 0);
    expect(result.success).toBe(true);
    expect(result.isLocked).toBe(false);
    expect(result.failedAttempts).toBe(0);
  });

  it('rejects an incorrect passcode and increments failed attempts', async () => {
    const passcode = 'CorrectWorkspacePasscode';
    const { hash, salt } = await hashPasscode(passcode);

    const result = await verifyPasscode('WrongPasscode', hash, salt, 2);
    expect(result.success).toBe(false);
    expect(result.isLocked).toBe(false);
    expect(result.failedAttempts).toBe(3);
  });

  it('triggers attempt throttling and lockout after 5 failed attempts', async () => {
    const passcode = 'CorrectWorkspacePasscode';
    const { hash, salt } = await hashPasscode(passcode);

    const result = await verifyPasscode('WrongPasscode', hash, salt, 4);
    expect(result.success).toBe(false);
    expect(result.isLocked).toBe(true);
    expect(result.remainingLockSeconds).toBe(60);
    expect(result.failedAttempts).toBe(5);
  });

  it('blocks verification attempts while lock timestamp is active', async () => {
    const passcode = 'CorrectWorkspacePasscode';
    const { hash, salt } = await hashPasscode(passcode);

    const lockUntil = Date.now() + 30000; // 30s in future
    const result = await verifyPasscode(passcode, hash, salt, 5, lockUntil);

    expect(result.success).toBe(false);
    expect(result.isLocked).toBe(true);
    expect(result.remainingLockSeconds).toBeGreaterThan(0);
  });
});
