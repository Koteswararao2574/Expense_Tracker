import { formatCurrency, formatDate } from '../../../utils/formatters'
import { Badge } from '../../../components/ui/index.jsx'

export default function TransactionTable({ rows, currency = 'USD', onEdit, onDelete }) {
  if (!rows.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs mt-1">Add your first transaction using the button above</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Date', 'Description', 'Category', 'Type', 'Amount', ''].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                           px-5 py-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((txn) => (
            <tr key={txn.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                {formatDate(txn.transactionDate)}
              </td>
              <td className="px-5 py-3.5 max-w-xs">
                <p className="font-medium text-gray-900 truncate">
                  {txn.description || txn.merchant || '—'}
                </p>
                {txn.merchant && txn.description && (
                  <p className="text-xs text-gray-400 truncate">{txn.merchant}</p>
                )}
              </td>
              <td className="px-5 py-3.5">
                {txn.categoryName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: txn.categoryColor ?? '#d1d5db' }}
                    />
                    <span className="text-gray-600">{txn.categoryName}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <Badge type={txn.type.toLowerCase()}>{txn.type}</Badge>
              </td>
              <td className={`px-5 py-3.5 font-semibold whitespace-nowrap ${
                txn.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {txn.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(txn.amount, txn.currency ?? currency)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => onEdit(txn)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50
                               rounded-lg transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(txn.id)}
                    className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50
                               rounded-lg transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
