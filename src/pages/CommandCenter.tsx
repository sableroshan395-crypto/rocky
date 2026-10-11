import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  CheckSquare,
  Bookmark as BookmarkIcon,
  FolderKanban,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, formatDateDDMMYYYY, timeAgo } from '@/utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import type { Task, Bookmark, Project, DashboardWidgetConfig } from '@/types/workspace';
import type { Account, Transaction, AuditLogEntry } from '@/types/financial';

interface OutletContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const CommandCenter: React.FC = () => {
  const { refreshTrigger, triggerRefresh } = useOutletContext<OutletContextType>();
  const { showSuccess } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig>(() => {
    return StorageAdapter.getPreferences().widgets;
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Load data
  useEffect(() => {
    setTasks(StorageAdapter.getTasks());
    setBookmarks(StorageAdapter.getBookmarks());
    setProjects(StorageAdapter.getProjects());
    setAccounts(StorageAdapter.getAccounts());
    setTransactions(StorageAdapter.getTransactions());
    setAuditLogs(StorageAdapter.getAuditLogs());
    setWidgetConfig(StorageAdapter.getPreferences().widgets);
  }, [refreshTrigger]);

  // Financial calculations strictly from real recorded data
  const financialTotals = useMemo(() => {
    let totalFundsPaise = 0;
    let cashPaise = 0;
    let bankPaise = 0;

    for (const acc of accounts) {
      if (acc.isArchived) continue;
      if (acc.includeInNetTotal) {
        totalFundsPaise += acc.currentRecordedBalancePaise;
      }
      if (acc.type === 'cash') {
        cashPaise += acc.currentRecordedBalancePaise;
      } else if (acc.type === 'bank') {
        bankPaise += acc.currentRecordedBalancePaise;
      }
    }

    // Recent 30 days inflows/outflows
    let recentInflowPaise = 0;
    let recentOutflowPaise = 0;
    for (const tx of transactions) {
      if (tx.status === 'completed' || tx.status === 'reconciled') {
        if (tx.type === 'income' || tx.type === 'refund') {
          recentInflowPaise += tx.amountPaise;
        } else if (tx.type === 'expense') {
          recentOutflowPaise += tx.amountPaise;
        }
      }
    }

    return {
      totalFundsPaise,
      cashPaise,
      bankPaise,
      recentInflowPaise,
      recentOutflowPaise,
      hasAccounts: accounts.length > 0,
    };
  }, [accounts, transactions]);

  // Toggle task completed
  const handleToggleTask = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    StorageAdapter.saveTask(updated);
    triggerRefresh();
    showSuccess(
      updated.completed ? 'Task completed' : 'Task reopened',
      `"${task.title}"`
    );
  };

  // Toggle widget visibility
  const handleSaveWidgets = (newConfig: DashboardWidgetConfig) => {
    setWidgetConfig(newConfig);
    StorageAdapter.savePreferences({ widgets: newConfig });
    setIsCustomizeOpen(false);
    showSuccess('Dashboard customized', 'Widget preferences updated.');
  };

  const todayStr = formatDateDDMMYYYY(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Today is <span className="font-medium text-slate-700 dark:text-slate-300">{todayStr}</span> (Asia/Kolkata). Welcome to your private headquarters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizeOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
          >
            Customize
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards (Strict Real Data Only) */}
      {widgetConfig.financialSummary && (
        <section aria-labelledby="financial-summary-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="financial-summary-heading" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recorded Financial Summary
            </h2>
            <Link
              to="/money"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              Money Center <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Funds */}
            <Card className="p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Recorded Total Funds</span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatPaiseToINR(financialTotals.totalFundsPaise)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {financialTotals.hasAccounts
                  ? `${accounts.length} active account${accounts.length === 1 ? '' : 's'}`
                  : '0 accounts configured (Phase 2)'}
              </p>
            </Card>

            {/* Cash in Hand */}
            <Card className="p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Cash in Hand</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatPaiseToINR(financialTotals.cashPaise)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Physical cash count ledger
              </p>
            </Card>

            {/* Inflows */}
            <Card className="p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Recorded Inflows</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatPaiseToINR(financialTotals.recentInflowPaise)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Completed income & refunds
              </p>
            </Card>

            {/* Outflows */}
            <Card className="p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Recorded Outflows</span>
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatPaiseToINR(financialTotals.recentOutflowPaise)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Completed expenses
              </p>
            </Card>
          </div>
        </section>
      )}

      {/* Grid: Tasks & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Tasks Widget */}
        {widgetConfig.openTasks && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                Open Tasks & Action Items
              </CardTitle>
              <Badge variant="neutral">{tasks.filter((t) => !t.completed).length} Pending</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No tasks recorded yet. Use <kbd className="font-mono">Ctrl+Q</kbd> to add your first task.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.slice(0, 5).map((task) => (
                    <li
                      key={task.id}
                      className="p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="text-slate-400 hover:text-indigo-600 shrink-0"
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`text-xs truncate ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.dueDate && (
                          <span className="text-[11px] text-slate-400">{task.dueDate}</span>
                        )}
                        <Badge
                          size="sm"
                          variant={
                            task.priority === 'urgent'
                              ? 'danger'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Favorite Bookmarks / Pinned Tools */}
        {widgetConfig.favoriteBookmarks && (
          <Card>
            <CardHeader>
              <CardTitle>
                <BookmarkIcon className="w-4 h-4 text-indigo-500" />
                Favorite Bookmarks
              </CardTitle>
              <Link to="/library" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {bookmarks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No bookmarks saved yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookmarks.slice(0, 10).map((bm) => (
                    <li
                      key={bm.id}
                      className="p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={bm.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 truncate"
                          >
                            <span className="truncate">{bm.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 truncate">
                          <span className="truncate font-mono">{bm.url}</span>
                          {bm.usernameOrEmail && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono shrink-0 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                              {bm.usernameOrEmail}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge size="sm" variant={bm.category === 'smm' ? 'primary' : 'neutral'} className="shrink-0 uppercase text-[9px]">
                        {bm.category}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grid: Active Projects & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects (Features Sai Decoration Websites) */}
        {widgetConfig.activeProjects && (
          <Card>
            <CardHeader>
              <CardTitle>
                <FolderKanban className="w-4 h-4 text-indigo-500" />
                Active Projects & Deployments
              </CardTitle>
              <Link to="/digital-lab" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                Digital Lab
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((proj) => (
                  <li
                    key={proj.id}
                    className="p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {proj.name}
                        </span>
                        <Badge size="sm" variant="success">
                          {proj.platform}
                        </Badge>
                      </div>
                      {proj.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {proj.description}
                        </p>
                      )}
                    </div>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                        title="Open live deployment"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Audit Trail / Recent Activity */}
        {widgetConfig.recentActivity && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="w-4 h-4 text-indigo-500" />
                Immutable Activity History
              </CardTitle>
              <Badge variant="neutral">Latest {Math.min(auditLogs.length, 5)}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No activity logged yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.slice(0, 5).map((log) => (
                    <li key={log.id} className="p-3 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({log.entityType})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          ID: <code className="font-mono text-[10px]">{log.entityId}</code>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {timeAgo(log.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Widget Customization Modal */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title="Customize Dashboard Widgets"
        description="Toggle which widgets are displayed on your Command Center."
        maxWidth="sm"
      >
        <div className="space-y-3">
          {(Object.keys(widgetConfig) as Array<keyof DashboardWidgetConfig>).map((key) => {
            const labels: Record<keyof DashboardWidgetConfig, string> = {
              financialSummary: 'Financial Summary Cards',
              quickActions: 'Quick Action Bar',
              openTasks: 'Open Tasks List',
              pinnedTools: 'Pinned Tools Hub',
              favoriteBookmarks: 'Favorite Bookmarks',
              activeProjects: 'Active Projects & Sites',
              recentActivity: 'Activity History Log',
            };

            return (
              <label
                key={key}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {labels[key]}
                </span>
                <input
                  type="checkbox"
                  checked={widgetConfig[key]}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            );
          })}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsCustomizeOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSaveWidgets(widgetConfig)}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
