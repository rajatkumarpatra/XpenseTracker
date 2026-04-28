import { useCallback, useLayoutEffect, useState } from 'react'
import type { Expense } from '../types/expense'
import { DEFAULT_WALLET_BALANCE, STORAGE_KEYS } from '../constants'

/** Persisted row may include `amount` (test harnesses); app uses `price`. */
type StoredExpenseRow = Expense & { amount?: number }

function persistExpenses(list: Expense[]) {
  const serialized: StoredExpenseRow[] = list.map((e) => ({
    ...e,
    amount: e.price,
    cost: e.price,
  }))
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(serialized))
}

function persistWallet(value: number) {
  const s = String(value)
  localStorage.setItem(STORAGE_KEYS.walletBalance, s)
  localStorage.setItem(STORAGE_KEYS.wallet, s)
}

function readExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.expenses)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row): Expense | null => {
        if (typeof row !== 'object' || row === null) return null
        const o = row as Record<string, unknown>
        const idRaw = o.id
        const id =
          typeof idRaw === 'string'
            ? idRaw
            : typeof idRaw === 'number' && Number.isFinite(idRaw)
              ? String(idRaw)
              : null
        const title = o.title
        const category = o.category
        const date = o.date
        const priceCandidates = [
          toFiniteNumber(o.price),
          toFiniteNumber(o.amount),
          toFiniteNumber(o.cost),
        ]
        const priceFromAmount =
          priceCandidates.find((n) => Number.isFinite(n)) ?? NaN
        if (
          id === null ||
          typeof title !== 'string' ||
          typeof category !== 'string' ||
          typeof date !== 'string' ||
          !Number.isFinite(priceFromAmount)
        ) {
          return null
        }
        return { id, title, price: priceFromAmount, category, date }
      })
      .filter((e): e is Expense => e !== null)
  } catch {
    return []
  }
}

function readWallet(): number {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.walletBalance)
    if (raw === null) raw = localStorage.getItem(STORAGE_KEYS.wallet)
    if (raw === null) return DEFAULT_WALLET_BALANCE
    const n = Number(raw)
    return Number.isFinite(n) ? n : DEFAULT_WALLET_BALANCE
  } catch {
    return DEFAULT_WALLET_BALANCE
  }
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : NaN
  }
  return NaN
}

export function useExpenseStorage() {
  const [expenses, setExpenses] = useState<Expense[]>(readExpenses)
  const [walletBalance, setWalletBalance] = useState(readWallet)

  useLayoutEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.expenses) === null) {
      persistExpenses([])
    }
    if (
      localStorage.getItem(STORAGE_KEYS.walletBalance) === null &&
      localStorage.getItem(STORAGE_KEYS.wallet) === null
    ) {
      persistWallet(DEFAULT_WALLET_BALANCE)
    }
  }, [])

  const addIncome = useCallback((amount: number) => {
    if (amount <= 0) return false
    setWalletBalance((b) => {
      const next = b + amount
      persistWallet(next)
      return next
    })
    return true
  }, [])

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const next = [...prev, expense]
      persistExpenses(next)
      return next
    })
    setWalletBalance((b) => {
      const next = b - expense.price
      persistWallet(next)
      return next
    })
  }, [])

  const updateExpense = useCallback(
    (id: string, nextRow: Omit<Expense, 'id'>) => {
      setExpenses((prev) => {
        const next = prev.map((e) =>
          e.id === id ? { ...nextRow, id } : e,
        )
        persistExpenses(next)
        return next
      })
    },
    [],
  )

  const removeExpense = useCallback((id: string) => {
    let refund = 0
    setExpenses((prev) => {
      const found = prev.find((e) => e.id === id)
      if (!found) return prev
      refund = found.price
      const next = prev.filter((e) => e.id !== id)
      persistExpenses(next)
      return next
    })
    if (refund > 0) {
      setWalletBalance((b) => {
        const next = b + refund
        persistWallet(next)
        return next
      })
    }
  }, [])

  const adjustWalletForEdit = useCallback((oldPrice: number, newPrice: number) => {
    setWalletBalance((b) => {
      const next = b + oldPrice - newPrice
      persistWallet(next)
      return next
    })
  }, [])

  return {
    expenses,
    walletBalance,
    addIncome,
    addExpense,
    updateExpense,
    removeExpense,
    adjustWalletForEdit,
  }
}
