import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  Search,
  RefreshCw,
  Edit2,
  Archive,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { formatPaiseToINR, timeAgo } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import { UpdateBalanceModal } from '@/components/money/UpdateBalanceModal';
import { AddAccountModal } from '@/components/money/AddAccountModal';
import type { Account, AccountType } from '@/types/financial';

interface OutletContextType {
  accounts: Account[];
  triggerRefresh: () => void;
}

export const AccountsPage: React.FC = () => {
  const { accounts, triggerRefresh } = useOutletContext<OutletContextType>();
  const { showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  const [selectedAccountForUpdate, setSelectedAccountForUpdate] = useState<Account | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredAccounts = accounts.filter((acc) => {
    if (!showArchived && acc.isArchived) return false;
    if (showArchived && !acc.isArchived) return false;
    if (typeFilter !== 'all' && acc.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        (acc.notes && acc.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'bank':
        return <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'prepaid_card':
        return <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleToggleArchive = (account: Account) => {
    const next = !account.isArchived;
    StorageAdapter.archiveAccount(account.id, next);
    triggerRefresh();
    showSuccess(next ? 'Account archived' : 'Account restored', `"${account.name}"`);
  };

  const handleExportCSV = () => {
    const headers = ['Account ID', 'Name', 'Type', 'Category', 'Current Balance (Paise)', 'Current Balance (INR)', 'Last Verified Date', 'Archived'];
    const rows = accounts.map((a) => [
      a.id,
      `"${a.name}"`,
      a.type,
      a.category,
      a.currentRecordedBalancePaise,
      (a.currentRecordedBalancePaise / 100).toFixed(2),
      a.lastVerifiedDate || '',
      a.isArchived ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rocky_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Exported accounts CSV', 'Downloaded account summary data.');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <Input
            placeholder="Search accounts by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Account Types' },
              { value: 'cash', label: 'Cash' },
              { value: 'bank', label: 'Banks' },
              { value: 'wallet', label: 'Wallets' },
              { value: 'prepaid_card', label: 'Prepaid Cards' },
              { value: 'custom', label: 'Custom' },
            ]}
          />

          <Button
            variant={showArchived ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Viewing Archived' : 'Archived'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Export CSV"
          >
            CSV
          </Button>
        </div>
      </div>

      {/* Account Cards Grid (Solid Modern Information-Dense Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          // Check if balance is stale (> 7 days)
          const lastDate = acc.lastVerifiedDate ? new Date(acc.lastVerifiedDate) : null;
          const isStale = lastDate ? Date.now() - lastDate.getTime() > 7 * 24 * 3600 * 1000 : true;

          return (
            <Card
              key={acc.id}
              className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="p-4">
                {/* Header: Icon, Name & Type */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {acc.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge size="sm" variant="neutral" className="capitalize text-[10px]">
                          {acc.type.replace('_', ' ')}
                        </Badge>
                        <Badge size="sm" variant="default" className="capitalize text-[10px]">
                          {acc.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Edit action */}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountToEdit(acc);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit account details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Balance Display */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Current Recorded Balance
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                      {formatPaiseToINR(acc.currentRecordedBalancePaise)}
                    </span>
                  </div>
                </div>

                {/* Verification Status Chip */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    {isStale ? (
                      <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Stale (Verify)
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {acc.lastVerifiedDate ? `Verified ${timeAgo(acc.lastVerifiedDate)}` : 'Never verified'}
                  </span>
                </div>

                {acc.notes && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
                    {acc.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedAccountForUpdate(acc)}
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                  className="flex-1 font-semibold text-xs"
                >
                  Update Balance
                </Button>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(acc)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title={acc.isArchived ? 'Restore account' : 'Archive account'}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
          No accounts found matching your query or filter.
        </div>
      )}

      {/* Manual Balance Update Modal */}
      <UpdateBalanceModal
        isOpen={Boolean(selectedAccountForUpdate)}
        onClose={() => setSelectedAccountForUpdate(null)}
        account={selectedAccountForUpdate}
        onSuccess={triggerRefresh}
      />

      {/* Edit Account Modal */}
      <AddAccountModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
