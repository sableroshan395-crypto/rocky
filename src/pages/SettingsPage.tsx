import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  CloudUpload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Save,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { MigrationService, type MigrationPreview, type MigrationResult } from '@/services/migrationService';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { isFirebaseConfigured, missingFirebaseKeys, firebaseUser, storageMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();

  // Migration wizard state
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<{ percent: number; message: string } | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [hasDownloadedPreMigrationBackup, setHasDownloadedPreMigrationBackup] = useState(false);

  // Clear data confirmation modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Trigger Backup Download
  const handleDownloadBackup = () => {
    const json = StorageAdapter.exportFullWorkspaceJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rocky_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Backup downloaded', 'Saved local workspace JSON backup.');
  };

  // Restore backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageAdapter.restoreFullWorkspaceJSON(content);
      if (res.success) {
        showSuccess('Restored successfully', res.message);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showError('Restore failed', res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Open Migration Wizard
  const handleOpenMigrationWizard = () => {
    const preview = MigrationService.prepareMigrationPreview();
    setMigrationPreview(preview);
    setHasDownloadedPreMigrationBackup(false);
    setMigrationProgress(null);
    setMigrationResult(null);
    setIsMigrationModalOpen(true);
  };

  // Download Pre-Migration Backup
  const handleDownloadPreMigrationBackup = () => {
    if (!migrationPreview) return;
    const blob = new Blob([migrationPreview.backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pre_migration_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setHasDownloadedPreMigrationBackup(true);
    showSuccess('Safety backup saved', 'You can now proceed with the migration.');
  };

  // Execute Migration
  const handleExecuteMigration = async () => {
    if (!db || !firebaseUser) {
      showError('Authentication required', 'Please sign in with Firebase before cloud migration.');
      return;
    }

    try {
      const result = await MigrationService.executeMigration(
        db,
        firebaseUser.uid,
        'skip',
        (percent, message) => setMigrationProgress({ percent, message })
      );
      setMigrationResult(result);
      if (result.success) {
        showSuccess('Migration completed', 'All records verified in Firestore.');
      } else {
        showWarning('Migration finished with issues', `${result.errors.length} errors reported.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown migration error';
      showError('Migration failed', msg);
    }
  };

  // Clear local storage
  const handleClearData = () => {
    StorageAdapter.clearLocalWorkspaceData();
    setIsClearModalOpen(false);
    showSuccess('Data cleared', 'All local workspace records removed.');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          System & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Workspace preferences, security disclosures, backups, and Firebase integration.
        </p>
      </div>

      {/* Security & Storage Notice */}
      <Card className="border-amber-200/80 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold">Local Storage Security Disclosure</p>
            <p>
              When running in <strong>Local Workspace Mode</strong>, records are stored in browser localStorage. While your local passcode locks the screen, browser storage is <em>unencrypted</em> on your machine.
            </p>
            <p>
              Never store passwords, recovery phrases, bank login secrets, or sensitive identity proofs in local mode.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Appearance Theme
              </label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  leftIcon={<Sun className="w-3.5 h-3.5" />}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  leftIcon={<Moon className="w-3.5 h-3.5" />}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  leftIcon={<Laptop className="w-3.5 h-3.5" />}
                >
                  System
                </Button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Currency & Regional Format
              </label>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-400">
                <p>Currency: <span className="font-semibold text-slate-900 dark:text-slate-100">INR (₹)</span></p>
                <p>Date Format: <span className="font-semibold text-slate-900 dark:text-slate-100">DD/MM/YYYY</span></p>
                <p>Timezone: <span className="font-semibold text-slate-900 dark:text-slate-100">Asia/Kolkata</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firebase Cloud Connection & Migration */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="w-4 h-4 text-indigo-500" />
            Firebase Cloud Integration
          </CardTitle>
          <Badge variant={isFirebaseConfigured ? 'success' : 'warning'}>
            {isFirebaseConfigured ? 'Connected' : 'Pending Configuration'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {!isFirebaseConfigured ? (
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <p>
                Firebase credentials are not yet configured in <code className="font-mono text-indigo-600">.env</code>.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
                <p className="font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Missing Environment Variables:
                </p>
                {missingFirebaseKeys.map((k) => (
                  <p key={k} className="text-rose-500">• {k}</p>
                ))}
              </div>
              <p>
                To connect Firebase, create a project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Firebase Console</a>, enable Authentication & Firestore, and copy the credentials into <code className="font-mono">.env</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Firebase Authentication and Cloud Firestore are active.</span>
              </div>
              <p className="text-slate-500">
                Current Storage Mode: <span className="font-semibold capitalize">{storageMode}</span>
              </p>

              {/* Controlled Migration Trigger */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                    Local-to-Firebase Migration Wizard
                  </p>
                  <p className="text-indigo-700/80 dark:text-indigo-300/80 text-[11px]">
                    Safely import your verified local records into your authenticated Cloud Firestore.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenMigrationWizard}
                  leftIcon={<CloudUpload className="w-3.5 h-3.5" />}
                >
                  Start Migration
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Save className="w-4 h-4 text-indigo-500" />
            Data Backup & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-500">
            Export a full JSON backup of all accounts, transactions, tasks, notes, bookmarks, and audit history.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadBackup}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Backup
            </Button>

            <label className="inline-flex items-center">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                  input?.click();
                }}
              >
                Restore from Backup
              </Button>
            </label>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Local Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Wizard Modal */}
      <Modal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        title="Local to Cloud Migration Wizard"
        description="Safe, idempotent import of your local workspace data into Cloud Firestore."
        maxWidth="lg"
      >
        {migrationPreview && (
          <div className="space-y-4 text-xs">
            {/* Step 1: Mandatory Backup */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Step 1: Download Safety Backup
                </span>
                {hasDownloadedPreMigrationBackup ? (
                  <Badge variant="success">Downloaded</Badge>
                ) : (
                  <Badge variant="danger">Required</Badge>
                )}
              </div>
              <p className="text-slate-500">
                To guarantee zero data loss, you must save a backup before sending writes to Firebase.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadPreMigrationBackup}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Safety Backup
              </Button>
            </div>

            {/* Step 2: Record Inspection & Validation */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Step 2: Inspect Record Counts & Validation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Tasks: <span className="font-semibold">{migrationPreview.counts.tasks}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Notes: <span className="font-semibold">{migrationPreview.counts.notes}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Bookmarks: <span className="font-semibold">{migrationPreview.counts.bookmarks}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Projects: <span className="font-semibold">{migrationPreview.counts.projects}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Accounts: <span className="font-semibold">{migrationPreview.counts.accounts}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Transactions: <span className="font-semibold">{migrationPreview.counts.transactions}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-sm">
                  Audit Logs: <span className="font-semibold">{migrationPreview.counts.auditLogs}</span>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  Total: {migrationPreview.totalRecords}
                </div>
              </div>

              {migrationPreview.validationErrors.length > 0 && (
                <div className="p-2 bg-rose-50 text-rose-700 rounded-sm">
                  {migrationPreview.validationErrors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Migration Progress & Execution */}
            {migrationProgress && (
              <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{migrationProgress.message}</span>
                  <span>{migrationProgress.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${migrationProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Migration Result Report */}
            {migrationResult && (
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Migration Verification Report:
                </p>
                <p className="text-emerald-700 dark:text-emerald-300">
                  {migrationResult.success
                    ? 'All written records matched and verified in Firestore.'
                    : `Finished with ${migrationResult.errors.length} errors.`}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setIsMigrationModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                disabled={!hasDownloadedPreMigrationBackup || Boolean(migrationProgress && !migrationResult)}
                onClick={handleExecuteMigration}
              >
                Execute Safe Import
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Confirm Clear Local Workspace"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-rose-50 text-rose-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p>
              This action permanently deletes all local records from this browser. Make sure you have downloaded a JSON backup first!
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              Permanently Clear Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
