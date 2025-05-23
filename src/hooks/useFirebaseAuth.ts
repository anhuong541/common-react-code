import { useState, useEffect } from 'react'

import { User, onAuthStateChanged } from 'firebase/auth'

import { auth } from '@/lib/firebase'

type FirebaseAuthState = {
  user: User | null
  loading: boolean
}

export const useFirebaseAuth = (): FirebaseAuthState => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
