// src/components/Toast.jsx
//
// A minimal, dependency-free toast notification system.
// No external package — this removes the whole class of "duplicate
// React copy" problems that come from installing a third-party
// component library like react-hot-toast.
//
// Usage:
//   1. Wrap your app once in <ToastProvider> (in main.jsx or App.jsx)
//   2. Anywhere inside, call: const toast = useToast()
//      toast.success('Registered!')
//      toast.error('Something went wrong')

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((message, type = 'default', duration = 3500) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), duration)
  }, [remove])

  const toast = {
    success: (msg, duration) => push(msg, 'success', duration),
    error:   (msg, duration) => push(msg, 'error', duration),
    info:    (msg, duration) => push(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Render container — fixed top-center, stacks multiple toasts */}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            {t.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

// Hook — call this inside any component to get { success, error, info }
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

const styles = {
  container: {
    position: 'fixed',
    top: '1.25rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    pointerEvents: 'none',
  },
  toast: {
    minWidth: '240px',
    maxWidth: '360px',
    padding: '0.75rem 1.1rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
    animation: 'toast-in 0.2s ease-out',
    textAlign: 'center',
  },
  success: { background: '#16a34a' },
  error:   { background: '#dc2626' },
  info:    { background: '#2563eb' },
  default: { background: '#334155' },
}