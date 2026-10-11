import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { formatPaiseToINR, parseINRToPaise, formatDateTime } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { GamblingSession } from '@/types/financial';

export const GamblingTrackerPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [sessions, setSessions] = useState<GamblingSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [platform, setPlatform] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [depositsStr, setDepositsStr] = useState('');
  const [withdrawalsStr, setWithdrawalsStr] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  const loadSessions = () => {
    setSessions(StorageAdapter.getGamblingSessions());
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const stats = useMemo(() => {
    let totalDepositsPaise = 0;
    let totalWithdrawalsPaise = 0;
    let totalMinutes = 0;

    for (const s of sessions) {
      totalDepositsPaise += s.depositsPaise;
      totalWithdrawalsPaise += s.withdrawalsPaise;
      totalMinutes += s.timeSpentMinutes;
    }

    const netResultPaise = totalWithdrawalsPaise - totalDepositsPaise;

    return {
      totalDepositsPaise,
      totalWithdrawalsPaise,
      netResultPaise,
      totalMinutes,
      isNetLoss: netResultPaise < 0,
    };
  }, [sessions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim()) {
      showError('Platform name is required.');
      return;
    }

    const depositsPaise = parseINRToPaise(depositsStr) || 0;
    const withdrawalsPaise = parseINRToPaise(withdrawalsStr) || 0;
    const netResultPaise = withdrawalsPaise - depositsPaise;
    const minutes = parseInt(timeSpentMinutes, 10) || 0;

    const newSession: GamblingSession = {
      id: 'gambling_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      platform: platform.trim(),
      sessionStart: sessionStart ? new Date(sessionStart).toISOString() : new Date().toISOString(),
      sessionEnd: sessionEnd ? new Date(sessionEnd).toISOString() : undefined,
      depositsPaise,
      withdrawalsPaise,
      netResultPaise,
      timeSpentMinutes: minutes,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    StorageAdapter.saveGamblingSession(newSession);
    showSuccess('Session logged', `${newSession.platform} session result recorded.`);
    setIsModalOpen(false);
    loadSessions();
  };

  return (
    <div className="space-y-4">
      {/* Awareness & Responsible Play Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Spending Control & Awareness Tool</span>
        </div>
        <p className="leading-relaxed">
          This module is designed solely to maintain transparency and discipline over recreational sessions. Gambling is not a reliable source of income or investment. Never chase losses or deposit beyond set limits.
        </p>
      </div>

      {/* KPI Cards (Solid Colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Deposited</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {formatPaiseToINR(stats.totalDepositsPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">{sessions.length} recorded sessions</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Withdrawn</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {formatPaiseToINR(stats.totalWithdrawalsPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Returned to bank/wallet</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Gain / Loss</span>
          <span
            className={`text-xl font-bold font-mono mt-1 block ${
              stats.netResultPaise >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {stats.netResultPaise >= 0 ? '+' : ''}
            {formatPaiseToINR(stats.netResultPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">
            {stats.isNetLoss ? 'Net Outflow (Spending)' : 'Net Positive'}
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Time Tracked</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Total duration spent</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <span className="text-xs text-slate-500 font-medium">
          Logged sessions help identify trends and enforce cooling-off discipline.
        </span>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setPlatform('');
            setSessionStart(new Date().toISOString().slice(0, 16));
            setSessionEnd(new Date().toISOString().slice(0, 16));
            setDepositsStr('');
            setWithdrawalsStr('0.00');
            setTimeSpentMinutes('30');
            setNotes('');
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Log Session
        </Button>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <span className="text-[11px] text-slate-400 font-mono">{sessions.length} sessions</span>
        </CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No sessions recorded. Click "Log Session" when you want to track a session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3 text-right">Deposited</th>
                    <th className="px-4 py-3 text-right">Withdrawn</th>
                    <th className="px-4 py-3 text-right">Result</th>
                    <th className="px-4 py-3 text-right">Duration</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDateTime(s.sessionStart)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {s.platform}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {formatPaiseToINR(s.depositsPaise)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        {formatPaiseToINR(s.withdrawalsPaise)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            s.netResultPaise >= 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }
                        >
                          {s.netResultPaise >= 0 ? '+' : ''}
                          {formatPaiseToINR(s.netResultPaise)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 whitespace-nowrap">
                        {s.timeSpentMinutes} mins
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                        {s.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Session Activity"
        description="Record financial inputs and time spent for personal awareness."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Platform / Website Name *"
            placeholder="e.g. Dream11, Stake, PokerBaazi"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Session Start Time"
              type="datetime-local"
              value={sessionStart}
              onChange={(e) => setSessionStart(e.target.value)}
            />
            <Input
              label="Approx. Duration (Minutes)"
              type="number"
              value={timeSpentMinutes}
              onChange={(e) => setTimeSpentMinutes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Deposited (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={depositsStr}
              onChange={(e) => setDepositsStr(e.target.value)}
            />
            <Input
              label="Total Withdrawn / Returned (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={withdrawalsStr}
              onChange={(e) => setWithdrawalsStr(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes / Reflection (Optional)"
            rows={2}
            placeholder="Self-awareness notes, stop-loss trigger, or emotions"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Session Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
