// src/pages/RemindersPage.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { useChamaStore } from '../store/useChamaStore'
import { subscribeToReminders, addReminder, deleteReminder } from '../utils/firestoreService'
import { Plus, Trash2, CalendarClock, MapPin, FileText, Clock } from 'lucide-react'
import { format, isPast } from 'date-fns'
import clsx from 'clsx'

export const RemindersPage = () => {
  const { isAdmin } = useAuth()
  const { reminders, setReminders } = useChamaStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', meetingDate: '', venue: '', agenda: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => subscribeToReminders(setReminders), [setReminders])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.meetingDate) { setError('Title and date are required'); return }
    setLoading(true); setError(null)
    await addReminder(form)
    setForm({ title: '', meetingDate: '', venue: '', agenda: '' })
    setShowForm(false)
    setLoading(false)
  }

  const upcoming = reminders.filter(r => !isPast(new Date(r.meetingDate)))
  const past     = reminders.filter(r => isPast(new Date(r.meetingDate)))

  const ReminderCard = ({ r }) => (
    <div className={clsx('reminder-card', isPast(new Date(r.meetingDate)) && 'past')} data-testid="reminder-card">
      <div className="reminder-card-header">
        <div className="reminder-title-row">
          <CalendarClock size={16} />
          <h4>{r.title}</h4>
        </div>
        {isAdmin && (
          <button className="btn-icon btn-danger-sm" onClick={() => deleteReminder(r.id)} data-testid="delete-reminder-btn">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="reminder-meta">
        <span><Clock size={13} /> {format(new Date(r.meetingDate), 'EEEE, d MMMM yyyy · h:mm a')}</span>
        {r.venue && <span><MapPin size={13} /> {r.venue}</span>}
        {r.agenda && <span><FileText size={13} /> {r.agenda}</span>}
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Meetings & Reminders</h2>
          <p className="page-sub">{upcoming.length} upcoming, {past.length} past</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} data-testid="add-reminder-btn">
            <Plus size={15} /> Schedule Meeting
          </button>
        )}
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="empty-state">
          <CalendarClock size={48} strokeWidth={1} />
          <p>No meetings scheduled yet.</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(true)}>Schedule First Meeting</button>}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="reminders-section">
          <h3 className="section-label">Upcoming</h3>
          <div className="reminder-cards">
            {upcoming.map(r => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="reminders-section">
          <h3 className="section-label faded">Past Meetings</h3>
          <div className="reminder-cards">
            {past.map(r => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Schedule Meeting</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Meeting Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Monthly Chama Meeting" aria-required="true" data-testid="reminder-title" />
              </div>
              <div className="form-group">
                <label>Date & Time *</label>
                <input type="datetime-local" value={form.meetingDate} onChange={e => setForm(p => ({ ...p, meetingDate: e.target.value }))} aria-required="true" data-testid="reminder-date" />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input type="text" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Community Hall, Nairobi" />
              </div>
              <div className="form-group">
                <label>Agenda</label>
                <textarea rows={3} value={form.agenda} onChange={e => setForm(p => ({ ...p, agenda: e.target.value }))} placeholder="Key discussion points…" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-reminder-btn">
                  {loading ? 'Saving…' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
