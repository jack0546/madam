"use client"

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ExternalLink,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { formatCedis } from '@/lib/utils';

interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderDetail {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  productName: string;
  productId?: string;
  amount: number;
  quantity?: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  status: string;
  paymentReference: string;
  createdAt: any;
  notes?: string;
  formUrl?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  statusHistory?: StatusHistory[];
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

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { key: 'processing', label: 'Processing', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200' },
]

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders/' + id);
      return;
    }
  }, [authLoading, user, router, id]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      doc(db, 'orders', id),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as OrderDetail;
          setOrder(data);
          setError(null);
          
          const statusIndex = statusSteps.findIndex(s => s.key === data.status);
          setActiveStep(statusIndex >= 0 ? statusIndex : 0);
        } else {
          setError('Order not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to order:', err);
        setError('Failed to load order');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <Package className="w-16 h-16 text-muted-foreground mx-auto" />
            <h1 className="font-headline text-3xl font-bold">Order Not Found</h1>
            <p className="text-muted-foreground">
              {error || 'We could not find this order. Please check the link and try again.'}
            </p>
            <Button onClick={() => router.push('/account')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Account
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-gradient-to-tr from-[#FAF8F5] via-white to-[#F5F8FA]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/account')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </div>

          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex p-3 bg-primary/10 text-primary rounded-full mb-2">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Order Tracking
            </h1>
            <p className="text-muted-foreground text-lg font-light">
              Track your order in real-time
            </p>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono text-sm">#{order.id}</p>
              </div>
              <Badge className={`${getStatusColor(order.status)} border-0 text-sm px-3 py-1`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 hidden md:block"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {statusSteps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isCompleted = activeStep > idx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${
                        isActive || isCompleted
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {(order.trackingNumber || order.carrier || order.estimatedDelivery) && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-6">
              <h3 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {order.trackingNumber && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracking Number</p>
                    <p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.carrier && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Carrier</p>
                    <p className="text-sm font-medium">{order.carrier}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimated Delivery</p>
                    <p className="text-sm font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
              {order.trackingNumber && order.carrier && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(order.carrier + ' tracking ' + order.trackingNumber)}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                  Track on {order.carrier}
                </Button>
              )}
            </div>
          )}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 mb-6">
              <h3 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Tracking History
              </h3>
              <div className="space-y-4">
                {order.statusHistory.map((entry, idx) => {
                  const stepInfo = statusSteps.find(s => s.key === entry.status);
                  const StepIcon = stepInfo?.icon || Package;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stepInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        {idx < order.statusHistory!.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-100 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">
                          {stepInfo?.label || entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
            <h3 className="font-headline text-xl font-bold mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{order.userName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{order.userEmail}</p>
              </div>
              {order.userPhone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{order.userPhone}</p>
                </div>
              )}
              {order.userAddress && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{order.userAddress}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Order Items</h4>
              {order.cartItems && order.cartItems.length > 0 ? (
                <div className="space-y-3">
                  {order.cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-xs text-muted-foreground">
                            {[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">x{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">{formatCedis(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-sm text-muted-foreground">Qty: {order.quantity || 1}</p>
                </div>
              )}
              <div className="flex justify-between mt-3 pt-3 border-t">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{formatCedis(order.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
