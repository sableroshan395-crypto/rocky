import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { parseINRToPaise, formatPaiseToINR } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { Account, Transaction } from '@/types/financial';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  defaultAccountId?: string;
  defaultType?: 'expense' | 'income';
  onSuccess?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  defaultAccountId,
  defaultType = 'expense',
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || '');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultAccountId) setAccountId(defaultAccountId);
      setType(defaultType);
      setDateStr(new Date().toISOString().slice(0, 16));
      setAmountStr('');
      setDescription('');
      setReferenceId('');
      setNotes('');
      setCategory(defaultType === 'expense' ? 'Food & Dining' : 'Salary');
    }
  }, [isOpen, defaultAccountId, defaultType]);

  const account = accounts.find((a) => a.id === accountId);
  const amountPaise = parseINRToPaise(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      showError('Please select a valid account.');
      return;
    }
    if (amountPaise <= 0) {
      showError('Amount must be greater than zero.');
      return;
    }
    if (!description.trim()) {
      showError('Description is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const timestamp = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

      const tx: Transaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: timestamp,
        accountId,
        type,
        amountPaise,
        category: category.trim() || 'General',
        description: description.trim(),
        referenceId: referenceId.trim() || undefined,
        status: 'completed',
        notes: notes.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      StorageAdapter.saveTransaction(tx);

      showSuccess(
        `${type === 'expense' ? 'Expense' : 'Income'} recorded`,
        `${formatPaiseToINR(amountPaise)} on ${account.name} (${tx.description}).`
      );

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to record transaction';
      showError('Action failed', msg);
    }
  };

  const expenseCategories = [
    'Food & Dining',
    'Groceries',
    'Transport / Fuel',
    'Bills & Utilities',
    'Shopping',
    'Entertainment',
    'Personal & Health',
    'Business Expense',
    'Education & Books',
    'General',
  ];

  const incomeCategories = [
    'Salary',
    'Business Revenue',
    'Freelance / Gig',
    'Investment Returns',
    'Gift / Pocket Money',
    'Refund',
    'General',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      description="Add an income or expense transaction to your personal ledger."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle: Solid button pills */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Food & Dining');
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Expense (Outflow)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Salary');
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Income (Inflow)
          </button>
        </div>

        {/* Account and Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Account *"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            options={accounts
              .filter((a) => !a.isArchived)
              .map((a) => ({
                value: a.id,
                label: `${a.name} (${formatPaiseToINR(a.currentRecordedBalancePaise)})`,
              }))}
          />

          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            autoFocus
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={(type === 'expense' ? expenseCategories : incomeCategories).map((c) => ({
              value: c,
              label: c,
            }))}
          />

          <Input
            label="Date & Time"
            type="datetime-local"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </div>

        {/* Description & Reference */}
        <Input
          label="Description / Payee *"
          placeholder="e.g. Grocery store, Petrol station, Chai, Client payment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Reference ID (Optional)"
            placeholder="e.g. UPI Ref / Bill No."
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
          <Input
            label="Notes (Optional)"
            placeholder="Additional context"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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
            disabled={amountPaise <= 0 || !description.trim()}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
