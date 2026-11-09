// All routes defined here
// AuthProvider wraps everything so auth state is available everywhere

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import DepartmentSelectPage from './pages/department/DepartmentSelectPage'
import LandingPage from './pages/landing/landingPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { lazy, Suspense } from 'react'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DepartmentDashboard from './pages/department/DepartmentDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import CitizenMapPage from './pages/citizen/CitizenMapPage'
import InspectorDashboard from './pages/inspector/InspectorDashboard'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DepartmentDashboard = lazy(() => import('./pages/department/DepartmentDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const CitizenMapPage = lazy(() => import('./pages/citizen/CitizenMapPage'))

const Unauthorized = () => (
  <h1 style={{ padding: '2rem' }}>
    403 — You do not have access to this page
  </h1>
)

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>

            <Routes>

              {/* Public routes — no token needed */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/department/select"
                element={<DepartmentSelectPage />}
              />

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
              {/* Department routes — DEPARTMENT_USER role only */}
              <Route
                path="/department/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DEPARTMENT_USER']}>
                    <DepartmentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Citizen routes — all logged in users */}
              <Route
                path="/citizen/map"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'ADMIN',
                      'DEPARTMENT_USER',
                      'CITIZEN'
                    ]}
                  >
                    <CitizenMapPage />
                  </ProtectedRoute>
                }
              />

            </Routes>

          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App