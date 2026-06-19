import { useTransactions } from '../../../hooks/index.js'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { Badge, Spinner } from '../../../components/ui/index.jsx'

export default function RecentTransactions({ currency = 'USD' }) {
  const { data, isLoading, isError } = useTransactions({ size: 5, page: 0 })

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (isError)   return <p className="text-sm text-danger-600">Failed to load transactions.</p>

  const items = data?.content ?? []

  if (!items.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm">No transactions yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((txn) => (
        <div key={txn.id} className="flex items-center gap-4 py-3">
          {/* Category color dot */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: txn.categoryColor ? `${txn.categoryColor}20` : '#f3f4f6' }}
          >
            💸
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {txn.description || txn.merchant || 'Transaction'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {txn.categoryName ?? 'Uncategorized'} · {formatDate(txn.transactionDate)}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`text-sm font-semibold ${
              txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'
            }`}>
              {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
            </p>
            <Badge type={txn.type.toLowerCase()}>{txn.type}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
