import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  Lock,
  ShieldAlert,
  Cloud,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenQuickCapture: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenQuickCapture,
}) => {
  const location = useLocation();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { storageMode, lockSession, logout } = useAuth();

  // Compute breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const routeNames: Record<string, string> = {
    money: 'Money Center',
    'sai-decoration': 'Sai Decoration Hub',
    'digital-lab': 'Digital Lab',
    tools: 'Tools Hub',
    library: 'Personal Library',
    study: 'Personal & Study',
    ideas: 'Idea Lab',
    settings: 'System & Settings',
  };

  return (
    <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 font-medium">
            Workspace
          </Link>
          {pathParts.map((part) => (
            <React.Fragment key={part}>
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {routeNames[part] || part}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Universal Search trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-lg text-xs transition-colors border border-slate-200/60 dark:border-slate-700/60"
          title="Global Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm">
            ⌘K
          </kbd>
        </button>

        {/* Quick Capture trigger */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickCapture}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="shadow-xs"
          title="Quick Capture (Ctrl+Q)"
        >
          <span className="hidden sm:inline">Capture</span>
        </Button>

        {/* Storage Mode Pill */}
        {storageMode === 'local' ? (
          <Link
            to="/settings"
            title="Local unencrypted storage. Data is stored in browser localStorage. Click to view backup & Firebase setup."
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Local (Unencrypted)</span>
          </Link>
        ) : (
          <div
            title="Authenticated Firebase Cloud Connection active."
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">Firebase Cloud</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
          title={`Switch to ${effectiveTheme === 'light' ? 'Dark' : 'Light'} mode`}
        >
          {effectiveTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Lock Workspace / Logout */}
        <button
          type="button"
          onClick={() => {
            if (storageMode === 'local') {
              lockSession();
            } else {
              logout();
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Lock Workspace Session"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Lock</span>
        </button>
      </div>
    </header>
  );
};
