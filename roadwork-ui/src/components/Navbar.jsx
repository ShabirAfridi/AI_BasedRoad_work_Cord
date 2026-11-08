
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>🛣️ Road Work System</span>
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.right}>
        <span style={styles.userInfo}>
          {user?.fullName} · <span style={styles.role}>{user?.role}</span>
        </span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1a1a2e',
    color: '#fff',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: {
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  title: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    borderLeft: '1px solid #374151',
    paddingLeft: '1rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    fontSize: '0.875rem',
    color: '#d1d5db',
  },
  role: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
}

export default Navbar