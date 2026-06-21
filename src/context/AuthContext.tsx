"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  adminEmail: string
  userProfile: any
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  adminEmail: 'narhsnazzisco@gmail.com',
  userProfile: null,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const adminEmail = 'narhsnazzisco@gmail.com'

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data())
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user?.uid) {
      await fetchUserProfile(user.uid)
    }
  }

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
            setUserProfile(userData || null)
          } catch {
            setIsAdmin(false)
            setUserProfile(null)
          }
        } else {
          setIsAdmin(true)
          setUserProfile({
            name: 'Admin User',
            email: adminEmail,
            phone: '',
            address: '',
            role: 'admin'
          })
        }
      } else {
        setIsAdmin(false)
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, adminEmail, userProfile, refreshProfile }}>
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
