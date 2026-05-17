// src/pages/MembersPage.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { useChamaStore } from '../store/useChamaStore'
import { subscribeToMembers, updateMemberRole, removeMember, addMember } from '../utils/firestoreService'
import { Shield, User, Trash2, Plus } from 'lucide-react'
import clsx from 'clsx'

export const MembersPage = () => {
  const { isAdmin } = useAuth()
  const { members, setMembers } = useChamaStore()
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', email: '' })
  const [error, setError] = useState(null)

  useEffect(() => subscribeToMembers(setMembers), [setMembers])

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleToggle = async (member) => {
    const next = member.role === 'admin' ? 'member' : 'admin'
    setBusy(member.id)
    await updateMemberRole(member.id, next)
    setBusy(null)
  }

  const handleRemove = async (member) => {
    if (!confirm(`Remove ${member.name} from the chama?`)) return
    setBusy(member.id)
    await removeMember(member.id)
    setBusy(null)
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!memberForm.name?.trim() || !memberForm.email?.trim()) {
      setError('Name and email are required.')
      return
    }
    setError(null)
    setBusy('add-member')
    await addMember({
      name: memberForm.name.trim(),
      email: memberForm.email.trim(),
      role: 'member',
      joinedAt: new Date().toISOString()
    })
    setMemberForm({ name: '', email: '' })
    setShowAddForm(false)
    setBusy(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Members</h2>
          <p className="page-sub">{members.length} registered member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-header-actions">
          <input
            className="search-input"
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="member-search"
          />
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)} data-testid="add-member-btn">
              <Plus size={14} /> Add member
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <table className="data-table" data-testid="members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Joined</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3} className="empty-row">No members found.</td></tr>
            )}
            {filtered.map(member => (
              <tr key={member.id} data-testid="member-row">
                <td>
                  <div className="member-cell">
                    {member.photoURL
                      ? <img src={member.photoURL} alt="" className="member-avatar" />
                      : <div className="member-avatar-ph">{member.name?.[0] || '?'}</div>
                    }
                    <div>
                      <strong>{member.name}</strong>
                      <span className="text-muted">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={clsx('role-badge', member.role === 'admin' ? 'admin' : 'member')}>
                    {member.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                    {member.role}
                  </span>
                </td>
                <td className="text-muted">
                  {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                </td>
                {isAdmin && (
                  <td>
                    <div className="action-row">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleRoleToggle(member)}
                        disabled={busy === member.id}
                        data-testid="toggle-role-btn"
                      >
                        {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleRemove(member)}
                        disabled={busy === member.id}
                        data-testid="remove-member-btn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isAdmin && (
        <p className="info-note">
          Only the secretary (admin) can manage member roles. Contact them for changes.
        </p>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Member</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAddMember} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={e => setMemberForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  required
                  data-testid="add-member-name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={e => setMemberForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@example.com"
                  required
                  data-testid="add-member-email"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy === 'add-member'} data-testid="save-member-btn">
                  {busy === 'add-member' ? 'Saving...' : 'Save member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
