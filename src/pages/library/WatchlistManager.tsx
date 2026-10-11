import React, { useState } from 'react';
import { Tv, Plus, Star, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { WatchlistItem } from '@/types/digitalLibrary';

interface WatchlistManagerProps {
  watchlist: WatchlistItem[];
  onRefresh: () => void;
}

const STATUS_VARIANTS: Record<WatchlistItem['status'], { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  watching: { variant: 'primary', label: 'Watching' },
  completed: { variant: 'success', label: 'Completed' },
  plan_to_watch: { variant: 'default', label: 'Plan to Watch' },
  on_hold: { variant: 'warning', label: 'On Hold' },
  dropped: { variant: 'danger', label: 'Dropped' },
};

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ watchlist, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WatchlistItem['type']>('anime');
  const [platform, setPlatform] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState('0');
  const [totalEpisodes, setTotalEpisodes] = useState('');
  const [rating, setRating] = useState('0');
  const [status, setStatus] = useState<WatchlistItem['status']>('watching');
  const [notes, setNotes] = useState('');

  const filtered = watchlist.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.platform && item.platform.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAdd = () => {
    setEditingItem(null);
    setTitle('');
    setType('anime');
    setPlatform('Crunchyroll');
    setCurrentEpisode('1');
    setTotalEpisodes('12');
    setRating('8');
    setStatus('watching');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (item: WatchlistItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setType(item.type);
    setPlatform(item.platform || '');
    setCurrentEpisode(String(item.currentEpisode));
    setTotalEpisodes(item.totalEpisodes ? String(item.totalEpisodes) : '');
    setRating(item.rating ? String(item.rating) : '0');
    setStatus(item.status);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleEpisodeIncrement = (id: string, delta: number) => {
    StorageAdapter.updateWatchlistEpisode(id, delta);
    onRefresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Title is required.');
      return;
    }

    const cur = parseInt(currentEpisode) || 0;
    const tot = totalEpisodes ? parseInt(totalEpisodes) : undefined;
    const rat = rating ? parseInt(rating) : undefined;

    try {
      StorageAdapter.saveWatchlistItem({
        id: editingItem?.id,
        title: title.trim(),
        type,
        platform: platform.trim() || undefined,
        currentEpisode: cur,
        totalEpisodes: tot,
        rating: rat,
        status,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingItem ? 'Updated Watchlist' : 'Added to Watchlist', title.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save watchlist item.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from watchlist?`)) {
      StorageAdapter.deleteWatchlistItem(id);
      showSuccess('Item Removed', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search anime, movies, series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'watching', label: 'Watching' },
              { value: 'completed', label: 'Completed' },
              { value: 'plan_to_watch', label: 'Plan to Watch' },
              { value: 'on_hold', label: 'On Hold' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add to Watchlist
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Tv className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {watchlist.length === 0
              ? 'No anime or entertainment items added yet. Track your current episode progress and ratings.'
              : 'No items match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {item.type} {item.platform && `· ${item.platform}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[item.status].variant} size="sm">
                    {STATUS_VARIANTS[item.status].label}
                  </Badge>
                </div>

                {/* Episode Progress Counter */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Episode Progress:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEpisodeIncrement(item.id, -1)}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 flex items-center justify-center select-none"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {item.currentEpisode} {item.totalEpisodes ? `/ ${item.totalEpisodes}` : ''}
                    </span>
                    <button
                      onClick={() => handleEpisodeIncrement(item.id, 1)}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 flex items-center justify-center select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {item.rating && item.rating > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.rating} / 10</span>
                  </div>
                )}

                {item.notes && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="h-7 px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id, item.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Watchlist Item' : 'Add to Watchlist'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solo Leveling, Oppenheimer" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as WatchlistItem['type'])}
              options={[
                { value: 'anime', label: 'Anime' },
                { value: 'movie', label: 'Movie' },
                { value: 'series', label: 'Web Series / TV' },
                { value: 'documentary', label: 'Documentary' },
              ]}
            />
            <Input label="Platform / Streaming App" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Netflix, Crunchyroll" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Current Episode" type="number" min="0" value={currentEpisode} onChange={(e) => setCurrentEpisode(e.target.value)} />
            <Input label="Total Episodes (Optional)" type="number" min="1" value={totalEpisodes} onChange={(e) => setTotalEpisodes(e.target.value)} placeholder="12" />
            <Input label="Rating (1-10)" type="number" min="0" max="10" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="8" />
          </div>

          <Select
            label="Watching Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as WatchlistItem['status'])}
            options={[
              { value: 'watching', label: 'Currently Watching' },
              { value: 'completed', label: 'Completed' },
              { value: 'plan_to_watch', label: 'Plan to Watch' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'dropped', label: 'Dropped' },
            ]}
          />

          <Textarea label="Personal Thoughts / Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Favorite arc, season 2 release date..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingItem ? 'Save Changes' : 'Add to List'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
