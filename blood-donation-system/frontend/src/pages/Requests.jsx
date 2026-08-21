import { useEffect, useState } from 'react'
import { ClipboardList, Plus, X, Check } from 'lucide-react'
import RequestCard from '../components/RequestCard'
import { getRequests, getHospitals, createRequest, updateRequest, deleteRequest } from '../api/client'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['pending', 'fulfilled', 'cancelled']

const EMPTY_FORM = {
  hospital_id: '',
  required_blood_group: 'O+',
  urgency: 'medium',
  units_needed: 1,
  notes: '',
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

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterBG, setFilterBG] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  async function fetchAll() {
    setLoading(true)
    try {
      const params = {}
      if (filterBG) params.blood_group = filterBG
      if (filterUrgency) params.urgency = filterUrgency
      if (filterStatus) params.status = filterStatus
      const [reqRes, hospRes] = await Promise.all([getRequests(params), getHospitals()])
      setRequests(reqRes.data)
      setHospitals(hospRes.data)
    } catch { showToast('Failed to load requests.', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [filterBG, filterUrgency, filterStatus])

  function openCreate() {
    setEditingRequest(null)
    setForm({ ...EMPTY_FORM, hospital_id: hospitals[0]?.id || '' })
    setShowModal(true)
  }

  function openEdit(req) {
    setEditingRequest(req)
    setForm({
      hospital_id: req.hospital_id,
      required_blood_group: req.required_blood_group,
      urgency: req.urgency,
      units_needed: req.units_needed,
      notes: req.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, units_needed: Number(form.units_needed), notes: form.notes || null }
      if (editingRequest) {
        await updateRequest(editingRequest.id, payload)
        showToast('Request updated.')
      } else {
        await createRequest(payload)
        showToast('Request created.')
      }
      setShowModal(false)
      fetchAll()
    } catch { showToast('Failed to save request.', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await deleteRequest(deleteTarget.id)
      showToast('Request deleted.')
      setDeleteTarget(null)
      fetchAll()
    } catch { showToast('Failed to delete request.', 'error') }
  }

  async function handleFulfill(req) {
    try {
      await updateRequest(req.id, { status: 'fulfilled' })
      showToast('Request marked as fulfilled!')
      fetchAll()
    } catch { showToast('Failed to update status.', 'error') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Requests</h1>
          <p className="page-subtitle">Track and manage hospital blood requests by urgency and status.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-request-btn" disabled={hospitals.length === 0}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select id="filter-blood-group" className="form-select" value={filterBG} onChange={e => setFilterBG(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        <select id="filter-urgency" className="form-select" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
          <option value="">All Urgencies</option>
          {URGENCIES.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
        </select>
        <select id="filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(filterBG || filterUrgency || filterStatus) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterBG(''); setFilterUrgency(''); setFilterStatus('') }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No requests found</h3>
          <p>{hospitals.length === 0 ? 'Add a hospital first before creating requests.' : 'Create a new blood request or adjust filters.'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {requests.map(r => (
            <RequestCard key={r.id} request={r} onEdit={openEdit} onDelete={setDeleteTarget} onFulfill={handleFulfill} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingRequest ? 'Edit Request' : 'New Blood Request'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)} id="close-request-modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Hospital *</label>
                  <select id="request-hospital" className="form-select" required value={form.hospital_id} onChange={e => setForm(f => ({ ...f, hospital_id: e.target.value }))}>
                    <option value="">Select a hospital</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} — {h.location.city}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select id="request-blood-group" className="form-select" value={form.required_blood_group} onChange={e => setForm(f => ({ ...f, required_blood_group: e.target.value }))}>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency *</label>
                  <select id="request-urgency" className="form-select" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                    {URGENCIES.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Units Needed *</label>
                  <input id="request-units" className="form-input" type="number" min="1" required value={form.units_needed} onChange={e => setForm(f => ({ ...f, units_needed: e.target.value }))} />
                </div>
                {editingRequest && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select id="request-status" className="form-select" value={editingRequest.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group full">
                  <label className="form-label">Notes</label>
                  <textarea id="request-notes" className="form-textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details (optional)" />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-request-form" disabled={saving}>
                  {saving ? 'Saving...' : editingRequest ? 'Update Request' : 'Create Request'}
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
              <h2 className="modal-title">Delete Request?</h2>
              <p>Remove this blood request for <strong>{deleteTarget.hospital_name}</strong>? This cannot be undone.</p>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-request">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
