import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

const requireDb = () => {
  if (!db) throw new Error('Firebase is not configured. Create .env.local with your VITE_FIREBASE_* values.')
  return db
}

const membersRef = db ? collection(db, 'members') : null
const contributionsRef = db ? collection(db, 'contributions') : null
const expensesRef = db ? collection(db, 'expenses') : null
const remindersRef = db ? collection(db, 'reminders') : null

export const getUserProfile = async (uid) => {
  if (!db) return null
  const profileRef = doc(db, 'profiles', uid)
  const snap = await getDoc(profileRef)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const upsertUserProfile = async (uid, profile) => {
  requireDb()
  const profileRef = doc(db, 'profiles', uid)
  return setDoc(profileRef, profile, { merge: true })
}

const makeSubscriber = (ref, orderField = 'createdAt', direction = 'desc') => (callback) => {
  if (!ref) {
    callback([])
    return () => {}
  }

  const q = query(ref, orderBy(orderField, direction))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  })
  return unsubscribe
}

export const subscribeToMembers = makeSubscriber(membersRef, 'joinedAt', 'desc')
export const subscribeToContributions = makeSubscriber(contributionsRef, 'createdAt', 'desc')
export const subscribeToExpenses = makeSubscriber(expensesRef, 'createdAt', 'desc')
export const subscribeToReminders = makeSubscriber(remindersRef, 'meetingDate', 'asc')

export const updateMemberRole = async (memberId, role) => {
  requireDb()
  const memberRef = doc(db, 'members', memberId)
  return updateDoc(memberRef, { role })
}

export const removeMember = async (memberId) => {
  requireDb()
  const memberRef = doc(db, 'members', memberId)
  return deleteDoc(memberRef)
}

export const addMember = async (member) => {
  requireDb()
  return addDoc(membersRef, {
    ...member,
    role: member.role || 'member',
    joinedAt: member.joinedAt || new Date().toISOString()
  })
}

export const addReminder = async (reminder) => {
  requireDb()
  return addDoc(remindersRef, { ...reminder, createdAt: new Date().toISOString() })
}

export const deleteReminder = async (reminderId) => {
  requireDb()
  const reminderRef = doc(db, 'reminders', reminderId)
  return deleteDoc(reminderRef)
}

export const updateReminder = async (reminderId, updates) => {
  requireDb()
  const reminderRef = doc(db, 'reminders', reminderId)
  return updateDoc(reminderRef, updates)
}

export const addContribution = async (contribution) => {
  requireDb()
  return addDoc(contributionsRef, { ...contribution, createdAt: new Date().toISOString() })
}

export const deleteContribution = async (contributionId) => {
  requireDb()
  const contributionRef = doc(db, 'contributions', contributionId)
  return deleteDoc(contributionRef)
}

export const addExpense = async (expense) => {
  requireDb()
  return addDoc(expensesRef, { ...expense, createdAt: new Date().toISOString() })
}

export const deleteExpense = async (expenseId) => {
  requireDb()
  const expenseRef = doc(db, 'expenses', expenseId)
  return deleteDoc(expenseRef)
}
