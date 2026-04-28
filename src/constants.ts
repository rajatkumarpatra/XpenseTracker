export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills',
  'Other',
] as const

export const DEFAULT_WALLET_BALANCE = 5000

/** Primary keys used by the app; some test harnesses also read `wallet`. */
export const STORAGE_KEYS = {
  expenses: 'expenses',
  walletBalance: 'walletBalance',
  wallet: 'wallet',
} as const

export const CHART_COLORS = [
  '#0d9488',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#22c55e',
  '#8b5cf6',
  '#64748b',
]
