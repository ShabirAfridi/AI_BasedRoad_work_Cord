
import { useNavigate } from 'react-router-dom'
import { FiZap, FiPhoneCall, FiWind, FiHome, FiDroplet } from 'react-icons/fi'

const DEPARTMENTS = [
  { id: 1, name: 'WAPDA',            tagline: 'Water & Power Development Authority', icon: FiZap,       color: 'blue' },
  { id: 2, name: 'PTCL',             tagline: 'Telecom cable & fiber works',          icon: FiPhoneCall, color: 'violet' },
  { id: 3, name: 'SNGPL',            tagline: 'Gas line excavation & repair',         icon: FiWind,      color: 'amber' },
]

const COLOR_MAP = {
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-600',    ring: 'group-hover:ring-blue-200' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-600',  ring: 'group-hover:ring-violet-200' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-600',   ring: 'group-hover:ring-amber-200' },
}

function DepartmentSelectPage() {
  const navigate = useNavigate()

  const handleSelect = (dept) => {
    navigate('/login', { state: { departmentLabel: dept.name } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">R</div>
            <span className="font-bold text-slate-900">RoadCoord</span>
          </div>
          <button onClick={() => navigate('/')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            ← Back
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Which department are you signing in for?</h1>
        <p className="mt-2 text-slate-500">
          Pick your agency, then sign in with your department account. Don't have one?{' '}
          <button onClick={() => navigate('/register')} className="font-semibold text-blue-600 hover:underline">
            Register a department account
          </button>.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon
            const c = COLOR_MAP[dept.color]
            return (
              <button
                key={dept.id}
                onClick={() => handleSelect(dept)}
                className={`group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ring-1 ring-transparent ${c.ring}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
                  <Icon size={22} className={c.text} />
                </div>
                <h2 className="mt-4 font-bold text-slate-900">{dept.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{dept.tagline}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                  Sign in →
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default DepartmentSelectPage