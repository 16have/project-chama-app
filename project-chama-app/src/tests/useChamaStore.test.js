// src/tests/useChamaStore.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useChamaStore } from '../store/useChamaStore'

const getState = () => useChamaStore.getState()
const setState = useChamaStore.setState

describe('useChamaStore', () => {
  beforeEach(() => {
    setState({
      members: [], contributions: [], expenses: [], reminders: []
    })
  })

  it('sets members correctly', () => {
    const members = [{ id: '1', name: 'Alice', role: 'admin' }, { id: '2', name: 'Bob', role: 'member' }]
    act(() => getState().setMembers(members))
    expect(useChamaStore.getState().members).toEqual(members)
  })

  it('sets contributions correctly', () => {
    const contributions = [{ id: 'c1', memberId: '1', amount: 2000 }]
    act(() => getState().setContributions(contributions))
    expect(useChamaStore.getState().contributions).toEqual(contributions)
  })

  it('sets expenses correctly', () => {
    const expenses = [{ id: 'e1', description: 'Venue', amount: 5000 }]
    act(() => getState().setExpenses(expenses))
    expect(useChamaStore.getState().expenses).toEqual(expenses)
  })

  it('sets reminders correctly', () => {
    const reminders = [{ id: 'r1', title: 'Monthly', meetingDate: '2026-06-01T10:00' }]
    act(() => getState().setReminders(reminders))
    expect(useChamaStore.getState().reminders).toEqual(reminders)
  })

  it('calculates totalContributions', () => {
    act(() => getState().setContributions([
      { id: 'c1', amount: 2000 },
      { id: 'c2', amount: 3000 },
    ]))
    expect(useChamaStore.getState().totalContributions()).toBe(5000)
  })

  it('calculates totalExpenses', () => {
    act(() => getState().setExpenses([
      { id: 'e1', amount: 1000 },
      { id: 'e2', amount: 500 },
    ]))
    expect(useChamaStore.getState().totalExpenses()).toBe(1500)
  })

  it('calculates positive balance', () => {
    act(() => {
      getState().setContributions([{ id: 'c1', amount: 10000 }])
      getState().setExpenses([{ id: 'e1', amount: 3000 }])
    })
    expect(useChamaStore.getState().balance()).toBe(7000)
  })

  it('calculates negative balance', () => {
    act(() => {
      getState().setContributions([{ id: 'c1', amount: 1000 }])
      getState().setExpenses([{ id: 'e1', amount: 5000 }])
    })
    expect(useChamaStore.getState().balance()).toBe(-4000)
  })

  it('returns zero balance with no data', () => {
    expect(useChamaStore.getState().balance()).toBe(0)
  })

  it('filters upcoming reminders (future dates only)', () => {
    const future = new Date()
    future.setDate(future.getDate() + 7)
    const past = new Date()
    past.setDate(past.getDate() - 3)

    act(() => getState().setReminders([
      { id: 'r1', title: 'Future', meetingDate: future.toISOString() },
      { id: 'r2', title: 'Past',   meetingDate: past.toISOString() },
    ]))
    const upcoming = useChamaStore.getState().upcomingReminders()
    expect(upcoming).toHaveLength(1)
    expect(upcoming[0].title).toBe('Future')
  })

  it('filters member contributions by uid', () => {
    act(() => getState().setContributions([
      { id: 'c1', memberId: 'user-1', amount: 2000 },
      { id: 'c2', memberId: 'user-2', amount: 1000 },
      { id: 'c3', memberId: 'user-1', amount: 3000 },
    ]))
    const mine = useChamaStore.getState().memberContributions('user-1')
    expect(mine).toHaveLength(2)
    expect(mine.every(c => c.memberId === 'user-1')).toBe(true)
  })

  it('returns empty array for member with no contributions', () => {
    act(() => getState().setContributions([{ id: 'c1', memberId: 'other', amount: 1000 }]))
    expect(useChamaStore.getState().memberContributions('nobody')).toHaveLength(0)
  })

  it('groups contributions by month', () => {
    const makeDate = (y, m) => {
      const d = new Date(y, m - 1, 15)
      return { toDate: () => d }
    }
    act(() => getState().setContributions([
      { id: 'c1', amount: 2000, createdAt: makeDate(2026, 1) },
      { id: 'c2', amount: 3000, createdAt: makeDate(2026, 1) },
      { id: 'c3', amount: 1500, createdAt: makeDate(2026, 2) },
    ]))
    const grouped = useChamaStore.getState().contributionsByMonth()
    expect(grouped).toHaveLength(2)
    expect(grouped.find(g => g.month === '2026-01')?.total).toBe(5000)
    expect(grouped.find(g => g.month === '2026-02')?.total).toBe(1500)
  })

  it('handles amount as string in totalContributions', () => {
    act(() => getState().setContributions([{ id: 'c1', amount: '2500' }]))
    expect(useChamaStore.getState().totalContributions()).toBe(2500)
  })
})
