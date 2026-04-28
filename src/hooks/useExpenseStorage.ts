import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../types/expense'
import { DEFAULT_WALLET_BALANCE, STORAGE_KEYS } from '../constants'

function readExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.expenses)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is Expense =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as Expense).id === 'string' &&
        typeof (e as Expense).title === 'string' &&
        typeof (e as Expense).price === 'number' &&
        typeof (e as Expense).category === 'string' &&
        typeof (e as Expense).date === 'string',
    )
  } catch {
    return []
  }
}

function readWallet(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.walletBalance)
    if (raw === null) return DEFAULT_WALLET_BALANCE
    const n = Number(raw)
    return Number.isFinite(n) ? n : DEFAULT_WALLET_BALANCE
  } catch {
    return DEFAULT_WALLET_BALANCE
  }
}

export function useExpenseStorage() {
  const [expenses, setExpenses] = useState<Expense[]>(readExpenses)
  const [walletBalance, setWalletBalance] = useState(readWallet)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.walletBalance,
      String(walletBalance),
    )
  }, [walletBalance])

  const addIncome = useCallback((amount: number) => {
    if (amount <= 0) return false
    setWalletBalance((b) => b + amount)
    return true
  }, [])

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev])
    setWalletBalance((b) => b - expense.price)
  }, [])

  const updateExpense = useCallback(
    (id: string, next: Omit<Expense, 'id'>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...next, id } : e)),
      )
    },
    [],
  )

  const removeExpense = useCallback((id: string) => {
    let refund = 0
    setExpenses((prev) => {
      const found = prev.find((e) => e.id === id)
      if (!found) return prev
      refund = found.price
      return prev.filter((e) => e.id !== id)
    })
    if (refund > 0) setWalletBalance((b) => b + refund)
  }, [])

  const adjustWalletForEdit = useCallback((oldPrice: number, newPrice: number) => {
    setWalletBalance((b) => b + oldPrice - newPrice)
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
