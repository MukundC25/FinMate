// Utility Helper Functions
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format time to readable string
 */
export function formatTime(timeString: string): string {
  return timeString;
}

/**
 * Get current month date range
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

/**
 * Get previous month date range
 */
export function getPreviousMonthRange(): { start: string; end: string } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
    end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Group transactions by date
 */
export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Convert date format from DD-MM-YY to YYYY-MM-DD
 */
export function convertDateFormat(dateStr: string): string {
  // Handle DD-MM-YY format
  if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-');
    const fullYear = `20${year}`; // Assuming 20xx
    return `${fullYear}-${month}-${day}`;
  }
  
  // Handle DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  
  // Handle DDMmmYY format (e.g., 13Sep25)
  if (/^\d{2}[A-Za-z]{3}\d{2}$/.test(dateStr)) {
    const day = dateStr.slice(0, 2);
    const monthStr = dateStr.slice(2, 5);
    const year = `20${dateStr.slice(5, 7)}`;
    
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04',
      may: '05', jun: '06', jul: '07', aug: '08',
      sep: '09', oct: '10', nov: '11', dec: '12',
    };
    
    const month = months[monthStr.toLowerCase()];
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Get current time in HH:MM AM/PM format
 */
export function getCurrentTime(): string {
  const now = new Date();
  return format(now, 'h:mm a');
}

/**
 * Validate amount
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Parse amount from string
 */
export function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/[^0-9.]/g, ''));
}
