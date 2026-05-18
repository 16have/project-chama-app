// src/App.jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage }     from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MembersPage }   from './pages/MembersPage'
import { FinancesPage }  from './pages/FinancesPage'
import { RemindersPage } from './pages/RemindersPage'
import { NotFoundPage }  from './pages/NotFoundPage'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all authenticated members */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/members"   element={<MembersPage />} />
            <Route path="/finances"  element={<FinancesPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
          </Route>

          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
