"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { isAdminEmail, getUserRole } from '@/lib/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (!firebaseUser) {
        router.push('/login?redirect=/admin/orders');
        return;
      }
      
      const email = firebaseUser.email?.toLowerCase() || ''
      const adminByEmail = isAdminEmail(email)
      
      if (!adminByEmail) {
        const role = await getUserRole(firebaseUser.uid)
        if (role !== 'admin') {
          router.push('/shop');
          return;
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
