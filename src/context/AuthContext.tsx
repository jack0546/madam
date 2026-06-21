"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  adminEmail: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  adminEmail: 'narhsnazzisco@gmail.com',
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const adminEmail = 'narhsnazzisco@gmail.com'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase() || ''
        const isAdminByEmail = email === adminEmail.toLowerCase()
        
        if (!isAdminByEmail) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            const userData = userDoc.data()
            setIsAdmin(userData?.role === 'admin')
          } catch {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(true)
        }
      } else {
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, adminEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
