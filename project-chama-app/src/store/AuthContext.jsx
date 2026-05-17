/* eslint-disable react-refresh/only-export-components */
// src/store/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { inMemoryPersistence, onAuthStateChanged, setPersistence, signInWithPopup, signOut } from 'firebase/auth'
import { auth, firebaseConfigError, googleProvider } from '../utils/firebase'
import { getUserProfile, upsertUserProfile } from '../utils/firestoreService'

const AuthContext = createContext(null)
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)   // Firebase auth user
  const [profile, setProfile] = useState(null)   // Firestore profile (includes role)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const prof = await getUserProfile(firebaseUser.uid)
        setProfile(prof)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error(`Missing Firebase config: ${firebaseConfigError.join(', ')}`)
    }

    await setPersistence(auth, inMemoryPersistence)
    const result = await signInWithPopup(auth, googleProvider)
    const fu = result.user

    // Create profile if first login
    const existing = await getUserProfile(fu.uid)
    if (!existing) {
      await upsertUserProfile(fu.uid, {
        name:      fu.displayName,
        email:     fu.email,
        photoURL:  fu.photoURL,
        role:      'member',   // default role; admin upgrades manually
        joinedAt:  new Date().toISOString()
      })
    }

    const prof = await getUserProfile(fu.uid)
    setUser(fu)
    setProfile(prof)
    return { user: fu, profile: prof }
  }

  const signInAsAdmin = async (requestedAdminPassword) => {
    if (!requestedAdminPassword?.trim()) {
      throw new Error('Please enter the admin password.')
    }
    if (!adminPassword) {
      throw new Error('Admin password is not configured.')
    }
    if (requestedAdminPassword !== adminPassword) {
      throw new Error('Invalid admin password.')
    }

    const adminUser = {
      uid: 'local-admin',
      displayName: 'Administrator',
      email: 'admin@chama.local'
    }
    const adminProfile = {
      id: adminUser.uid,
      name: 'Administrator',
      email: adminUser.email,
      role: 'admin',
      joinedAt: new Date().toISOString()
    }

    setUser(adminUser)
    setProfile(adminProfile)
    return { user: adminUser, profile: adminProfile }
  }

  const logout = async () => {
    if (!auth) return
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, firebaseConfigError, signInWithGoogle, signInAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
