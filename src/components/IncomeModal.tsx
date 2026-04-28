import { useState, type FormEvent } from 'react'
import Modal from 'react-modal'
import { useSnackbar } from 'notistack'

type IncomeModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddIncome: (amount: number) => boolean
}

export function IncomeModal({ isOpen, onClose, onAddIncome }: IncomeModalProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) {
      enqueueSnackbar('Please enter a valid income amount.', { variant: 'warning' })
      return
    }
    const ok = onAddIncome(n)
    if (ok) {
      setAmount('')
      onClose()
      enqueueSnackbar('Balance updated successfully.', { variant: 'success' })
    }
  }

  const handleClose = () => {
    setAmount('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modal-sheet"
      overlayClassName="modal-overlay"
      contentLabel="Add income"
    >
      <h2 className="modal-title">Add Balance</h2>
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="field-label" htmlFor="income-amount">
          Income Amount
        </label>
        <input
          id="income-amount"
          type="number"
          name="incomeAmount"
          placeholder="Income Amount"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="field-input"
        />
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Balance
          </button>
        </div>
      </form>
    </Modal>
  )
}
