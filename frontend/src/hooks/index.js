import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import transactionApi from '../api/transactionApi'
import analyticsApi   from '../api/analyticsApi'
import budgetApi      from '../api/budgetApi'
import categoryApi    from '../api/categoryApi'
import { format, subMonths, startOfMonth } from 'date-fns'

// ── Query keys (centralised to avoid typos) ───────────────────────────────────
export const QUERY_KEYS = {
  transactions:       ['transactions'],
  transaction:        (id) => ['transactions', id],
  categoryBreakdown:  (from, to) => ['analytics', 'categories', from, to],
  monthlyTrend:       (months) => ['analytics', 'trend', months],
  budgets:            ['budgets'],
  categories:         ['categories'],
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions, params],
    queryFn: () => transactionApi.getAll(params),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.budgets })
    },
  })
}

export function useUpdateTransaction(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => transactionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.budgets })
    },
  })
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function useCategoryBreakdown(from, to) {
  return useQuery({
    queryKey: QUERY_KEYS.categoryBreakdown(from, to),
    queryFn: () => analyticsApi.getCategoryBreakdown(from, to),
    enabled: !!from && !!to,
  })
}

export function useMonthlyTrend(months = 12) {
  return useQuery({
    queryKey: QUERY_KEYS.monthlyTrend(months),
    queryFn: () => analyticsApi.getMonthlyTrend(months),
  })
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export function useBudgets() {
  return useQuery({
    queryKey: QUERY_KEYS.budgets,
    queryFn: budgetApi.getAll,
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.budgets }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.budgets }),
  })
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: categoryApi.getAll,
    staleTime: Infinity,   // categories rarely change
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function useCurrentMonthRange() {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to:   format(now, 'yyyy-MM-dd'),
  }
}
