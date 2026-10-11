import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Wallet,
  Banknote,
  Receipt,
  Percent,
  Gamepad2,
  FileBarChart,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { TransferModal } from '@/components/money/TransferModal';
import { AddTransactionModal } from '@/components/money/AddTransactionModal';
import { AddAccountModal } from '@/components/money/AddAccountModal';
import type { Account, Transaction } from '@/types/financial';

export const MoneyCenterLayout: React.FC = () => {
  const location = useLocation();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const loadData = () => {
    setAccounts(StorageAdapter.getAccounts());
    setTransactions(StorageAdapter.getTransactions());
  };

  useEffect(() => {
    loadData();
  }, [refreshCount]);

  const triggerRefresh = () => {
    setRefreshCount((c) => c + 1);
  };

  const totals = useMemo(() => {
    let recordedTotalFundsPaise = 0;
    let cashPaise = 0;
    let bankPaise = 0;
    let totalInflowPaise = 0;
    let totalOutflowPaise = 0;

    for (const acc of accounts) {
      if (acc.isArchived) continue;
      if (acc.includeInNetTotal) {
        recordedTotalFundsPaise += acc.currentRecordedBalancePaise;
      }
      if (acc.type === 'cash') {
        cashPaise += acc.currentRecordedBalancePaise;
      } else if (acc.type === 'bank') {
        bankPaise += acc.currentRecordedBalancePaise;
      }
    }

    for (const tx of transactions) {
      if (tx.status === 'completed' || tx.status === 'reconciled') {
        if (tx.type === 'income' || tx.type === 'refund') {
          totalInflowPaise += tx.amountPaise;
        } else if (tx.type === 'expense') {
          totalOutflowPaise += tx.amountPaise;
        }
      }
    }

    return {
      recordedTotalFundsPaise,
      cashPaise,
      bankPaise,
      totalInflowPaise,
      totalOutflowPaise,
      activeAccountsCount: accounts.filter((a) => !a.isArchived).length,
    };
  }, [accounts, transactions]);

  const navTabs = [
    { name: 'Accounts & Balances', path: '/money/accounts', icon: <Wallet className="w-3.5 h-3.5" /> },
    { name: 'Cash in Hand', path: '/money/cashbook', icon: <Banknote className="w-3.5 h-3.5" /> },
    { name: 'Transaction Ledger', path: '/money/transactions', icon: <Receipt className="w-3.5 h-3.5" /> },
    { name: 'Work & Commission', path: '/money/commission', icon: <Percent className="w-3.5 h-3.5" /> },
    { name: 'Gambling Tracker', path: '/money/gambling', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { name: 'Reports & Audit', path: '/money/reports', icon: <FileBarChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner (Solid High-Density Financial Dashboard) */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Recorded Total Funds (Last Verified)
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                {formatPaiseToINR(totals.recordedTotalFundsPaise)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                across {totals.activeAccountsCount} active accounts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Derived from verified physical cash count, bank balances, and prepaid card ledgers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddTxOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Transaction
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTransferOpen(true)}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            >
              Transfer Funds
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddAccountOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Account
            </Button>
          </div>
        </div>

        {/* Financial KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cash in Hand</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatPaiseToINR(totals.cashPaise)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Bank Accounts</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatPaiseToINR(totals.bankPaise)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">Total Inflows</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              +{formatPaiseToINR(totals.totalInflowPaise)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 block">Total Outflows</span>
            <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
              -{formatPaiseToINR(totals.totalOutflowPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1 pb-px scrollbar-none">
        {navTabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (location.pathname === '/money' && tab.path === '/money/accounts');

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 -mb-px'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              {tab.icon}
              {tab.name}
            </NavLink>
          );
        })}
      </div>

      {/* Sub-Route View */}
      <Outlet context={{ accounts, transactions, triggerRefresh }} />

      {/* Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        accounts={accounts}
        onSuccess={triggerRefresh}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        accounts={accounts}
        onSuccess={triggerRefresh}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
