import clsx from 'clsx'
import { forwardRef } from 'react'

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', className, loading, children, ...props }) {
  const VARIANTS = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }
  return (
    <button
      className={clsx(VARIANTS[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx('input', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, className, children, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        ref={ref}
        className={clsx('input bg-white', error && 'input-error', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <svg
      className={clsx('animate-spin text-current', sz)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ type = 'default', children }) {
  const styles = {
    income:  'badge-income',
    expense: 'badge-expense',
    default: 'badge bg-gray-100 text-gray-600',
    warning: 'badge bg-warning-50 text-warning-600',
  }
  return <span className={styles[type] ?? styles.default}>{children}</span>
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', title, children }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-success-50 border-green-200 text-green-800',
    warning: 'bg-warning-50 border-yellow-200 text-yellow-800',
    error:   'bg-danger-50 border-red-200 text-red-800',
  }
  return (
    <div className={clsx('rounded-lg border p-4 text-sm', styles[type])}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p>{children}</p>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh]
                      overflow-y-auto z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}