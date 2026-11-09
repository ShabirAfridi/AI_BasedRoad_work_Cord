<<<<<<< HEAD
// src/pages/auth/RegisterPage.jsx

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getActiveDepartments } from '../../api/departmentApi'
=======
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import ThemeToggle from '../../components/ThemeToggle'

const DEPARTMENTS = [
  { id: 1, name: 'WAPDA' },
  { id: 2, name: 'PTCL' },
  { id: 3, name: 'SNGPL' },
]
>>>>>>> 1184d18 (Add Liquibase migrations and application updates)

function RegisterPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
    departmentId: '',
  })
  const [error, setError] = useState('')
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      toast.error("Passwords don't match")
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
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
      toast.success('Registration successful — welcome')
      if (isAdmin()) navigate('/admin/dashboard')
      else if (isDepartmentUser()) navigate('/department/dashboard')
      else navigate('/citizen/map')
    } else {
      setError(result.error)
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 transition-colors duration-200 relative"> {/* dark: page bg */}

      <div className="absolute top-6 right-6"> {/* dark: toggle top-right, matches LoginPage */}
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-lg dark:shadow-slate-900/50 w-full max-w-[420px] transition-colors duration-200"> {/* dark: card */}

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 text-center"> {/* dark: heading */}
          Create Account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 text-sm"> {/* dark: subtitle */}
          Road Work Coordination System
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm"> {/* dark: error banner */}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label> {/* dark: label */}
            <input
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200" /* dark: input */
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Email</label> {/* dark: label */}
            <input
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200" /* dark: input */
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Password</label> {/* dark: label */}
            <input
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200" /* dark: input */
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label> {/* dark: label */}
            <input
              className={`w-full px-3.5 py-2.5 border rounded-lg text-[0.95rem] outline-none
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200
                          ${
                            formData.confirmPassword && formData.confirmPassword !== formData.password
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
            {formData.confirmPassword && formData.confirmPassword !== formData.password && (
              <span className="text-red-600 dark:text-red-400 text-xs mt-1 block">Passwords don't match yet</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Role</label> {/* dark: label */}
            <select
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors duration-200" /* dark: select */
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

          {formData.role === 'DEPARTMENT_USER' && (
            <div className="mb-4">
              <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Department</label> {/* dark: label */}
              <select
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors duration-200" /* dark: select */
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
            className={`w-full py-3 rounded-lg text-white font-semibold mt-2 transition-colors duration-200 ${
              loading
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer'
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center mt-5 text-sm text-slate-500 dark:text-slate-400"> {/* dark: footer */}
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline"> {/* dark: link */}
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage