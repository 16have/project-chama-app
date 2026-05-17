// src/store/useChamaStore.js
import { create } from 'zustand'

export const useChamaStore = create((set, get) => ({
  members:       [],
  contributions: [],
  expenses:      [],
  reminders:     [],

  setMembers:       (members)       => set({ members }),
  setContributions: (contributions) => set({ contributions }),
  setExpenses:      (expenses)      => set({ expenses }),
  setReminders:     (reminders)     => set({ reminders }),

  // Computed
  totalContributions: () =>
    get().contributions.reduce((s, c) => s + Number(c.amount || 0), 0),

  totalExpenses: () =>
    get().expenses.reduce((s, e) => s + Number(e.amount || 0), 0),

  balance: () =>
    get().totalContributions() - get().totalExpenses(),

  upcomingReminders: () => {
    const now = new Date()
    return get().reminders
      .filter(r => new Date(r.meetingDate) >= now)
      .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
  },

  memberContributions: (uid) =>
    get().contributions.filter(c => c.memberId === uid),

  contributionsByMonth: () => {
    const map = {}
    get().contributions.forEach(c => {
      const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = (map[key] || 0) + Number(c.amount || 0)
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }))
  }
}))
