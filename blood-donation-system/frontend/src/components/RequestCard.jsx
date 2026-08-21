import { Building2, Droplets, Layers, Pencil, Trash2, CheckCircle2 } from 'lucide-react'

const URGENCY_CLASS = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

const STATUS_CLASS = {
  pending: 'badge-pending',
  fulfilled: 'badge-fulfilled',
  cancelled: 'badge-cancelled',
}

export default function RequestCard({ request, onEdit, onDelete, onFulfill }) {
  return (
    <div className="entity-card" style={request.urgency === 'critical' ? { borderColor: 'rgba(239,68,68,0.35)' } : {}}>
      <div className="entity-card-header">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-blood">{request.required_blood_group}</span>
          <span className={`badge ${URGENCY_CLASS[request.urgency]}`}>
            {request.urgency === 'critical' && <span className="pulse-dot" style={{ marginRight: 4 }} />}
            {request.urgency}
          </span>
          <span className={`badge ${STATUS_CLASS[request.status]}`}>{request.status}</span>
        </div>
      </div>

      <div className="entity-meta">
        <div className="entity-meta-row">
          <Building2 size={13} />
          {request.hospital_name || 'Unknown Hospital'}
        </div>
        <div className="entity-meta-row">
          <Layers size={13} />
          {request.units_needed} unit{request.units_needed !== 1 ? 's' : ''} needed
        </div>
        {request.notes && (
          <div className="entity-meta-row" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {request.notes}
          </div>
        )}
        <div className="entity-meta-row" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Created: {new Date(request.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="entity-card-actions">
        {request.status === 'pending' && (
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
            onClick={() => onFulfill(request)}
            id={`fulfill-request-${request.id}`}
          >
            <CheckCircle2 size={13} /> Fulfill
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(request)} id={`edit-request-${request.id}`}>
          <Pencil size={13} /> Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(request)} id={`delete-request-${request.id}`}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}
