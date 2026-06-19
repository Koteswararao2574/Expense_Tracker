import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/budgets':      'Budgets',
  '/recurring':    'Recurring Rules',
  '/export':       'Export Data',
}

export default function Topbar() {
  const location = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[location.pathname] ?? 'ExpenseTracker'

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6
                       flex items-center justify-between flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="badge bg-gray-100 text-gray-600 text-xs">
          {user?.preferredCurrency ?? 'USD'}
        </span>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </header>
  )
}
