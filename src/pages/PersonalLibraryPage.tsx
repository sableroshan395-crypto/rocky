import React, { useState, useEffect } from 'react';
import {
  Bookmark as BookmarkIcon,
  FileText,
  Tv,
  Shield,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Tag,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { WatchlistManager } from './library/WatchlistManager';
import { DocumentVault } from './library/DocumentVault';
import type { Bookmark, Note } from '@/types/workspace';
import type { WatchlistItem, VaultDocument } from '@/types/digitalLibrary';

type LibraryTab = 'bookmarks' | 'notes' | 'watchlist' | 'vault';

export const PersonalLibraryPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<LibraryTab>('bookmarks');

  // Data
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);

  // Bookmark Modal
  const [isBmModalOpen, setIsBmModalOpen] = useState(false);
  const [editingBm, setEditingBm] = useState<Bookmark | null>(null);
  const [bmTitle, setBmTitle] = useState('');
  const [bmUrl, setBmUrl] = useState('');
  const [bmCategory, setBmCategory] = useState<Bookmark['category']>('tools');
  const [bmTags, setBmTags] = useState('');
  const [bmUsername, setBmUsername] = useState('');
  const [bmNotes, setBmNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<Note['category']>('general');
  const [noteTags, setNoteTags] = useState('');

  const loadData = () => {
    setBookmarks(StorageAdapter.getBookmarks());
    setNotes(StorageAdapter.getNotes());
    setWatchlist(StorageAdapter.getWatchlist());
    setDocuments(StorageAdapter.getVaultDocuments());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bookmarks handlers
  const openAddBm = () => {
    setEditingBm(null);
    setBmTitle('');
    setBmUrl('');
    setBmCategory('smm');
    setBmTags('');
    setBmUsername('');
    setBmNotes('');
    setIsBmModalOpen(true);
  };

  const openEditBm = (bm: Bookmark) => {
    setEditingBm(bm);
    setBmTitle(bm.title);
    setBmUrl(bm.url);
    setBmCategory(bm.category);
    setBmTags(bm.tags.join(', '));
    setBmUsername(bm.usernameOrEmail || '');
    setBmNotes(bm.notes || '');
    setIsBmModalOpen(true);
  };

  const handleSaveBm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmTitle.trim() || !bmUrl.trim()) {
      showError('Title and URL are required.');
      return;
    }

    const tags = bmTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const now = new Date().toISOString();
      StorageAdapter.saveBookmark({
        id: editingBm?.id || `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: bmTitle.trim(),
        url: bmUrl.trim(),
        category: bmCategory,
        tags,
        isFavorite: editingBm?.isFavorite ?? true,
        usernameOrEmail: bmUsername.trim() || undefined,
        notes: bmNotes.trim() || undefined,
        createdAt: editingBm?.createdAt || now,
        updatedAt: now,
      });

      showSuccess(editingBm ? 'Bookmark Updated' : 'Bookmark Saved', bmTitle.trim());
      setIsBmModalOpen(false);
      loadData();
    } catch {
      showError('Failed to save bookmark.');
    }
  };

  const handleDeleteBm = (id: string, name: string) => {
    if (window.confirm(`Delete bookmark "${name}"?`)) {
      StorageAdapter.deleteBookmark(id);
      showSuccess('Bookmark Deleted', name);
      loadData();
    }
  };

  // Notes handlers
  const openAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('general');
    setNoteTags('');
    setIsNoteModalOpen(true);
  };

  const openEditNote = (n: Note) => {
    setEditingNote(n);
    setNoteTitle(n.title);
    setNoteContent(n.content);
    setNoteCategory(n.category);
    setNoteTags(n.tags.join(', '));
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showError('Note title is required.');
      return;
    }

    const tags = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const now = new Date().toISOString();
      StorageAdapter.saveNote({
        id: editingNote?.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        tags,
        isPinned: editingNote?.isPinned || false,
        createdAt: editingNote?.createdAt || now,
        updatedAt: now,
      });

      showSuccess(editingNote ? 'Note Updated' : 'Note Saved', noteTitle.trim());
      setIsNoteModalOpen(false);
      loadData();
    } catch {
      showError('Failed to save note.');
    }
  };

  const handleDeleteNote = (id: string, name: string) => {
    if (window.confirm(`Delete note "${name}"?`)) {
      StorageAdapter.deleteNote(id);
      showSuccess('Note Deleted', name);
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Personal Library
            </h1>
            <Badge variant="primary">Knowledge & Vault</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Web bookmarks, knowledge notes vault, entertainment watchlist, and document registry.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'bookmarks', label: `Web Bookmarks (${bookmarks.length})`, icon: <BookmarkIcon className="w-3.5 h-3.5" /> },
          { id: 'notes', label: `Knowledge Notes (${notes.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'watchlist', label: `Entertainment Watchlist (${watchlist.length})`, icon: <Tv className="w-3.5 h-3.5" /> },
          { id: 'vault', label: `Document Vault (${documents.length})`, icon: <Shield className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as LibraryTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Curated tools, business links, documentation, and reference websites.
            </p>
            <Button variant="primary" size="sm" onClick={openAddBm} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Bookmark
            </Button>
          </div>

          {bookmarks.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No bookmarks saved yet. Use Quick Capture (<kbd className="font-mono">Ctrl+Q</kbd>) or the button above.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookmarks.map((bm) => (
                <Card key={bm.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{bm.title}</h4>
                      <Badge size="sm" variant="neutral">{bm.category}</Badge>
                    </div>

                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 truncate block font-mono"
                    >
                      {bm.url} <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>

                    {(bm.usernameOrEmail || bm.notes) && (
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                        {bm.usernameOrEmail && (
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-indigo-500 shrink-0" />
                              {bm.usernameOrEmail}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(bm.usernameOrEmail || '');
                                setCopiedId(bm.id + '_user');
                                setTimeout(() => setCopiedId(null), 1800);
                              }}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              {copiedId === bm.id + '_user' ? (
                                <span className="text-emerald-500 font-semibold flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Copied</span>
                              ) : (
                                <span className="flex items-center gap-0.5"><Copy className="w-2.5 h-2.5" /> Copy</span>
                              )}
                            </button>
                          </div>
                        )}
                        {bm.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {bm.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {bm.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {bm.tags.map((t) => (
                          <span key={t} className="text-[10px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditBm(bm)} className="h-7 px-2">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteBm(bm.id, bm.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Bookmark Modal */}
          <Modal isOpen={isBmModalOpen} onClose={() => setIsBmModalOpen(false)} title={editingBm ? 'Edit Bookmark' : 'Save Bookmark'}>
            <form onSubmit={handleSaveBm} className="space-y-3">
              <Input label="Title" required value={bmTitle} onChange={(e) => setBmTitle(e.target.value)} placeholder="e.g. SMM Social Media" />
              <Input label="URL" type="url" required value={bmUrl} onChange={(e) => setBmUrl(e.target.value)} placeholder="https://..." />
              <Select
                label="Category"
                value={bmCategory}
                onChange={(e) => setBmCategory(e.target.value as Bookmark['category'])}
                options={[
                  { value: 'smm', label: 'SMM Panels' },
                  { value: 'tools', label: 'Tools' },
                  { value: 'business', label: 'Business' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'dev', label: 'Developer / Docs' },
                  { value: 'personal', label: 'Personal' },
                ]}
              />
              <Input label="Username / Email (Optional)" value={bmUsername} onChange={(e) => setBmUsername(e.target.value)} placeholder="e.g. sableroshan24@gmail.com" />
              <Input label="Credentials / Password / Notes (Optional)" value={bmNotes} onChange={(e) => setBmNotes(e.target.value)} placeholder="e.g. Login: user | Pass: pass123" />
              <Input label="Tags (comma-separated)" value={bmTags} onChange={(e) => setBmTags(e.target.value)} placeholder="smm, reseller, panel" />

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" onClick={() => setIsBmModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">{editingBm ? 'Save Changes' : 'Save Bookmark'}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Notes vault for operating procedures, meeting thoughts, and reference guides.
            </p>
            <Button variant="primary" size="sm" onClick={openAddNote} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No notes saved yet. Capture personal thoughts, instructions, or procedures.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notes.map((n) => (
                <Card key={n.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</h4>
                      <Badge size="sm" variant="neutral">{n.category}</Badge>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {n.content}
                    </p>

                    {n.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {n.tags.map((t) => (
                          <span key={t} className="text-[10px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditNote(n)} className="h-7 px-2">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(n.id, n.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Note Modal */}
          <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={editingNote ? 'Edit Note' : 'Create Note'} maxWidth="lg">
            <form onSubmit={handleSaveNote} className="space-y-3">
              <Input label="Title" required value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="e.g. Generator Maintenance Procedure" />
              <Select
                label="Category"
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as Note['category'])}
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'procedures', label: 'Procedures / Checklists' },
                  { value: 'ideas', label: 'Ideas' },
                  { value: 'business', label: 'Business' },
                  { value: 'study', label: 'Study' },
                ]}
              />
              <Textarea label="Content" rows={8} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your note here..." />
              <Input label="Tags (comma-separated)" value={noteTags} onChange={(e) => setNoteTags(e.target.value)} placeholder="generator, oil, safety" />

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">{editingNote ? 'Save Changes' : 'Save Note'}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 3: Watchlist */}
      {activeTab === 'watchlist' && (
        <WatchlistManager watchlist={watchlist} onRefresh={loadData} />
      )}

      {/* Tab 4: Vault */}
      {activeTab === 'vault' && (
        <DocumentVault documents={documents} onRefresh={loadData} />
      )}
    </div>
  );
};
