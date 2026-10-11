import type { Task, Note, Bookmark, Project, UserPreferences } from '@/types/workspace';
import type {
  Account,
  Transaction,
  BalanceAdjustment,
  AuditLogEntry,
  WorkCommissionRecord,
  GamblingSession,
  TransferRequest,
} from '@/types/financial';
import type {
  SaiCustomer,
  SaiBooking,
  SaiEquipment,
  SaiQuote,
} from '@/types/saiDecoration';
import type {
  PromptTemplate,
  SmmOrder,
  OnlineGig,
  WatchlistItem,
  VaultDocument,
} from '@/types/digitalLibrary';
import type {
  SubjectModule,
  AcademicExam,
  DailyHabit,
  VentureIdea,
} from '@/types/studyAndIdeas';

const STORAGE_KEYS = {
  TASKS: 'rocky_tasks_v1',
  NOTES: 'rocky_notes_v1',
  BOOKMARKS: 'rocky_bookmarks_v1',
  PROJECTS: 'rocky_projects_v1',
  ACCOUNTS: 'rocky_accounts_v1',
  TRANSACTIONS: 'rocky_transactions_v1',
  ADJUSTMENTS: 'rocky_adjustments_v1',
  COMMISSION: 'rocky_commission_v1',
  GAMBLING: 'rocky_gambling_v1',
  SAI_CUSTOMERS: 'rocky_sai_customers_v1',
  SAI_BOOKINGS: 'rocky_sai_bookings_v1',
  SAI_EQUIPMENT: 'rocky_sai_equipment_v1',
  SAI_QUOTES: 'rocky_sai_quotes_v1',
  PROMPTS: 'rocky_prompts_v1',
  SMM_ORDERS: 'rocky_smm_orders_v1',
  GIGS: 'rocky_gigs_v1',
  WATCHLIST: 'rocky_watchlist_v1',
  VAULT_DOCS: 'rocky_vault_docs_v1',
  SUBJECTS: 'rocky_subjects_v1',
  EXAMS: 'rocky_exams_v1',
  HABITS: 'rocky_habits_v1',
  IDEAS: 'rocky_ideas_v1',
  AUDIT_LOGS: 'rocky_audit_logs_v1',
  PREFERENCES: 'rocky_preferences_v1',
  LOCAL_SECURITY: 'rocky_local_security_v1',
  SESSION_UNLOCKED: 'rocky_session_unlocked_v1',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  sidebarCollapsed: false,
  widgets: {
    financialSummary: true,
    quickActions: true,
    openTasks: true,
    pinnedTools: true,
    favoriteBookmarks: true,
    activeProjects: true,
    recentActivity: true,
  },
  defaultCurrency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timeZone: 'Asia/Kolkata',
};

// Initial verified projects specified in requirements
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_sai_website',
    name: 'Sai Decoration Business Website',
    url: 'https://sai-decoration.netlify.app/',
    platform: 'Netlify',
    status: 'active',
    type: 'business',
    description: 'Public business website for Sai Decoration event services.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_sai_billing',
    name: 'Sai Decoration Billing System',
    url: 'https://sai-decoration-billing.netlify.app/',
    platform: 'Netlify',
    status: 'active',
    type: 'billing',
    description: 'Internal billing and order estimation application deployed on Netlify.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm_smm_cheapest',
    title: 'Cheapest SMM Panel',
    url: 'https://cheapestsmmpanels.com',
    category: 'smm',
    tags: ['smm', 'reseller', 'panel'],
    isFavorite: true,
    usernameOrEmail: 'sableroshan24@gmail.com',
    notes: 'Email: sableroshan24@gmail.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_smm_fine',
    title: 'Fine SMM Panel',
    url: 'https://finesmmpanel.com/',
    category: 'smm',
    tags: ['smm', 'reseller', 'panel'],
    isFavorite: true,
    usernameOrEmail: 'sableroshan24@gmail.com',
    notes: 'Email: sableroshan24@gmail.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_smm_social_media',
    title: 'SMM Social Media',
    url: 'https://smmsocialmedia.in/',
    category: 'smm',
    tags: ['smm', 'reseller', 'panel'],
    isFavorite: true,
    usernameOrEmail: 'roshansableddd',
    notes: 'Login: roshansableddd | Pass: roshan2424',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_sai_web',
    title: 'Sai Decoration Website',
    url: 'https://sai-decoration.netlify.app/',
    category: 'business',
    tags: ['family-business', 'live'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_sai_bill',
    title: 'Sai Decoration Billing App',
    url: 'https://sai-decoration-billing.netlify.app/',
    category: 'business',
    tags: ['billing', 'live'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_tool_pdf',
    title: 'PDF Tool (iLovePDF)',
    url: 'https://www.ilovepdf.com/',
    category: 'tools',
    tags: ['pdf', 'editor', 'useful-tools'],
    isFavorite: true,
    notes: 'Merge, split, compress, convert, and edit PDF documents.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_tool_qr',
    title: 'QR Generator',
    url: 'https://www.the-qrcode-generator.com/',
    category: 'tools',
    tags: ['qr', 'generator', 'useful-tools'],
    isFavorite: true,
    notes: 'Create free QR codes for URLs, text, WiFi, and contact cards.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_tool_photo_conv',
    title: 'Photo Converter',
    url: 'https://www.freeconvert.com/image-converter',
    category: 'tools',
    tags: ['image', 'converter', 'useful-tools'],
    isFavorite: true,
    notes: 'Batch convert image formats (PNG, JPG, WEBP, SVG, HEIC).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bm_tool_img_resizer',
    title: 'Image Resizer',
    url: 'https://imageresizer.com/',
    category: 'tools',
    tags: ['image', 'resizer', 'useful-tools'],
    isFavorite: true,
    notes: 'Resize, crop, optimize, and compress image dimensions online.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial 6 target accounts specified in Requirement 7.1
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash',
    name: 'Cash in Hand',
    type: 'cash',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'Physical currency on hand and in drawer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_omnicard',
    name: 'OmniCard',
    type: 'prepaid_card',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'OmniCard digital wallet & RuPay card',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_kotak',
    name: 'Kotak Bank',
    type: 'bank',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'Kotak Mahindra Bank primary account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_amazon',
    name: 'Amazon Pay',
    type: 'wallet',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'Amazon Pay balance wallet',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_mobikwik',
    name: 'MobiKwik',
    type: 'wallet',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'MobiKwik wallet & ZIP balance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_airtel',
    name: 'Airtel Payments Bank',
    type: 'bank',
    category: 'personal',
    openingBalancePaise: 0,
    currentRecordedBalancePaise: 0,
    lastVerifiedBalancePaise: 0,
    lastVerifiedDate: new Date().toISOString(),
    isArchived: false,
    includeInNetTotal: true,
    notes: 'Airtel Payments Bank savings account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read from localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage key "${key}":`, err);
  }
}

export class StorageAdapter {
  // Audit Logging
  static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newLog: AuditLogEntry = {
      ...entry,
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 500); // Retain latest 500 logs
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, updated);
    return newLog;
  }

  static getAuditLogs(): AuditLogEntry[] {
    return getLocalItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // Preferences
  static getPreferences(): UserPreferences {
    return getLocalItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  }

  static savePreferences(preferences: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated: UserPreferences = {
      ...current,
      ...preferences,
      widgets: {
        ...current.widgets,
        ...(preferences.widgets || {}),
      },
    };
    setLocalItem(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  }

  // Tasks
  static getTasks(): Task[] {
    return getLocalItem<Task[]>(STORAGE_KEYS.TASKS, []);
  }

  static saveTask(task: Task): Task {
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    let updatedTasks: Task[];

    if (existingIndex >= 0) {
      updatedTasks = [...tasks];
      updatedTasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'task',
        entityId: task.id,
        details: { title: task.title, completed: task.completed },
      });
    } else {
      updatedTasks = [task, ...tasks];
      this.addAuditLog({
        action: 'create',
        entityType: 'task',
        entityId: task.id,
        details: { title: task.title, priority: task.priority },
      });
    }

    setLocalItem(STORAGE_KEYS.TASKS, updatedTasks);
    return task;
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const target = tasks.find((t) => t.id === id);
    if (!target) return false;

    const filtered = tasks.filter((t) => t.id !== id);
    setLocalItem(STORAGE_KEYS.TASKS, filtered);

    this.addAuditLog({
      action: 'delete',
      entityType: 'task',
      entityId: id,
      details: { title: target.title },
    });
    return true;
  }

  // Notes
  static getNotes(): Note[] {
    return getLocalItem<Note[]>(STORAGE_KEYS.NOTES, []);
  }

  static saveNote(note: Note): Note {
    const notes = this.getNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    let updatedNotes: Note[];

    if (existingIndex >= 0) {
      updatedNotes = [...notes];
      updatedNotes[existingIndex] = { ...note, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'note',
        entityId: note.id,
        details: { title: note.title },
      });
    } else {
      updatedNotes = [note, ...notes];
      this.addAuditLog({
        action: 'create',
        entityType: 'note',
        entityId: note.id,
        details: { title: note.title, category: note.category },
      });
    }

    setLocalItem(STORAGE_KEYS.NOTES, updatedNotes);
    return note;
  }

  static deleteNote(id: string): boolean {
    const notes = this.getNotes();
    const target = notes.find((n) => n.id === id);
    if (!target) return false;

    const filtered = notes.filter((n) => n.id !== id);
    setLocalItem(STORAGE_KEYS.NOTES, filtered);

    this.addAuditLog({
      action: 'delete',
      entityType: 'note',
      entityId: id,
      details: { title: target.title },
    });
    return true;
  }

  // Bookmarks
  static getBookmarks(): Bookmark[] {
    const saved = getLocalItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    if (saved.length === 0) {
      setLocalItem(STORAGE_KEYS.BOOKMARKS, INITIAL_BOOKMARKS);
      return INITIAL_BOOKMARKS;
    }
    let changed = false;
    const merged = [...saved];
    for (const init of INITIAL_BOOKMARKS) {
      if (!merged.some((b) => b.id === init.id)) {
        merged.push(init);
        changed = true;
      }
    }
    if (changed) {
      setLocalItem(STORAGE_KEYS.BOOKMARKS, merged);
    }
    return merged;
  }

  static saveBookmark(bookmark: Bookmark): Bookmark {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.id === bookmark.id);
    let updated: Bookmark[];

    if (existingIndex >= 0) {
      updated = [...bookmarks];
      updated[existingIndex] = { ...bookmark, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'bookmark',
        entityId: bookmark.id,
        details: { title: bookmark.title, url: bookmark.url },
      });
    } else {
      updated = [bookmark, ...bookmarks];
      this.addAuditLog({
        action: 'create',
        entityType: 'bookmark',
        entityId: bookmark.id,
        details: { title: bookmark.title, url: bookmark.url },
      });
    }

    setLocalItem(STORAGE_KEYS.BOOKMARKS, updated);
    return bookmark;
  }

  static deleteBookmark(id: string): boolean {
    const bookmarks = this.getBookmarks();
    const target = bookmarks.find((b) => b.id === id);
    if (!target) return false;

    const filtered = bookmarks.filter((b) => b.id !== id);
    setLocalItem(STORAGE_KEYS.BOOKMARKS, filtered);

    this.addAuditLog({
      action: 'delete',
      entityType: 'bookmark',
      entityId: id,
      details: { title: target.title },
    });
    return true;
  }

  // Projects
  static getProjects(): Project[] {
    return getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  static saveProject(project: Project): Project {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    let updated: Project[];

    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'project',
        entityId: project.id,
        details: { name: project.name, status: project.status },
      });
    } else {
      updated = [project, ...projects];
      this.addAuditLog({
        action: 'create',
        entityType: 'project',
        entityId: project.id,
        details: { name: project.name, platform: project.platform },
      });
    }

    setLocalItem(STORAGE_KEYS.PROJECTS, updated);
    return project;
  }

  static deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.PROJECTS, projects);
    this.addAuditLog({
      action: 'delete',
      entityType: 'project',
      entityId: id,
      details: {},
    });
  }

  // Accounts & Balances (Initialized with 6 accounts)
  static getAccounts(): Account[] {
    return getLocalItem<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  }

  static saveAccount(account: Account): Account {
    const accounts = this.getAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    let updated: Account[];

    if (index >= 0) {
      updated = [...accounts];
      updated[index] = { ...account, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'account',
        entityId: account.id,
        details: { name: account.name, balancePaise: account.currentRecordedBalancePaise },
      });
    } else {
      updated = [...accounts, account];
      this.addAuditLog({
        action: 'create',
        entityType: 'account',
        entityId: account.id,
        details: { name: account.name, type: account.type, openingBalancePaise: account.openingBalancePaise },
      });
    }

    setLocalItem(STORAGE_KEYS.ACCOUNTS, updated);
    return account;
  }

  static archiveAccount(accountId: string, archive = true): boolean {
    const accounts = this.getAccounts();
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return false;

    target.isArchived = archive;
    target.updatedAt = new Date().toISOString();
    setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.addAuditLog({
      action: 'update',
      entityType: 'account',
      entityId: accountId,
      details: { isArchived: archive },
    });
    return true;
  }

  // Transactions
  static getTransactions(): Transaction[] {
    return getLocalItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  }

  static saveTransaction(tx: Transaction): Transaction {
    const transactions = this.getTransactions();
    const index = transactions.findIndex((t) => t.id === tx.id);
    let updated: Transaction[];

    if (index >= 0) {
      updated = [...transactions];
      updated[index] = { ...tx, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'transaction',
        entityId: tx.id,
        details: { amountPaise: tx.amountPaise, type: tx.type },
      });
    } else {
      updated = [tx, ...transactions];
      this.addAuditLog({
        action: 'create',
        entityType: 'transaction',
        entityId: tx.id,
        details: { amountPaise: tx.amountPaise, type: tx.type, accountId: tx.accountId },
      });
    }

    // Update account balance for standard completed non-transfer transactions
    if (tx.status === 'completed' || tx.status === 'reconciled') {
      const accounts = this.getAccounts();
      const acc = accounts.find((a) => a.id === tx.accountId);
      if (acc && tx.type !== 'transfer' && tx.type !== 'balance_adjustment') {
        if (tx.type === 'income' || tx.type === 'refund') {
          acc.currentRecordedBalancePaise += tx.amountPaise;
        } else if (tx.type === 'expense') {
          acc.currentRecordedBalancePaise -= tx.amountPaise;
        }
        acc.updatedAt = new Date().toISOString();
        setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);
      }
    }

    setLocalItem(STORAGE_KEYS.TRANSACTIONS, updated);
    return tx;
  }

  // Adjustments
  static getAdjustments(): BalanceAdjustment[] {
    return getLocalItem<BalanceAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS, []);
  }

  /**
   * REQUIREMENT 7.2: MANUAL BALANCE UPDATE
   * Calculates difference = newActual - previousRecorded
   * Persists adjustment, preserves previous balance, creates ledger transaction, updates account balance and verified timestamp.
   */
  static executeManualBalanceUpdate(
    accountId: string,
    newActualBalancePaise: number,
    reason: string,
    referenceNote?: string,
    adjustedAt?: string
  ): { success: boolean; adjustment: BalanceAdjustment; differencePaise: number } {
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      throw new Error(`Account with ID "${accountId}" not found.`);
    }

    const previousBalancePaise = account.currentRecordedBalancePaise;
    const differencePaise = newActualBalancePaise - previousBalancePaise;
    const timestamp = adjustedAt || new Date().toISOString();

    const auditEntry = this.addAuditLog({
      action: 'reconcile',
      entityType: 'balance_adjustment',
      entityId: accountId,
      details: {
        accountName: account.name,
        previousBalancePaise,
        newActualBalancePaise,
        differencePaise,
        reason,
        referenceNote,
      },
    });

    const adjustment: BalanceAdjustment = {
      id: 'adj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      accountId,
      previousBalancePaise,
      newActualBalancePaise,
      differencePaise,
      adjustedAt: timestamp,
      reason,
      referenceNote,
      auditLogId: auditEntry.id,
    };

    // Save adjustment
    const adjustments = this.getAdjustments();
    setLocalItem(STORAGE_KEYS.ADJUSTMENTS, [adjustment, ...adjustments]);

    // Save ledger entry reflecting the adjustment
    const tx: Transaction = {
      id: 'tx_adj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: timestamp,
      accountId,
      type: 'balance_adjustment',
      amountPaise: Math.abs(differencePaise),
      category: 'Balance Adjustment',
      description: `Adjustment: ${reason}${referenceNote ? ` (${referenceNote})` : ''}`,
      status: 'completed',
      notes: `Previous: ${previousBalancePaise}, Difference: ${differencePaise}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const transactions = this.getTransactions();
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, [tx, ...transactions]);

    // Update account with new actual balance and last verified date
    account.currentRecordedBalancePaise = newActualBalancePaise;
    account.lastVerifiedBalancePaise = newActualBalancePaise;
    account.lastVerifiedDate = timestamp;
    account.updatedAt = timestamp;
    setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);

    return {
      success: true,
      adjustment,
      differencePaise,
    };
  }

  /**
   * REQUIREMENT 7.3 & 7.6: LINKED ATOMIC TRANSFERS
   * Creates linked debit and credit transactions sharing a linkedTransferId.
   * Decreases source account and increases target account.
   * Transfers DO NOT count as personal income or expense.
   */
  static executeTransfer(req: TransferRequest): {
    success: boolean;
    linkedTransferId: string;
    debitTx: Transaction;
    creditTx: Transaction;
  } {
    if (req.sourceAccountId === req.targetAccountId) {
      throw new Error('Source and destination accounts must be different.');
    }
    if (req.amountPaise <= 0) {
      throw new Error('Transfer amount must be greater than zero.');
    }

    const accounts = this.getAccounts();
    const sourceAcc = accounts.find((a) => a.id === req.sourceAccountId);
    const targetAcc = accounts.find((a) => a.id === req.targetAccountId);

    if (!sourceAcc || !targetAcc) {
      throw new Error('Both source and target accounts must exist.');
    }

    const linkedTransferId = 'trf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = req.date || new Date().toISOString();

    const debitTx: Transaction = {
      id: 'tx_dr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      date: timestamp,
      accountId: sourceAcc.id,
      type: 'transfer',
      amountPaise: req.amountPaise,
      category: 'Transfer Out',
      description: `Transfer to ${targetAcc.name}: ${req.description}`,
      referenceId: req.referenceId,
      linkedTransferId,
      status: 'completed',
      notes: req.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const creditTx: Transaction = {
      id: 'tx_cr_' + (Date.now() + 1) + '_' + Math.random().toString(36).substring(2, 5),
      date: timestamp,
      accountId: targetAcc.id,
      type: 'transfer',
      amountPaise: req.amountPaise,
      category: 'Transfer In',
      description: `Transfer from ${sourceAcc.name}: ${req.description}`,
      referenceId: req.referenceId,
      linkedTransferId,
      status: 'completed',
      notes: req.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update balances atomically
    sourceAcc.currentRecordedBalancePaise -= req.amountPaise;
    sourceAcc.updatedAt = timestamp;

    targetAcc.currentRecordedBalancePaise += req.amountPaise;
    targetAcc.updatedAt = timestamp;

    // Save accounts & transactions
    setLocalItem(STORAGE_KEYS.ACCOUNTS, accounts);

    const transactions = this.getTransactions();
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, [debitTx, creditTx, ...transactions]);

    this.addAuditLog({
      action: 'transfer',
      entityType: 'transaction',
      entityId: linkedTransferId,
      details: {
        from: sourceAcc.name,
        to: targetAcc.name,
        amountPaise: req.amountPaise,
        description: req.description,
      },
    });

    return {
      success: true,
      linkedTransferId,
      debitTx,
      creditTx,
    };
  }

  // Work & Commission Ledger (Requirement 7.8)
  static getCommissionRecords(): WorkCommissionRecord[] {
    return getLocalItem<WorkCommissionRecord[]>(STORAGE_KEYS.COMMISSION, []);
  }

  static saveCommissionRecord(record: WorkCommissionRecord): WorkCommissionRecord {
    const list = this.getCommissionRecords();
    const index = list.findIndex((r) => r.id === record.id);
    let updated: WorkCommissionRecord[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...record, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        action: 'update',
        entityType: 'commission',
        entityId: record.id,
        details: { referenceId: record.referenceId, status: record.status },
      });
    } else {
      updated = [record, ...list];
      this.addAuditLog({
        action: 'create',
        entityType: 'commission',
        entityId: record.id,
        details: {
          referenceId: record.referenceId,
          amountProcessed: record.amountProcessedPaise,
          rate: record.commissionRate,
        },
      });
    }

    setLocalItem(STORAGE_KEYS.COMMISSION, updated);
    return record;
  }

  static deleteCommissionRecord(id: string): boolean {
    const list = this.getCommissionRecords();
    const filtered = list.filter((r) => r.id !== id);
    setLocalItem(STORAGE_KEYS.COMMISSION, filtered);

    this.addAuditLog({
      action: 'delete',
      entityType: 'commission',
      entityId: id,
      details: { id },
    });
    return true;
  }

  // Gambling Session Tracker (Requirement 7.9)
  static getGamblingSessions(): GamblingSession[] {
    return getLocalItem<GamblingSession[]>(STORAGE_KEYS.GAMBLING, []);
  }

  static saveGamblingSession(session: GamblingSession): GamblingSession {
    const list = this.getGamblingSessions();
    const index = list.findIndex((s) => s.id === session.id);
    let updated: GamblingSession[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = session;
      this.addAuditLog({
        action: 'update',
        entityType: 'gambling',
        entityId: session.id,
        details: { platform: session.platform, netResultPaise: session.netResultPaise },
      });
    } else {
      updated = [session, ...list];
      this.addAuditLog({
        action: 'create',
        entityType: 'gambling',
        entityId: session.id,
        details: { platform: session.platform, netResultPaise: session.netResultPaise },
      });
    }

    setLocalItem(STORAGE_KEYS.GAMBLING, updated);
    return session;
  }

  static deleteGamblingSession(id: string): boolean {
    const list = this.getGamblingSessions();
    const filtered = list.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.GAMBLING, filtered);

    this.addAuditLog({
      action: 'delete',
      entityType: 'gambling',
      entityId: id,
      details: { id },
    });
    return true;
  }

  // Export / Backup Full Workspace
  static exportFullWorkspaceJSON(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: "Rocky's Workspace",
      data: {
        preferences: this.getPreferences(),
        tasks: this.getTasks(),
        notes: this.getNotes(),
        bookmarks: this.getBookmarks(),
        projects: this.getProjects(),
        accounts: this.getAccounts(),
        transactions: this.getTransactions(),
        adjustments: this.getAdjustments(),
        commissionRecords: this.getCommissionRecords(),
        gamblingSessions: this.getGamblingSessions(),
        saiCustomers: this.getSaiCustomers(),
        saiBookings: this.getSaiBookings(),
        saiEquipment: this.getSaiEquipment(),
        saiQuotes: this.getSaiQuotes(),
        prompts: this.getPrompts(),
        smmOrders: this.getSmmOrders(),
        onlineGigs: this.getOnlineGigs(),
        watchlist: this.getWatchlist(),
        vaultDocuments: this.getVaultDocuments(),
        subjects: this.getSubjects(),
        exams: this.getExams(),
        habits: this.getHabits(),
        ideas: this.getIdeas(),
        auditLogs: this.getAuditLogs(),
      },
    };

    this.addAuditLog({
      action: 'export',
      entityType: 'settings',
      entityId: 'backup',
      details: { timestamp: payload.exportedAt },
    });

    return JSON.stringify(payload, null, 2);
  }

  // Restore Full Workspace from JSON
  static restoreFullWorkspaceJSON(jsonString: string): {
    success: boolean;
    message: string;
    restoredCounts?: Record<string, number>;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data) {
        return { success: false, message: 'Invalid backup file format: missing data root.' };
      }

      const d = parsed.data;
      if (d.tasks && Array.isArray(d.tasks)) setLocalItem(STORAGE_KEYS.TASKS, d.tasks);
      if (d.notes && Array.isArray(d.notes)) setLocalItem(STORAGE_KEYS.NOTES, d.notes);
      if (d.bookmarks && Array.isArray(d.bookmarks)) setLocalItem(STORAGE_KEYS.BOOKMARKS, d.bookmarks);
      if (d.projects && Array.isArray(d.projects)) setLocalItem(STORAGE_KEYS.PROJECTS, d.projects);
      if (d.accounts && Array.isArray(d.accounts)) setLocalItem(STORAGE_KEYS.ACCOUNTS, d.accounts);
      if (d.transactions && Array.isArray(d.transactions)) setLocalItem(STORAGE_KEYS.TRANSACTIONS, d.transactions);
      if (d.adjustments && Array.isArray(d.adjustments)) setLocalItem(STORAGE_KEYS.ADJUSTMENTS, d.adjustments);
      if (d.commissionRecords && Array.isArray(d.commissionRecords))
        setLocalItem(STORAGE_KEYS.COMMISSION, d.commissionRecords);
      if (d.gamblingSessions && Array.isArray(d.gamblingSessions))
        setLocalItem(STORAGE_KEYS.GAMBLING, d.gamblingSessions);
      if (d.preferences) setLocalItem(STORAGE_KEYS.PREFERENCES, d.preferences);
      if (d.saiCustomers && Array.isArray(d.saiCustomers)) localStorage.setItem(STORAGE_KEYS.SAI_CUSTOMERS, JSON.stringify(d.saiCustomers));
      if (d.saiBookings && Array.isArray(d.saiBookings)) localStorage.setItem(STORAGE_KEYS.SAI_BOOKINGS, JSON.stringify(d.saiBookings));
      if (d.saiEquipment && Array.isArray(d.saiEquipment)) localStorage.setItem(STORAGE_KEYS.SAI_EQUIPMENT, JSON.stringify(d.saiEquipment));
      if (d.saiQuotes && Array.isArray(d.saiQuotes)) localStorage.setItem(STORAGE_KEYS.SAI_QUOTES, JSON.stringify(d.saiQuotes));
      if (d.prompts && Array.isArray(d.prompts)) localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(d.prompts));
      if (d.smmOrders && Array.isArray(d.smmOrders)) localStorage.setItem(STORAGE_KEYS.SMM_ORDERS, JSON.stringify(d.smmOrders));
      if (d.onlineGigs && Array.isArray(d.onlineGigs)) localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(d.onlineGigs));
      if (d.watchlist && Array.isArray(d.watchlist)) localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(d.watchlist));
      if (d.vaultDocuments && Array.isArray(d.vaultDocuments)) localStorage.setItem(STORAGE_KEYS.VAULT_DOCS, JSON.stringify(d.vaultDocuments));
      if (d.subjects && Array.isArray(d.subjects)) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(d.subjects));
      if (d.exams && Array.isArray(d.exams)) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(d.exams));
      if (d.habits && Array.isArray(d.habits)) localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(d.habits));
      if (d.ideas && Array.isArray(d.ideas)) localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(d.ideas));

      const restoredCounts = {
        tasks: d.tasks?.length || 0,
        notes: d.notes?.length || 0,
        bookmarks: d.bookmarks?.length || 0,
        projects: d.projects?.length || 0,
        accounts: d.accounts?.length || 0,
        transactions: d.transactions?.length || 0,
        adjustments: d.adjustments?.length || 0,
        commission: d.commissionRecords?.length || 0,
        gambling: d.gamblingSessions?.length || 0,
        saiCustomers: d.saiCustomers?.length || 0,
        saiBookings: d.saiBookings?.length || 0,
        saiEquipment: d.saiEquipment?.length || 0,
        saiQuotes: d.saiQuotes?.length || 0,
        prompts: d.prompts?.length || 0,
        smmOrders: d.smmOrders?.length || 0,
        onlineGigs: d.onlineGigs?.length || 0,
        watchlist: d.watchlist?.length || 0,
        vaultDocuments: d.vaultDocuments?.length || 0,
        subjects: d.subjects?.length || 0,
        exams: d.exams?.length || 0,
        habits: d.habits?.length || 0,
        ideas: d.ideas?.length || 0,
      };

      this.addAuditLog({
        action: 'restore',
        entityType: 'settings',
        entityId: 'restore',
        details: restoredCounts,
      });

      return {
        success: true,
        message: 'Successfully restored workspace data from backup.',
        restoredCounts,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown parse error';
      return { success: false, message: `Restore failed: ${errMsg}` };
    }
  }

  // ─── Sai Customers ───
  static getSaiCustomers(): SaiCustomer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAI_CUSTOMERS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSaiCustomer(customer: Omit<SaiCustomer, 'id' | 'createdAt' | 'updatedAt' | 'totalBookings'> & { id?: string }): SaiCustomer {
    const items = this.getSaiCustomers();
    const now = new Date().toISOString();
    let saved: SaiCustomer;

    if (customer.id) {
      const idx = items.findIndex((c) => c.id === customer.id);
      saved = {
        ...items[idx],
        ...customer,
        id: customer.id,
        totalBookings: items[idx]?.totalBookings || 0,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'account', entityId: saved.id, details: { name: saved.name } });
    } else {
      saved = {
        ...customer,
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        totalBookings: 0,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'account', entityId: saved.id, details: { name: saved.name } });
    }

    localStorage.setItem(STORAGE_KEYS.SAI_CUSTOMERS, JSON.stringify(items));
    return saved;
  }

  static deleteSaiCustomer(id: string): void {
    const items = this.getSaiCustomers().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAI_CUSTOMERS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'account', entityId: id, details: {} });
  }

  // ─── Sai Bookings ───
  static getSaiBookings(): SaiBooking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAI_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSaiBooking(booking: Omit<SaiBooking, 'id' | 'createdAt' | 'updatedAt' | 'balanceDuePaise'> & { id?: string }): SaiBooking {
    const items = this.getSaiBookings();
    const now = new Date().toISOString();
    const balanceDuePaise = booking.totalAmountPaise - booking.advanceReceivedPaise;
    let saved: SaiBooking;

    if (booking.id) {
      const idx = items.findIndex((b) => b.id === booking.id);
      saved = {
        ...items[idx],
        ...booking,
        id: booking.id,
        balanceDuePaise,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'transaction', entityId: saved.id, details: { event: saved.eventType, date: saved.eventDate } });
    } else {
      saved = {
        ...booking,
        id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        balanceDuePaise,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);

      // Increment customer booking count
      const customers = this.getSaiCustomers();
      const cIdx = customers.findIndex((c) => c.id === booking.customerId);
      if (cIdx >= 0) {
        customers[cIdx].totalBookings = (customers[cIdx].totalBookings || 0) + 1;
        customers[cIdx].updatedAt = now;
        localStorage.setItem(STORAGE_KEYS.SAI_CUSTOMERS, JSON.stringify(customers));
      }

      this.addAuditLog({ action: 'create', entityType: 'transaction', entityId: saved.id, details: { event: saved.eventType, date: saved.eventDate } });
    }

    localStorage.setItem(STORAGE_KEYS.SAI_BOOKINGS, JSON.stringify(items));
    return saved;
  }

  static updateBookingStatus(id: string, status: SaiBooking['status']): void {
    const items = this.getSaiBookings();
    const idx = items.findIndex((b) => b.id === id);
    if (idx >= 0) {
      items[idx].status = status;
      items[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SAI_BOOKINGS, JSON.stringify(items));
      this.addAuditLog({ action: 'update', entityType: 'transaction', entityId: id, details: { newStatus: status } });
    }
  }

  static deleteSaiBooking(id: string): void {
    const items = this.getSaiBookings().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAI_BOOKINGS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'transaction', entityId: id, details: {} });
  }

  // ─── Sai Equipment ───
  static getSaiEquipment(): SaiEquipment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAI_EQUIPMENT);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSaiEquipment(equipment: Omit<SaiEquipment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SaiEquipment {
    const items = this.getSaiEquipment();
    const now = new Date().toISOString();
    let saved: SaiEquipment;

    if (equipment.id) {
      const idx = items.findIndex((e) => e.id === equipment.id);
      saved = {
        ...items[idx],
        ...equipment,
        id: equipment.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'account', entityId: saved.id, details: { name: saved.name } });
    } else {
      saved = {
        ...equipment,
        id: `equip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'account', entityId: saved.id, details: { name: saved.name } });
    }

    localStorage.setItem(STORAGE_KEYS.SAI_EQUIPMENT, JSON.stringify(items));
    return saved;
  }

  static updateEquipmentStatus(id: string, status: SaiEquipment['status'], renter?: string, until?: string): void {
    const items = this.getSaiEquipment();
    const idx = items.findIndex((e) => e.id === id);
    if (idx >= 0) {
      items[idx].status = status;
      items[idx].currentRenter = renter;
      items[idx].rentedUntil = until;
      items[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SAI_EQUIPMENT, JSON.stringify(items));
      this.addAuditLog({ action: 'update', entityType: 'account', entityId: id, details: { status, renter } });
    }
  }

  static deleteSaiEquipment(id: string): void {
    const items = this.getSaiEquipment().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAI_EQUIPMENT, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'account', entityId: id, details: {} });
  }

  // ─── Sai Quotes ───
  static getSaiQuotes(): SaiQuote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAI_QUOTES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSaiQuote(quote: Omit<SaiQuote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt' | 'subtotalPaise' | 'totalPaise'> & { id?: string; quoteNumber?: string }): SaiQuote {
    const items = this.getSaiQuotes();
    const now = new Date().toISOString();
    const subtotalPaise = quote.items.reduce((sum, item) => sum + item.totalPaise, 0);
    const totalPaise = subtotalPaise - quote.discountPaise + quote.taxPaise;
    let saved: SaiQuote;

    if (quote.id) {
      const idx = items.findIndex((q) => q.id === quote.id);
      saved = {
        ...items[idx],
        ...quote,
        id: quote.id,
        quoteNumber: quote.quoteNumber || items[idx]?.quoteNumber || `SD-Q${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`,
        subtotalPaise,
        totalPaise,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'task', entityId: saved.id, details: { quoteNumber: saved.quoteNumber } });
    } else {
      const quoteNumber = `SD-Q${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`;
      saved = {
        ...quote,
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        quoteNumber,
        subtotalPaise,
        totalPaise,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'task', entityId: saved.id, details: { quoteNumber: saved.quoteNumber } });
    }

    localStorage.setItem(STORAGE_KEYS.SAI_QUOTES, JSON.stringify(items));
    return saved;
  }

  static deleteSaiQuote(id: string): void {
    const items = this.getSaiQuotes().filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAI_QUOTES, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'task', entityId: id, details: {} });
  }

  // ─── Prompts ───
  static getPrompts(): PromptTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    return raw ? JSON.parse(raw) : [];
  }

  static savePrompt(prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): PromptTemplate {
    const items = this.getPrompts();
    const now = new Date().toISOString();
    let saved: PromptTemplate;

    if (prompt.id) {
      const idx = items.findIndex((p) => p.id === prompt.id);
      saved = {
        ...items[idx],
        ...prompt,
        id: prompt.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'note', entityId: saved.id, details: { title: saved.title } });
    } else {
      saved = {
        ...prompt,
        id: `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'note', entityId: saved.id, details: { title: saved.title } });
    }

    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(items));
    return saved;
  }

  static deletePrompt(id: string): void {
    const items = this.getPrompts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'note', entityId: id, details: {} });
  }

  // ─── SMM Orders ───
  static getSmmOrders(): SmmOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SMM_ORDERS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSmmOrder(order: Omit<SmmOrder, 'id' | 'orderNumber' | 'profitPaise' | 'createdAt' | 'updatedAt'> & { id?: string; orderNumber?: string }): SmmOrder {
    const items = this.getSmmOrders();
    const now = new Date().toISOString();
    const profitPaise = order.sellingPricePaise - order.costPricePaise;
    let saved: SmmOrder;

    if (order.id) {
      const idx = items.findIndex((o) => o.id === order.id);
      saved = {
        ...items[idx],
        ...order,
        id: order.id,
        orderNumber: order.orderNumber || items[idx]?.orderNumber || `SMM-${String(items.length + 1).padStart(3, '0')}`,
        profitPaise,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'transaction', entityId: saved.id, details: { orderNumber: saved.orderNumber } });
    } else {
      const orderNumber = `SMM-${new Date().getFullYear().toString().slice(-2)}${String(items.length + 1).padStart(3, '0')}`;
      saved = {
        ...order,
        id: `smm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderNumber,
        profitPaise,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'transaction', entityId: saved.id, details: { orderNumber: saved.orderNumber } });
    }

    localStorage.setItem(STORAGE_KEYS.SMM_ORDERS, JSON.stringify(items));
    return saved;
  }

  static updateSmmOrderStatus(id: string, status: SmmOrder['status']): void {
    const items = this.getSmmOrders();
    const idx = items.findIndex((o) => o.id === id);
    if (idx >= 0) {
      items[idx].status = status;
      items[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SMM_ORDERS, JSON.stringify(items));
      this.addAuditLog({ action: 'update', entityType: 'transaction', entityId: id, details: { newStatus: status } });
    }
  }

  static deleteSmmOrder(id: string): void {
    const items = this.getSmmOrders().filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.SMM_ORDERS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'transaction', entityId: id, details: {} });
  }

  // ─── Online Gigs ───
  static getOnlineGigs(): OnlineGig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GIGS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveOnlineGig(gig: Omit<OnlineGig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): OnlineGig {
    const items = this.getOnlineGigs();
    const now = new Date().toISOString();
    let saved: OnlineGig;

    if (gig.id) {
      const idx = items.findIndex((g) => g.id === gig.id);
      saved = {
        ...items[idx],
        ...gig,
        id: gig.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'transaction', entityId: saved.id, details: { title: saved.taskTitle } });
    } else {
      saved = {
        ...gig,
        id: `gig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'transaction', entityId: saved.id, details: { title: saved.taskTitle } });
    }

    localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(items));
    return saved;
  }

  static deleteOnlineGig(id: string): void {
    const items = this.getOnlineGigs().filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'transaction', entityId: id, details: {} });
  }

  // ─── Watchlist ───
  static getWatchlist(): WatchlistItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return raw ? JSON.parse(raw) : [];
  }

  static saveWatchlistItem(item: Omit<WatchlistItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): WatchlistItem {
    const items = this.getWatchlist();
    const now = new Date().toISOString();
    let saved: WatchlistItem;

    if (item.id) {
      const idx = items.findIndex((w) => w.id === item.id);
      saved = {
        ...items[idx],
        ...item,
        id: item.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
    } else {
      saved = {
        ...item,
        id: `wtc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
    return saved;
  }

  static updateWatchlistEpisode(id: string, delta: number): void {
    const items = this.getWatchlist();
    const idx = items.findIndex((w) => w.id === id);
    if (idx >= 0) {
      const current = items[idx].currentEpisode || 0;
      const next = Math.max(0, current + delta);
      items[idx].currentEpisode = next;
      if (items[idx].totalEpisodes && next >= items[idx].totalEpisodes!) {
        items[idx].status = 'completed';
      }
      items[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
    }
  }

  static deleteWatchlistItem(id: string): void {
    const items = this.getWatchlist().filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
  }

  // ─── Document Vault ───
  static getVaultDocuments(): VaultDocument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VAULT_DOCS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveVaultDocument(doc: Omit<VaultDocument, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): VaultDocument {
    const items = this.getVaultDocuments();
    const now = new Date().toISOString();
    let saved: VaultDocument;

    if (doc.id) {
      const idx = items.findIndex((d) => d.id === doc.id);
      saved = {
        ...items[idx],
        ...doc,
        id: doc.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'note', entityId: saved.id, details: { title: saved.title } });
    } else {
      saved = {
        ...doc,
        id: `vlt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'note', entityId: saved.id, details: { title: saved.title } });
    }

    localStorage.setItem(STORAGE_KEYS.VAULT_DOCS, JSON.stringify(items));
    return saved;
  }

  static deleteVaultDocument(id: string): void {
    const items = this.getVaultDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.VAULT_DOCS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'note', entityId: id, details: {} });
  }

  // ─── Subject Modules ───
  static getSubjects(): SubjectModule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveSubject(subj: Omit<SubjectModule, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SubjectModule {
    const items = this.getSubjects();
    const now = new Date().toISOString();
    let saved: SubjectModule;

    if (subj.id) {
      const idx = items.findIndex((s) => s.id === subj.id);
      saved = {
        ...items[idx],
        ...subj,
        id: subj.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'note', entityId: saved.id, details: { subject: saved.subjectName } });
    } else {
      saved = {
        ...subj,
        id: `sbj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'note', entityId: saved.id, details: { subject: saved.subjectName } });
    }

    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(items));
    return saved;
  }

  static deleteSubject(id: string): void {
    const items = this.getSubjects().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'note', entityId: id, details: {} });
  }

  // ─── Academic Exams ───
  static getExams(): AcademicExam[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveExam(exam: Omit<AcademicExam, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): AcademicExam {
    const items = this.getExams();
    const now = new Date().toISOString();
    let saved: AcademicExam;

    if (exam.id) {
      const idx = items.findIndex((e) => e.id === exam.id);
      saved = {
        ...items[idx],
        ...exam,
        id: exam.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'task', entityId: saved.id, details: { subject: saved.subjectName, date: saved.examDate } });
    } else {
      saved = {
        ...exam,
        id: `exm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'task', entityId: saved.id, details: { subject: saved.subjectName, date: saved.examDate } });
    }

    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(items));
    return saved;
  }

  static deleteExam(id: string): void {
    const items = this.getExams().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'task', entityId: id, details: {} });
  }

  // ─── Daily Habits ───
  static getHabits(): DailyHabit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveHabit(habit: Omit<DailyHabit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DailyHabit {
    const items = this.getHabits();
    const now = new Date().toISOString();
    let saved: DailyHabit;

    if (habit.id) {
      const idx = items.findIndex((h) => h.id === habit.id);
      saved = {
        ...items[idx],
        ...habit,
        id: habit.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
    } else {
      saved = {
        ...habit,
        id: `hbt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(items));
    return saved;
  }

  static toggleHabitToday(id: string): DailyHabit | null {
    const items = this.getHabits();
    const idx = items.findIndex((h) => h.id === id);
    if (idx < 0) return null;

    const todayStr = new Date().toISOString().slice(0, 10);
    const habit = items[idx];
    const isCompleted = habit.lastCompletedDate === todayStr;

    if (isCompleted) {
      habit.streakDays = Math.max(0, habit.streakDays - 1);
      habit.lastCompletedDate = undefined;
      habit.completedToday = false;
    } else {
      habit.streakDays = (habit.streakDays || 0) + 1;
      habit.lastCompletedDate = todayStr;
      habit.completedToday = true;
    }

    habit.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(items));
    return habit;
  }

  static deleteHabit(id: string): void {
    const items = this.getHabits().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(items));
  }

  // ─── Venture Ideas ───
  static getIdeas(): VentureIdea[] {
    const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return raw ? JSON.parse(raw) : [];
  }

  static saveIdea(idea: Omit<VentureIdea, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): VentureIdea {
    const items = this.getIdeas();
    const now = new Date().toISOString();
    let saved: VentureIdea;

    if (idea.id) {
      const idx = items.findIndex((i) => i.id === idea.id);
      saved = {
        ...items[idx],
        ...idea,
        id: idea.id,
        createdAt: items[idx]?.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) items[idx] = saved;
      else items.unshift(saved);
      this.addAuditLog({ action: 'update', entityType: 'note', entityId: saved.id, details: { title: saved.title, stage: saved.stage } });
    } else {
      saved = {
        ...idea,
        id: `ida_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(saved);
      this.addAuditLog({ action: 'create', entityType: 'note', entityId: saved.id, details: { title: saved.title, stage: saved.stage } });
    }

    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(items));
    return saved;
  }

  static updateIdeaStage(id: string, stage: VentureIdea['stage']): void {
    const items = this.getIdeas();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx].stage = stage;
      items[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(items));
      this.addAuditLog({ action: 'update', entityType: 'note', entityId: id, details: { newStage: stage } });
    }
  }

  static deleteIdea(id: string): void {
    const items = this.getIdeas().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(items));
    this.addAuditLog({ action: 'delete', entityType: 'note', entityId: id, details: {} });
  }

  // Clear Local Data safely
  static clearLocalWorkspaceData(): void {
    const keysToClear = [
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.NOTES,
      STORAGE_KEYS.BOOKMARKS,
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.ACCOUNTS,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.ADJUSTMENTS,
      STORAGE_KEYS.COMMISSION,
      STORAGE_KEYS.GAMBLING,
      STORAGE_KEYS.SAI_CUSTOMERS,
      STORAGE_KEYS.SAI_BOOKINGS,
      STORAGE_KEYS.SAI_EQUIPMENT,
      STORAGE_KEYS.SAI_QUOTES,
      STORAGE_KEYS.PROMPTS,
      STORAGE_KEYS.SMM_ORDERS,
      STORAGE_KEYS.GIGS,
      STORAGE_KEYS.WATCHLIST,
      STORAGE_KEYS.VAULT_DOCS,
      STORAGE_KEYS.SUBJECTS,
      STORAGE_KEYS.EXAMS,
      STORAGE_KEYS.HABITS,
      STORAGE_KEYS.IDEAS,
    ];
    for (const k of keysToClear) {
      localStorage.removeItem(k);
    }

    this.addAuditLog({
      action: 'delete',
      entityType: 'settings',
      entityId: 'all_data',
      details: { timestamp: new Date().toISOString() },
    });
  }
}
