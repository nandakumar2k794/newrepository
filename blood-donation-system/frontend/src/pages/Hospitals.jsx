import { useEffect, useState } from 'react'
import { Building2, Plus, X, Check } from 'lucide-react'
import HospitalCard from '../components/HospitalCard'
import { getHospitals, createHospital, updateHospital, deleteHospital } from '../api/client'

const EMPTY_FORM = {
  name: '',
  location: { address: '', city: '', state: '', pincode: '' },
  contact: { phone: '', email: '', website: '' },
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <Check size={16} color="#4ade80" /> : <X size={16} color="#f87171" />}
      {msg}
    </div>
  )
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHospital, setEditingHospital] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  async function fetchHospitals() {
    setLoading(true)
    try {
      const res = await getHospitals()
      setHospitals(res.data)
    } catch { showToast('Failed to load hospitals.', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchHospitals() }, [])

  function openCreate() {
    setEditingHospital(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(hospital) {
    setEditingHospital(hospital)
    setForm({
      name: hospital.name,
      location: { ...hospital.location },
      contact: {
        phone: hospital.contact.phone,
        email: hospital.contact.email || '',
        website: hospital.contact.website || '',
      },
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        contact: {
          phone: form.contact.phone,
          email: form.contact.email || null,
          website: form.contact.website || null,
        },
      }
      if (editingHospital) {
        await updateHospital(editingHospital.id, payload)
        showToast('Hospital updated.')
      } else {
        await createHospital(payload)
        showToast('Hospital added.')
      }
      setShowModal(false)
      fetchHospitals()
    } catch { showToast('Failed to save hospital.', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await deleteHospital(deleteTarget.id)
      showToast('Hospital deleted.')
      setDeleteTarget(null)
      fetchHospitals()
    } catch { showToast('Failed to delete hospital.', 'error') }
  }

  function setField(path, value) {
    const keys = path.split('.')
    setForm(prev => {
      const next = { ...prev }
      if (keys.length === 1) next[keys[0]] = value
      else next[keys[0]] = { ...next[keys[0]], [keys[1]]: value }
      return next
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospitals</h1>
          <p className="page-subtitle">Manage registered hospitals that submit blood requests.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-hospital-btn">
          <Plus size={16} /> Add Hospital
        </button>
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : hospitals.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No hospitals yet</h3>
          <p>Register the first hospital to start managing blood requests.</p>
        </div>
      ) : (
        <div className="card-grid">
          {hospitals.map(h => (
            <HospitalCard key={h.id} hospital={h} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)} id="close-hospital-modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Hospital Name *</label>
                  <input id="hospital-name" className="form-input" required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Apollo Hospital" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Address *</label>
                  <input id="hospital-address" className="form-input" required value={form.location.address} onChange={e => setField('location.address', e.target.value)} placeholder="Street address" />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input id="hospital-city" className="form-input" required value={form.location.city} onChange={e => setField('location.city', e.target.value)} placeholder="Chennai" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input id="hospital-state" className="form-input" required value={form.location.state} onChange={e => setField('location.state', e.target.value)} placeholder="Tamil Nadu" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input id="hospital-pincode" className="form-input" required value={form.location.pincode} onChange={e => setField('location.pincode', e.target.value)} placeholder="600001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input id="hospital-phone" className="form-input" required value={form.contact.phone} onChange={e => setField('contact.phone', e.target.value)} placeholder="+91 44XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input id="hospital-email" className="form-input" type="email" value={form.contact.email} onChange={e => setField('contact.email', e.target.value)} placeholder="optional" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Website</label>
                  <input id="hospital-website" className="form-input" value={form.contact.website} onChange={e => setField('contact.website', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-hospital-form" disabled={saving}>
                  {saving ? 'Saving...' : editingHospital ? 'Update Hospital' : 'Add Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="confirm-dialog">
              <h2 className="modal-title">Delete Hospital?</h2>
              <p>Remove <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-hospital">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
