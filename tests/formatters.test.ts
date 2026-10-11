import { describe, it, expect } from 'vitest';
import {
  formatPaiseToINR,
  parseINRToPaise,
  formatDateDDMMYYYY,
} from '@/utils/formatters';
import { isValidPaise, isValidSignedPaise } from '@/types/financial';

describe('Financial Formatters and Calculations', () => {
  it('formats integer paise to standard Indian Rupee notation', () => {
    expect(formatPaiseToINR(0)).toBe('₹0.00');
    expect(formatPaiseToINR(50000)).toBe('₹500.00');
    expect(formatPaiseToINR(150000)).toBe('₹1,500.00');
    expect(formatPaiseToINR(15000000)).toBe('₹1,50,000.00');
    expect(formatPaiseToINR(1000000000)).toBe('₹1,00,00,000.00');
  });

  it('correctly handles negative paise values', () => {
    expect(formatPaiseToINR(-15000)).toBe('-₹150.00');
    expect(formatPaiseToINR(-15000000)).toBe('-₹1,50,000.00');
  });

  it('parses formatted INR strings into exact integer paise', () => {
    expect(parseINRToPaise('500')).toBe(50000);
    expect(parseINRToPaise('₹1,500')).toBe(150000);
    expect(parseINRToPaise('₹1,50,000.50')).toBe(15000050);
    expect(parseINRToPaise('12.34')).toBe(1234);
  });

  it('rejects invalid or negative values when disallowed', () => {
    expect(parseINRToPaise('abc')).toBeNull();
    expect(parseINRToPaise(-100, false)).toBeNull();
    expect(parseINRToPaise('', false)).toBeNull();
  });

  it('validates safe integer paise types', () => {
    expect(isValidPaise(50000)).toBe(true);
    expect(isValidPaise(0)).toBe(true);
    expect(isValidPaise(-50)).toBe(false);
    expect(isValidPaise(12.34)).toBe(false);
    expect(isValidPaise(NaN)).toBe(false);
    expect(isValidPaise(Infinity)).toBe(false);

    expect(isValidSignedPaise(-5000)).toBe(true);
    expect(isValidSignedPaise(5000)).toBe(true);
  });

  it('formats dates in DD/MM/YYYY format', () => {
    const d = new Date(2026, 9, 10); // 10 Oct 2026
    expect(formatDateDDMMYYYY(d)).toBe('10/10/2026');
  });
});
