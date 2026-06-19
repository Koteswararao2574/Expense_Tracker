import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axiosInstance from '../../api/axiosInstance'
import { useCategories } from '../../hooks/index.js'
import {
  Button, Modal, Input, Select, Alert, Spinner, Badge,
} from '../../components/ui/index.jsx'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TRANSACTION_TYPES, RECURRING_FREQUENCIES, COMMON_CURRENCIES } from '../../utils/constants'

// ── API helpers ───────────────────────────────────────────────────────────────
const recurringApi = {
  getAll:  () => axiosInstance.get('/recurring').then(r => r.data.data),
  create:  (d) => axiosInstance.post('/recurring', d).then(r => r.data.data),
  delete:  (id) => axiosInstance.delete(`/recurring/${id}`).then(r => r.data),
}

const schema = z.object({
  name:        z.string().min(2, 'At least 2 characters'),
  amount:      z.coerce.number().positive('Must be positive'),
  currency:    z.string(),
  type:        z.enum(['INCOME', 'EXPENSE']),
  frequency:   z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate:   z.string().min(1, 'Required'),
  endDate:     z.string().optional(),
  categoryId:  z.coerce.number().optional().nullable(),
})

export default function RecurringPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: recurringApi.getAll,
  })
  const { data: categories = [] } = useCategories()

  const createMutation = useMutation({
    mutationFn: recurringApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setOpen(false); reset() },
  })
  const deleteMutation = useMutation({
    mutationFn: recurringApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', type: 'EXPENSE', frequency: 'MONTHLY' },
  })

  const onSubmit = async (data) => {
    await createMutation.mutateAsync({ ...data, categoryId: data.categoryId || null })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recurring Rules</h2>
          <p className="text-sm text-gray-500">Transactions that repeat automatically</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Rule</Button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!isLoading && !rules.length && (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔁</p>
          <p className="text-sm font-medium text-gray-600">No recurring rules</p>
          <p className="text-xs mt-1">Automate subscriptions, salaries, or regular bills</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{rule.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rule.frequency}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge type={rule.type.toLowerCase()}>{rule.type}</Badge>
                <button
                  onClick={() => deleteMutation.mutate(rule.id)}
                  className="ml-1 text-gray-400 hover:text-danger-600 transition"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p className={`text-xl font-bold ${rule.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}>
              {formatCurrency(rule.amount, rule.currency)}
            </p>

            <div className="text-xs text-gray-500 space-y-1">
              <p>📅 Next run: <span className="font-medium text-gray-700">{formatDate(rule.nextRunDate)}</span></p>
              {rule.endDate && <p>🏁 Ends: {formatDate(rule.endDate)}</p>}
              {rule.categoryName && <p>🏷️ {rule.categoryName}</p>}
            </div>

            <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
              rule.active ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {rule.active ? '● Active' : '○ Inactive'}
            </span>
          </div>
        ))}
      </div>

      {/* Create modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Recurring Rule">
        {createMutation.isError && (
          <div className="mb-4">
            <Alert type="error">
              {createMutation.error?.response?.data?.error ?? 'Failed to create rule'}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Netflix subscription" error={errors.name?.message} {...register('name')} />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Amount" type="number" step="0.01" placeholder="0.00" error={errors.amount?.message} {...register('amount')} />
            </div>
            <Select label="Currency" {...register('currency')}>
              {COMMON_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" {...register('type')}>
              {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select label="Frequency" {...register('frequency')}>
              {RECURRING_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </div>

          <Select label="Category (optional)" {...register('categoryId')}>
            <option value="">— None —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="End date (optional)" type="date" {...register('endDate')} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Create rule</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
