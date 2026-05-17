// src/pages/FinancesPage.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { useChamaStore } from '../store/useChamaStore'
import {
  subscribeToContributions, subscribeToExpenses, subscribeToMembers,
  addContribution, deleteContribution, addExpense, deleteExpense
} from '../utils/firestoreService'
import { Plus, Trash2, TrendingUp, TrendingDown, Landmark } from 'lucide-react'
import { format } from 'date-fns'

const TABS = ['Overview', 'Contributions', 'Expenses']

export const FinancesPage = () => {
  const { isAdmin } = useAuth()
  const {
    members, contributions, expenses,
    setMembers, setContributions, setExpenses,
    totalContributions, totalExpenses, balance
  } = useChamaStore()

  const [tab, setTab] = useState('Overview')
  const [showContribForm, setShowContribForm] = useState(false)
  const [showExpForm, setShowExpForm] = useState(false)
  const [cForm, setCForm] = useState({ memberId: '', amount: '', note: '' })
  const [eForm, setEForm] = useState({ description: '', amount: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const u1 = subscribeToMembers(setMembers)
    const u2 = subscribeToContributions(setContributions)
    const u3 = subscribeToExpenses(setExpenses)
    return () => { u1(); u2(); u3() }
  }, [setContributions, setExpenses, setMembers])

  const handleAddContribution = async (e) => {
    e.preventDefault()
    if (!cForm.memberId || !cForm.amount) { setError('Member and amount required'); return }
    setLoading(true); setError(null)
    const member = members.find(m => m.id === cForm.memberId)
    await addContribution({ ...cForm, memberName: member?.name, amount: Number(cForm.amount) })
    setCForm({ memberId: '', amount: '', note: '' })
    setShowContribForm(false)
    setLoading(false)
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!eForm.description || !eForm.amount) { setError('Description and amount required'); return }
    setLoading(true); setError(null)
    await addExpense({ ...eForm, amount: Number(eForm.amount) })
    setEForm({ description: '', amount: '', category: '' })
    setShowExpForm(false)
    setLoading(false)
  }

  const fmt = (n) => `KES ${Number(n).toLocaleString()}`
  const fmtDate = (ts) => {
    if (!ts) return '-'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return format(d, 'd MMM yyyy')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Finances</h2>
          <p className="page-sub">Track contributions and expenses</p>
        </div>
        {isAdmin && (
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => setShowContribForm(true)} data-testid="add-contribution-btn">
              <Plus size={15} /> Contribution
            </button>
            <button className="btn btn-outline" onClick={() => setShowExpForm(true)} data-testid="add-expense-btn">
              <Plus size={15} /> Expense
            </button>
          </div>
        )}
      </div>

      <div className="fin-summary">
        <div className="fin-card green">
          <TrendingUp size={20} />
          <div>
            <span className="fin-amount">{fmt(totalContributions())}</span>
            <span className="fin-label">Total Contributions</span>
          </div>
        </div>
        <div className="fin-card red">
          <TrendingDown size={20} />
          <div>
            <span className="fin-amount">{fmt(totalExpenses())}</span>
            <span className="fin-label">Total Expenses</span>
          </div>
        </div>
        <div className={`fin-card ${balance() >= 0 ? 'gold' : 'red'}`}>
          <Landmark size={20} />
          <div>
            <span className="fin-amount">{fmt(balance())}</span>
            <span className="fin-label">Balance</span>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Contributions' && (
        <div className="table-card">
          <table className="data-table" data-testid="contributions-table">
            <thead><tr><th>Member</th><th>Amount</th><th>Note</th><th>Date</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {contributions.length === 0 && <tr><td colSpan={5} className="empty-row">No contributions yet.</td></tr>}
              {contributions.map(c => (
                <tr key={c.id} data-testid="contribution-row">
                  <td><strong>{c.memberName || '-'}</strong></td>
                  <td><span className="amount-green">{fmt(c.amount)}</span></td>
                  <td className="text-muted">{c.note || '-'}</td>
                  <td className="text-muted">{fmtDate(c.createdAt)}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn-icon btn-danger-sm" onClick={() => deleteContribution(c.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Expenses' && (
        <div className="table-card">
          <table className="data-table" data-testid="expenses-table">
            <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {expenses.length === 0 && <tr><td colSpan={5} className="empty-row">No expenses recorded.</td></tr>}
              {expenses.map(e => (
                <tr key={e.id} data-testid="expense-row">
                  <td><strong>{e.description}</strong></td>
                  <td className="text-muted">{e.category || '-'}</td>
                  <td><span className="amount-red">{fmt(e.amount)}</span></td>
                  <td className="text-muted">{fmtDate(e.createdAt)}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn-icon btn-danger-sm" onClick={() => deleteExpense(e.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Overview' && (
        <div className="overview-grid">
          <div className="section-card">
            <h3>Recent Contributions</h3>
            {contributions.slice(0, 5).map(c => (
              <div key={c.id} className="ledger-row">
                <span>{c.memberName}</span>
                <span className="amount-green">{fmt(c.amount)}</span>
              </div>
            ))}
            {contributions.length === 0 && <p className="empty-text">None yet.</p>}
          </div>
          <div className="section-card">
            <h3>Recent Expenses</h3>
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="ledger-row">
                <span>{e.description}</span>
                <span className="amount-red">{fmt(e.amount)}</span>
              </div>
            ))}
            {expenses.length === 0 && <p className="empty-text">None yet.</p>}
          </div>
        </div>
      )}

      {showContribForm && (
        <div className="modal-overlay" onClick={() => setShowContribForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Record Contribution</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAddContribution} className="modal-form">
              <div className="form-group">
                <label>Member</label>
                <select value={cForm.memberId} onChange={e => setCForm(p => ({ ...p, memberId: e.target.value }))} required>
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (KES)</label>
                <input type="number" min="1" value={cForm.amount} onChange={e => setCForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 2000" required data-testid="contribution-amount" />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input type="text" value={cForm.note} onChange={e => setCForm(p => ({ ...p, note: e.target.value }))} placeholder="Monthly contribution..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowContribForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-contribution-btn">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpForm && (
        <div className="modal-overlay" onClick={() => setShowExpForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Record Expense</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAddExpense} className="modal-form">
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={eForm.description} onChange={e => setEForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Venue hire" required data-testid="expense-description" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={eForm.category} onChange={e => setEForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select...</option>
                  {['Venue', 'Catering', 'Transport', 'Stationery', 'Welfare', 'Other'].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (KES)</label>
                <input type="number" min="1" value={eForm.amount} onChange={e => setEForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 5000" required data-testid="expense-amount" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowExpForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-expense-btn">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
