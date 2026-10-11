/**
 * Local Workspace Security Utilities
 * Uses standard Web Crypto API (PBKDF2 with SHA-256, 100,000 iterations, 16-byte cryptographically secure salt).
 *
 * IMPORTANT SECURITY DISCLOSURE:
 * Hashing the passcode protects the workspace UI from casual inspection on an unlocked machine.
 * HOWEVER, data in browser localStorage remains UNENCRYPTED at rest.
 * Anyone with direct access to browser developer tools, filesystem storage files, or malicious extensions
 * can read raw localStorage keys.
 * Do not store banking passwords, UPI PINs, recovery seeds, or sensitive unencrypted government IDs.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;

// Convert ArrayBuffer to Hex string
function buf2hex(buffer: ArrayBuffer): string {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

// Convert Hex string to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a PBKDF2-SHA256 hash from a passcode and salt.
 */
export async function hashPasscode(passcode: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const passcodeBuffer = encoder.encode(passcode);

  let saltBytes: Uint8Array;
  if (saltHex) {
    saltBytes = hex2buf(saltHex);
  } else {
    saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  }

  // Import key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passcodeBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_BYTE_LENGTH * 8
  );

  return {
    hash: buf2hex(derivedBits),
    salt: saltHex || buf2hex(saltBytes.buffer as ArrayBuffer),
  };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export interface VerificationResult {
  success: boolean;
  isLocked: boolean;
  remainingLockSeconds?: number;
  failedAttempts: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

/**
 * Verifies a candidate passcode against the stored hash and salt, enforcing attempt throttling.
 */
export async function verifyPasscode(
  candidatePasscode: string,
  storedHash: string,
  storedSalt: string,
  currentFailedAttempts = 0,
  lockUntilTimestamp?: number
): Promise<VerificationResult> {
  const now = Date.now();

  // Check if currently throttled / locked out
  if (lockUntilTimestamp && now < lockUntilTimestamp) {
    const remainingSeconds = Math.ceil((lockUntilTimestamp - now) / 1000);
    return {
      success: false,
      isLocked: true,
      remainingLockSeconds: remainingSeconds,
      failedAttempts: currentFailedAttempts,
    };
  }

  // Calculate hash
  const { hash: candidateHash } = await hashPasscode(candidatePasscode, storedSalt);
  const isValid = constantTimeCompare(candidateHash, storedHash);

  if (isValid) {
    return {
      success: true,
      isLocked: false,
      failedAttempts: 0,
    };
  } else {
    const newFailedCount = currentFailedAttempts + 1;
    let isLocked = false;
    let remainingLockSeconds: number | undefined;

    if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
      isLocked = true;
      remainingLockSeconds = Math.round(LOCKOUT_DURATION_MS / 1000);
    }

    return {
      success: false,
      isLocked,
      remainingLockSeconds,
      failedAttempts: newFailedCount,
    };
  }
}
