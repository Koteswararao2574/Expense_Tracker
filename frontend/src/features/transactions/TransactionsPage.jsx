import { useState } from 'react'
import {
  useTransactions,
  useDeleteTransaction,
} from '../../hooks/index.js'
import { useAuth } from '../../context/AuthContext'
import { Button, Spinner, Alert } from '../../components/ui/index.jsx'
import TransactionTable from './components/TransactionTable.jsx'
import TransactionForm  from './components/TransactionForm.jsx'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [page, setPage]         = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)

  const { data, isLoading, isError } = useTransactions({ page, size: 15 })
  const deleteMutation = useDeleteTransaction()

  const handleEdit   = (txn)  => { setEditing(txn); setFormOpen(true) }
  const handleDelete = (id)   => { if (confirm('Delete this transaction?')) deleteMutation.mutate(id) }
  const handleClose  = ()     => { setFormOpen(false); setEditing(null) }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500">
            {data?.totalElements ?? 0} total records
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          + Add Transaction
        </Button>
      </div>

      {/* Error */}
      {isError && <Alert type="error">Failed to load transactions. Please refresh.</Alert>}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <TransactionTable
            rows={data?.content ?? []}
            currency={user?.preferredCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              ← Previous
            </Button>
            <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <TransactionForm
        open={formOpen}
        onClose={handleClose}
        editingTransaction={editing}
      />
    </div>
  )
}
