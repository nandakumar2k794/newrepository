import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, ClipboardList, AlertTriangle, ArrowRight, Droplets } from 'lucide-react'
import { getDonors } from '../api/client'
import { getHospitals } from '../api/client'
import { getRequests } from '../api/client'

const URGENCY_CLASS = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ donors: 0, hospitals: 0, requests: 0, pending: 0 })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [donorsRes, hospitalsRes, requestsRes] = await Promise.all([
          getDonors(),
          getHospitals(),
          getRequests(),
        ])
        const all = requestsRes.data
        setStats({
          donors: donorsRes.data.length,
          hospitals: hospitalsRes.data.length,
          requests: all.length,
          pending: all.filter(r => r.status === 'pending').length,
        })
        setRecentRequests(all.slice(0, 6))
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="spinner-container"><div className="spinner" /></div>
  )

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Droplets size={28} color="var(--red-light)" />
          <h1 className="hero-title">BloodLink Dashboard</h1>
        </div>
        <p className="hero-subtitle">
          Manage donors, hospitals, and blood requests — all in one place. Every connection saves a life.
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon red"><Users size={22} /></div>
          <div>
            <p className="stat-label">Total Donors</p>
            <p className="stat-value">{stats.donors}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Building2 size={22} /></div>
          <div>
            <p className="stat-label">Hospitals</p>
            <p className="stat-value">{stats.hospitals}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><ClipboardList size={22} /></div>
          <div>
            <p className="stat-label">Total Requests</p>
            <p className="stat-value">{stats.requests}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div>
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Blood Requests</h2>
        <Link to="/requests" className="btn btn-secondary btn-sm" id="view-all-requests">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {recentRequests.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No requests yet</h3>
          <p>Blood requests from hospitals will appear here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {recentRequests.map(req => (
            <div key={req.id} className="card" style={req.urgency === 'critical' ? { borderColor: 'rgba(239,68,68,0.35)' } : {}}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-blood">{req.required_blood_group}</span>
                <span className={`badge ${URGENCY_CLASS[req.urgency]}`}>
                  {req.urgency === 'critical' && <span className="pulse-dot" style={{ marginRight: 4 }} />}
                  {req.urgency}
                </span>
                <span className={`badge badge-${req.status}`}>{req.status}</span>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {req.hospital_name || 'Unknown Hospital'}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {req.units_needed} unit{req.units_needed !== 1 ? 's' : ''} needed
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
