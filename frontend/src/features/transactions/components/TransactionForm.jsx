import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  useCreateTransaction,
  useUpdateTransaction,
  useCategories,
} from '../../../hooks/index.js'
import {
  Modal, Input, Select, Button, Alert,
} from '../../../components/ui/index.jsx'
import { TRANSACTION_TYPES, COMMON_CURRENCIES } from '../../../utils/constants'

const schema = z.object({
  amount:          z.coerce.number().positive('Must be a positive number'),
  currency:        z.string().min(1),
  type:            z.enum(['INCOME', 'EXPENSE']),
  transactionDate: z.string().min(1, 'Date is required'),
  description:     z.string().max(500).optional(),
  merchant:        z.string().max(100).optional(),
  categoryId:      z.coerce.number().optional().nullable(),
})

export default function TransactionForm({ open, onClose, editingTransaction }) {
  const isEditing = !!editingTransaction
  const { data: categories = [] } = useCategories()

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction(editingTransaction?.id)
  const mutation = isEditing ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currency:        'USD',
      type:            'EXPENSE',
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount:          editingTransaction.amount,
        currency:        editingTransaction.currency,
        type:            editingTransaction.type,
        transactionDate: editingTransaction.transactionDate,
        description:     editingTransaction.description ?? '',
        merchant:        editingTransaction.merchant ?? '',
        categoryId:      editingTransaction.categoryId ?? '',
      })
    } else {
      reset({
        currency:        'USD',
        type:            'EXPENSE',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        description:     '',
        merchant:        '',
        categoryId:      '',
      })
    }
  }, [editingTransaction, reset])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || null,
    }
    await mutation.mutateAsync(payload)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
    >
      {mutation.isError && (
        <div className="mb-4">
          <Alert type="error">
            {mutation.error?.response?.data?.error ?? 'Something went wrong'}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Amount + Currency side by side */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount')}
            />
          </div>
          <Select label="Currency" {...register('currency')}>
            {COMMON_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </Select>
        </div>

        {/* Type */}
        <Select label="Type" error={errors.type?.message} {...register('type')}>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>

        {/* Date */}
        <Input
          label="Date"
          type="date"
          error={errors.transactionDate?.message}
          {...register('transactionDate')}
        />

        {/* Category */}
        <Select label="Category (optional)" {...register('categoryId')}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        {/* Merchant */}
        <Input
          label="Merchant (optional)"
          placeholder="e.g. Starbucks"
          error={errors.merchant?.message}
          {...register('merchant')}
        />

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Add a note…"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-danger-600">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {isEditing ? 'Save changes' : 'Add transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
