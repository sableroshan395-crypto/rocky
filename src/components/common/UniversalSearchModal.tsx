import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckSquare, FileText, Bookmark, FolderKanban, ArrowRight, X } from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { Badge } from '@/components/ui/Badge';
import type { UniversalSearchResult } from '@/types/workspace';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo<UniversalSearchResult[]>(() => {
    if (!query.trim()) {
      // Default suggested items / sections
      return [
        { id: 'nav_command', title: 'Command Center', subtitle: 'Main Workspace Dashboard', type: 'route', url: '/' },
        { id: 'nav_money', title: 'Money Center', subtitle: 'Accounts, Cashbook & Balances', type: 'route', url: '/money' },
        { id: 'nav_tools', title: 'Tools Hub', subtitle: 'Utilities & Converters', type: 'route', url: '/tools' },
        { id: 'nav_sai', title: 'Sai Decoration Business Hub', subtitle: 'Bookings, Orders & Inventory', type: 'route', url: '/sai-decoration' },
        { id: 'nav_digital', title: 'Digital Lab', subtitle: 'Websites & Services', type: 'route', url: '/digital-lab' },
        { id: 'nav_library', title: 'Personal Library', subtitle: 'Documents & Bookmarks', type: 'route', url: '/library' },
      ];
    }

    const q = query.toLowerCase();
    const results: UniversalSearchResult[] = [];

    // Search Tasks
    const tasks = StorageAdapter.getTasks();
    for (const t of tasks) {
      if (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          id: `task_${t.id}`,
          title: t.title,
          subtitle: `Task • Priority: ${t.priority} • ${t.completed ? 'Completed' : 'Pending'}`,
          type: 'task',
          url: '/',
          category: t.category,
        });
      }
    }

    // Search Notes
    const notes = StorageAdapter.getNotes();
    for (const n of notes) {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({
          id: `note_${n.id}`,
          title: n.title,
          subtitle: `Note • Category: ${n.category}`,
          type: 'note',
          url: '/library',
          category: n.category,
        });
      }
    }

    // Search Bookmarks
    const bookmarks = StorageAdapter.getBookmarks();
    for (const b of bookmarks) {
      if (b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)) {
        results.push({
          id: `bm_${b.id}`,
          title: b.title,
          subtitle: b.url,
          type: 'bookmark',
          url: b.url,
          category: b.category,
        });
      }
    }

    // Search Projects
    const projects = StorageAdapter.getProjects();
    for (const p of projects) {
      if (p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) {
        results.push({
          id: `proj_${p.id}`,
          title: p.name,
          subtitle: `${p.platform} • ${p.status} • ${p.type}`,
          type: 'project',
          url: p.url || '/digital-lab',
          category: p.type,
        });
      }
    }

    return results.slice(0, 10);
  }, [query]);

  const handleSelect = (result: UniversalSearchResult) => {
    onClose();
    if (result.type === 'bookmark' && result.url?.startsWith('http')) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } else if (result.url) {
      navigate(result.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const getItemIcon = (type: UniversalSearchResult['type']) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-indigo-500" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-violet-500" />;
      default:
        return <ArrowRight className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Search"
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-20 p-4"
    >
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />

      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, bookmarks, projects, tasks, notes... (Ctrl+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <ul className="space-y-1">
              {searchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {getItemIcon(item.type)}
                      <div className="truncate">
                        <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.category && (
                      <Badge size="sm" variant="neutral" className="ml-2 uppercase tracking-wider">
                        {item.category}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Open with <kbd className="font-mono">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
