// src/tests/components.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ─── Mock Firebase (never call real Firestore in tests) ───────
vi.mock('../utils/firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {}
}))

vi.mock('../utils/firestoreService', () => ({
  subscribeToMembers:       vi.fn((cb) => { cb([]); return () => {} }),
  subscribeToReminders:     vi.fn((cb) => { cb([]); return () => {} }),
  subscribeToContributions: vi.fn((cb) => { cb([]); return () => {} }),
  subscribeToExpenses:      vi.fn((cb) => { cb([]); return () => {} }),
  updateMemberRole:         vi.fn(),
  removeMember:             vi.fn(),
  addReminder:              vi.fn(),
  deleteReminder:           vi.fn(),
  addContribution:          vi.fn(),
  deleteContribution:       vi.fn(),
  addExpense:               vi.fn(),
  deleteExpense:            vi.fn(),
}))

// ─── Mock Auth Context ────────────────────────────────────────
const mockAuthMember = {
  user:             { uid: 'u1', displayName: 'Alice Mwangi', email: 'alice@test.com', photoURL: null },
  profile:          { name: 'Alice Mwangi', role: 'member' },
  loading:          false,
  isAdmin:          false,
  signInWithGoogle: vi.fn(),
  logout:           vi.fn(),
}
const mockAuthAdmin = { ...mockAuthMember, profile: { name: 'Alice Mwangi', role: 'admin' }, isAdmin: true }

vi.mock('../store/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuthMember),
  AuthProvider: ({ children }) => children,
}))

import { useAuth } from '../store/AuthContext'
import { LoginPage }     from '../pages/LoginPage'
import { MembersPage }   from '../pages/MembersPage'
import { RemindersPage } from '../pages/RemindersPage'
import { FinancesPage }  from '../pages/FinancesPage'
import { NotFoundPage }  from '../pages/NotFoundPage'
import { subscribeToMembers } from '../utils/firestoreService'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

// ─── LoginPage ─────────────────────────────────────────────────
describe('LoginPage', () => {
  beforeEach(() => useAuth.mockReturnValue({ ...mockAuthMember, user: null }))

  it('renders sign-in button', () => {
    wrap(<LoginPage />)
    expect(screen.getByTestId('google-signin-btn')).toBeInTheDocument()
  })

  it('shows Chama Portal heading', () => {
    wrap(<LoginPage />)
    expect(screen.getByText('Chama Portal')).toBeInTheDocument()
  })

  it('shows access notice', () => {
    wrap(<LoginPage />)
    expect(screen.getByText(/Access is granted/i)).toBeInTheDocument()
  })

  it('calls signInWithGoogle on click', async () => {
    const mockSign = vi.fn().mockResolvedValue({})
    useAuth.mockReturnValue({ ...mockAuthMember, user: null, signInWithGoogle: mockSign })
    wrap(<LoginPage />)
    fireEvent.click(screen.getByTestId('google-signin-btn'))
    await waitFor(() => expect(mockSign).toHaveBeenCalled())
  })

  it('shows error on sign-in failure', async () => {
    const mockSign = vi.fn().mockRejectedValue(new Error('fail'))
    useAuth.mockReturnValue({ ...mockAuthMember, user: null, signInWithGoogle: mockSign })
    wrap(<LoginPage />)
    fireEvent.click(screen.getByTestId('google-signin-btn'))
    await waitFor(() => expect(screen.getByText(/Sign-in failed/i)).toBeInTheDocument())
  })
})

// ─── MembersPage (Member role) ─────────────────────────────────
describe('MembersPage — member view', () => {
  beforeEach(() => useAuth.mockReturnValue(mockAuthMember))

  it('renders members table', () => {
    wrap(<MembersPage />)
    expect(screen.getByTestId('members-table')).toBeInTheDocument()
  })

  it('renders search input', () => {
    wrap(<MembersPage />)
    expect(screen.getByTestId('member-search')).toBeInTheDocument()
  })

  it('does NOT show admin action buttons', () => {
    wrap(<MembersPage />)
    expect(screen.queryByTestId('toggle-role-btn')).not.toBeInTheDocument()
  })

  it('shows info note for non-admins', () => {
    wrap(<MembersPage />)
    expect(screen.getByText(/Only the secretary/i)).toBeInTheDocument()
  })
})

// ─── MembersPage (Admin role) ──────────────────────────────────
describe('MembersPage — admin view', () => {
  beforeEach(() => {
    useAuth.mockReturnValue(mockAuthAdmin)
    subscribeToMembers.mockImplementation((cb) => {
      cb([{ id: 'u2', name: 'Bob Kamau', email: 'bob@test.com', role: 'member', joinedAt: '2025-01-01' }])
      return () => {}
    })
  })

  it('shows toggle-role button for admins', async () => {
    wrap(<MembersPage />)
    await waitFor(() => expect(screen.getByTestId('toggle-role-btn')).toBeInTheDocument())
  })

  it('shows remove-member button', async () => {
    wrap(<MembersPage />)
    await waitFor(() => expect(screen.getByTestId('remove-member-btn')).toBeInTheDocument())
  })

  it('search filters members', async () => {
    wrap(<MembersPage />)
    await waitFor(() => screen.getByText('Bob Kamau'))
    fireEvent.change(screen.getByTestId('member-search'), { target: { value: 'nobody' } })
    await waitFor(() => expect(screen.getByText('No members found.')).toBeInTheDocument())
  })
})

// ─── RemindersPage ─────────────────────────────────────────────
describe('RemindersPage — member view', () => {
  beforeEach(() => useAuth.mockReturnValue(mockAuthMember))

  it('renders page title', () => {
    wrap(<RemindersPage />)
    expect(screen.getByText('Meetings & Reminders')).toBeInTheDocument()
  })

  it('does NOT show schedule button for members', () => {
    wrap(<RemindersPage />)
    expect(screen.queryByTestId('add-reminder-btn')).not.toBeInTheDocument()
  })

  it('shows empty state message', () => {
    wrap(<RemindersPage />)
    expect(screen.getByText(/No meetings scheduled yet/i)).toBeInTheDocument()
  })
})

describe('RemindersPage — admin view', () => {
  beforeEach(() => useAuth.mockReturnValue(mockAuthAdmin))

  it('shows Schedule Meeting button for admin', () => {
    wrap(<RemindersPage />)
    expect(screen.getByTestId('add-reminder-btn')).toBeInTheDocument()
  })

  it('opens form modal on button click', async () => {
    wrap(<RemindersPage />)
    fireEvent.click(screen.getByTestId('add-reminder-btn'))
    await waitFor(() => expect(screen.getByTestId('reminder-title')).toBeInTheDocument())
  })

  it('shows validation error without title', async () => {
    wrap(<RemindersPage />)
    fireEvent.click(screen.getByTestId('add-reminder-btn'))
    await waitFor(() => screen.getByTestId('save-reminder-btn'))
    fireEvent.click(screen.getByTestId('save-reminder-btn'))
    await waitFor(() => expect(screen.getByText(/Title and date are required/i)).toBeInTheDocument())
  })
})

// ─── FinancesPage ──────────────────────────────────────────────
describe('FinancesPage — member view', () => {
  beforeEach(() => useAuth.mockReturnValue(mockAuthMember))

  it('renders finance page title', () => {
    wrap(<FinancesPage />)
    expect(screen.getByText('Finances')).toBeInTheDocument()
  })

  it('does not show add-contribution button for members', () => {
    wrap(<FinancesPage />)
    expect(screen.queryByTestId('add-contribution-btn')).not.toBeInTheDocument()
  })
})

describe('FinancesPage — admin view', () => {
  beforeEach(() => useAuth.mockReturnValue(mockAuthAdmin))

  it('shows add-contribution button for admins', () => {
    wrap(<FinancesPage />)
    expect(screen.getByTestId('add-contribution-btn')).toBeInTheDocument()
  })

  it('shows add-expense button for admins', () => {
    wrap(<FinancesPage />)
    expect(screen.getByTestId('add-expense-btn')).toBeInTheDocument()
  })

  it('opens contribution modal', async () => {
    wrap(<FinancesPage />)
    fireEvent.click(screen.getByTestId('add-contribution-btn'))
    await waitFor(() => expect(screen.getByTestId('contribution-amount')).toBeInTheDocument())
  })

  it('opens expense modal', async () => {
    wrap(<FinancesPage />)
    fireEvent.click(screen.getByTestId('add-expense-btn'))
    await waitFor(() => expect(screen.getByTestId('expense-amount')).toBeInTheDocument())
  })
})

// ─── NotFoundPage ──────────────────────────────────────────────
describe('NotFoundPage', () => {
  it('shows 404', () => {
    wrap(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })
  it('has dashboard link', () => {
    wrap(<NotFoundPage />)
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
  })
})
