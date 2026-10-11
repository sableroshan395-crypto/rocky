import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPaiseToINR, formatDateDDMMYYYY, formatDateTime } from '@/utils/formatters';
import { UpdateBalanceModal } from '@/components/money/UpdateBalanceModal';
import { TransferModal } from '@/components/money/TransferModal';
import { AddTransactionModal } from '@/components/money/AddTransactionModal';
import type { Account, Transaction } from '@/types/financial';

interface OutletContextType {
  accounts: Account[];
  transactions: Transaction[];
  triggerRefresh: () => void;
}

export const CashbookPage: React.FC = () => {
  const { accounts, transactions, triggerRefresh } = useOutletContext<OutletContextType>();

  const cashAccount = accounts.find((a) => a.id === 'acc_cash' || a.type === 'cash');

  const [isUpdateBalanceOpen, setIsUpdateBalanceOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);

  // Filter cash transactions
  const cashTransactions = useMemo(() => {
    if (!cashAccount) return [];
    return transactions.filter((t) => t.accountId === cashAccount.id);
  }, [transactions, cashAccount]);

  // Aggregate cash stats
  const cashStats = useMemo(() => {
    let cashReceived = 0;
    let cashSpent = 0;
    let cashWithdrawnFromBanks = 0;
    let cashDepositedIntoBanks = 0;
    let adjustmentsTotal = 0;

    for (const tx of cashTransactions) {
      if (tx.status !== 'completed' && tx.status !== 'reconciled') continue;

      if (tx.type === 'income' || tx.type === 'refund') {
        cashReceived += tx.amountPaise;
      } else if (tx.type === 'expense') {
        cashSpent += tx.amountPaise;
      } else if (tx.type === 'transfer') {
        if (tx.category === 'Transfer In' || tx.description.toLowerCase().includes('from')) {
          cashWithdrawnFromBanks += tx.amountPaise;
        } else {
          cashDepositedIntoBanks += tx.amountPaise;
        }
      } else if (tx.type === 'balance_adjustment') {
        const diffMatch = tx.notes?.match(/Difference:\s*(-?\d+)/);
        const signedDiff = diffMatch ? parseInt(diffMatch[1], 10) : tx.amountPaise;
        adjustmentsTotal += signedDiff;
      }
    }

    return {
      cashReceived,
      cashSpent,
      cashWithdrawnFromBanks,
      cashDepositedIntoBanks,
      adjustmentsTotal,
    };
  }, [cashTransactions]);

  if (!cashAccount) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
        No "Cash in Hand" account configured. Please create a Cash account in Accounts & Balances.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero Cash Balance Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Physical Cash in Hand
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                  {formatPaiseToINR(cashAccount.currentRecordedBalancePaise)}
                </span>
                <span className="text-xs text-slate-500 font-medium">recorded currency</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Last physical recount: {cashAccount.lastVerifiedDate ? formatDateTime(cashAccount.lastVerifiedDate) : 'Not verified yet'}
              </p>
            </div>
          </div>

          {/* Quick Actions (Solid Colors) */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCashInOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Add Cash In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCashOutOpen(true)}
              leftIcon={<Minus className="w-3.5 h-3.5" />}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Add Cash Out
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsWithdrawOpen(true)}
              leftIcon={<ArrowDownLeft className="w-3.5 h-3.5" />}
              title="Withdraw cash from Bank or OmniCard to Cash"
            >
              Withdraw to Cash
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDepositOpen(true)}
              leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              title="Deposit physical cash into Bank"
            >
              Deposit to Bank
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateBalanceOpen(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reconcile Cash
            </Button>
          </div>
        </div>

        {/* Cash Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
              Cash Received (Inflow)
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              +{formatPaiseToINR(cashStats.cashReceived)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 block">
              Cash Spent (Expenses)
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              -{formatPaiseToINR(cashStats.cashSpent)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 block">
              ATM / Bank Withdrawals
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              +{formatPaiseToINR(cashStats.cashWithdrawnFromBanks)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
              Deposited to Bank
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              -{formatPaiseToINR(cashStats.cashDepositedIntoBanks)}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Movement Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Transaction Ledger</CardTitle>
          <span className="text-[11px] text-slate-400">
            {cashTransactions.length} recorded cash movements
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {cashTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No cash movements recorded yet. Use the action buttons above to record cash in, out, or ATM withdrawals.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cashTransactions.map((tx) => {
                    const isCredit =
                      tx.type === 'income' ||
                      tx.type === 'refund' ||
                      (tx.type === 'transfer' && tx.category === 'Transfer In');

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {formatDateDDMMYYYY(tx.date)}
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {tx.description}
                          </span>
                          {tx.referenceId && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Ref: {tx.referenceId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {tx.category}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
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

      {/* Reconcile / Manual Update Modal */}
      <UpdateBalanceModal
        isOpen={isUpdateBalanceOpen}
        onClose={() => setIsUpdateBalanceOpen(false)}
        account={cashAccount}
        onSuccess={triggerRefresh}
      />

      {/* Withdraw Cash Modal (Withdraw from bank/card to Cash) */}
      <TransferModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        accounts={accounts}
        defaultTargetId={cashAccount.id}
        onSuccess={triggerRefresh}
      />

      {/* Deposit Cash Modal (Deposit from Cash to bank) */}
      <TransferModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        accounts={accounts}
        defaultSourceId={cashAccount.id}
        onSuccess={triggerRefresh}
      />

      {/* Cash In Modal */}
      <AddTransactionModal
        isOpen={isCashInOpen}
        onClose={() => setIsCashInOpen(false)}
        accounts={accounts}
        defaultAccountId={cashAccount.id}
        defaultType="income"
        onSuccess={triggerRefresh}
      />

      {/* Cash Out Modal */}
      <AddTransactionModal
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
        accounts={accounts}
        defaultAccountId={cashAccount.id}
        defaultType="expense"
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
