"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, Package, ExternalLink, Trash2, Plus, Truck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCedis, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ALL_PRODUCTS } from '@/lib/products';
import { Textarea } from '@/components/ui/textarea';
import { getIdToken } from 'firebase/auth';

interface Order {
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentReference: string;
  createdAt: any;
  notes?: string;
  formUrl?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
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

export default function AdminOrdersPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin/orders');
      return;
    }
    if (!authLoading && user && !isAdmin) {
      router.push('/shop');
      return;
    }
  }, [authLoading, user, isAdmin, router]);

  if (authLoading || !user || !isAdmin) {
    return null;
  }

  const debouncedSetSearchQuery = useDebounce((q: string) => {
    setSearchQuery(q);
  }, 300);

  useEffect(() => {
    if (!user || !isAdmin) return;
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to orders:', err);
      setLoading(false);
    });
    
    return () => unsub();
  }, [user, isAdmin]);

  useEffect(() => {
    if (selectedOrder) {
      setTrackingNumber(selectedOrder.trackingNumber || '');
      setCarrier(selectedOrder.carrier || '');
      setEstimatedDelivery(selectedOrder.estimatedDelivery || '');
      setAdminNotes(selectedOrder.notes || '');
    }
  }, [selectedOrder]);

  useEffect(() => {
    let filtered = orders
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(o => 
        o.userEmail.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }
    setFilteredOrders(filtered)
  }, [searchQuery, orders, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const token = user ? await getIdToken(user) : null;
      const updateData: any = { status }
      
      if (status === 'shipped' || status === 'delivered') {
        updateData.trackingNumber = trackingNumber
        updateData.carrier = carrier
        if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery
      }
      
      if (adminNotes) updateData.notes = adminNotes
      
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const sendEmailToCustomer = (order: Order) => {
    const subject = encodeURIComponent(`Your Elegance Boutique Order - ${order.productName}`)
    const body = encodeURIComponent(
      `Dear ${order.userName},\n\nThank you for your order of ${order.productName} (₵${order.amount.toFixed(2)}).\n\nWe will notify you once your order is shipped.\n\nBest regards,\nElegance Boutique`
    )
    window.open(`mailto:${order.userEmail}?subject=${subject}&body=${body}`)
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const token = user ? await getIdToken(user) : null;
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete order');
      }
      
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setFilteredOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow pt-24 pb-20 container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold">Orders Dashboard</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {orders.length} Total Orders
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, product, or order ID..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  debouncedSetSearchQuery(e.target.value);
                }}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-headline text-xl font-bold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? "No customer orders have been placed yet." 
                : "No orders match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-slate-400" />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div>
                        {order.cartItems && order.cartItems.length > 0 ? (
                          <>
                            <p className="font-medium truncate">{order.cartItems.length} item(s)</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {order.cartItems.map(i => i.name).join(', ')}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium truncate">{order.productName}</p>
                            {order.productId && (
                              <p className="text-xs text-muted-foreground">ID: {order.productId}</p>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
<TableCell className="font-bold">{formatCedis(order.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border-0`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-red-500 hover:text-red-700"
                           onClick={() => deleteOrder(order.id)}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                         <Dialog open={selectedOrder?.id === order.id} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                           <DialogTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-slate-500 hover:text-primary"
                               onClick={() => setSelectedOrder(order)}
                             >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-2xl">Order Details</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
                                    <p className="font-mono text-sm">#{selectedOrder.id}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                                    <select
                                      value={selectedOrder.status}
                                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                    </select>
                                  </div>
                                </div>

                                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Truck className="w-4 h-4" /> Shipping & Tracking
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Tracking Number</p>
                                        <Input
                                          value={trackingNumber}
                                          onChange={(e) => setTrackingNumber(e.target.value)}
                                          placeholder="e.g. TRK-123456"
                                          className="h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Carrier</p>
                                        <Input
                                          value={carrier}
                                          onChange={(e) => setCarrier(e.target.value)}
                                          placeholder="e.g. DHL, FedEx, UPS"
                                          className="h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                                        <Input
                                          type="date"
                                          value={estimatedDelivery}
                                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                                          className="h-9 text-sm"
                                        />
                                      </div>
                                    </div>
                                    {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-3 gap-2"
                                        onClick={() => {
                                          if (selectedOrder.trackingNumber && selectedOrder.carrier) {
                                            window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedOrder.carrier + ' tracking ' + selectedOrder.trackingNumber)}`, '_blank')
                                          }
                                        }}
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Track Package
                                      </Button>
                                    )}
                                  </div>
                                )}

                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Admin Notes
                                  </h4>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Internal notes about this order..."
                                    className="text-sm min-h-[80px]"
                                  />
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Customer Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Name</p>
                                      <p className="text-sm font-medium">{selectedOrder.userName}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Email</p>
                                      <p className="text-sm">{selectedOrder.userEmail}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Phone
                                      </p>
                                      <p className="text-sm">{selectedOrder.userPhone || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Address
                                      </p>
                                      <p className="text-sm">{selectedOrder.userAddress || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> Order Summary
                                  </h4>
                                  {selectedOrder.cartItems && selectedOrder.cartItems.length > 0 ? (
                                    <div className="space-y-3">
                                      {selectedOrder.cartItems.map((item, idx) => (
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
                                            <p className="font-medium">×{item.quantity}</p>
                                            <p className="text-xs text-muted-foreground">{formatCedis(item.price)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-muted-foreground">Product</span>
                                        <span className="font-medium block truncate">{selectedOrder.productName}</span>
                                        {selectedOrder.productId && (
                                          <span className="text-xs text-muted-foreground block">ID: {selectedOrder.productId}</span>
                                        )}
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quantity</span>
                                        <span className="font-medium">{selectedOrder.quantity || 1}</span>
                                      </div>
                                      {(selectedOrder.selectedSize || selectedOrder.selectedColor) && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Options</span>
                                          <span className="font-medium">
                                            {[selectedOrder.selectedSize, selectedOrder.selectedColor].filter(Boolean).join(' / ')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-between mt-3 pt-3 border-t">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-bold text-lg">{formatCedis(selectedOrder.amount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Ref</span>
                                    <span className="font-mono text-xs">{selectedOrder.paymentReference || 'N/A'}</span>
                                  </div>
                                </div>

                                {selectedOrder.notes && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Customer Notes</h4>
                                    <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg">
                                      {selectedOrder.notes}
                                    </p>
                                  </div>
                                )}

                                {selectedOrder.formUrl && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                      <ExternalLink className="w-4 h-4" /> Form Submission URL
                                    </h4>
                                    <div className="flex items-center gap-3">
                                      <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg flex-1 truncate">
                                        {selectedOrder.formUrl}
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.open(selectedOrder.formUrl, '_blank')}
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Open
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => sendEmailToCustomer(selectedOrder)}
                                    className="gap-2"
                                  >
                                    <Mail className="w-4 h-4" />
                                    Email Customer
                                  </Button>
                                  <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
