import { useCallback, useState } from 'react'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { ExpenseCharts } from './components/ExpenseCharts'
import { ExpenseList } from './components/ExpenseList'
import { ExpenseModal } from './components/ExpenseModal'
import { IncomeModal } from './components/IncomeModal'
import { useExpenseStorage } from './hooks/useExpenseStorage'
import type { Expense } from './types/expense'
import './App.css'

function formatWallet(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

function ExpenseTrackerApp() {
  const { enqueueSnackbar } = useSnackbar()
  const {
    expenses,
    walletBalance,
    addIncome,
    addExpense,
    updateExpense,
    removeExpense,
    adjustWalletForEdit,
  } = useExpenseStorage()

  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expenseModalMode, setExpenseModalMode] = useState<'add' | 'edit'>('add')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const openAddExpense = () => {
    setExpenseModalMode('add')
    setEditingExpense(null)
    setExpenseModalOpen(true)
  }

  const openEditExpense = (exp: Expense) => {
    setExpenseModalMode('edit')
    setEditingExpense(exp)
    setExpenseModalOpen(true)
  }

  const closeExpenseModal = () => {
    setExpenseModalOpen(false)
    setEditingExpense(null)
  }

  const handleSubmitExpense = useCallback(
    (payload: Omit<Expense, 'id'>, id?: string) => {
      if (id && editingExpense) {
        adjustWalletForEdit(editingExpense.price, payload.price)
        updateExpense(id, payload)
        return
      }
      const newExpense: Expense = {
        ...payload,
        id: crypto.randomUUID(),
      }
      addExpense(newExpense)
    },
    [
      addExpense,
      adjustWalletForEdit,
      updateExpense,
      editingExpense,
    ],
  )

  const handleDelete = (id: string) => {
    removeExpense(id)
    enqueueSnackbar('Expense removed. Balance updated.', { variant: 'info' })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p className="app-subtitle">Track spending and stay within budget</p>
      </header>

      <main className="app-main">
        <section className="wallet-panel" aria-labelledby="wallet-label">
          <h2 id="wallet-label" className="wallet-heading">
            Wallet Balance: {formatWallet(walletBalance)}
          </h2>
          <p className="wallet-caption">Available for new expenses</p>
          <div className="wallet-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIncomeOpen(true)}
            >
              + Add Income
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddExpense}
            >
              + Add Expense
            </button>
          </div>
        </section>

        <ExpenseCharts expenses={expenses} />

        <section className="history-panel" aria-labelledby="history-heading">
          <h2 id="history-heading" className="panel-title">
            Recent Expenses
          </h2>
          <ExpenseList
            expenses={expenses}
            onEdit={openEditExpense}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <IncomeModal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        onAddIncome={addIncome}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={closeExpenseModal}
        mode={expenseModalMode}
        walletBalance={walletBalance}
        editingExpense={editingExpense}
        onSubmitExpense={handleSubmitExpense}
      />
    </div>
  )
}

export default function App() {
  return (
    <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <ExpenseTrackerApp />
    </SnackbarProvider>
  )
}
