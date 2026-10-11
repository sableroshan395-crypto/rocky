import React from 'react';
import { Wallet, ShieldCheck, Banknote, CreditCard, Landmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const MoneyCenterPage: React.FC = () => {
  const initialAccountLabels = [
    { name: 'Cash in Hand', type: 'Physical Cash', icon: <Banknote className="w-4 h-4 text-emerald-500" /> },
    { name: 'OmniCard', type: 'Prepaid Card / Wallet', icon: <CreditCard className="w-4 h-4 text-indigo-500" /> },
    { name: 'Kotak Bank', type: 'Savings Bank Account', icon: <Landmark className="w-4 h-4 text-rose-500" /> },
    { name: 'Amazon Pay', type: 'Digital Wallet', icon: <Wallet className="w-4 h-4 text-amber-500" /> },
    { name: 'MobiKwik', type: 'Digital Wallet', icon: <Wallet className="w-4 h-4 text-blue-500" /> },
    { name: 'Airtel Payments Bank', type: 'Payments Bank', icon: <Landmark className="w-4 h-4 text-red-500" /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Money Center
            </h1>
            <Badge variant="primary" size="md">Roadmap: Phase 2</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal finance, multi-account ledger, manual balance updates, and cashbook management.
          </p>
        </div>
      </div>

      {/* Honest Phase 2 Scope & Architectural Groundwork Notice */}
      <Card className="border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20">
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Phase 1 Groundwork Active: Strict Integer Paise Data Models
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            All data contracts have been defined in Phase 1 with safe integer paise arithmetic (<code className="font-mono text-indigo-600">amountInPaise</code>), immutable audit tracking, and relational account UUIDs. In accordance with project instructions, incomplete calculations and fake balances are not rendered here until Phase 2 is implemented.
          </p>
        </CardContent>
      </Card>

      {/* Planned Accounts Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Target Accounts (To Be Initialized in Phase 2)</CardTitle>
          <span className="text-[11px] text-slate-400">Labels only — no API access assumed</span>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialAccountLabels.map((acc) => (
              <li key={acc.name} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {acc.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{acc.type}</span>
                  </div>
                </div>
                <Badge variant="neutral">Phase 2 Target</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Phase 2 Feature Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Ledger & Balances</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <p>• <strong>Manual Balance Updates:</strong> prominent adjustment action with auto-calculated difference <code className="font-mono text-[11px]">(New Actual - Previous Recorded)</code>.</p>
            <p>• <strong>Cash in Hand Ledger:</strong> linked cash-in, cash-out, withdrawals, and deposits.</p>
            <p>• <strong>Atomic Linked Transfers:</strong> moving money between accounts without double counting income/expenses.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Work & Awareness</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <p>• <strong>Account Work & Commission:</strong> default 3.2% commission rate with eligible basis tracking.</p>
            <p>• <strong>Gambling Session Tracker:</strong> awareness and spending control with session limits.</p>
            <p>• <strong>Reconciliation Reports:</strong> auditable variance reports and CSV exports.</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <p className="text-xs text-slate-500">
          Ready to activate this module? Let's verify and complete Phase 1 first.
        </p>
        <Button variant="secondary" size="sm" disabled>
          Activate Money Center (Scheduled for Phase 2)
        </Button>
      </div>
    </div>
  );
};
