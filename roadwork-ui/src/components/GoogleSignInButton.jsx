
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosConfig from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

const GOOGLE_CLIENT_ID = '577224207743-7g5h8ogc016k1jmbqfg019o8374rjsk8.apps.googleusercontent.com'
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

// Loads the script once, reuses it if already present/loading.
// Returns a promise that resolves once window.google is actually usable.
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`)

    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Failed to load Google script')))
  })
}

function GoogleSignInButton() {
  const buttonRef = useRef(null)
  const navigate   = useNavigate()
  const toast      = useToast()
  const { setAuthFromResponse } = useAuth()
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const res = await axiosConfig.post('/api/auth/google', {
                idToken: response.credential,
              })
              const { role } = res.data.data
              setAuthFromResponse(res.data.data)
              toast.success('Signed in with Google')
              if (role === 'ADMIN')                navigate('/admin/dashboard')
              else if (role === 'DEPARTMENT_USER') navigate('/department/dashboard')
              else                                  navigate('/citizen/map')

            } catch (err) {
            console.log('DEBUG — caught error:', err)
              toast.error(err.response?.data?.message || 'Google sign-in failed')
            }
          },
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
        })
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => { cancelled = true }
  }, [])

  if (loadError) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#dc2626', textAlign: 'center' }}>
        Couldn't load Google Sign-In. Check your internet connection and refresh.
      </p>
    )
  }

  return <div ref={buttonRef} />
}

export default GoogleSignInButton