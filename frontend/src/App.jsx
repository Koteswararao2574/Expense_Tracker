import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/guards/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

// Auth pages
import LoginPage    from './features/auth/LoginPage.jsx'
import RegisterPage from './features/auth/RegisterPage.jsx'

// App pages
import DashboardPage      from './features/dashboard/DashboardPage.jsx'
import TransactionsPage   from './features/transactions/TransactionsPage.jsx'
import RecurringPage      from './features/recurring/RecurringPage.jsx'
import BudgetsPage        from './features/budgets/BudgetsPage.jsx'
import ExportPage         from './features/export/ExportPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — wrapped in AppLayout (sidebar + topbar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/recurring"    element={<RecurringPage />} />
              <Route path="/budgets"      element={<BudgetsPage />} />
              <Route path="/export"       element={<ExportPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
