import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider }  from './context/AuthContext'
import Navbar from './components/Navbar'
import Dashboard          from './pages/Dashboard'
import Donors             from './pages/Donors'
import Hospitals          from './pages/Hospitals'
import Requests           from './pages/Requests'
import DonorRegistration  from './pages/DonorRegistration'
import HospitalRegistration from './pages/HospitalRegistration'
import BloodRequestForm   from './pages/BloodRequestForm'
import DonorSearch        from './pages/DonorSearch'
import Login              from './pages/Login'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* ── Overview ── */}
                <Route path="/"                   element={<Dashboard />} />

                {/* ── Auth ── */}
                <Route path="/login"              element={<Login />} />

                {/* ── Management lists ── */}
                <Route path="/donors"             element={<Donors />} />
                <Route path="/hospitals"          element={<Hospitals />} />
                <Route path="/requests"           element={<Requests />} />

                {/* ── Standalone form pages ── */}
                <Route path="/register-donor"     element={<DonorRegistration />} />
                <Route path="/register-hospital"  element={<HospitalRegistration />} />
                <Route path="/new-request"        element={<BloodRequestForm />} />
                <Route path="/search"             element={<DonorSearch />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
