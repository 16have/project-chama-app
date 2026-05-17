// src/pages/DashboardPage.jsx
import { useEffect } from 'react'
import { useAuth } from '../store/AuthContext'
import { useChamaStore } from '../store/useChamaStore'
import {
  subscribeToContributions, subscribeToExpenses,
  subscribeToReminders, subscribeToMembers
} from '../utils/firestoreService'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, TrendingDown, Landmark, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'

export const DashboardPage = () => {
  const { profile } = useAuth()
  const {
    setMembers, setContributions, setExpenses, setReminders,
    members, totalContributions, totalExpenses, balance,
    upcomingReminders, contributionsByMonth
  } = useChamaStore()

  useEffect(() => {
    const u1 = subscribeToMembers(setMembers)
    const u2 = subscribeToContributions(setContributions)
    const u3 = subscribeToExpenses(setExpenses)
    const u4 = subscribeToReminders(setReminders)
    return () => { u1(); u2(); u3(); u4() }
  }, [setContributions, setExpenses, setMembers, setReminders])

  const stats = [
    { label: 'Total Members',       value: members.length,          icon: Users,        color: 'green'  },
    { label: 'Total Contributions', value: `KES ${totalContributions().toLocaleString()}`, icon: TrendingUp,   color: 'gold'   },
    { label: 'Total Expenses',      value: `KES ${totalExpenses().toLocaleString()}`,      icon: TrendingDown, color: 'orange' },
    { label: 'Current Balance',     value: `KES ${balance().toLocaleString()}`,            icon: Landmark,     color: balance() >= 0 ? 'green' : 'red' },
  ]

  const chartData = contributionsByMonth()
  const nextMeeting = upcomingReminders()[0]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Welcome back, {profile?.name?.split(' ')[0] || 'Member'} 👋</p>
        </div>
      </div>

      {/* Next Meeting Banner */}
      {nextMeeting && (
        <div className="meeting-banner" data-testid="meeting-banner">
          <CalendarClock size={18} />
          <div>
            <strong>Next Meeting:</strong> {nextMeeting.title} —{' '}
            {format(new Date(nextMeeting.meetingDate), 'EEEE, d MMMM yyyy · h:mm a')}
            {nextMeeting.venue && <span> · {nextMeeting.venue}</span>}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid" data-testid="stats-grid">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <div className="stat-icon-wrap"><Icon size={20} /></div>
            <div className="stat-body">
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <h3>Monthly Contributions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c8a84b" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#c8a84b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a7a5a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8a7a5a' }} />
              <Tooltip
                contentStyle={{ background: '#1e2a1a', border: '1px solid #3a4e2e', borderRadius: 8 }}
                labelStyle={{ color: '#d4c5a0' }}
                itemStyle={{ color: '#c8a84b' }}
              />
              <Area type="monotone" dataKey="total" stroke="#c8a84b" strokeWidth={2} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upcoming reminders list */}
      <div className="section-card">
        <h3>Upcoming Meetings</h3>
        {upcomingReminders().length === 0
          ? <p className="empty-text">No upcoming meetings scheduled.</p>
          : <ul className="reminder-list">
              {upcomingReminders().slice(0, 4).map(r => (
                <li key={r.id} className="reminder-item">
                  <span className="reminder-dot" />
                  <div>
                    <strong>{r.title}</strong>
                    <span>{format(new Date(r.meetingDate), 'd MMM yyyy · h:mm a')}</span>
                    {r.venue && <span> — {r.venue}</span>}
                  </div>
                </li>
              ))}
            </ul>
        }
      </div>
    </div>
  )
}
