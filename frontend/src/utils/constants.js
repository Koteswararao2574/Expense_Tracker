export const TRANSACTION_TYPES = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME',  label: 'Income'  },
]

export const BUDGET_PERIODS = [
  { value: 'WEEKLY',  label: 'Weekly'  },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY',  label: 'Yearly'  },
]

export const RECURRING_FREQUENCIES = [
  { value: 'DAILY',   label: 'Daily'   },
  { value: 'WEEKLY',  label: 'Weekly'  },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY',  label: 'Yearly'  },
]

export const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar'    },
  { code: 'EUR', symbol: '€',  name: 'Euro'         },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
]

// Default chart color palette for categories
export const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
  '#f97316', '#6366f1',
]
