import { format, startOfMonth } from 'date-fns'
import { useMonthlyTrend, useCategoryBreakdown, useCurrentMonthRange } from '../../hooks/index.js'
import { useAuth } from '../../context/AuthContext'
import SummaryCards      from './components/SummaryCards.jsx'
import MonthlyBarChart   from './components/MonthlyBarChart.jsx'
import CategoryPieChart  from './components/CategoryPieChart.jsx'
import RecentTransactions from './components/RecentTransactions.jsx'
import { Spinner } from '../../components/ui/index.jsx'

export default function DashboardPage() {
  const { user } = useAuth()
  const { from, to } = useCurrentMonthRange()

  const { data: trend,     isLoading: trendLoading }     = useMonthlyTrend(12)
  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdown(from, to)

  const currentMonth = trend?.[trend.length - 1] ?? null

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} · Here's your financial overview
        </p>
      </div>

      {/* Summary cards */}
      {trendLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <SummaryCards month={currentMonth} currency={user?.preferredCurrency} />
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Income vs Expenses (12 months)</h3>
          {trendLoading
            ? <div className="h-60 flex items-center justify-center"><Spinner /></div>
            : <MonthlyBarChart data={trend ?? []} currency={user?.preferredCurrency} />
          }
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
          {breakdownLoading
            ? <div className="h-60 flex items-center justify-center"><Spinner /></div>
            : <CategoryPieChart data={breakdown ?? []} currency={user?.preferredCurrency} />
          }
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h3>
        <RecentTransactions currency={user?.preferredCurrency} />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
