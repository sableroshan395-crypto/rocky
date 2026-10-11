import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { formatPaiseToINR, formatDateTime } from '@/utils/formatters';
import { AddTransactionModal } from '@/components/money/AddTransactionModal';
import { useToast } from '@/context/ToastContext';
import type { Account, Transaction } from '@/types/financial';

interface OutletContextType {
  accounts: Account[];
  transactions: Transaction[];
  triggerRefresh: () => void;
}

export const TransactionsPage: React.FC = () => {
  const { accounts, transactions, triggerRefresh } = useOutletContext<OutletContextType>();
  const { showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Account map for quick lookup
  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    for (const a of accounts) map.set(a.id, a);
    return map;
  }, [accounts]);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (accountFilter !== 'all') {
      list = list.filter((t) => t.accountId === accountFilter);
    }

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.referenceId && t.referenceId.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortDirection === 'desc' ? diff : -diff;
      } else {
        const diff = b.amountPaise - a.amountPaise;
        return sortDirection === 'desc' ? diff : -diff;
      }
    });

    return list;
  }, [transactions, accountFilter, typeFilter, searchQuery, sortField, sortDirection]);

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Account',
      'Type',
      'Amount (Paise)',
      'Amount (INR)',
      'Category',
      'Description',
      'Reference ID',
      'Linked Transfer ID',
      'Status',
    ];

    const rows = filteredTransactions.map((t) => {
      const acc = accountMap.get(t.accountId);
      return [
        t.id,
        `"${t.date}"`,
        `"${acc ? acc.name : t.accountId}"`,
        t.type,
        t.amountPaise,
        (t.amountPaise / 100).toFixed(2),
        `"${t.category}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.referenceId || ''}"`,
        `"${t.linkedTransferId || ''}"`,
        t.status,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rocky_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Exported transactions CSV', `Exported ${filteredTransactions.length} records.`);
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search transactions, payee, category, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Accounts' },
              ...accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'expense', label: 'Expenses' },
              { value: 'income', label: 'Income' },
              { value: 'transfer', label: 'Transfers' },
              { value: 'balance_adjustment', label: 'Adjustments' },
            ]}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Entry
          </Button>
        </div>
      </div>

      {/* Ledger Table (High-Density Solid Color Aesthetic) */}
      <Card>
        <CardHeader>
          <CardTitle>Master Transaction Ledger</CardTitle>
          <span className="text-[11px] font-mono text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length} records
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions matching your search filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                  <tr>
                    <th
                      className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">
                        Date {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </span>
                    </th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Amount {sortField === 'amount' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((tx) => {
                    const acc = accountMap.get(tx.accountId);
                    const isCredit =
                      tx.type === 'income' ||
                      tx.type === 'refund' ||
                      (tx.type === 'transfer' && tx.category === 'Transfer In');

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {formatDateTime(tx.date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {acc ? acc.name : 'Unknown Account'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            size="sm"
                            variant={
                              tx.type === 'expense'
                                ? 'danger'
                                : tx.type === 'income'
                                ? 'success'
                                : tx.type === 'transfer'
                                ? 'primary'
                                : 'default'
                            }
                            className="capitalize"
                          >
                            {tx.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                            {tx.description}
                          </span>
                          {tx.referenceId && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Ref: {tx.referenceId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {tx.category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge size="sm" variant="neutral" className="capitalize">
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                          {(() => {
                            if (tx.type === 'balance_adjustment') {
                              const diffMatch = tx.notes?.match(/Difference:\s*(-?\d+)/);
                              const isPositiveAdj = diffMatch ? parseInt(diffMatch[1], 10) >= 0 : true;
                              return (
                                <span className={isPositiveAdj ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                                  {isPositiveAdj ? '+' : '-'}{formatPaiseToINR(tx.amountPaise)}
                                </span>
                              );
                            }
                            return (
                              <span
                                className={
                                  isCredit
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : tx.type === 'expense' || tx.category === 'Transfer Out'
                                    ? 'text-rose-700 dark:text-rose-400'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              >
                                {isCredit ? '+' : '-'}
                                {formatPaiseToINR(tx.amountPaise)}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        accounts={accounts}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
