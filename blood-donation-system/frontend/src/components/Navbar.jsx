import { NavLink } from 'react-router-dom'
import {
  Droplets, LayoutDashboard,
  Users, Building2, ClipboardList,
  UserPlus, Hospital, FilePlus2, Search,
  Sun, Moon, LogIn, LogOut, UserCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Register',
    links: [
      { to: '/register-donor',    label: 'Register Donor',    icon: UserPlus },
      { to: '/register-hospital', label: 'Register Hospital', icon: Hospital },
      { to: '/new-request',       label: 'Blood Request',     icon: FilePlus2 },
    ],
  },
  {
    label: 'Search & Browse',
    links: [
      { to: '/search', label: 'Find Donors', icon: Search },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/donors',    label: 'All Donors',    icon: Users },
      { to: '/hospitals', label: 'All Hospitals', icon: Building2 },
      { to: '/requests',  label: 'All Requests',  icon: ClipboardList },
    ],
  },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const isDark = theme === 'dark'

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Droplets size={20} color="#fff" />
        </div>
        <span className="logo-text">BloodLink</span>
      </div>

      {/* User profile / Login pill */}
      <div style={{ marginBottom: 20, padding: '0 12px' }}>
        {isAuthenticated ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Log out"
              style={{ padding: '6px 8px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <LogIn size={15} /> Sign In / Register
          </NavLink>
        )}
      </div>

      {/* Nav sections */}
      {NAV_SECTIONS.map(section => (
        <div key={section.label} style={{ marginBottom: 20 }}>
          <p className="nav-section-label">{section.label}</p>
          <div className="nav-links">
            {section.links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} className="nav-icon" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      {/* ── Theme toggle ── */}
      <div className="theme-toggle-wrapper">
        <button
          id="theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb">
              {isDark
                ? <Moon size={12} strokeWidth={2.5} />
                : <Sun  size={12} strokeWidth={2.5} />
              }
            </span>
          </span>
          <span className="theme-toggle-label">
            {isDark ? 'Dark mode' : 'Light mode'}
          </span>
        </button>
      </div>

      <div className="sidebar-footer">
        <p>BloodLink MVP v1.0</p>
        <p style={{ marginTop: 4 }}>© 2026 BloodLink</p>
      </div>
    </nav>
  )
}
