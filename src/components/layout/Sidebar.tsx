import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Wrench,
  FlaskConical,
  PartyPopper,
  Library,
  GraduationCap,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: 'HQ',
      items: [
        {
          name: 'Command Center',
          path: '/',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'FINANCES & OPERATIONS',
      items: [
        {
          name: 'Money Center',
          path: '/money',
          icon: <Wallet className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Sai Decoration Hub',
          path: '/sai-decoration',
          icon: <PartyPopper className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Digital Lab',
          path: '/digital-lab',
          icon: <FlaskConical className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'PRODUCTIVITY & ASSETS',
      items: [
        {
          name: 'Tools Hub',
          path: '/tools',
          icon: <Wrench className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Personal Library',
          path: '/library',
          icon: <Library className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Personal & Study',
          path: '/study',
          icon: <GraduationCap className="w-4 h-4 shrink-0" />,
        },
        {
          name: 'Idea Lab',
          path: '/ideas',
          icon: <Lightbulb className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          name: 'System & Settings',
          path: '/settings',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const handleToggle = () => {
    const nextState = !isCollapsed;
    onToggleCollapse();
    StorageAdapter.savePreferences({ sidebarCollapsed: nextState });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
            R
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate">
                Rocky's Workspace
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block tracking-tight truncate">
                Personal HQ
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className="hidden md:flex p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h4 className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onCloseMobile()}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick External Links (Sai Decoration) */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Live Deployments
            </h4>
            <div className="space-y-1">
              <a
                href="https://sai-decoration.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="truncate">Sai Decoration Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
              <a
                href="https://sai-decoration-billing.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="truncate">Sai Billing System</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Version */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <span>Rocky's Workspace</span>
            <span className="font-mono text-[10px]">v1.0 (Phase 1)</span>
          </div>
        ) : (
          <div className="text-center font-mono text-[10px]">v1.0</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className={`fixed inset-y-0 z-30 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
