import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import type { Expense } from '../types/expense'

type ExpenseListProps = {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

/** Match wallet formatting: no thousands separators so Cypress can assert amounts like "1500" */
function formatMoney(n: number) {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

function formatDisplayDate(iso: string) {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>No expenses yet. Use &quot;+ Add Expense&quot; to record one.</p>
      </div>
    )
  }

  return (
    <ul
      className="expense-list"
      data-testid="transaction-list"
      aria-label="Transactions"
    >
      {expenses.map((exp) => (
        <li key={exp.id} className="expense-row">
          <div className="expense-row-main">
            <span className="expense-title">{exp.title}</span>
            <span className="expense-meta">
              {exp.category} · {formatDisplayDate(exp.date)}
            </span>
          </div>
          <div className="expense-row-actions">
            <span className="expense-amount">{formatMoney(exp.price)}</span>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Edit ${exp.title}`}
              onClick={() => onEdit(exp)}
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              aria-label={`Delete ${exp.title}`}
              onClick={() => onDelete(exp.id)}
            >
              <FiTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
