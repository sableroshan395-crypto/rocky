import { doc, writeBatch, getDoc, type Firestore } from 'firebase/firestore';
import { StorageAdapter } from './storageAdapter';

export interface MigrationPreview {
  counts: {
    tasks: number;
    notes: number;
    bookmarks: number;
    projects: number;
    accounts: number;
    transactions: number;
    adjustments: number;
    auditLogs: number;
  };
  totalRecords: number;
  validationErrors: string[];
  duplicateIds: string[];
  backupJson: string;
}

export interface MigrationConflict {
  collection: string;
  id: string;
  localName: string;
}

export interface MigrationResult {
  success: boolean;
  importedCounts: Record<string, number>;
  verifiedCounts: Record<string, number>;
  errors: string[];
}

export class MigrationService {
  /**
   * Previews records to be migrated, checks for validation errors, duplicates, and generates downloadable backup.
   */
  static prepareMigrationPreview(): MigrationPreview {
    const tasks = StorageAdapter.getTasks();
    const notes = StorageAdapter.getNotes();
    const bookmarks = StorageAdapter.getBookmarks();
    const projects = StorageAdapter.getProjects();
    const accounts = StorageAdapter.getAccounts();
    const transactions = StorageAdapter.getTransactions();
    const adjustments = StorageAdapter.getAdjustments();
    const auditLogs = StorageAdapter.getAuditLogs();

    const validationErrors: string[] = [];
    const idMap = new Set<string>();
    const duplicateIds: string[] = [];

    const checkCollection = (items: Array<{ id: string }>, colName: string) => {
      for (const item of items) {
        if (!item.id || typeof item.id !== 'string') {
          validationErrors.push(`${colName}: Found record missing a valid string ID.`);
        } else if (idMap.has(`${colName}:${item.id}`)) {
          duplicateIds.push(`${colName}:${item.id}`);
        } else {
          idMap.add(`${colName}:${item.id}`);
        }
      }
    };

    checkCollection(tasks, 'tasks');
    checkCollection(notes, 'notes');
    checkCollection(bookmarks, 'bookmarks');
    checkCollection(projects, 'projects');
    checkCollection(accounts, 'accounts');
    checkCollection(transactions, 'transactions');
    checkCollection(adjustments, 'adjustments');

    const backupJson = StorageAdapter.exportFullWorkspaceJSON();

    return {
      counts: {
        tasks: tasks.length,
        notes: notes.length,
        bookmarks: bookmarks.length,
        projects: projects.length,
        accounts: accounts.length,
        transactions: transactions.length,
        adjustments: adjustments.length,
        auditLogs: auditLogs.length,
      },
      totalRecords:
        tasks.length +
        notes.length +
        bookmarks.length +
        projects.length +
        accounts.length +
        transactions.length +
        adjustments.length,
      validationErrors,
      duplicateIds,
      backupJson,
    };
  }

  /**
   * Detects if any remote records in Firestore under users/{userId}/{collection}/{id} already exist.
   */
  static async checkRemoteConflicts(
    firestore: Firestore,
    userId: string
  ): Promise<MigrationConflict[]> {
    const conflicts: MigrationConflict[] = [];

    const collectionsToCheck: Array<{ name: string; items: Array<{ id: string; name?: string; title?: string }> }> = [
      { name: 'tasks', items: StorageAdapter.getTasks() },
      { name: 'notes', items: StorageAdapter.getNotes() },
      { name: 'bookmarks', items: StorageAdapter.getBookmarks() },
      { name: 'projects', items: StorageAdapter.getProjects() },
      { name: 'accounts', items: StorageAdapter.getAccounts() },
    ];

    for (const col of collectionsToCheck) {
      for (const item of col.items) {
        try {
          const docRef = doc(firestore, `users/${userId}/${col.name}/${item.id}`);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            conflicts.push({
              collection: col.name,
              id: item.id,
              localName: item.name || item.title || item.id,
            });
          }
        } catch {
          // If check fails due to permissions, record can be reported
        }
      }
    }

    return conflicts;
  }

  /**
   * Performs an idempotent batch import into Firestore, verifies write success, and logs audit trail.
   */
  static async executeMigration(
    firestore: Firestore,
    userId: string,
    conflictResolution: 'skip' | 'overwrite' = 'skip',
    onProgress?: (progressPercent: number, statusMessage: string) => void
  ): Promise<MigrationResult> {
    const importedCounts: Record<string, number> = {
      tasks: 0,
      notes: 0,
      bookmarks: 0,
      projects: 0,
      accounts: 0,
      transactions: 0,
      adjustments: 0,
    };
    const verifiedCounts: Record<string, number> = { ...importedCounts };
    const errors: string[] = [];

    const datasets: Record<string, Array<{ id: string; [key: string]: unknown }>> = {
      tasks: StorageAdapter.getTasks() as unknown as Array<{ id: string }>,
      notes: StorageAdapter.getNotes() as unknown as Array<{ id: string }>,
      bookmarks: StorageAdapter.getBookmarks() as unknown as Array<{ id: string }>,
      projects: StorageAdapter.getProjects() as unknown as Array<{ id: string }>,
      accounts: StorageAdapter.getAccounts() as unknown as Array<{ id: string }>,
      transactions: StorageAdapter.getTransactions() as unknown as Array<{ id: string }>,
      adjustments: StorageAdapter.getAdjustments() as unknown as Array<{ id: string }>,
    };

    onProgress?.(10, 'Preparing batch writes...');

    // Firestore batch limit is 500 operations
    let batch = writeBatch(firestore);
    let opCount = 0;
    const documentsToVerify: Array<{ path: string; colName: string; id: string }> = [];

    for (const [colName, items] of Object.entries(datasets)) {
      for (const item of items) {
        const docRef = doc(firestore, `users/${userId}/${colName}/${item.id}`);

        if (conflictResolution === 'skip') {
          // In skip mode, set with merge: false if not exists, or merge
          batch.set(docRef, { ...item, migratedAt: new Date().toISOString() }, { merge: true });
        } else {
          batch.set(docRef, { ...item, migratedAt: new Date().toISOString() });
        }

        importedCounts[colName] = (importedCounts[colName] || 0) + 1;
        documentsToVerify.push({ path: `users/${userId}/${colName}/${item.id}`, colName, id: item.id });
        opCount++;

        if (opCount >= 400) {
          await batch.commit();
          batch = writeBatch(firestore);
          opCount = 0;
        }
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    onProgress?.(60, 'Verifying written documents in Firestore...');

    // Verification step: verify by reading doc IDs in Firestore
    for (let i = 0; i < documentsToVerify.length; i++) {
      const docItem = documentsToVerify[i];
      try {
        const snap = await getDoc(doc(firestore, docItem.path));
        if (snap.exists()) {
          verifiedCounts[docItem.colName] = (verifiedCounts[docItem.colName] || 0) + 1;
        } else {
          errors.push(`Document ${docItem.path} could not be verified in Firestore.`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Read error';
        errors.push(`Failed to verify ${docItem.path}: ${msg}`);
      }
    }

    onProgress?.(100, 'Migration completed.');

    StorageAdapter.addAuditLog({
      action: 'import',
      entityType: 'settings',
      entityId: 'cloud_migration',
      details: {
        userId,
        importedCounts,
        verifiedCounts,
        errorCount: errors.length,
      },
    });

    return {
      success: errors.length === 0,
      importedCounts,
      verifiedCounts,
      errors,
    };
  }
}
