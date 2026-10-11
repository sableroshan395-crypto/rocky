import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { Account } from '@/types/financial';

interface UpdateBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess?: () => void;
}

export const UpdateBalanceModal: React.FC<UpdateBalanceModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [actualInput, setActualInput] = useState('');
  const [reason, setReason] = useState('Physical recount of balance');
  const [referenceNote, setReferenceNote] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      setActualInput((account.currentRecordedBalancePaise / 100).toFixed(2));
      setDateStr(new Date().toISOString().slice(0, 16));
      setReason('Physical recount of balance');
      setReferenceNote('');
      setIsConfirmed(false);
    }
  }, [account, isOpen]);

  if (!account) return null;

  const previousBalancePaise = account.currentRecordedBalancePaise;
  const newActualPaise = parseINRToPaise(actualInput, true);

  const differencePaise = newActualPaise !== null ? newActualPaise - previousBalancePaise : 0;
  const isPositive = differencePaise > 0;
  const isNegative = differencePaise < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActualPaise === null) {
      showError('Please enter a valid numeric actual balance.');
      return;
    }
    if (!reason.trim()) {
      showError('Adjustment reason is required for audit history.');
      return;
    }
    if (!isConfirmed) {
      showError('Please confirm the balance adjustment before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isoTimestamp = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      StorageAdapter.executeManualBalanceUpdate(
        account.id,
        newActualPaise,
        reason,
        referenceNote.trim() || undefined,
        isoTimestamp
      );

      showSuccess(
        'Balance updated successfully',
        `${account.name} balance adjusted to ${formatPaiseToINR(newActualPaise)} (${differencePaise >= 0 ? '+' : ''}${formatPaiseToINR(differencePaise)}).`
      );

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to update balance';
      showError('Update failed', msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Balance — ${account.name}`}
      description="Record an auditable manual balance adjustment with exact variance tracking."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Previous vs New vs Difference Visual Block (Solid Colors) */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Previous Recorded
            </span>
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
              {formatPaiseToINR(previousBalancePaise)}
            </span>
          </div>

          <div className="border-x border-slate-200 dark:border-slate-700 px-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              New Actual
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {newActualPaise !== null ? formatPaiseToINR(newActualPaise) : '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Adjustment
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                isPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isNegative
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatPaiseToINR(differencePaise)}
            </span>
          </div>
        </div>

        {/* Input Form Fields */}
        <Input
          label="New Verified Actual Balance (₹) *"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={actualInput}
          onChange={(e) => setActualInput(e.target.value)}
          autoFocus
          helperText="Enter the exact balance currently shown on your bank, wallet, card, or cash recount."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Reason for Adjustment *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: 'Physical recount of balance', label: 'Physical recount of balance' },
              { value: 'Bank statement reconciliation', label: 'Bank statement reconciliation' },
              { value: 'Unrecorded ATM cash withdrawal', label: 'Unrecorded ATM cash withdrawal' },
              { value: 'Unrecorded cash spending', label: 'Unrecorded cash spending' },
              { value: 'Bank charges / interest adjustment', label: 'Bank charges / interest adjustment' },
              { value: 'Correction of previous entry error', label: 'Correction of previous entry error' },
              { value: 'Other manual correction', label: 'Other manual correction' },
            ]}
          />

          <Input
            label="Verification Date & Time"
            type="datetime-local"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </div>

        <Textarea
          label="Reference Note / Statement Details (Optional)"
          rows={2}
          placeholder="e.g. Recount of cash box at end of day, Kotak passbook entry ref #892"
          value={referenceNote}
          onChange={(e) => setReferenceNote(e.target.value)}
        />

        {/* Audit Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Auditable Record:</strong> This update creates an immutable balance adjustment record preserving the previous balance of <strong>{formatPaiseToINR(previousBalancePaise)}</strong> and records an adjustment of <strong>{differencePaise >= 0 ? '+' : ''}{formatPaiseToINR(differencePaise)}</strong> in the ledger.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <span>I confirm this verified balance update for {account.name}.</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!isConfirmed || newActualPaise === null}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Balance Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
