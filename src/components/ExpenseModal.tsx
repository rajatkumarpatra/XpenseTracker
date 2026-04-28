import { useState, type FormEvent } from 'react'
import Modal from 'react-modal'
import { useSnackbar } from 'notistack'

function modalParent() {
  return document.getElementById('root') ?? document.body
}
import { EXPENSE_CATEGORIES } from '../constants'
import type { Expense } from '../types/expense'

type ExpenseModalProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  walletBalance: number
  editingExpense: Expense | null
  onSubmitExpense: (payload: Omit<Expense, 'id'>, id?: string) => void
}

const emptyForm = { title: '', price: '', category: '', date: '' }

export function ExpenseModal({
  isOpen,
  onClose,
  mode,
  walletBalance,
  editingExpense,
  onSubmitExpense,
}: ExpenseModalProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  const syncFormFromProps = () => {
    if (mode === 'edit' && editingExpense) {
      setTitle(editingExpense.title)
      setPrice(String(editingExpense.price))
      setCategory(editingExpense.category)
      setDate(editingExpense.date)
    } else {
      setTitle(emptyForm.title)
      setPrice(emptyForm.price)
      setCategory(emptyForm.category)
      setDate(emptyForm.date)
    }
  }

  const resetFields = () => {
    setTitle('')
    setPrice('')
    setCategory('')
    setDate('')
  }

  const handleClose = () => {
    resetFields()
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    const p = Number(price)
    const c = category.trim()
    const d = date.trim()

    if (!t || !Number.isFinite(p) || p <= 0 || !c || !d) {
      enqueueSnackbar('Please fill in all fields with valid values.', {
        variant: 'warning',
      })
      return
    }

    const maxSpend =
      mode === 'edit' && editingExpense
        ? walletBalance + editingExpense.price
        : walletBalance

    if (p > maxSpend) {
      enqueueSnackbar(
        'You cannot spend more than your available wallet balance.',
        { variant: 'error' },
      )
      return
    }

    onSubmitExpense({ title: t, price: p, category: c, date: d }, editingExpense?.id)
    if (mode === 'add') {
      resetFields()
      enqueueSnackbar('Expense added successfully.', { variant: 'success' })
    } else {
      enqueueSnackbar('Expense updated successfully.', { variant: 'success' })
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={syncFormFromProps}
      onRequestClose={handleClose}
      parentSelector={modalParent}
      portalClassName="modal-portal-root"
      className="modal-sheet"
      overlayClassName="modal-overlay"
      contentLabel={mode === 'add' ? 'Add expense' : 'Edit expense'}
    >
      <h2 className="modal-title">
        {mode === 'add' ? 'Add New Expense' : 'Edit Expense'}
      </h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field-label" htmlFor="expense-title">
          Title
        </label>
        <input
          id="expense-title"
          type="text"
          name="title"
          placeholder="e.g. Groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="field-input"
        />

        <label className="field-label" htmlFor="expense-price">
          Amount
        </label>
        <input
          id="expense-price"
          type="number"
          name="price"
          placeholder="0.00"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="field-input"
        />

        <label className="field-label" htmlFor="expense-category">
          Category
        </label>
        <select
          id="expense-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field-input field-select"
        >
          <option value="">Select category</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="expense-date">
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="field-input"
        />

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {mode === 'add' ? 'Add Expense' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
