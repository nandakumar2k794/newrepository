import { MapPin, Phone, Mail, Pencil, Trash2 } from 'lucide-react'

export default function DonorCard({ donor, onEdit, onDelete }) {
  return (
    <div className="entity-card">
      <div className="entity-card-header">
        <div>
          <p className="entity-name">{donor.name}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span className="badge badge-blood">{donor.blood_group}</span>
            <span className={`badge ${donor.is_available ? 'badge-available' : 'badge-unavailable'}`}>
              {donor.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      <div className="entity-meta">
        <div className="entity-meta-row">
          <MapPin size={13} />
          {donor.location.city}, {donor.location.state} — {donor.location.pincode}
        </div>
        <div className="entity-meta-row">
          <Phone size={13} />
          {donor.contact.phone}
        </div>
        {donor.contact.email && (
          <div className="entity-meta-row">
            <Mail size={13} />
            {donor.contact.email}
          </div>
        )}
        {donor.last_donated && (
          <div className="entity-meta-row" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Last donated: {new Date(donor.last_donated).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="entity-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(donor)} id={`edit-donor-${donor.id}`}>
          <Pencil size={13} /> Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(donor)} id={`delete-donor-${donor.id}`}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}
