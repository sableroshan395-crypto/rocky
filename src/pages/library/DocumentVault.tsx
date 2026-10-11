import React, { useState } from 'react';
import { Shield, Plus, Search, Trash2, Edit2, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { VaultDocument } from '@/types/digitalLibrary';

interface DocumentVaultProps {
  documents: VaultDocument[];
  onRefresh: () => void;
}

const CATEGORY_COLORS: Record<VaultDocument['category'], 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  identity: 'danger',
  finance: 'success',
  business: 'primary',
  education: 'warning',
  receipts: 'default',
  other: 'default',
};

export const DocumentVault: React.FC<DocumentVaultProps> = ({ documents, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<VaultDocument | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultDocument['category']>('identity');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isSensitive, setIsSensitive] = useState(true);
  const [notes, setNotes] = useState('');

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.documentNumber && d.documentNumber.toLowerCase().includes(search.toLowerCase())) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const openAdd = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('identity');
    setDocumentNumber('');
    setIssueDate('');
    setExpiryDate('');
    setTagsStr('');
    setIsSensitive(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (d: VaultDocument) => {
    setEditingDoc(d);
    setTitle(d.title);
    setCategory(d.category);
    setDocumentNumber(d.documentNumber || '');
    setIssueDate(d.issueDate || '');
    setExpiryDate(d.expiryDate || '');
    setTagsStr(d.tags.join(', '));
    setIsSensitive(d.isSensitive);
    setNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Document title is required.');
      return;
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      StorageAdapter.saveVaultDocument({
        id: editingDoc?.id,
        title: title.trim(),
        category,
        documentNumber: documentNumber.trim() || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        tags,
        isSensitive,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingDoc ? 'Document Updated' : 'Document Registered', title.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save document metadata.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete document record "${name}"?`)) {
      StorageAdapter.deleteVaultDocument(id);
      showSuccess('Record Deleted', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-semibold">Metadata & Reference Registry:</span>
          <p className="text-[11px] mt-0.5">
            Store document reference numbers, expiry reminders, and locker tags. Never store unencrypted raw photos of Aadhaar cards or passwords in browser local storage.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search documents by title, number, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'identity', label: 'Identity' },
              { value: 'finance', label: 'Finance / Tax' },
              { value: 'business', label: 'Business' },
              { value: 'education', label: 'Education' },
              { value: 'receipts', label: 'Receipts / Warranties' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Register Document
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Shield className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {documents.length === 0
              ? 'No documents registered. Track PAN, GST certificates, degree certificates, and warranty dates.'
              : 'No documents match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => (
            <Card key={d.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {d.title}
                      {d.isSensitive && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {d.documentNumber || '—'}
                    </span>
                  </div>
                  <Badge variant={CATEGORY_COLORS[d.category]} size="sm">
                    {d.category}
                  </Badge>
                </div>

                {(d.issueDate || d.expiryDate) && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Issue Date</span>
                      <span>{d.issueDate || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Expiry Date</span>
                      <span className={d.expiryDate && new Date(d.expiryDate) < new Date() ? 'text-rose-500 font-bold' : ''}>
                        {d.expiryDate || 'Lifetime'}
                      </span>
                    </div>
                  </div>
                )}

                {d.notes && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {d.notes}
                  </p>
                )}

                {d.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {d.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)} className="h-7 px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id, d.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoc ? 'Edit Document Record' : 'Register Document in Vault'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Document Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GST Registration Certificate, Degree" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VaultDocument['category'])}
              options={[
                { value: 'identity', label: 'Identity / KYC' },
                { value: 'finance', label: 'Finance / Tax / Banking' },
                { value: 'business', label: 'Business License' },
                { value: 'education', label: 'Education / Degree' },
                { value: 'receipts', label: 'Receipt / Warranty' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input label="Document / Certificate Number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="e.g. 27AABCS1234D1Z5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Issue Date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            <Input label="Expiry Date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>

          <Input label="Tags (comma-separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="tax, gst, pune, office" />
          <Textarea label="Locker / Physical Filing Location & Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Stored in Safe Locker #2, Blue Folder..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingDoc ? 'Save Changes' : 'Register Document'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
