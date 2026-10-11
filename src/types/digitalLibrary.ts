/**
 * Digital Lab & Personal Library Models & Contracts
 */

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'coding' | 'writing' | 'antigravity' | 'marketing' | 'system' | 'other';
  systemPrompt?: string;
  promptText: string;
  variables: string[]; // e.g. ["language", "componentName"]
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmmOrder {
  id: string;
  orderNumber: string; // e.g. "SMM-2026-001"
  platform: 'Instagram' | 'YouTube' | 'Telegram' | 'Twitter/X' | 'Facebook' | 'Spotify' | 'Other';
  serviceType: 'followers' | 'likes' | 'views' | 'subscribers' | 'comments' | 'custom';
  targetUrl: string;
  quantity: number;
  costPricePaise: number; // what provider charges
  sellingPricePaise: number; // what client pays
  profitPaise: number; // selling - cost
  providerOrderId?: string;
  clientName?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineGig {
  id: string;
  platform: string; // e.g. "Remotasks", "Toloka", "Upwork", "Freelance"
  taskTitle: string;
  category: 'microtask' | 'development' | 'design' | 'writing' | 'content';
  amountEarnedPaise: number;
  timeSpentMinutes: number;
  status: 'in_progress' | 'submitted' | 'approved' | 'paid' | 'rejected';
  payoutMethod?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'anime' | 'movie' | 'series' | 'documentary';
  platform?: string; // Netflix, Crunchyroll, etc.
  currentEpisode: number;
  totalEpisodes?: number;
  rating?: number; // 1-10
  status: 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped';
  notes?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  category: 'identity' | 'finance' | 'business' | 'education' | 'receipts' | 'other';
  documentNumber?: string;
  expiryDate?: string;
  issueDate?: string;
  notes?: string;
  tags: string[];
  isSensitive: boolean;
  createdAt: string;
  updatedAt: string;
}
