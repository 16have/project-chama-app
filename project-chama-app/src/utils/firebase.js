import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

const invalidConfig = [
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIza')
    ? 'VITE_FIREBASE_API_KEY should start with AIza'
    : null,
  firebaseConfig.appId && !firebaseConfig.appId.startsWith('1:')
    ? 'VITE_FIREBASE_APP_ID should look like 1:430613946585:web:...'
    : null,
  firebaseConfig.storageBucket?.includes('@')
    ? 'VITE_FIREBASE_STORAGE_BUCKET should be a bucket name, not an email address'
    : null,
].filter(Boolean)

export const firebaseConfigError = [...missingConfig, ...invalidConfig]

const app = firebaseConfigError.length === 0 ? initializeApp(firebaseConfig) : null
const authInstance = app ? getAuth(app) : null

if (authInstance) {
  setPersistence(authInstance, inMemoryPersistence)
}

export const auth = authInstance
export const googleProvider = new GoogleAuthProvider()
export const db = app ? getFirestore(app) : null
