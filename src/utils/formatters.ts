/**
 * Formatting and Arithmetic Utilities
 * Accurate Indian numbering formatting (INR), integer paise conversions, and date helpers.
 */

/**
 * Formats integer paise into standard Indian Rupee notation (₹X,XX,XXX.XX)
 * e.g. 15000000 paise -> "₹1,50,000.00"
 * e.g. 50000 paise -> "₹500.00"
 * e.g. -15000 paise -> "-₹150.00"
 */
export function formatPaiseToINR(paise: number, includeDecimals = true): string {
  if (!Number.isFinite(paise) || isNaN(paise)) {
    return '₹0.00';
  }

  const isNegative = paise < 0;
  const absPaise = Math.abs(Math.round(paise));
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  // Format integer rupee part according to Indian numbering system (3 digits, then 2 digits)
  const rupeeStr = rupees.toString();
  let formattedRupees = '';

  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    const lastThree = rupeeStr.substring(rupeeStr.length - 3);
    const otherDigits = rupeeStr.substring(0, rupeeStr.length - 3);
    const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = formattedOther + ',' + lastThree;
  }

  const decimals = includeDecimals ? `.${remainingPaise.toString().padStart(2, '0')}` : '';
  const prefix = isNegative ? '-₹' : '₹';

  return `${prefix}${formattedRupees}${decimals}`;
}

/**
 * Parses user input into exact integer paise.
 * Rejects invalid strings, NaN, infinity, or negative numbers if not allowed.
 */
export function parseINRToPaise(input: string | number, allowNegative = false): number | null {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || isNaN(input)) return null;
    if (!allowNegative && input < 0) return null;
    return Math.round(input * 100);
  }

  if (typeof input !== 'string') return null;

  // Strip currency symbols, commas, and whitespace
  const sanitized = input.replace(/[₹,\s]/g, '').trim();
  if (sanitized === '') return null;

  const num = Number(sanitized);
  if (!Number.isFinite(num) || isNaN(num)) return null;
  if (!allowNegative && num < 0) return null;

  return Math.round(num * 100);
}

/**
 * Formats ISO date string to DD/MM/YYYY
 */
export function formatDateDDMMYYYY(dateInput: string | Date | number): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats ISO date string to DD/MM/YYYY, HH:MM AM/PM
 */
export function formatDateTime(dateInput: string | Date | number): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const datePart = formatDateDDMMYYYY(date);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strHours = String(hours).padStart(2, '0');

    return `${datePart}, ${strHours}:${minutes} ${ampm}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Human readable relative time (e.g. "just now", "5m ago", "2h ago", "yesterday")
 */
export function timeAgo(dateInput: string | Date | number): string {
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'in the future';
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'just now';

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDateDDMMYYYY(date);
  } catch {
    return '';
  }
}
