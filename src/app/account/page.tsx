"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  LogOut,
  Loader2,
  ExternalLink,
  FileText,
  Globe,
  ShoppingBag,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { logoutUser, updateUserEmail } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { formatCedis, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: any;
  userPhone?: string;
  userAddress?: string;
  userRegion?: string;
  notes?: string;
  formUrl?: string;
  trackingNumber?: string;
  carrier?: string;
  cartItems?: Array<{
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
    category?: string;
  }>;
}

export default function AccountPage() {
  const { user, userProfile, isAdmin, refreshProfile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account');
      return;
    }

    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
      });
    }
  }, [user, userProfile, router]);

  const prevOrdersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'orders'),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];
          setOrders(orders);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const showStatusUpdate = (order: Order) => {
    const statusLabels: Record<string, string> = {
      pending: 'Order Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };

    const statusMessages: Record<string, string> = {
      pending: 'Your order has been received',
      processing: 'Your order is being processed',
      shipped: order.trackingNumber 
        ? `Your order is on the way! Tracking: ${order.trackingNumber}` 
        : 'Your order has been shipped',
      delivered: 'Your order has been delivered',
    };

    toast({
      title: `Order Update: ${statusLabels[order.status]}`,
      description: statusMessages[order.status] || 'Order status updated',
    });
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };
      
      if (formData.email && formData.email !== user.email) {
        updateData.email = formData.email;
        const result = await updateUserEmail(user, formData.email);
        if (!result.success) {
          console.warn('Email update in auth failed, updating Firestore only:', result.error);
        }
      }
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-gradient-to-tr from-[#FAF8F5] via-white to-[#F5F8FA]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10 space-y-3">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              My Account
            </h1>
            <p className="text-muted-foreground text-lg font-light">
              Manage your profile and view order history
            </p>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                    {(userProfile?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold">
                      {userProfile?.name || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-medium">{userProfile?.name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-medium">{userProfile?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
                        <p className="text-sm font-medium">{userProfile?.address || 'Not set'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full mt-4"
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        disabled={!!user?.email}
                      />
                      {user?.email && (
                        <p className="text-xs text-muted-foreground">
                          Email is linked to your authentication provider.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+233 24 000 0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your full delivery address"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSaving} className="flex-1">
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-primary" />
                  <h3 className="font-headline text-2xl font-bold">Order History</h3>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-headline text-xl font-bold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Button onClick={() => router.push('/shop')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-slate-100 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-grow">
                             <div className="flex items-start justify-between mb-2">
                               <div>
                                 {order.cartItems && order.cartItems.length > 0 ? (
                                   <div className="space-y-1">
                                     {order.cartItems.map((item, idx) => (
                                       <h4 key={idx} className="font-semibold text-lg">{item.name}</h4>
                                     ))}
                                   </div>
                                 ) : (
                                   <h4 className="font-semibold text-lg">{order.productName}</h4>
                                 )}
                                 <p className="text-sm text-muted-foreground">
                                   Order #{order.id.slice(0, 8)}
                                 </p>
                               </div>
                              <Badge className={`${getStatusColor(order.status)} border-0`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {formatCedis(order.amount || 0)}
                              </span>
                              <span>
                                {formatDate(order.createdAt) || 'N/A'}
                              </span>
                            </div>
                             <div className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
                               <ArrowRight className="w-3 h-3" />
                               Track Order
                             </div>
                             <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                {order.userAddress && (
                                  <p className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {order.userAddress}
                                  </p>
                                )}
                                {order.userRegion && (
                                  <p className="flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    {order.userRegion}
                                  </p>
                                )}
                                {order.userPhone && (
                                 <p className="flex items-center gap-2">
                                   <Phone className="w-3 h-3" />
                                   {order.userPhone}
                                 </p>
                               )}
                               {order.cartItems && order.cartItems.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                   {order.cartItems.map((item, idx) => (
                                     <p key={idx} className="flex items-center gap-2">
                                       <ShoppingBag className="w-3 h-3" />
                                       {item.name} × {item.quantity}
                                       {(item.selectedSize || item.selectedColor) && (
                                         <span className="text-slate-500">
                                           ({[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ')})
                                         </span>
                                       )}
                                     </p>
                                   ))}
                                 </div>
                               )}
                               {order.notes && (
                                 <p className="flex items-start gap-2">
                                   <FileText className="w-3 h-3 mt-0.5" />
                                   {order.notes}
                                 </p>
                               )}
                               {order.formUrl && (
                                 <a
                                   href={order.formUrl}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-2 text-primary hover:underline"
                                 >
                                   <ExternalLink className="w-3 h-3" />
                                   View submitted form
                                 </a>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
