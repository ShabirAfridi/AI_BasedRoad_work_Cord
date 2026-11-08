// src/pages/auth/RegisterPage.jsx

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getActiveDepartments } from '../../api/departmentApi'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    fullName:     '',
    email:        '',
    password:     '',
    role:         'CITIZEN',
    departmentId: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    getActiveDepartments()
        .then(res => setDepartments(res.data.data || []))
        .catch(() => setDepartments([]))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Build payload — only include departmentId if DEPARTMENT_USER
    const payload = {
      fullName: formData.fullName,
      email:    formData.email,
      password: formData.password,
      role:     formData.role,
      ...(formData.role === 'DEPARTMENT_USER' && {
        departmentId: parseInt(formData.departmentId)
      })
    }

    const result = await register(payload)
    setLoading(false)

    if (result.success) {
      if (formData.role === 'ADMIN')                navigate('/admin/dashboard')
      else if (formData.role === 'DEPARTMENT_USER') navigate('/department/dashboard')
      else if (formData.role === 'INSPECTOR')       navigate('/inspector/dashboard')
      else                                          navigate('/citizen/map')
    } else {
      setError(result.error)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Road Work Coordination System</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>

          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Shabir Ahmad"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.input}
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CITIZEN">Citizen</option>
              <option value="DEPARTMENT_USER">Department User</option>
              <option value="ADMIN">Admin</option>
              <option value="INSPECTOR">Inspector</option>
            </select>
          </div>

          {/* Show department dropdown only when DEPARTMENT_USER is selected */}
          {formData.role === 'DEPARTMENT_USER' && (
            <div style={styles.field}>
              <label style={styles.label}>Department</label>
              <select
                style={styles.input}
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            style={loading ? styles.buttonDisabled : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.25rem',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  buttonDisabled: {
    width: '100%',
    padding: '0.75rem',
    background: '#93c5fd',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default RegisterPage