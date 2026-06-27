import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDocs, query, where, orderBy, deleteDoc, getDoc } from 'firebase/firestore';
import { ALL_PRODUCTS, getProductByName } from '@/lib/products';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      email, 
      fullName, 
      phone, 
      address, 
      productName: productNameParam,
      productId: productIdParam,
      quantity, 
      selectedSize, 
      selectedColor, 
      paymentReference,
      cartItems 
    } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    let orderAmount = 0;
    let productName = '';

    if (cartItems && cartItems.length > 0) {
      orderAmount = cartItems.reduce((acc: number, item: any) => 
        acc + ((item.discountPrice || item.price) * item.quantity), 0
      );
      productName = 'Shopping Bag Order';
    } else if (productNameParam) {
      const product = getProductByName(productNameParam);
      if (!product && productIdParam) {
        const productById = ALL_PRODUCTS.find((p: any) => p.id === productIdParam);
        if (productById) {
          const price = productById.discountPrice || productById.price;
          orderAmount = price * (quantity || 1);
          productName = productById.name;
        }
      } else if (product) {
        const price = product.discountPrice || product.price;
        orderAmount = price * (quantity || 1);
        productName = product.name;
      }
    } else if (productIdParam) {
      const product = ALL_PRODUCTS.find((p: any) => p.id === productIdParam);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const price = product.discountPrice || product.price;
      orderAmount = price * (quantity || 1);
      productName = product.name;
    }

    if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const orderData = {
      userId: userId || `guest_${Date.now()}`,
      userEmail: email,
      userName: fullName,
      userPhone: phone || '',
      userAddress: address || '',
      productName,
      productId: productIdParam || null,
      amount: orderAmount,
      quantity: quantity || (cartItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1),
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      status: 'pending',
      paymentReference: paymentReference || '',
      paymentStatus: 'success',
      createdAt: serverTimestamp(),
    };

    const orderDoc = await addDoc(collection(db, 'orders'), orderData);

    const uid = orderData.userId;
    if (!uid.startsWith('guest_')) {
      await updateDoc(doc(db, 'users', uid), {
        orders: arrayUnion(orderDoc.id),
      });
    }

    return NextResponse.json({ success: true, message: 'Order created successfully' });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const ordersRef = collection(db, 'orders');
    let q;

    if (userId) {
      q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
      q = query(ordersRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'orders', orderId));

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, trackingNumber, carrier, estimatedDelivery, notes } = body;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;
    if (notes !== undefined) updateData.notes = notes;

    if (status === 'shipped') {
      updateData.shippedAt = new Date().toISOString();
    }
    if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const existingHistory = orderSnap.data().statusHistory || [];
    if (status) {
      updateData.statusHistory = [
        ...existingHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          note: notes || undefined,
        },
      ];
    }

    await updateDoc(orderRef, updateData);

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}