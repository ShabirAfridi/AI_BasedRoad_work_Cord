import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import ThemeToggle from '../../components/ThemeToggle'

function LoginPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation() // fix: was missing — location.state was reading window.location instead
  const { login, isAdmin, isDepartmentUser } = useAuth()
  const departmentLabel = location.state?.departmentLabel

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)

    setLoading(false)

    if (result.success) {
      const role = result.userObj.role
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'DEPARTMENT_USER') navigate('/department/dashboard')
      else navigate('/citizen/map')
      else if (role === 'INSPECTOR') navigate('/inspector/dashboard')
      else                    navigate('/citizen/map')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 transition-colors duration-200 relative"> {/* dark: page bg */}

      <div className="absolute top-6 right-6"> {/* dark: toggle placed top-right of auth page, per earlier placement guidance */}
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-lg dark:shadow-slate-900/50 w-full max-w-[400px] transition-colors duration-200"> {/* dark: card bg + shadow */}

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 text-center"> {/* dark: heading */}
          Road Work System
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 text-sm"> {/* dark: subtitle */}
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm"> {/* dark: error banner */}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"> {/* dark: label */}
              Email
            </label>
            <input
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200" /* dark: input bg/border/text */
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"> {/* dark: label */}
              Password
            </label>
            <input
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-[0.95rem] outline-none
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200" /* dark: input bg/border/text */
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            className={`w-full py-3 rounded-lg text-white font-semibold mt-2 transition-colors duration-200 ${
              loading
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' // dark: disabled state
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer' // dark: active state
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <div className="text-center my-4 text-sm text-slate-400 dark:text-slate-500">--or--</div> {/* dark: divider */}
        <GoogleSignInButton />

        <p className="text-center mt-5 text-sm text-slate-500 dark:text-slate-400"> {/* dark: footer text */}
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline"> {/* dark: link color */}
            Register here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage