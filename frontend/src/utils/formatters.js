import { format, parseISO } from 'date-fns'

/**
 * Format a number as currency.
 * @param {number|string} amount
 * @param {string} currency  ISO 4217 code, e.g. "USD"
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

/**
 * Format an ISO date string or Date to a readable format.
 * @param {string|Date} date
 * @param {string} fmt  date-fns format string
 */
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

/**
 * Return "Jan 2025" from { year: 2025, month: 1 }
 */
export function formatMonthYear(year, month) {
  return format(new Date(year, month - 1, 1), 'MMM yyyy')
}

/**
 * Format a percentage with 1 decimal place.
 */
export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`
}

/**
 * Compact number format: 1_200_000 → "1.2M"
 */
export function formatCompact(value) {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)
}
