/**
 * AuthContext.jsx
 * ---------------
 * Manages user authentication state (user profile, token, login, register, logout)
 */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem('bloodlink-user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('bloodlink-token') || '')

  useEffect(() => {
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.defaults.headers.common['X-User-Email']  = user.email
    } else {
      delete api.defaults.headers.common['Authorization']
      delete api.defaults.headers.common['X-User-Email']
    }
  }, [token, user])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('bloodlink-token', access_token)
    localStorage.setItem('bloodlink-user', JSON.stringify(userData))
    return userData
  }

  const register = async (name, email, password, role = 'donor') => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { access_token, user: userData } = res.data
    setToken(access_token)
    setUser(userData)
    localStorage.setItem('bloodlink-token', access_token)
    localStorage.setItem('bloodlink-user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('bloodlink-token')
    localStorage.removeItem('bloodlink-user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
