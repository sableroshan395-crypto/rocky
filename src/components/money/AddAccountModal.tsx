import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { parseINRToPaise } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { Account, AccountType, AccountCategory } from '@/types/financial';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  onSuccess?: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [category, setCategory] = useState<AccountCategory>('personal');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('0.00');
  const [includeInNetTotal, setIncludeInNetTotal] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setName(accountToEdit.name);
        setType(accountToEdit.type);
        setCategory(accountToEdit.category);
        setOpeningBalanceStr((accountToEdit.openingBalancePaise / 100).toFixed(2));
        setIncludeInNetTotal(accountToEdit.includeInNetTotal);
        setNotes(accountToEdit.notes || '');
      } else {
        setName('');
        setType('bank');
        setCategory('personal');
        setOpeningBalanceStr('0.00');
        setIncludeInNetTotal(true);
        setNotes('');
      }
    }
  }, [isOpen, accountToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Account name is required.');
      return;
    }

    const openingPaise = parseINRToPaise(openingBalanceStr) || 0;

    try {
      setIsSubmitting(true);
      const timestamp = new Date().toISOString();

      if (accountToEdit) {
        const updated: Account = {
          ...accountToEdit,
          name: name.trim(),
          type,
          category,
          includeInNetTotal,
          notes: notes.trim() || undefined,
          updatedAt: timestamp,
        };
        StorageAdapter.saveAccount(updated);
        showSuccess('Account updated', `"${updated.name}" details saved.`);
      } else {
        const newAccount: Account = {
          id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: name.trim(),
          type,
          category,
          openingBalancePaise: openingPaise,
          currentRecordedBalancePaise: openingPaise,
          lastVerifiedBalancePaise: openingPaise,
          lastVerifiedDate: timestamp,
          isArchived: false,
          includeInNetTotal,
          notes: notes.trim() || undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        StorageAdapter.saveAccount(newAccount);
        showSuccess('Account added', `"${newAccount.name}" created with opening balance.`);
      }

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to save account';
      showError('Error', msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? `Edit Account — ${accountToEdit.name}` : 'Add New Account or Wallet'}
      description="Configure accounts, bank relations, wallets, or cash pools."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Account Name *"
          placeholder="e.g. HDFC Bank, PayTM Wallet, Emergency Cash"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Account Type *"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            options={[
              { value: 'cash', label: 'Cash in Hand' },
              { value: 'bank', label: 'Bank Account' },
              { value: 'wallet', label: 'Digital Wallet' },
              { value: 'prepaid_card', label: 'Prepaid Card' },
              { value: 'custom', label: 'Custom / Other' },
            ]}
          />

          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as AccountCategory)}
            options={[
              { value: 'personal', label: 'Personal' },
              { value: 'business', label: 'Business' },
              { value: 'work', label: 'Work / Authorized' },
            ]}
          />
        </div>

        {!accountToEdit && (
          <Input
            label="Opening Balance (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={openingBalanceStr}
            onChange={(e) => setOpeningBalanceStr(e.target.value)}
            helperText="Starting balance for your initial ledger count."
          />
        )}

        <Textarea
          label="Notes / Account Details (Optional)"
          rows={2}
          placeholder="Account identifier, branch, or usage instructions (never store sensitive passwords/PINs)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={includeInNetTotal}
            onChange={(e) => setIncludeInNetTotal(e.target.checked)}
            className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <span>Include this account in "Recorded Total Funds" calculation</span>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!name.trim()}
            leftIcon={accountToEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {accountToEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
