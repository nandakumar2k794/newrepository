/**
 * BloodRequestForm.jsx
 * --------------------
 * Standalone full-page form to create a blood request for a hospital.
 * Connects to:  GET  /api/hospitals/    (to populate hospital dropdown)
 *               POST /api/requests/
 */
import { useState, useEffect } from 'react'
import { createRequest, getHospitals } from '../api/client'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCIES    = ['low', 'medium', 'high', 'critical']

const URGENCY_META = {
  low:      { label: 'Low',      desc: 'Can wait a few days',         color: '#22c55e' },
  medium:   { label: 'Medium',   desc: 'Required within 24 hours',    color: '#eab308' },
  high:     { label: 'High',     desc: 'Required within a few hours', color: '#f97316' },
  critical: { label: 'Critical', desc: 'Life-threatening — urgent!',  color: '#ef4444' },
}

const INITIAL_FORM = {
  hospital_id:          '',
  required_blood_group: 'O+',
  urgency:              'medium',
  units_needed:         1,
  notes:                '',
}

export default function BloodRequestForm() {
  const [form, setForm]           = useState(INITIAL_FORM)
  const [hospitals, setHospitals] = useState([])
  const [hospLoading, setHospLoading] = useState(true)
  const [status, setStatus]       = useState(null)
  const [loading, setLoading]     = useState(false)

  // Fetch hospitals for the dropdown on mount
  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await getHospitals()
        setHospitals(res.data)
        if (res.data.length > 0) {
          setForm(f => ({ ...f, hospital_id: res.data[0].id }))
        }
      } catch {
        setStatus({ type: 'error', msg: 'Could not load hospitals. Please add a hospital first.' })
      } finally {
        setHospLoading(false)
      }
    }
    loadHospitals()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'units_needed' ? Math.max(1, Number(value)) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.hospital_id) {
      setStatus({ type: 'error', msg: 'Please select a hospital.' })
      return
    }
    setLoading(true)
    setStatus(null)

    const payload = {
      hospital_id:          form.hospital_id,
      required_blood_group: form.required_blood_group,
      urgency:              form.urgency,
      units_needed:         Number(form.units_needed),
      notes:                form.notes.trim() || null,
    }

    try {
      const res = await createRequest(payload)
      setStatus({
        type: 'success',
        msg: `Blood request created! Hospital: ${res.data.hospital_name} — ${res.data.required_blood_group} × ${res.data.units_needed} unit(s) (ID: ${res.data.id})`,
      })
      setForm(prev => ({ ...INITIAL_FORM, hospital_id: prev.hospital_id }))
    } catch (err) {
      const detail = err?.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')
        : detail || 'Failed to create blood request.'
      setStatus({ type: 'error', msg })
    } finally {
      setLoading(false)
    }
  }

  const urgencyMeta = URGENCY_META[form.urgency]

  return (
    <div className="form-page">
      {/* ── Page Header ── */}
      <div className="form-page-header">
        <div className="form-page-icon request-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Blood Request Form</h1>
          <p className="page-subtitle">Submit a blood request on behalf of a hospital.</p>
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

      {/* ── Urgency indicator strip ── */}
      <div className="urgency-strip">
        {URGENCIES.map(u => (
          <button
            key={u}
            type="button"
            className={`urgency-chip ${form.urgency === u ? 'urgency-chip-active' : ''}`}
            style={{ '--urgency-color': URGENCY_META[u].color }}
            onClick={() => setForm(f => ({ ...f, urgency: u }))}
          >
            {URGENCY_META[u].label}
          </button>
        ))}
      </div>
      <p className="urgency-desc-text" style={{ color: urgencyMeta.color }}>
        ● {urgencyMeta.desc}
      </p>

      {/* ── Form Card ── */}
      <div className="form-card">
        <form id="blood-request-form" onSubmit={handleSubmit} noValidate>

          {/* Hospital & Blood */}
          <fieldset className="form-section">
            <legend className="form-section-title">Request Details</legend>
            <div className="form-grid">

              <div className="form-group full">
                <label className="form-label" htmlFor="br-hospital">Hospital <span className="required">*</span></label>
                {hospLoading ? (
                  <div className="form-input" style={{ color: 'var(--text-muted)' }}>Loading hospitals…</div>
                ) : hospitals.length === 0 ? (
                  <div className="form-input warning-input">No hospitals found — please register a hospital first.</div>
                ) : (
                  <select
                    id="br-hospital"
                    name="hospital_id"
                    className="form-select"
                    required
                    value={form.hospital_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} — {h.location.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="br-blood-group">Required Blood Group <span className="required">*</span></label>
                <select
                  id="br-blood-group"
                  name="required_blood_group"
                  className="form-select"
                  required
                  value={form.required_blood_group}
                  onChange={handleChange}
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="br-urgency">Urgency Level <span className="required">*</span></label>
                <select
                  id="br-urgency"
                  name="urgency"
                  className="form-select"
                  required
                  value={form.urgency}
                  onChange={handleChange}
                  style={{ borderColor: urgencyMeta.color }}
                >
                  {URGENCIES.map(u => (
                    <option key={u} value={u}>
                      {URGENCY_META[u].label} — {URGENCY_META[u].desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="br-units">Units Needed <span className="required">*</span></label>
                <div className="units-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setForm(f => ({ ...f, units_needed: Math.max(1, f.units_needed - 1) }))}
                    aria-label="Decrease units"
                  >−</button>
                  <input
                    id="br-units"
                    name="units_needed"
                    className="form-input stepper-input"
                    type="number"
                    min="1"
                    required
                    value={form.units_needed}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setForm(f => ({ ...f, units_needed: f.units_needed + 1 }))}
                    aria-label="Increase units"
                  >+</button>
                </div>
              </div>

              <div className="form-group full">
                <label className="form-label" htmlFor="br-notes">Additional Notes</label>
                <textarea
                  id="br-notes"
                  name="notes"
                  className="form-textarea"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="e.g. Patient undergoing emergency surgery, requires immediate supply..."
                  rows={3}
                />
              </div>
            </div>
          </fieldset>

          {/* Summary Preview */}
          <div className="request-preview">
            <h4 className="preview-title">Request Summary</h4>
            <div className="preview-row">
              <span>Blood Group</span>
              <span className="badge badge-blood">{form.required_blood_group}</span>
            </div>
            <div className="preview-row">
              <span>Units</span>
              <strong>{form.units_needed}</strong>
            </div>
            <div className="preview-row">
              <span>Urgency</span>
              <span className={`badge badge-${form.urgency}`}>{form.urgency}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="form-submit-row">
            <button type="button" className="btn btn-secondary"
              onClick={() => setForm(prev => ({ ...INITIAL_FORM, hospital_id: prev.hospital_id }))}>
              Reset
            </button>
            <button
              id="submit-blood-request"
              type="submit"
              className="btn btn-primary"
              disabled={loading || hospitals.length === 0}
            >
              {loading ? <><span className="btn-spinner" /> Submitting...</> : 'Submit Blood Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
