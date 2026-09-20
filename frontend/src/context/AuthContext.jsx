import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Configure Axios to automatically attach Bearer token to all requests if present
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobtracker_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('jobtracker_token') || null)
  const [isLoading, setIsLoading] = useState(true)

  // Guest Mode State (max 2 free trial evaluations)
  const GUEST_MAX_TRIALS = 2
  const [isGuest, setIsGuest] = useState(() => {
    return sessionStorage.getItem('jobtracker_is_guest') === 'true'
  })
  const [guestTrialsUsed, setGuestTrialsUsed] = useState(() => {
    const saved = localStorage.getItem('jobtracker_guest_trials_used')
    return saved ? parseInt(saved, 10) || 0 : 0
  })

  const guestTrialsRemaining = Math.max(0, GUEST_MAX_TRIALS - guestTrialsUsed)

  function enterGuestMode() {
    sessionStorage.setItem('jobtracker_is_guest', 'true')
    setIsGuest(true)
  }

  function exitGuestMode() {
    sessionStorage.removeItem('jobtracker_is_guest')
    setIsGuest(false)
  }

  function recordGuestTrial() {
    setGuestTrialsUsed((prev) => {
      const next = prev + 1
      localStorage.setItem('jobtracker_guest_trials_used', next.toString())
      return next
    })
  }

  // Verify token and restore session on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('jobtracker_token')
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const res = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        setUser(res.data.user)
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err?.message)
        localStorage.removeItem('jobtracker_token')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  async function login(email, password) {
    const res = await axios.post('http://localhost:8000/api/auth/login', {
      email,
      password,
    })
    const { token: receivedToken, user: userData } = res.data

    localStorage.setItem('jobtracker_token', receivedToken)
    sessionStorage.removeItem('jobtracker_is_guest')
    setToken(receivedToken)
    setUser(userData)
    setIsGuest(false)
    return userData
  }

  async function register(email, password, name) {
    const res = await axios.post('http://localhost:8000/api/auth/register', {
      email,
      password,
      name,
    })
    const { token: receivedToken, user: userData } = res.data

    localStorage.setItem('jobtracker_token', receivedToken)
    sessionStorage.removeItem('jobtracker_is_guest')
    setToken(receivedToken)
    setUser(userData)
    setIsGuest(false)
    return userData
  }

  function logout() {
    localStorage.removeItem('jobtracker_token')
    sessionStorage.removeItem('jobtracker_is_guest')
    setToken(null)
    setUser(null)
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        guestTrialsUsed,
        guestTrialsRemaining,
        GUEST_MAX_TRIALS,
        enterGuestMode,
        exitGuestMode,
        recordGuestTrial,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
