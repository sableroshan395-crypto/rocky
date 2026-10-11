import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firebase Security Rules Configuration', () => {
  it('enforces default deny and owner isolation in firestore.rules', () => {
    const rulesPath = path.resolve(__dirname, '../firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // Default Deny
    expect(rulesContent).toContain('allow read, write: if false;');

    // Owner-only UID isolation
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('request.auth != null && request.auth.uid == userId');

    // Denies unauthenticated access
    expect(rulesContent).not.toContain('allow read, write: if true;');
  });

  it('enforces default deny and owner isolation in storage.rules', () => {
    const rulesPath = path.resolve(__dirname, '../storage.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // Default Deny
    expect(rulesContent).toContain('allow read, write: if false;');

    // Owner-only isolation for user folder
    expect(rulesContent).toContain('match /users/{userId}/{allUserFiles=**}');
    expect(rulesContent).toContain('request.auth != null && request.auth.uid == userId');

    // Denies public access
    expect(rulesContent).not.toContain('allow read: if true;');
  });
});
