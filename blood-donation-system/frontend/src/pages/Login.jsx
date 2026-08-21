/**
 * Login.jsx
 * ---------
 * Authentication page (Login & Registration) for BloodLink.
 */
import { useState } from 'react'
import { useNavigate } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus, Lock, Mail, User, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [role, setRole]             = useState('donor')
  const [status, setStatus]         = useState(null)
  const [loading, setLoading]       = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      if (isRegister) {
        if (!name.trim()) {
          setStatus({ type: 'error', msg: 'Name is required.' })
          setLoading(false)
          return
        }
        await register(name.trim(), email.trim(), password, role)
        setStatus({ type: 'success', msg: 'Account created successfully! Redirecting...' })
      } else {
        await login(email.trim(), password)
        setStatus({ type: 'success', msg: 'Logged in successfully! Redirecting...' })
      }
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || 'Authentication failed.'
      setStatus({ type: 'error', msg: detail })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      {/* Header */}
      <div className="form-page-header">
        <div className="form-page-icon donor-icon">
          <LogIn size={28} />
        </div>
        <div>
          <h1 className="page-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="page-subtitle">
            {isRegister
              ? 'Join BloodLink as a Donor or Hospital Administrator.'
              : 'Sign in to access your blood donation dashboard.'}
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button
          className={`btn ${!isRegister ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setIsRegister(false); setStatus(null); }}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <LogIn size={16} /> Log In
        </button>
        <button
          className={`btn ${isRegister ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setIsRegister(true); setStatus(null); }}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <UserPlus size={16} /> Create Account
        </button>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`status-banner status-${status.type}`}>
          <span className="status-icon">{status.type === 'success' ? '✓' : '✕'}</span>
          {status.msg}
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend className="form-section-title">
              {isRegister ? 'Registration Details' : 'Login Credentials'}
            </legend>

            <div className="form-grid">
              {isRegister && (
                <div className="form-group full">
                  <label className="form-label" htmlFor="auth-name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="auth-name"
                    className="form-input"
                    type="text"
                    required={isRegister}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aisha Nair"
                  />
                </div>
              )}

              <div className="form-group full">
                <label className="form-label" htmlFor="auth-email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="auth-email"
                  className="form-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-group full">
                <label className="form-label" htmlFor="auth-password">
                  Password <span className="required">*</span>
                </label>
                <input
                  id="auth-password"
                  className="form-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {isRegister && (
                <div className="form-group full">
                  <label className="form-label" htmlFor="auth-role">
                    Account Role
                  </label>
                  <select
                    id="auth-role"
                    className="form-select"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="donor">Donor / Volunteer</option>
                    <option value="hospital">Hospital Administrator</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              )}
            </div>
          </fieldset>

          <div className="form-submit-row">
            <button
              id="submit-auth-form"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <><span className="btn-spinner" /> Processing...</>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
