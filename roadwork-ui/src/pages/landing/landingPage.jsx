import { useNavigate } from 'react-router-dom'
import { FiTruck, FiUsers, FiMap, FiShield, FiActivity, FiBell, FiGithub, FiLinkedin } from 'react-icons/fi'
const TEAM = [
          {
            initials: 'SA',
            name:     'Shabir Afridi',
            role:     'Backend Developer',
            blurb:    'Spring Boot, REST APIs, PostgreSQL, system architecture & security',
            color:    'bg-blue-600',
            github:   'https://github.com/ShabirAfridi',
            linkedin: 'https://www.linkedin.com/in/shabir-afridi-36936b356/',
          },
          {
            initials: 'AA',
            name:     'Awais Ali Shah',
            role:     'Backend Developer',
            blurb:    'Spring Boot, REST APIs, business logic',
            color:    'bg-emerald-600',
            github:   'https://github.com/awaisAliShah99',
            linkedin: 'https://www.linkedin.com/in/awaisali00?trk=contact-info',
          },
          {
            initials: 'S',
            name:     'Sohaima',
            role:     'Graphic Designer',
            blurb:    'UI/UX design & visual identity, Canva',
            color:    'bg-amber-500',
            github:   null,       // no GitHub — design-focused role
            linkedin: 'www.linkedin.com/in/sohaima-mushtaq-130833284',
          },
        ]
function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top nav ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              R
            </div>
            <span className="font-bold text-slate-900">RoadCoord</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
          AI-Enhanced Infrastructure Coordination
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Road Work Coordination &amp; Excavation Management System
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          One platform for utility departments to schedule excavation work,
          automatically detect conflicts, and keep citizens informed —
          eliminating redundant digging across the city.
        </p>
      </section>

      {/* ── Role cards ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">

          {/* Department card — routes to department selection, not straight to login */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <FiTruck size={26} className="text-blue-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Department Login</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              For WAPDA, PTCL, SNGPL, and other utility departments. Submit
              excavation requests, track approvals, and resolve scheduling
              conflicts.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['WAPDA', 'PTCL', 'SNGPL'].map(dept => (
                <span key={dept} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {dept}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate('/department/select')}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition group-hover:bg-blue-700"
            >
              Continue as Department
            </button>
          </div>

          {/* Citizen card */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <FiUsers size={26} className="text-emerald-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Citizen Access</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              View live road work on an interactive map and report
              unauthorized digging or road damage in your area — no account
              required to report an issue.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Live Map</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Report Issues</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition group-hover:bg-emerald-700"
            >
              Continue as Citizen
            </button>
          </div>

        </div>
      </section>

      {/* ── Features strip ────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-center text-2xl font-bold text-slate-900">How it works</h3>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <FiActivity className="text-blue-600" size={22} />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Automatic Conflict Detection</h4>
              <p className="mt-2 text-sm text-slate-500">
                Overlapping excavation requests on the same road are flagged
                instantly and routed for admin review.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <FiMap className="text-emerald-600" size={22} />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Live Interactive Map</h4>
              <p className="mt-2 text-sm text-slate-500">
                Every citizen can see exactly what work is happening, where,
                and by which department — in real time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <FiBell className="text-amber-600" size={22} />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Instant Notifications</h4>
              <p className="mt-2 text-sm text-slate-500">
                Departments and admins are notified by email the moment a
                conflict or complaint is raised.
              </p>
            </div>
          </div>
        </div>
      </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-center text-2xl font-bold text-slate-900">Meet the Team</h3>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
              A Final Year Project — Abdul Wali Khan University Mardan, Department of Computer Science
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${member.color} text-lg font-bold text-white`}>
                    {member.initials}
                  </div>

                  <h4 className="mt-4 font-bold text-slate-900">{member.name}</h4>
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">{member.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{member.blurb}</p>

                  {(member.github || member.linkedin) && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer"
                           className="text-slate-400 hover:text-slate-700 transition">
                          <FiGithub size={18} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                           className="text-slate-400 hover:text-slate-700 transition">
                          <FiLinkedin size={18} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-1.5">
          <FiShield size={14} />
          Abdul Wali Khan University Mardan
        </div>
      </footer>
    </div>
  )
}

export default LandingPage