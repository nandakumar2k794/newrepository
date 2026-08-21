/**
 * DonorRegistration.jsx
 * ---------------------
 * Standalone full-page form to register a new blood donor.
 * Connects to:  POST /api/donors/
 */
import { useState } from 'react'
import { createDonor } from '../api/client'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const INITIAL_FORM = {
  name: '',
  blood_group: 'O+',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  is_available: 'true',
  last_donated: '',
}

export default function DonorRegistration() {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [status, setStatus]   = useState(null)   // { type:'success'|'error', msg:'' }
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const payload = {
      name:        form.name.trim(),
      blood_group: form.blood_group,
      location: {
        city:    form.city.trim(),
        state:   form.state.trim(),
        pincode: form.pincode.trim(),
      },
      contact: {
        phone: form.phone.trim(),
        email: form.email.trim() || null,
      },
      is_available: form.is_available === 'true',
      last_donated: form.last_donated
        ? new Date(form.last_donated).toISOString()
        : null,
    }

    try {
      const res = await createDonor(payload)
      setStatus({ type: 'success', msg: `Donor "${res.data.name}" registered successfully! (ID: ${res.data.id})` })
      setForm(INITIAL_FORM)
    } catch (err) {
      const detail = err?.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')
        : detail || 'Failed to register donor. Please try again.'
      setStatus({ type: 'error', msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      {/* ── Page Header ── */}
      <div className="form-page-header">
        <div className="form-page-icon donor-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Donor Registration</h1>
          <p className="page-subtitle">Register a new blood donor to our network.</p>
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
        <form id="donor-registration-form" onSubmit={handleSubmit} noValidate>

          {/* Personal Info */}
          <fieldset className="form-section">
            <legend className="form-section-title">Personal Information</legend>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label" htmlFor="dr-name">Full Name <span className="required">*</span></label>
                <input
                  id="dr-name"
                  name="name"
                  className="form-input"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ravi Kumar"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dr-blood-group">Blood Group <span className="required">*</span></label>
                <select
                  id="dr-blood-group"
                  name="blood_group"
                  className="form-select"
                  value={form.blood_group}
                  onChange={handleChange}
                  required
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dr-available">Available to Donate?</label>
                <select
                  id="dr-available"
                  name="is_available"
                  className="form-select"
                  value={form.is_available}
                  onChange={handleChange}
                >
                  <option value="true">Yes — Available</option>
                  <option value="false">No — Unavailable</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dr-last-donated">Date of Last Donation</label>
                <input
                  id="dr-last-donated"
                  name="last_donated"
                  className="form-input"
                  type="date"
                  value={form.last_donated}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="form-section">
            <legend className="form-section-title">Location</legend>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="dr-city">City <span className="required">*</span></label>
                <input
                  id="dr-city"
                  name="city"
                  className="form-input"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="dr-state">State <span className="required">*</span></label>
                <input
                  id="dr-state"
                  name="state"
                  className="form-input"
                  type="text"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="dr-pincode">Pincode <span className="required">*</span></label>
                <input
                  id="dr-pincode"
                  name="pincode"
                  className="form-input"
                  type="text"
                  required
                  pattern="\d{6}"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="600001"
                  maxLength={6}
                />
              </div>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="form-section">
            <legend className="form-section-title">Contact Details</legend>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="dr-phone">Phone Number <span className="required">*</span></label>
                <input
                  id="dr-phone"
                  name="phone"
                  className="form-input"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9XXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="dr-email">Email Address</label>
                <input
                  id="dr-email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="optional"
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
              id="submit-donor-registration"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <><span className="btn-spinner" /> Registering...</> : 'Register Donor'}
            </button>
          </div>

        </form>
      </div>

      {/* Blood group quick reference */}
      <div className="info-card">
        <h3 className="info-card-title">Blood Group Compatibility</h3>
        <div className="blood-group-grid">
          {BLOOD_GROUPS.map(bg => (
            <div key={bg} className={`blood-chip ${form.blood_group === bg ? 'blood-chip-active' : ''}`}
                 onClick={() => setForm(f => ({ ...f, blood_group: bg }))}
                 role="button" tabIndex={0}
                 onKeyDown={e => e.key === 'Enter' && setForm(f => ({ ...f, blood_group: bg }))}>
              {bg}
            </div>
          ))}
        </div>
        <p className="info-hint">Click a blood group above to select it.</p>
      </div>
    </div>
  )
}
