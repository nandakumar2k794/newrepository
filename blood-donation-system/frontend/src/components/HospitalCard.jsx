import { MapPin, Phone, Mail, Globe, Pencil, Trash2 } from 'lucide-react'

export default function HospitalCard({ hospital, onEdit, onDelete }) {
  return (
    <div className="entity-card">
      <div className="entity-card-header">
        <p className="entity-name">{hospital.name}</p>
      </div>

      <div className="entity-meta">
        <div className="entity-meta-row">
          <MapPin size={13} />
          {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
        </div>
        <div className="entity-meta-row">
          <Phone size={13} />
          {hospital.contact.phone}
        </div>
        {hospital.contact.email && (
          <div className="entity-meta-row">
            <Mail size={13} />
            {hospital.contact.email}
          </div>
        )}
        {hospital.contact.website && (
          <div className="entity-meta-row">
            <Globe size={13} />
            <a
              href={hospital.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--red-light)', textDecoration: 'none' }}
            >
              {hospital.contact.website}
            </a>
          </div>
        )}
      </div>

      <div className="entity-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(hospital)} id={`edit-hospital-${hospital.id}`}>
          <Pencil size={13} /> Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(hospital)} id={`delete-hospital-${hospital.id}`}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}
