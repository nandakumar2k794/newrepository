/**
 * DonorSearch.jsx
 * ---------------
 * Dedicated donor search page with:
 *  - Dropdown to filter by blood group (primary filter)
 *  - City / state text filters
 *  - Availability toggle
 *  - Results mapped dynamically from GET /api/donors/search
 */
import { useState, useCallback } from 'react'
import { searchDonors } from '../api/client'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BG_COMPATIBILITY = {
  'O-':  'Universal donor — compatible with all blood types',
  'O+':  'Can donate to A+, B+, AB+, O+',
  'A-':  'Can donate to A+, A-, AB+, AB-',
  'A+':  'Can donate to A+, AB+',
  'B-':  'Can donate to B+, B-, AB+, AB-',
  'B+':  'Can donate to B+, AB+',
  'AB-': 'Can donate to AB+, AB-',
  'AB+': 'Universal recipient',
}

const INITIAL_FILTERS = {
  blood_group:  '',
  city:         '',
  state:        '',
  is_available: '',
  pincode:      '',
}

function DonorResultCard({ donor }) {
  const initials = donor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <article className="result-card" aria-label={`Donor: ${donor.name}`}>
      {/* Avatar */}
      <div className="result-avatar">
        <span className="result-initials">{initials}</span>
        <span className={`result-availability ${donor.is_available ? 'avail-yes' : 'avail-no'}`}
              title={donor.is_available ? 'Available' : 'Unavailable'} />
      </div>

      {/* Info */}
      <div className="result-info">
        <div className="result-name-row">
          <h3 className="result-name">{donor.name}</h3>
          <span className="badge badge-blood">{donor.blood_group}</span>
        </div>

        <div className="result-meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {donor.location.city}, {donor.location.state}
          <span className="result-pincode">— {donor.location.pincode}</span>
        </div>

        <div className="result-meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 16 19.79 19.79 0 0 1 1.85 7.4 2 2 0 0 1 3.84 5.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 12.2A16 16 0 0 0 16 20.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 24 21.3z"/></svg>
          {donor.contact.phone}
          {donor.contact.email && (
            <a href={`mailto:${donor.contact.email}`} className="result-email">
              — {donor.contact.email}
            </a>
          )}
        </div>

        {donor.last_donated && (
          <div className="result-meta-row result-muted">
            Last donated: {new Date(donor.last_donated).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="result-status-col">
        <span className={`badge ${donor.is_available ? 'badge-available' : 'badge-unavailable'}`}>
          {donor.is_available ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </article>
  )
}

export default function DonorSearch() {
  const [filters, setFilters]   = useState(INITIAL_FILTERS)
  const [results, setResults]   = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  function handleFilter(e) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const runSearch = useCallback(async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    // Build only non-empty params
    const params = {}
    if (filters.blood_group)  params.blood_group  = filters.blood_group
    if (filters.city.trim())  params.city         = filters.city.trim()
    if (filters.state.trim()) params.state        = filters.state.trim()
    if (filters.pincode.trim()) params.pincode    = filters.pincode.trim()
    if (filters.is_available !== '') params.is_available = filters.is_available

    try {
      const res = await searchDonors(params)
      setResults(res.data)
      setSearched(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Search failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [filters])

  function clearAll() {
    setFilters(INITIAL_FILTERS)
    setResults([])
    setSearched(false)
    setError(null)
  }

  const hasActiveFilter = Object.values(filters).some(v => v !== '')

  return (
    <div className="form-page">
      {/* ── Page Header ── */}
      <div className="form-page-header">
        <div className="form-page-icon search-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <h1 className="page-title">Find Donors</h1>
          <p className="page-subtitle">Search for available blood donors by blood group, city, or availability.</p>
        </div>
      </div>

      {/* ── Search Panel ── */}
      <div className="search-panel">
        <form id="donor-search-form" onSubmit={runSearch}>
          <div className="search-filters-grid">

            {/* ── PRIMARY: Blood Group Dropdown ── */}
            <div className="form-group search-group-primary">
              <label className="form-label" htmlFor="search-blood-group">
                Blood Group
                <span className="filter-tag">Primary filter</span>
              </label>
              <select
                id="search-blood-group"
                name="blood_group"
                className="form-select search-select-primary"
                value={filters.blood_group}
                onChange={handleFilter}
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {filters.blood_group && (
                <p className="compat-hint">{BG_COMPATIBILITY[filters.blood_group]}</p>
              )}
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label" htmlFor="search-city">City</label>
              <input
                id="search-city"
                name="city"
                className="form-input"
                type="text"
                value={filters.city}
                onChange={handleFilter}
                placeholder="e.g. Chennai"
              />
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label" htmlFor="search-state">State</label>
              <input
                id="search-state"
                name="state"
                className="form-input"
                type="text"
                value={filters.state}
                onChange={handleFilter}
                placeholder="e.g. Tamil Nadu"
              />
            </div>

            {/* Availability */}
            <div className="form-group">
              <label className="form-label" htmlFor="search-available">Availability</label>
              <select
                id="search-available"
                name="is_available"
                className="form-select"
                value={filters.is_available}
                onChange={handleFilter}
              >
                <option value="">All</option>
                <option value="true">Available only</option>
                <option value="false">Unavailable only</option>
              </select>
            </div>

            {/* Pincode */}
            <div className="form-group">
              <label className="form-label" htmlFor="search-pincode">Pincode</label>
              <input
                id="search-pincode"
                name="pincode"
                className="form-input"
                type="text"
                value={filters.pincode}
                onChange={handleFilter}
                placeholder="Exact pincode"
                maxLength={6}
              />
            </div>

          </div>

          {/* Search Actions */}
          <div className="search-actions">
            {hasActiveFilter && (
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                Clear All
              </button>
            )}
            <button
              id="run-donor-search"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? <><span className="btn-spinner" /> Searching…</>
                : <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search Donors
                  </>
              }
            </button>
          </div>
        </form>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="status-banner status-error">
          <span className="status-icon">✕</span>
          {error}
          <button className="status-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* ── Results ── */}
      {loading && (
        <div className="spinner-container"><div className="spinner" /></div>
      )}

      {!loading && searched && (
        <div className="results-section">
          {/* Results header */}
          <div className="results-header">
            <h2 className="results-count">
              {results.length === 0
                ? 'No donors found'
                : `${results.length} donor${results.length !== 1 ? 's' : ''} found`}
            </h2>
            {filters.blood_group && (
              <span className="badge badge-blood" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                {filters.blood_group}
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.25 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3>No matching donors</h3>
              <p>Try broadening your search — remove a filter or choose a different blood group.</p>
            </div>
          ) : (
            /* ── Dynamic results list — .map() over results ── */
            <div className="results-list" role="list">
              {results.map(donor => (
                <DonorResultCard key={donor.id} donor={donor} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !searched && (
        <div className="search-prompt">
          <div className="search-prompt-inner">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.2 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p>Select filters above and click <strong>Search Donors</strong> to find available donors.</p>
            <p style={{ marginTop: 6 }}>Use the <strong>Blood Group</strong> dropdown to narrow your search instantly.</p>
          </div>
        </div>
      )}
    </div>
  )
}
