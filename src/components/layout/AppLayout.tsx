import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { UniversalSearchModal } from '@/components/common/UniversalSearchModal';
import { QuickCaptureModal } from '@/components/common/QuickCaptureModal';
import { StorageAdapter } from '@/services/storageAdapter';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return StorageAdapter.getPreferences().sidebarCollapsed || false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global keyboard shortcuts (Ctrl/Cmd + K and Ctrl/Cmd + Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key.toLowerCase() === 'k') {
        // Universal Search
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'q') {
        // Quick Capture (only if not typing in text field)
        if (!isInput) {
          e.preventDefault();
          setIsQuickCaptureOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <Outlet context={{ refreshTrigger, triggerRefresh: () => setRefreshTrigger((n) => n + 1) }} />
          </main>
        </div>
      </div>

      {/* Universal Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onItemCreated={() => setRefreshTrigger((n) => n + 1)}
      />
    </div>
  );
};
