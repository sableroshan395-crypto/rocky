import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthPage } from '@/pages/AuthPage';
import { CommandCenter } from '@/pages/CommandCenter';
import { MoneyCenterLayout } from '@/pages/money/MoneyCenterLayout';
import { AccountsPage } from '@/pages/money/AccountsPage';
import { CashbookPage } from '@/pages/money/CashbookPage';
import { TransactionsPage } from '@/pages/money/TransactionsPage';
import { CommissionLedgerPage } from '@/pages/money/CommissionLedgerPage';
import { GamblingTrackerPage } from '@/pages/money/GamblingTrackerPage';
import { ReportsPage } from '@/pages/money/ReportsPage';
import { ToolsHubPage } from '@/pages/ToolsHubPage';
import { SaiDecorationPage } from '@/pages/SaiDecorationPage';
import { DigitalLabPage } from '@/pages/DigitalLabPage';
import { PersonalLibraryPage } from '@/pages/PersonalLibraryPage';
import { PersonalStudyPage } from '@/pages/PersonalStudyPage';
import { IdeaLabPage } from '@/pages/IdeaLabPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  const { isUnlocked } = useAuth();

  if (!isUnlocked) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/money" element={<MoneyCenterLayout />}>
            <Route index element={<Navigate to="/money/accounts" replace />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="cashbook" element={<CashbookPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="commission" element={<CommissionLedgerPage />} />
            <Route path="gambling" element={<GamblingTrackerPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="/tools/*" element={<ToolsHubPage />} />
          <Route path="/sai-decoration/*" element={<SaiDecorationPage />} />
          <Route path="/digital-lab/*" element={<DigitalLabPage />} />
          <Route path="/library/*" element={<PersonalLibraryPage />} />
          <Route path="/study/*" element={<PersonalStudyPage />} />
          <Route path="/ideas/*" element={<IdeaLabPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
