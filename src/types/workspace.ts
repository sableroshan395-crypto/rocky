/**
 * Workspace Entity Types & Contracts for Rocky's Workspace
 */

export type StorageMode = 'local' | 'firebase';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  category: 'personal' | 'business' | 'study' | 'finance' | 'general';
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'ideas' | 'procedures' | 'study' | 'business';
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: 'smm' | 'tools' | 'business' | 'finance' | 'dev' | 'personal';
  tags: string[];
  isFavorite: boolean;
  usernameOrEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  url?: string;
  repoUrl?: string;
  platform: 'Netlify' | 'Vercel' | 'Firebase' | 'GitHub' | 'Custom';
  status: 'active' | 'in_progress' | 'planned' | 'archived';
  type: 'business' | 'billing' | 'personal' | 'tool';
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidgetConfig {
  financialSummary: boolean;
  quickActions: boolean;
  openTasks: boolean;
  pinnedTools: boolean;
  favoriteBookmarks: boolean;
  activeProjects: boolean;
  recentActivity: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  widgets: DashboardWidgetConfig;
  defaultCurrency: 'INR';
  dateFormat: 'DD/MM/YYYY';
  timeZone: 'Asia/Kolkata';
}

export interface LocalSecurityConfig {
  passcodeHash?: string;
  salt?: string;
  failedAttempts: number;
  lockUntil?: number; // Timestamp ms
  createdAt?: string;
}

export interface UniversalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'task' | 'note' | 'bookmark' | 'project' | 'route';
  url?: string;
  category?: string;
}
