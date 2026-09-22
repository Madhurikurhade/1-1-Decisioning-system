import { WeeklyAllocation } from '../types';

/**
 * Formats a number or string into standard Indian numbering format (e.g. 40000000 -> ₹4,00,00,000)
 */
export function formatIndianCurrency(amount: number | string, includeSymbol = true): string {
  if (amount === '' || amount === undefined || amount === null) return '';
  const cleanStr = String(amount).replace(/[^0-9.]/g, '');
  if (!cleanStr) return '';
  
  const parts = cleanStr.split('.');
  let numStr = parts[0];
  const decimalStr = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

  if (numStr.length <= 3) {
    return (includeSymbol ? '₹' : '') + numStr + decimalStr;
  }

  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return (includeSymbol ? '₹' : '') + formattedOther + ',' + lastThree + decimalStr;
}

/**
 * Strips non-numeric characters for storing raw values
 */
export function parseRawNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return cleaned ? parseFloat(cleaned) : 0;
}

/**
 * Formats integer with commas (e.g. 10000 -> 10,000)
 */
export function formatNumberWithCommas(val: string | number): string {
  if (val === '' || val === null || val === undefined) return '';
  const num = parseRawNumber(val);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-IN');
}

/**
 * Parses DD/MM/YYYY to Date object
 */
export function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
    return d;
  }
  return null;
}

/**
 * Formats Date to DD/MM/YYYY
 */
export function formatToDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Calculates duration in days between two DD/MM/YYYY dates (inclusive)
 */
export function calculateDurationDays(startStr: string, endStr: string): number {
  const start = parseDDMMYYYY(startStr);
  const end = parseDDMMYYYY(endStr);
  if (!start || !end) return 0;
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of end date
  return diffDays;
}

/**
 * Calculates number of weeks based on duration days.
 * E.g.:
 * - 1 to 7 days = 1 week
 * - 8 to 14 days = 2 weeks
 * - 15 to 21 days = 3 weeks (e.g. 11 to 30 -> 20 days -> 3 weeks)
 * - 22 to 28 days = 4 weeks
 * - 29 to 35 days = 5 weeks (e.g. all month 1 to 30 -> 30 days -> 5 weeks)
 */
export function calculateNumWeeks(days: number): number {
  if (days <= 0) return 4;
  return Math.max(1, Math.ceil(days / 7));
}

/**
 * Generates balanced weekly allocations totaling exactly 100%
 */
export function generateWeeklyAllocations(
  numWeeks: number,
  overallBudget: string | number
): WeeklyAllocation[] {
  const overallNum = parseRawNumber(overallBudget);
  const safeWeeks = Math.max(1, numWeeks);
  const basePct = Math.floor((100 / safeWeeks) * 10) / 10;
  const remainder = Math.round((100 - basePct * safeWeeks) * 10) / 10;

  return Array.from({ length: safeWeeks }, (_, i) => {
    const pctVal = i === safeWeeks - 1 ? +(basePct + remainder).toFixed(1) : basePct;
    return {
      week: i + 1,
      percent: pctVal.toFixed(1),
      amount: (overallNum * pctVal) / 100,
    };
  });
}

/**
 * Generates suggested use case name:
 * e.g. "10,000 AIP Optimization for Unsecured_BFL_SOL_S1"
 */
export function generateSuggestedUseCaseName(
  quantity: string,
  metric: string,
  l1: string,
  partner: string,
  l2: string[],
  l3: string[]
): string {
  const qtyFormatted = quantity ? formatNumberWithCommas(quantity) : '10,000';
  const metricText = metric || 'AIP';
  
  const components: string[] = [];
  if (l1) components.push(l1);
  if (partner) components.push(partner);
  if (l2 && l2.length > 0) components.push(l2.join('-'));
  if (l3 && l3.length > 0) components.push(l3.join('-'));

  const targetSuffix = components.length > 0 ? components.join('_') : 'Unsecured_BFL_SOL';

  return `${qtyFormatted} ${metricText} Optimization for ${targetSuffix}`;
}

/**
 * Checks if a DD/MM/YYYY date is in the future relative to 11 Sept 2026
 */
export function isDateInFuture(dateStr: string, refDate: Date = new Date(2026, 8, 11)): boolean {
  const parsed = parseDDMMYYYY(dateStr);
  if (!parsed) return false;
  const refTime = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();
  return parsed.getTime() > refTime;
}

/**
 * Formats a Date object to "01 Sept 2026"
 */
export function formatDateForTable(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Checks if a given Date object is the final calendar day of its month (28/29/30/31)
 */
export function isMonthEndDate(date: Date): boolean {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === lastDay;
}

/**
 * Returns formatted DD/MM/YYYY for the month-end date of a given year and month (0-indexed)
 */
export function formatMonthEndDate(year: number, month: number): string {
  const end = new Date(year, month + 1, 0);
  const dayStr = String(end.getDate()).padStart(2, '0');
  const monthStr = String(end.getMonth() + 1).padStart(2, '0');
  return `${dayStr}/${monthStr}/${year}`;
}

