import { useEffect, useState } from 'react'
import { Users, Plus, Search, X, Check } from 'lucide-react'
import DonorCard from '../components/DonorCard'
import { getDonors, createDonor, updateDonor, deleteDonor } from '../api/client'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const EMPTY_FORM = {
  name: '', blood_group: 'O+',
  location: { city: '', state: '', pincode: '' },
  contact: { phone: '', email: '' },
  is_available: true, last_donated: '',
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

export default function Donors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDonor, setEditingDonor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterBG, setFilterBG] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  async function fetchDonors() {
    setLoading(true)
    try {
      const params = {}
      if (filterBG) params.blood_group = filterBG
      if (search) params.city = search
      const res = await getDonors(params)
      setDonors(res.data)
    } catch { showToast('Failed to load donors.', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDonors() }, [filterBG, search])

  function openCreate() {
    setEditingDonor(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(donor) {
    setEditingDonor(donor)
    setForm({
      name: donor.name,
      blood_group: donor.blood_group,
      location: { ...donor.location },
      contact: { phone: donor.contact.phone, email: donor.contact.email || '' },
      is_available: donor.is_available,
      last_donated: donor.last_donated ? donor.last_donated.split('T')[0] : '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        last_donated: form.last_donated ? new Date(form.last_donated).toISOString() : null,
        contact: { ...form.contact, email: form.contact.email || null },
      }
      if (editingDonor) {
        await updateDonor(editingDonor.id, payload)
        showToast('Donor updated successfully.')
      } else {
        await createDonor(payload)
        showToast('Donor added successfully.')
      }
      setShowModal(false)
      fetchDonors()
    } catch { showToast('Failed to save donor.', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await deleteDonor(deleteTarget.id)
      showToast('Donor deleted.')
      setDeleteTarget(null)
      fetchDonors()
    } catch { showToast('Failed to delete donor.', 'error') }
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
          <h1 className="page-title">Donors</h1>
          <p className="page-subtitle">Manage blood donors and their availability.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-donor-btn">
          <Plus size={16} /> Add Donor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            id="donor-search-city"
            className="form-input"
            placeholder="Search by city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="donor-filter-bloodgroup" className="form-select" value={filterBG} onChange={e => setFilterBG(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        {(filterBG || search) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterBG(''); setSearch('') }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : donors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No donors found</h3>
          <p>Add a donor or adjust your filters.</p>
        </div>
      ) : (
        <div className="card-grid">
          {donors.map(d => (
            <DonorCard key={d.id} donor={d} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingDonor ? 'Edit Donor' : 'Add New Donor'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)} id="close-donor-modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Full Name *</label>
                  <input id="donor-name" className="form-input" required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Ravi Kumar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select id="donor-blood-group" className="form-select" value={form.blood_group} onChange={e => setField('blood_group', e.target.value)}>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Available?</label>
                  <select id="donor-available" className="form-select" value={form.is_available} onChange={e => setField('is_available', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input id="donor-city" className="form-input" required value={form.location.city} onChange={e => setField('location.city', e.target.value)} placeholder="e.g. Chennai" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input id="donor-state" className="form-input" required value={form.location.state} onChange={e => setField('location.state', e.target.value)} placeholder="e.g. Tamil Nadu" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input id="donor-pincode" className="form-input" required value={form.location.pincode} onChange={e => setField('location.pincode', e.target.value)} placeholder="600001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input id="donor-phone" className="form-input" required value={form.contact.phone} onChange={e => setField('contact.phone', e.target.value)} placeholder="+91 9XXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input id="donor-email" className="form-input" type="email" value={form.contact.email} onChange={e => setField('contact.email', e.target.value)} placeholder="optional" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Last Donated</label>
                  <input id="donor-last-donated" className="form-input" type="date" value={form.last_donated} onChange={e => setField('last_donated', e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-donor-form" disabled={saving}>
                  {saving ? 'Saving...' : editingDonor ? 'Update Donor' : 'Add Donor'}
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
              <h2 className="modal-title">Delete Donor?</h2>
              <p>Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This cannot be undone.</p>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-donor">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
