import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { Account, TransferRequest } from '@/types/financial';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  defaultSourceId?: string;
  defaultTargetId?: string;
  onSuccess?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  defaultSourceId,
  defaultTargetId,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [sourceId, setSourceId] = useState(defaultSourceId || accounts[0]?.id || '');
  const [targetId, setTargetId] = useState(defaultTargetId || accounts[1]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultSourceId) setSourceId(defaultSourceId);
      if (defaultTargetId) setTargetId(defaultTargetId);
      setDateStr(new Date().toISOString().slice(0, 16));
      setAmountStr('');
      setDescription('');
      setReferenceId('');
    }
  }, [isOpen, defaultSourceId, defaultTargetId]);

  const sourceAccount = accounts.find((a) => a.id === sourceId);
  const targetAccount = accounts.find((a) => a.id === targetId);

  const amountPaise = parseINRToPaise(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceAccount || !targetAccount) {
      showError('Please select valid source and destination accounts.');
      return;
    }
    if (sourceId === targetId) {
      showError('Source and destination accounts must be different.');
      return;
    }
    if (amountPaise <= 0) {
      showError('Please enter a valid transfer amount greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      const req: TransferRequest = {
        sourceAccountId: sourceId,
        targetAccountId: targetId,
        amountPaise,
        date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
        description: description.trim() || `Transfer from ${sourceAccount.name} to ${targetAccount.name}`,
        referenceId: referenceId.trim() || undefined,
      };

      StorageAdapter.executeTransfer(req);

      showSuccess(
        'Transfer completed',
        `Moved ${formatPaiseToINR(amountPaise)} from ${sourceAccount.name} to ${targetAccount.name}.`
      );

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Transfer failed';
      showError('Transfer failed', msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Funds Between Accounts"
      description="Record an atomic transfer between accounts without double counting income or expenses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source and Destination Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="From (Source Account) *"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            options={accounts
              .filter((a) => !a.isArchived)
              .map((a) => ({
                value: a.id,
                label: `${a.name} (${formatPaiseToINR(a.currentRecordedBalancePaise)})`,
              }))}
          />

          <Select
            label="To (Destination Account) *"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            options={accounts
              .filter((a) => !a.isArchived)
              .map((a) => ({
                value: a.id,
                label: `${a.name} (${formatPaiseToINR(a.currentRecordedBalancePaise)})`,
              }))}
          />
        </div>

        {/* Transfer Amount */}
        <Input
          label="Transfer Amount (₹) *"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          autoFocus
        />

        {/* Balance Preview (Solid Color Box) */}
        {sourceAccount && targetAccount && amountPaise > 0 && sourceId !== targetId && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Balance Impact Preview
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">{sourceAccount.name}</span>
                <span className="line-through text-slate-400 mr-1.5">
                  {formatPaiseToINR(sourceAccount.currentRecordedBalancePaise)}
                </span>
                <ArrowRight className="w-3 h-3 inline text-slate-400 mx-0.5" />
                <span className="font-bold text-rose-600 dark:text-rose-400 ml-1">
                  {formatPaiseToINR(sourceAccount.currentRecordedBalancePaise - amountPaise)}
                </span>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">{targetAccount.name}</span>
                <span className="line-through text-slate-400 mr-1.5">
                  {formatPaiseToINR(targetAccount.currentRecordedBalancePaise)}
                </span>
                <ArrowRight className="w-3 h-3 inline text-slate-400 mx-0.5" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                  {formatPaiseToINR(targetAccount.currentRecordedBalancePaise + amountPaise)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date & Time"
            type="datetime-local"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
          <Input
            label="Reference ID (Optional)"
            placeholder="e.g. UTR / IMPS / ATM Slip Ref"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
        </div>

        <Input
          label="Description / Purpose"
          placeholder="e.g. ATM cash withdrawal, Salary deposit, Wallet reload"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Protection Notice */}
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Transfers are matched linked entries. They do not increase income or count as expense.
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={amountPaise <= 0 || sourceId === targetId}
            leftIcon={<ArrowRightLeft className="w-4 h-4" />}
          >
            Execute Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
