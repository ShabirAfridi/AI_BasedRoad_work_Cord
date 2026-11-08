// All routes defined here
// AuthProvider wraps everything so auth state is available everywhere

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DepartmentDashboard from './pages/department/DepartmentDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import CitizenMapPage from './pages/citizen/CitizenMapPage'
import InspectorDashboard from './pages/inspector/InspectorDashboard'

const Unauthorized      = () => <h1 style={{padding:'2rem'}}>403 — You do not have access to this page</h1>

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public routes — no token needed */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Default → go to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes — ADMIN role only */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Department routes — DEPARTMENT_USER role only */}
          <Route
            path="/department/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DEPARTMENT_USER']}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />
            {/* Inspector routes — INSPECTOR role only */}
            <Route
                path="/inspector/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['INSPECTOR']}>
                        <InspectorDashboard />
                    </ProtectedRoute>
                }
            />

          {/* Citizen routes — all logged in users */}
          <Route
            path="/citizen/map"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DEPARTMENT_USER', 'CITIZEN']}>
                <CitizenMapPage/>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App