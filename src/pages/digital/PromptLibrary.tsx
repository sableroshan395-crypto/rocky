import React, { useState } from 'react';
import { Sparkles, Plus, Copy, Check, Search, Trash2, Edit2, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { PromptTemplate } from '@/types/digitalLibrary';

interface PromptLibraryProps {
  prompts: PromptTemplate[];
  onRefresh: () => void;
}

const CATEGORY_COLORS: Record<PromptTemplate['category'], 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  coding: 'primary',
  writing: 'success',
  antigravity: 'warning',
  marketing: 'danger',
  system: 'default',
  other: 'default',
};

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PromptTemplate['category']>('coding');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptText, setPromptText] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const filtered = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.promptText.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const openAdd = () => {
    setEditingPrompt(null);
    setTitle('');
    setCategory('coding');
    setSystemPrompt('');
    setPromptText('');
    setTagsStr('');
    setIsModalOpen(true);
  };

  const openEdit = (p: PromptTemplate) => {
    setEditingPrompt(p);
    setTitle(p.title);
    setCategory(p.category);
    setSystemPrompt(p.systemPrompt || '');
    setPromptText(p.promptText);
    setTagsStr(p.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showSuccess('Copied to Clipboard', 'Prompt copied ready to paste.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      showError('Title and prompt text are required.');
      return;
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Auto-detect variables like {{variable}}
    const variableMatches = promptText.match(/\{\{([^}]+)\}\}/g) || [];
    const variables = Array.from(new Set(variableMatches.map((m) => m.replace(/[{}]/g, '').trim())));

    try {
      StorageAdapter.savePrompt({
        id: editingPrompt?.id,
        title: title.trim(),
        category,
        systemPrompt: systemPrompt.trim() || undefined,
        promptText: promptText.trim(),
        variables,
        tags,
        isFavorite: editingPrompt?.isFavorite || false,
      });

      showSuccess(editingPrompt ? 'Prompt Updated' : 'Prompt Created', title.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save prompt.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete prompt "${name}"?`)) {
      StorageAdapter.deletePrompt(id);
      showSuccess('Prompt Deleted', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search prompts by title, keywords, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'coding', label: 'Coding' },
              { value: 'writing', label: 'Writing' },
              { value: 'antigravity', label: 'Antigravity' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'system', label: 'System' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          New Prompt
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {prompts.length === 0
              ? 'No prompt templates saved yet. Create reusable prompts with variables like {{input}}.'
              : 'No prompts match your search.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{p.title}</h4>
                  <Badge variant={CATEGORY_COLORS[p.category]} size="sm">
                    {p.category}
                  </Badge>
                </div>

                {p.systemPrompt && (
                  <p className="text-[11px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded line-clamp-2">
                    System: {p.systemPrompt}
                  </p>
                )}

                <div className="relative">
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-36">
                    {p.promptText}
                  </pre>
                </div>

                {p.variables.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">Variables:</span>
                    {p.variables.map((v) => (
                      <span key={v} className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}

                {p.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {p.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopy(p.id, p.promptText)}
                  leftIcon={copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  className="h-7 text-xs"
                >
                  {copiedId === p.id ? 'Copied' : 'Copy Prompt'}
                </Button>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id, p.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPrompt ? 'Edit Prompt' : 'New Prompt Template'} maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Prompt Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Next.js Code Reviewer" />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PromptTemplate['category'])}
            options={[
              { value: 'coding', label: 'Coding / Engineering' },
              { value: 'writing', label: 'Content Writing' },
              { value: 'antigravity', label: 'Antigravity Workflows' },
              { value: 'marketing', label: 'Marketing / Copy' },
              { value: 'system', label: 'System / Prompt Engineering' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Textarea label="System Instructions (Optional)" rows={2} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are an expert full-stack code auditor..." />
          <Textarea
            label="Prompt Body (Use {{variable}} for placeholders)"
            rows={6}
            required
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Review the following code for bugs, performance bottlenecks, and security flaws:&#10;&#10;```{{language}}&#10;{{code}}&#10;```"
            className="font-mono text-xs"
          />
          <Input label="Tags (comma-separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="react, typescript, audit" />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingPrompt ? 'Save Changes' : 'Save Prompt'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
