import { formatCurrency } from '../../../utils/formatters'

const cards = (month, currency) => [
  {
    label:  'Total Income',
    value:  month?.totalIncome ?? 0,
    icon:   '📈',
    color:  'text-success-600',
    bg:     'bg-success-50',
  },
  {
    label:  'Total Expenses',
    value:  month?.totalExpense ?? 0,
    icon:   '📉',
    color:  'text-danger-600',
    bg:     'bg-danger-50',
  },
  {
    label:  'Net Savings',
    value:  (month?.totalIncome ?? 0) - (month?.totalExpense ?? 0),
    icon:   '💵',
    color:  'text-primary-600',
    bg:     'bg-primary-50',
  },
]

export default function SummaryCards({ month, currency = 'USD' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards(month, currency).map(({ label, value, icon, color, bg }) => (
        <div key={label} className="stat-card flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-xl flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${color}`}>
              {formatCurrency(value, currency)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">This month</p>
          </div>
        </div>
      ))}
    </div>
  )
}
