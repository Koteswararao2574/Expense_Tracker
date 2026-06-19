import { useState } from 'react'
import { format, subMonths, startOfMonth } from 'date-fns'
import exportApi from '../../api/exportApi'
import { Button, Alert } from '../../components/ui/index.jsx'
import { Input } from '../../components/ui/index.jsx'

const PRESETS = [
  { label: 'This month',    getDates: () => ({ from: format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last month',    getDates: () => { const d = subMonths(new Date(), 1); return { from: format(startOfMonth(d), 'yyyy-MM-dd'), to: format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd') } } },
  { label: 'Last 3 months', getDates: () => ({ from: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 6 months', getDates: () => ({ from: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This year',     getDates: () => ({ from: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
]

export default function ExportPage() {
  const [from, setFrom]       = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo]           = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(null)   // 'csv' | 'excel' | null
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  const applyPreset = (preset) => {
    const dates = preset.getDates()
    setFrom(dates.from)
    setTo(dates.to)
    setSuccess(null)
    setError(null)
  }

  const handleExport = async (type) => {
    if (!from || !to) { setError('Please select a date range.'); return }
    if (from > to)    { setError('Start date must be before end date.'); return }

    try {
      setError(null)
      setSuccess(null)
      setLoading(type)

      if (type === 'csv')   await exportApi.downloadCsv(from, to)
      if (type === 'excel') await exportApi.downloadExcel(from, to)

      setSuccess(`${type.toUpperCase()} downloaded successfully!`)
    } catch (err) {
      setError(err?.response?.data?.error ?? `Failed to export ${type}. Try again.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Download your transactions as CSV or Excel for external use
        </p>
      </div>

      {/* Alerts */}
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Date range card */}
      <div className="card space-y-5">
        <h3 className="text-sm font-semibold text-gray-700">Select Date Range</h3>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200
                         text-gray-600 hover:bg-primary-50 hover:border-primary-300
                         hover:text-primary-700 transition"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Manual date pickers */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setSuccess(null) }}
            max={to}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setSuccess(null) }}
            min={from}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        {/* Range summary */}
        {from && to && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            📅 Exporting transactions from <strong>{format(new Date(from + 'T00:00'), 'MMM d, yyyy')}</strong>
            {' '}to <strong>{format(new Date(to + 'T00:00'), 'MMM d, yyyy')}</strong>
          </p>
        )}
      </div>

      {/* Export format cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV card */}
        <div className="card flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">
            📄
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">CSV File</h4>
            <p className="text-xs text-gray-500 mt-1">
              Plain comma-separated format. Compatible with Google Sheets,
              Excel, and any data tool.
            </p>
          </div>
          <Button
            className="w-full"
            variant="secondary"
            loading={loading === 'csv'}
            disabled={!!loading}
            onClick={() => handleExport('csv')}
          >
            {loading === 'csv' ? 'Downloading…' : '⬇ Download CSV'}
          </Button>
        </div>

        {/* Excel card */}
        <div className="card flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
            📊
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Excel File (.xlsx)</h4>
            <p className="text-xs text-gray-500 mt-1">
              Formatted spreadsheet with colour-coded rows, auto-sized
              columns, and header styling.
            </p>
          </div>
          <Button
            className="w-full"
            loading={loading === 'excel'}
            disabled={!!loading}
            onClick={() => handleExport('excel')}
          >
            {loading === 'excel' ? 'Downloading…' : '⬇ Download Excel'}
          </Button>
        </div>
      </div>

      {/* Field legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Exported Fields</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Date', 'Type', 'Amount', 'Currency', 'Category', 'Merchant', 'Description'].map((f) => (
            <span key={f} className="badge bg-gray-100 text-gray-600">{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
