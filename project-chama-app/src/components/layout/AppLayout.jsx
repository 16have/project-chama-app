// src/components/layout/AppLayout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { LayoutDashboard, Users, Wallet, Bell, LogOut, Menu, X, Shield } from 'lucide-react'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members',       icon: Users,            label: 'Members'   },
  { to: '/finances',      icon: Wallet,           label: 'Finances'  },
  { to: '/reminders',     icon: Bell,             label: 'Reminders' },
]

export const AppLayout = () => {
  const { user, profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <header className="topbar">
        <button className="topbar-menu" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="topbar-brand">🌿 Chama</span>
        {isAdmin && <span className="admin-badge"><Shield size={12} /> Admin</span>}
      </header>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-leaf">🌿</span>
          <div>
            <span className="brand-name">Chama</span>
            {isAdmin && <span className="role-tag admin">Admin</span>}
            {!isAdmin && <span className="role-tag member">Member</span>}
          </div>
        </div>

        <nav className="sidebar-nav" onClick={() => setOpen(false)}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="user-avatar" />
              : <div className="user-avatar-ph">{profile?.name?.[0] || '?'}</div>
            }
            <div className="user-info">
              <span className="user-name">{profile?.name || user?.displayName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn-icon" onClick={handleLogout} title="Sign out" data-testid="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
