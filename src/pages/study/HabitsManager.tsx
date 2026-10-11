import React, { useState } from 'react';
import { Flame, Plus, CheckCircle, Circle, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { DailyHabit } from '@/types/studyAndIdeas';

interface HabitsManagerProps {
  habits: DailyHabit[];
  onRefresh: () => void;
}

const CATEGORY_COLORS: Record<DailyHabit['category'], 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  study: 'primary',
  fitness: 'success',
  discipline: 'warning',
  finance: 'danger',
  business: 'default',
};

export const HabitsManager: React.FC<HabitsManagerProps> = ({ habits, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<DailyHabit | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DailyHabit['category']>('study');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState('7');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = habits.filter((h) => {
    const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || h.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleToggle = (id: string) => {
    const updated = StorageAdapter.toggleHabitToday(id);
    if (updated) {
      if (updated.lastCompletedDate === todayStr) {
        showSuccess('Habit Completed today! 🔥', `Streak increased to ${updated.streakDays} days.`);
      } else {
        showSuccess('Habit Check-in undone', `Streak adjusted to ${updated.streakDays} days.`);
      }
      onRefresh();
    }
  };

  const openAdd = () => {
    setEditingHabit(null);
    setTitle('');
    setCategory('study');
    setTargetDaysPerWeek('7');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (h: DailyHabit) => {
    setEditingHabit(h);
    setTitle(h.title);
    setCategory(h.category);
    setTargetDaysPerWeek(String(h.targetDaysPerWeek));
    setNotes(h.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Habit title is required.');
      return;
    }

    try {
      StorageAdapter.saveHabit({
        id: editingHabit?.id,
        title: title.trim(),
        category,
        streakDays: editingHabit?.streakDays || 0,
        targetDaysPerWeek: parseInt(targetDaysPerWeek) || 7,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingHabit ? 'Habit Updated' : 'Habit Created', title.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save habit.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete habit "${name}"?`)) {
      StorageAdapter.deleteHabit(id);
      showSuccess('Habit Removed', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search habits & routines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'study', label: 'Study' },
              { value: 'fitness', label: 'Fitness / Health' },
              { value: 'discipline', label: 'Discipline' },
              { value: 'finance', label: 'Finance' },
              { value: 'business', label: 'Business' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          New Habit
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Flame className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {habits.length === 0
              ? 'No habits tracked. Add daily habits (2 hours study, morning walk, check accounts) and build streaks.'
              : 'No habits match your search.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((h) => {
            const isDoneToday = h.lastCompletedDate === todayStr;

            return (
              <Card key={h.id} className="p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{h.title}</h4>
                    <Badge variant={CATEGORY_COLORS[h.category]} size="sm">
                      {h.category}
                    </Badge>
                  </div>

                  {/* Streak pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{h.streakDays} Day Streak</span>
                    </div>

                    <button
                      onClick={() => handleToggle(h.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        isDoneToday
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      {isDoneToday ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Target: {h.targetDaysPerWeek} days / week
                  </p>

                  {h.notes && (
                    <p className="text-[10px] text-slate-400 italic">
                      {h.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(h)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(h.id, h.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHabit ? 'Edit Habit' : 'Create Daily Habit'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Habit Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2 Hours B.Com Study & Revision" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DailyHabit['category'])}
              options={[
                { value: 'study', label: 'Study & Academics' },
                { value: 'fitness', label: 'Fitness & Health' },
                { value: 'discipline', label: 'Discipline & Routine' },
                { value: 'finance', label: 'Financial Audit' },
                { value: 'business', label: 'Business Operations' },
              ]}
            />
            <Input label="Target Days Per Week" type="number" min="1" max="7" value={targetDaysPerWeek} onChange={(e) => setTargetDaysPerWeek(e.target.value)} />
          </div>

          <Textarea label="Cue, Routine & Rewards (Optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="After evening tea, open Accounting textbook..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingHabit ? 'Save Changes' : 'Create Habit'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
