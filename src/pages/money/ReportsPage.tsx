import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { formatPaiseToINR } from '@/utils/formatters';
import { calculateLedgerBalance } from '@/types/financial';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import { UpdateBalanceModal } from '@/components/money/UpdateBalanceModal';
import type { Account, Transaction } from '@/types/financial';

interface OutletContextType {
  accounts: Account[];
  transactions: Transaction[];
  triggerRefresh: () => void;
}

export const ReportsPage: React.FC = () => {
  const { accounts, transactions, triggerRefresh } = useOutletContext<OutletContextType>();
  const { showSuccess } = useToast();

  const [selectedAccountForRec, setSelectedAccountForRec] = useState<Account | null>(null);

  const adjustments = useMemo(() => StorageAdapter.getAdjustments(), []);

  // Compute account reconciliation variances
  const reconciliationReport = useMemo(() => {
    return accounts.map((acc) => {
      const accTransactions = transactions.filter((t) => t.accountId === acc.id);
      const accAdjustments = adjustments.filter((a) => a.accountId === acc.id);

      const calculatedBalancePaise = calculateLedgerBalance(
        acc.openingBalancePaise,
        accTransactions,
        accAdjustments
      );

      const recordedBalancePaise = acc.currentRecordedBalancePaise;
      const variancePaise = recordedBalancePaise - calculatedBalancePaise;

      return {
        account: acc,
        recordedBalancePaise,
        calculatedBalancePaise,
        variancePaise,
        isReconciled: variancePaise === 0,
      };
    });
  }, [accounts, transactions, adjustments]);

  // Monthly Income vs Expense Breakdown
  const monthlyBreakdown = useMemo(() => {
    const monthsMap = new Map<string, { incomePaise: number; expensePaise: number }>();

    for (const tx of transactions) {
      if (tx.status !== 'completed' && tx.status !== 'reconciled') continue;
      if (tx.type !== 'income' && tx.type !== 'expense' && tx.type !== 'refund') continue;

      const dateObj = new Date(tx.date);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

      const curr = monthsMap.get(monthKey) || { incomePaise: 0, expensePaise: 0 };
      if (tx.type === 'income' || tx.type === 'refund') {
        curr.incomePaise += tx.amountPaise;
      } else if (tx.type === 'expense') {
        curr.expensePaise += tx.amountPaise;
      }
      monthsMap.set(monthKey, curr);
    }

    return Array.from(monthsMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const handleExportReconciliationCSV = () => {
    const headers = [
      'Account Name',
      'Account Type',
      'Recorded Balance (INR)',
      'Ledger Calculated (INR)',
      'Variance (INR)',
      'Status',
      'Last Verified Date',
    ];

    const rows = reconciliationReport.map((r) => [
      `"${r.account.name}"`,
      r.account.type,
      (r.recordedBalancePaise / 100).toFixed(2),
      (r.calculatedBalancePaise / 100).toFixed(2),
      (r.variancePaise / 100).toFixed(2),
      r.isReconciled ? 'RECONCILED' : 'DISCREPANCY',
      r.account.lastVerifiedDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rocky_reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Reconciliation CSV exported', 'Downloaded reconciliation variance audit report.');
  };

  return (
    <div className="space-y-5">
      {/* Reconciliation Variance Audit Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Account Balance Reconciliation & Variance Audit</CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison between your latest verified recorded balance and the sum of underlying ledger movements.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReconciliationCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Variance Report
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3 text-right">Recorded Balance</th>
                  <th className="px-4 py-3 text-right">Ledger Calculated</th>
                  <th className="px-4 py-3 text-right">Variance</th>
                  <th className="px-4 py-3">Audit Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reconciliationReport.map((r) => (
                  <tr key={r.account.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {r.account.name}
                      <span className="text-[10px] font-normal text-slate-400 block capitalize">
                        {r.account.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatPaiseToINR(r.recordedBalancePaise)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatPaiseToINR(r.calculatedBalancePaise)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                      {r.variancePaise === 0 ? (
                        <span className="text-slate-400">₹0.00</span>
                      ) : (
                        <span
                          className={
                            r.variancePaise > 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }
                        >
                          {r.variancePaise > 0 ? '+' : ''}
                          {formatPaiseToINR(r.variancePaise)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.isReconciled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Reconciled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Variance Detected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAccountForRec(r.account)}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Cash Flow Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Net Cash Flow</CardTitle>
          <span className="text-[11px] text-slate-400">Historical personal income & expense trends</span>
        </CardHeader>
        <CardContent className="p-0">
          {monthlyBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No completed monthly income or expense transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3 text-right">Income</th>
                    <th className="px-4 py-3 text-right">Expenses</th>
                    <th className="px-4 py-3 text-right">Net Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyBreakdown.map(([monthKey, data]) => {
                    const netPaise = data.incomePaise - data.expensePaise;
                    return (
                      <tr key={monthKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {monthKey}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatPaiseToINR(data.incomePaise)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          -{formatPaiseToINR(data.expensePaise)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <span
                            className={
                              netPaise >= 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }
                          >
                            {netPaise >= 0 ? '+' : ''}
                            {formatPaiseToINR(netPaise)}
                          </span>
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

      {/* Adjust Modal */}
      <UpdateBalanceModal
        isOpen={Boolean(selectedAccountForRec)}
        onClose={() => setSelectedAccountForRec(null)}
        account={selectedAccountForRec}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
