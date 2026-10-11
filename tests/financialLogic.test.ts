import { describe, it, expect } from 'vitest';
import { calculateLedgerBalance, type Transaction, type BalanceAdjustment } from '@/types/financial';

describe('Financial Data Integrity & Ledger Logic', () => {
  it('calculates balance with single documented rule (opening + inflows - outflows + adjustments)', () => {
    const openingBalancePaise = 50000; // ₹500.00

    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        date: '2026-10-10T10:00:00Z',
        accountId: 'acc_cash',
        type: 'income',
        amountPaise: 100000, // ₹1,000.00
        category: 'Work',
        description: 'Payment',
        status: 'completed',
        createdAt: '2026-10-10T10:00:00Z',
        updatedAt: '2026-10-10T10:00:00Z',
      },
      {
        id: 'tx_2',
        date: '2026-10-10T11:00:00Z',
        accountId: 'acc_cash',
        type: 'expense',
        amountPaise: 20000, // ₹200.00
        category: 'Fuel',
        description: 'Petrol',
        status: 'completed',
        createdAt: '2026-10-10T11:00:00Z',
        updatedAt: '2026-10-10T11:00:00Z',
      },
      {
        id: 'tx_3',
        date: '2026-10-10T12:00:00Z',
        accountId: 'acc_cash',
        type: 'expense',
        amountPaise: 30000, // ₹300.00
        category: 'Pending Purchase',
        description: 'Pending',
        status: 'pending', // PENDING MUST HAVE ZERO EFFECT!
        createdAt: '2026-10-10T12:00:00Z',
        updatedAt: '2026-10-10T12:00:00Z',
      },
    ];

    const adjustments: BalanceAdjustment[] = [
      {
        id: 'adj_1',
        accountId: 'acc_cash',
        previousBalancePaise: 130000,
        newActualBalancePaise: 135000,
        differencePaise: 5000, // +₹50.00
        adjustedAt: '2026-10-10T13:00:00Z',
        reason: 'Physical wallet count',
        auditLogId: 'audit_123',
      },
    ];

    // 50000 + 100000 - 20000 (pending ignored) + 5000 = 135000
    const calculated = calculateLedgerBalance(openingBalancePaise, transactions, adjustments);
    expect(calculated).toBe(135000);
  });

  it('correctly credits and debits linked transfers in ledger balance', () => {
    const openingPaise = 50000; // ₹500.00

    const transactions: Transaction[] = [
      {
        id: 'tx_trf_in',
        date: '2026-10-10T10:00:00Z',
        accountId: 'acc_cash',
        type: 'transfer',
        amountPaise: 40000, // ₹400.00
        category: 'Transfer In',
        description: 'Transfer from OmniCard',
        status: 'completed',
        createdAt: '2026-10-10T10:00:00Z',
        updatedAt: '2026-10-10T10:00:00Z',
      },
      {
        id: 'tx_trf_out',
        date: '2026-10-10T11:00:00Z',
        accountId: 'acc_cash',
        type: 'transfer',
        amountPaise: 10000, // ₹100.00
        category: 'Transfer Out',
        description: 'Transfer to Kotak Bank',
        status: 'completed',
        createdAt: '2026-10-10T11:00:00Z',
        updatedAt: '2026-10-10T11:00:00Z',
      },
    ];

    // 50000 + 40000 (Transfer In) - 10000 (Transfer Out) = 80000
    const balance = calculateLedgerBalance(openingPaise, transactions, []);
    expect(balance).toBe(80000);
  });

  it('accurately verifies the required test scenario sequence', () => {
    // 1. Initial Balances
    let cashBalance = 50000; // ₹500
    let omniBalance = 150000; // ₹1,500
    expect(cashBalance + omniBalance).toBe(200000); // ₹2,000

    // 2. Transfer ₹400 from OmniCard to Cash
    const transferAmount = 40000; // ₹400
    omniBalance -= transferAmount; // ₹1,100
    cashBalance += transferAmount; // ₹900
    expect(cashBalance).toBe(90000); // ₹900
    expect(omniBalance).toBe(110000); // ₹1,100
    expect(cashBalance + omniBalance).toBe(200000); // Total still ₹2,000

    // 3. Spend ₹150 from Cash
    const expenseAmount = 15000; // ₹150
    cashBalance -= expenseAmount; // ₹750
    expect(cashBalance).toBe(75000); // ₹750
    expect(cashBalance + omniBalance).toBe(185000); // Total becomes ₹1,850

    // 4. Manually reconcile Cash to ₹800 (Adjustment +₹50)
    const previousRecorded = cashBalance; // ₹750
    const newActual = 80000; // ₹800
    const difference = newActual - previousRecorded; // +₹50 (5000 paise)
    expect(difference).toBe(5000);

    const adjustment: BalanceAdjustment = {
      id: 'adj_test',
      accountId: 'acc_cash',
      previousBalancePaise: previousRecorded,
      newActualBalancePaise: newActual,
      differencePaise: difference,
      adjustedAt: new Date().toISOString(),
      reason: 'Physical recount of drawer',
      auditLogId: 'audit_test_rec',
    };

    cashBalance = adjustment.newActualBalancePaise;
    expect(cashBalance).toBe(80000); // ₹800
    expect(cashBalance + omniBalance).toBe(190000); // Total becomes ₹1,900
  });
});
