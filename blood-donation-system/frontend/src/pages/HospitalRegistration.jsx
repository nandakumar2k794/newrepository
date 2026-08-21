/**
 * HospitalRegistration.jsx
 * ------------------------
 * Standalone full-page form to register a new hospital.
 * Connects to:  POST /api/hospitals/
 */
import { useState } from 'react'
import { createHospital } from '../api/client'

const INITIAL_FORM = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
}

export default function HospitalRegistration() {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [status, setStatus]   = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const payload = {
      name: form.name.trim(),
      location: {
        address: form.address.trim(),
        city:    form.city.trim(),
        state:   form.state.trim(),
        pincode: form.pincode.trim(),
      },
      contact: {
        phone:   form.phone.trim(),
        email:   form.email.trim()   || null,
        website: form.website.trim() || null,
      },
    }

    try {
      const res = await createHospital(payload)
      setStatus({ type: 'success', msg: `Hospital "${res.data.name}" registered successfully! (ID: ${res.data.id})` })
      setForm(INITIAL_FORM)
    } catch (err) {
      const detail = err?.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')
        : detail || 'Failed to register hospital. Please try again.'
      setStatus({ type: 'error', msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      {/* ── Page Header ── */}
      <div className="form-page-header">
        <div className="form-page-icon hospital-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Hospital Registration</h1>
          <p className="page-subtitle">Register a hospital to manage blood requests.</p>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {status && (
        <div className={`status-banner status-${status.type}`} role="alert">
          <span className="status-icon">{status.type === 'success' ? '✓' : '✕'}</span>
          {status.msg}
          <button className="status-close" onClick={() => setStatus(null)}>×</button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="form-card">
        <form id="hospital-registration-form" onSubmit={handleSubmit} noValidate>

          {/* Hospital Identity */}
          <fieldset className="form-section">
            <legend className="form-section-title">Hospital Details</legend>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="hr-name">Hospital Name <span className="required">*</span></label>
                <input
                  id="hr-name"
                  name="name"
                  className="form-input"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Apollo Hospital"
                  autoComplete="organization"
                />
              </div>
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="form-section">
            <legend className="form-section-title">Location</legend>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="hr-address">Street Address <span className="required">*</span></label>
                <input
                  id="hr-address"
                  name="address"
                  className="form-input"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 21 Greams Road"
                  autoComplete="street-address"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hr-city">City <span className="required">*</span></label>
                <input
                  id="hr-city"
                  name="city"
                  className="form-input"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                  autoComplete="address-level2"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hr-state">State <span className="required">*</span></label>
                <input
                  id="hr-state"
                  name="state"
                  className="form-input"
                  type="text"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Tamil Nadu"
                  autoComplete="address-level1"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hr-pincode">Pincode <span className="required">*</span></label>
                <input
                  id="hr-pincode"
                  name="pincode"
                  className="form-input"
                  type="text"
                  required
                  pattern="\d{6}"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="600006"
                  maxLength={6}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="form-section">
            <legend className="form-section-title">Contact Information</legend>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="hr-phone">Phone Number <span className="required">*</span></label>
                <input
                  id="hr-phone"
                  name="phone"
                  className="form-input"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 44XXXXXXXX"
                  autoComplete="tel"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hr-email">Email Address</label>
                <input
                  id="hr-email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@hospital.com (optional)"
                  autoComplete="email"
                />
              </div>
              <div className="form-group full">
                <label className="form-label" htmlFor="hr-website">Website</label>
                <input
                  id="hr-website"
                  name="website"
                  className="form-input"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://www.hospital.com (optional)"
                />
              </div>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="form-submit-row">
            <button type="button" className="btn btn-secondary" onClick={() => { setForm(INITIAL_FORM); setStatus(null) }}>
              Reset
            </button>
            <button
              id="submit-hospital-registration"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <><span className="btn-spinner" /> Registering...</> : 'Register Hospital'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
