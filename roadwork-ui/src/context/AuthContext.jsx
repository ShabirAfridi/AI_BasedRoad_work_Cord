// Global auth state — stores user info and token
// Wrapped around entire app so any component can read auth state

import { createContext, useContext, useState } from 'react'
import { loginApi, registerApi } from '../api/authApi'

// Create the context
const AuthContext = createContext(null)

// AuthProvider wraps the entire app in App.jsx
export function AuthProvider({ children }) {

  // Load user from sessionStorage on page refresh
  // so user stays logged in if they refresh the browser
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('token') || null
  })

    const setAuthFromResponse = (data) => {
      const userObj = {
        email:        data.email,
        fullName:     data.fullName,
        role:         data.role,
        departmentId: data.departmentId,
      }
      sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('user', JSON.stringify(userObj))

          setToken(data.token)
          setUser(userObj)

          return userObj
        }


  // ── LOGIN ────────────────────────────────────────────────────
  // Called by LoginPage when user submits the form
  // Returns { success, error }
  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password)
      const data = response.data.data  // ApiResponse<AuthResponse> → data.data

      // Defensive check — if backend response shape is wrong
      // or token is missing, fail loudly instead of saving garbage
      if (!data || !data.token) {
        return { success: false, error: 'Invalid response from server' }
      }
         const userObj = setAuthFromResponse(data)

      return { success: true,userObj }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // ── REGISTER ─────────────────────────────────────────────────
  const register = async (formData) => {
    try {
      const response = await registerApi(formData)
      const data = response.data.data

      const userObj  = setAuthFromResponse(data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // ── LOGOUT ───────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // ── ROLE HELPERS ─────────────────────────────────────────────
  const isAdmin          = () => user?.role === 'ADMIN'
  const isDepartmentUser = () => user?.role === 'DEPARTMENT_USER'
  const isCitizen        = () => user?.role === 'CITIZEN'
  const isLoggedIn       = () => !!token

  return (
    <AuthContext.Provider value={{
      user, token,
      login, register, logout,setAuthFromResponse,
      isAdmin, isDepartmentUser, isCitizen, isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component to access auth
// Usage: const { user, login, logout, isAdmin } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}