import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Donors ──────────────────────────────────────────────────
export const getDonors = (params = {}) => api.get('/donors', { params })
export const getDonor  = (id) => api.get(`/donors/${id}`)
export const createDonor = (data) => api.post('/donors', data)
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data)
export const deleteDonor = (id) => api.delete(`/donors/${id}`)

/**
 * Advanced donor search — hits GET /donors/search
 * Supported params: blood_group, city, state, is_available, pincode, limit, skip
 */
export const searchDonors = (params = {}) => api.get('/donors/search', { params })

// ── Hospitals ────────────────────────────────────────────────
export const getHospitals = () => api.get('/hospitals')
export const getHospital = (id) => api.get(`/hospitals/${id}`)
export const createHospital = (data) => api.post('/hospitals', data)
export const updateHospital = (id, data) => api.put(`/hospitals/${id}`, data)
export const deleteHospital = (id) => api.delete(`/hospitals/${id}`)

// ── Requests ─────────────────────────────────────────────────
export const getRequests = (params = {}) => api.get('/requests', { params })
export const getRequest = (id) => api.get(`/requests/${id}`)
export const createRequest = (data) => api.post('/requests', data)
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data)
export const deleteRequest = (id) => api.delete(`/requests/${id}`)

// ── Auth ─────────────────────────────────────────────────────
export const loginUser    = (credentials) => api.post('/auth/login', credentials)
export const registerUser = (userData)    => api.post('/auth/register', userData)
export const getMe        = ()            => api.get('/auth/me')

export default api
