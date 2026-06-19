import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
  useCategories,
} from '../../hooks/index.js'
import { useAuth } from '../../context/AuthContext'
import {
  Button, Modal, Input, Select, Alert, Spinner,
} from '../../components/ui/index.jsx'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { BUDGET_PERIODS } from '../../utils/constants'

const schema = z.object({
  limitAmount:           z.coerce.number().positive('Must be > 0'),
  period:                z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  alertThresholdPercent: z.coerce.number().min(1).max(100),
  alertEnabled:          z.boolean(),
  categoryId:            z.coerce.number().optional().nullable(),
})

function BudgetCard({ budget, currency, onDelete }) {
  const pct      = Number(budget.percentUsed)
  const isOver   = budget.overBudget
  const barColor = isOver
    ? 'bg-danger-500'
    : pct >= budget.alertThresholdPercent
      ? 'bg-warning-500'
      : 'bg-primary-500'

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{budget.categoryName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{budget.period} budget</p>
        </div>
        <button
          onClick={() => onDelete(budget.budgetId)}
          className="text-gray-400 hover:text-danger-600 transition p-1"
          title="Delete budget"
        >
          🗑️
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{formatCurrency(budget.spent, currency)} spent</span>
          <span className={isOver ? 'text-danger-600 font-semibold' : ''}>
            {formatPercent(pct)}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className={isOver ? 'text-danger-600 font-medium' : 'text-gray-400'}>
            {isOver
              ? `${formatCurrency(Math.abs(budget.remaining), currency)} over budget!`
              : `${formatCurrency(budget.remaining, currency)} remaining`
            }
          </span>
          <span className="text-gray-400">
            Limit: {formatCurrency(budget.limitAmount, currency)}
          </span>
        </div>
      </div>

      {/* Alert badge */}
      {pct >= budget.alertThresholdPercent && !isOver && (
        <p className="text-xs text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5">
          ⚠️ Approaching budget limit ({budget.alertThresholdPercent}% threshold)
        </p>
      )}
      {isOver && (
        <p className="text-xs text-danger-600 bg-danger-50 rounded-lg px-3 py-1.5">
          🚨 Over budget!
        </p>
      )}
    </div>
  )
}

export default function BudgetsPage() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const { data: budgets = [], isLoading } = useBudgets()
  const { data: categories = [] }         = useCategories()
  const createMutation = useCreateBudget()
  const deleteMutation = useDeleteBudget()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'MONTHLY',
      alertThresholdPercent: 80,
      alertEnabled: true,
    },
  })

  const onSubmit = async (data) => {
    await createMutation.mutateAsync({ ...data, categoryId: data.categoryId || null })
    reset()
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Budgets</h2>
          <p className="text-sm text-gray-500">Track your spending limits</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Budget</Button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!isLoading && !budgets.length && (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm font-medium text-gray-600">No budgets set up yet</p>
          <p className="text-xs mt-1">Create a budget to track your spending limits</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.map((b) => (
          <BudgetCard
            key={b.budgetId}
            budget={b}
            currency={user?.preferredCurrency}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Create budget modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create Budget">
        {createMutation.isError && (
          <div className="mb-4">
            <Alert type="error">
              {createMutation.error?.response?.data?.error ?? 'Failed to create budget'}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Budget limit"
            type="number"
            step="0.01"
            placeholder="500.00"
            error={errors.limitAmount?.message}
            {...register('limitAmount')}
          />

          <Select label="Period" error={errors.period?.message} {...register('period')}>
            {BUDGET_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>

          <Select label="Category (optional — leave blank for overall)" {...register('categoryId')}>
            <option value="">— Overall (all categories) —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Input
            label="Alert threshold (%)"
            type="number"
            min={1}
            max={100}
            error={errors.alertThresholdPercent?.message}
            {...register('alertThresholdPercent')}
          />

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded" {...register('alertEnabled')} />
            Enable budget alerts
          </label>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Create budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
