import React, { useState } from 'react';
import { DollarSign, Plus, Clock, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { OnlineGig } from '@/types/digitalLibrary';

interface GigsManagerProps {
  gigs: OnlineGig[];
  onRefresh: () => void;
}

const STATUS_VARIANTS: Record<OnlineGig['status'], { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  in_progress: { variant: 'default', label: 'In Progress' },
  submitted: { variant: 'warning', label: 'Submitted' },
  approved: { variant: 'primary', label: 'Approved' },
  paid: { variant: 'success', label: 'Paid' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

export const GigsManager: React.FC<GigsManagerProps> = ({ gigs, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<OnlineGig | null>(null);

  // Form state
  const [platform, setPlatform] = useState('Remotasks');
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<OnlineGig['category']>('microtask');
  const [amountStr, setAmountStr] = useState('');
  const [timeSpent, setTimeSpent] = useState('30');
  const [status, setStatus] = useState<OnlineGig['status']>('submitted');
  const [payoutMethod, setPayoutMethod] = useState('PayPal');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = gigs.filter(
    (g) =>
      g.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
      g.platform.toLowerCase().includes(search.toLowerCase()) ||
      (g.referenceId && g.referenceId.includes(search))
  );

  const totalPaidPaise = gigs
    .filter((g) => g.status === 'paid')
    .reduce((sum, g) => sum + g.amountEarnedPaise, 0);

  const totalPendingPaise = gigs
    .filter((g) => g.status === 'submitted' || g.status === 'approved')
    .reduce((sum, g) => sum + g.amountEarnedPaise, 0);

  const openAdd = () => {
    setEditingGig(null);
    setPlatform('Remotasks');
    setTaskTitle('');
    setCategory('microtask');
    setAmountStr('');
    setTimeSpent('30');
    setStatus('submitted');
    setPayoutMethod('PayPal');
    setReferenceId('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (g: OnlineGig) => {
    setEditingGig(g);
    setPlatform(g.platform);
    setTaskTitle(g.taskTitle);
    setCategory(g.category);
    setAmountStr((g.amountEarnedPaise / 100).toFixed(2));
    setTimeSpent(String(g.timeSpentMinutes));
    setStatus(g.status);
    setPayoutMethod(g.payoutMethod || 'PayPal');
    setReferenceId(g.referenceId || '');
    setNotes(g.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !platform.trim()) {
      showError('Platform and task title are required.');
      return;
    }

    const earnedPaise = parseINRToPaise(amountStr) || 0;
    const minutes = parseInt(timeSpent) || 0;

    try {
      StorageAdapter.saveOnlineGig({
        id: editingGig?.id,
        platform: platform.trim(),
        taskTitle: taskTitle.trim(),
        category,
        amountEarnedPaise: earnedPaise,
        timeSpentMinutes: minutes,
        status,
        payoutMethod: payoutMethod.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingGig ? 'Task Updated' : 'Task Logged', taskTitle.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save gig record.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete gig "${name}"?`)) {
      StorageAdapter.deleteOnlineGig(id);
      showSuccess('Task Removed', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Gigs</span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{gigs.length}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Earnings Received</span>
          <p className="text-lg font-bold font-mono text-emerald-600">{formatPaiseToINR(totalPaidPaise)}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Pending Approval</span>
          <p className="text-lg font-bold font-mono text-amber-600">{formatPaiseToINR(totalPendingPaise)}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Hours Spent</span>
          <p className="text-lg font-bold font-mono text-indigo-600">
            {(gigs.reduce((sum, g) => sum + g.timeSpentMinutes, 0) / 60).toFixed(1)} hrs
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search gigs by platform, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Log Online Gig
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {gigs.length === 0
              ? 'No online gig income logged yet. Record microtasks, freelance deliveries, and AI labeling payouts.'
              : 'No gigs match your search.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {g.taskTitle}
                    </span>
                    <Badge variant={STATUS_VARIANTS[g.status].variant} size="sm">
                      {STATUS_VARIANTS[g.status].label}
                    </Badge>
                    <span className="text-[11px] text-slate-500">
                      via <span className="font-semibold">{g.platform}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {g.timeSpentMinutes} mins
                    </span>
                    {g.payoutMethod && <span>Payout: {g.payoutMethod}</span>}
                    {g.referenceId && <span>Ref: #{g.referenceId}</span>}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Earned</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatPaiseToINR(g.amountEarnedPaise)}
                  </span>
                </div>
              </div>

              {g.notes && (
                <p className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded mt-2">
                  {g.notes}
                </p>
              )}

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(g)} className="h-7 px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(g.id, g.taskTitle)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGig ? 'Edit Gig Task' : 'Log Online Task / Gig'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Platform / Client" required value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Remotasks, Freelance" />
            <Select
              label="Task Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as OnlineGig['category'])}
              options={[
                { value: 'microtask', label: 'Microtask / Annotation' },
                { value: 'development', label: 'Web / App Development' },
                { value: 'design', label: 'Graphic / UI Design' },
                { value: 'writing', label: 'Content / Copywriting' },
                { value: 'content', label: 'Video / Social Media' },
              ]}
            />
          </div>

          <Input label="Task Title / Description" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. LLM RLHF dataset ranking #41" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Amount Earned (₹)" type="number" step="0.01" required value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="500" />
            <Input label="Time Spent (Minutes)" type="number" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} placeholder="45" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OnlineGig['status'])}
              options={[
                { value: 'in_progress', label: 'In Progress' },
                { value: 'submitted', label: 'Submitted / Review' },
                { value: 'approved', label: 'Approved (Pending Payment)' },
                { value: 'paid', label: 'Paid / Received' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <Input label="Payout Channel" value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} placeholder="PayPal, Bank, Crypto, UPI" />
          </div>

          <Input label="Reference / Submission ID" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="e.g. SUB-99214" />
          <Textarea label="Notes & Quality Feedback" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Feedback score, review turnaround time..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingGig ? 'Save Changes' : 'Log Gig'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
