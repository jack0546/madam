"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown, Mail, Phone, MapPin, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { logoutUser } from '@/lib/firebase'
import { Button } from '@/components/ui/button'

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, userProfile, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || userProfile?.email || ''
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900">{displayName}</p>
            <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
          </div>

          <div className="px-4 py-3 space-y-2 border-b border-slate-100">
            {userProfile?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{userProfile.phone}</span>
              </div>
            )}
            {userProfile?.address && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{userProfile.address}</span>
              </div>
            )}
            {!userProfile?.phone && !userProfile?.address && (
              <p className="text-sm text-muted-foreground italic">No phone or address saved</p>
            )}
          </div>

          <div className="px-2 py-2 space-y-1">
            {isAdmin ? (
              <Link href="/admin/orders" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/account" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  My Account
                </Button>
              </Link>
            )}
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
