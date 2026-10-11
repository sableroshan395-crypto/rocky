/**
 * Financial Types & Data Contracts for Rocky's Workspace
 * Strict adherence to integer paise representation and immutable audit requirements.
 */

export type CurrencyCode = 'INR';

export type AccountType = 'cash' | 'bank' | 'wallet' | 'prepaid_card' | 'custom';

export type AccountCategory = 'personal' | 'business' | 'work';

export interface Account {
  id: string; // Stable UUID
  name: string; // e.g. "Cash in Hand", "Kotak Bank"
  type: AccountType;
  category: AccountCategory;
  openingBalancePaise: number; // Integer paise
  currentRecordedBalancePaise: number; // Integer paise
  lastVerifiedBalancePaise?: number; // Integer paise
  lastVerifiedDate?: string; // ISO 8601
  isArchived: boolean;
  includeInNetTotal: boolean;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund' | 'balance_adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'reconciled';

export interface Transaction {
  id: string; // Stable UUID
  date: string; // ISO 8601
  accountId: string; // Relational foreign key to Account.id
  type: TransactionType;
  amountPaise: number; // Strictly positive integer paise
  category: string;
  description: string;
  referenceId?: string;
  linkedTransferId?: string; // Shared by matched debit & credit transfer entries
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceAdjustment {
  id: string;
  accountId: string;
  previousBalancePaise: number;
  newActualBalancePaise: number;
  differencePaise: number; // newActual - previous (can be positive, zero, or negative)
  adjustedAt: string;
  reason: string;
  referenceNote?: string;
  auditLogId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'transfer' | 'reconcile' | 'import' | 'restore' | 'export' | 'auth_unlock' | 'auth_lock' | 'auth_login' | 'auth_logout';
  entityType: 'account' | 'transaction' | 'balance_adjustment' | 'commission' | 'gambling' | 'task' | 'note' | 'bookmark' | 'project' | 'settings' | 'auth';
  entityId: string;
  details: Record<string, unknown>; // Sanitized details; never credentials or secrets
}

export interface WorkCommissionRecord {
  id: string;
  date: string; // ISO 8601
  referenceId: string;
  purpose: string;
  amountProcessedPaise: number;
  commissionRate: number; // e.g. 3.2
  commissionBasisPaise: number;
  calculatedCommissionPaise: number;
  commissionReceivedPaise: number;
  relatedFeesPaise: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamblingSession {
  id: string;
  platform: string;
  sessionStart: string; // ISO 8601
  sessionEnd?: string;
  depositsPaise: number;
  withdrawalsPaise: number;
  netResultPaise: number; // withdrawals - deposits
  timeSpentMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface TransferRequest {
  sourceAccountId: string;
  targetAccountId: string;
  amountPaise: number;
  date: string;
  description: string;
  referenceId?: string;
  notes?: string;
}

export function calculateCommissionPaise(eligiblePaise: number, ratePercent: number): number {
  return Math.round((eligiblePaise * ratePercent) / 100);
}

/**
 * Validates that an amount is a safe, non-negative integer paise.
 */
export function isValidPaise(amount: unknown): amount is number {
  return (
    typeof amount === 'number' &&
    Number.isInteger(amount) &&
    Number.isFinite(amount) &&
    amount >= 0 &&
    amount <= Number.MAX_SAFE_INTEGER
  );
}

/**
 * Validates that a difference or signed amount is a safe integer paise.
 */
export function isValidSignedPaise(amount: unknown): amount is number {
  return (
    typeof amount === 'number' &&
    Number.isInteger(amount) &&
    Number.isFinite(amount) &&
    Math.abs(amount) <= Number.MAX_SAFE_INTEGER
  );
}

/**
 * Single documented ledger balance formula:
 * Balance = Opening Balance + Sum(Completed Inflows) - Sum(Completed Outflows) + Sum(Balance Adjustments)
 * Note: Transfers have linked debit/credit entries, where debit decreases source account and credit increases target account.
 * Pending or cancelled transactions have ZERO balance effect.
 */
export function calculateLedgerBalance(
  openingBalancePaise: number,
  transactions: Transaction[],
  adjustments: BalanceAdjustment[] = []
): number {
  let balance = openingBalancePaise;

  for (const tx of transactions) {
    if (tx.status !== 'completed' && tx.status !== 'reconciled') {
      continue; // Pending and cancelled transactions never modify the ledger
    }

    if (tx.type === 'income' || tx.type === 'refund') {
      balance += tx.amountPaise;
    } else if (tx.type === 'expense') {
      balance -= tx.amountPaise;
    } else if (tx.type === 'transfer') {
      // In linked transfers:
      // An outgoing transfer ('Transfer Out') reduces the account balance
      // An incoming transfer ('Transfer In') increases the account balance
      if (tx.category === 'Transfer In' || tx.description.toLowerCase().startsWith('transfer from')) {
        balance += tx.amountPaise;
      } else if (tx.category === 'Transfer Out' || tx.description.toLowerCase().startsWith('transfer to')) {
        balance -= tx.amountPaise;
      }
    }
  }

  for (const adj of adjustments) {
    balance += adj.differencePaise;
  }

  return balance;
}
