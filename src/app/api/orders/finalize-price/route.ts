import { NextRequest, NextResponse } from 'next/server';
import { ALL_PRODUCTS } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      if (item.productId) {
        const product = ALL_PRODUCTS.find((p) => p.id === item.productId);
        if (!product) {
          return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
        }
        const price = product.discountPrice || product.price;
        const itemTotal = price * (item.quantity || 1);
        total += itemTotal;
        validatedItems.push({
          ...item,
          price: product.discountPrice || null,
          finalPrice: price,
          itemTotal,
        });
      } else if (item.price) {
        total += item.price * (item.quantity || 1);
        validatedItems.push(item);
      }
    }

    return NextResponse.json({ 
      total, 
      validatedItems,
      currency: 'GHS'
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 });
  }
}