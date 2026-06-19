import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '../../../utils/formatters'
import { CHART_COLORS } from '../../../utils/constants'

function CustomTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">{formatCurrency(value, currency)}</p>
    </div>
  )
}

export default function CategoryPieChart({ data, currency = 'USD' }) {
  if (!data?.length) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-gray-400">
        No spending data for this period
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name:  d.categoryName,
    value: Number(d.totalAmount),
    color: d.color,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => (
            <span className="text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
