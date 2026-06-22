"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';
import { formatCedis } from '@/lib/utils';

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shipping, 
    total 
  } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl font-bold mb-10 text-center">Your Shopping Bag</h1>
          
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-xl text-muted-foreground">Your shopping bag is currently empty.</p>
              <Link href="/shop">
                <Button size="lg" className="rounded-full px-12">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-6">
                {cart.map((item) => {
                  const price = item.discountPrice || item.price;
                  return (
                    <div key={`${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`} className="flex gap-4 p-4 bg-white rounded-xl border shadow-sm group">
                      <div className="w-24 h-32 relative flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
                        <Image 
                          src={item.images[0]} 
                          alt={item.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                              <h3 className="font-headline text-lg font-bold">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.category}</p>
                            <p className="text-sm text-slate-500 font-light">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' | '}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          </div>
                          <p className="font-bold text-lg">{formatCedis(price)}</p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded-lg overflow-hidden h-9 bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm border-x h-full flex items-center justify-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link href="/shop" className="inline-flex items-center text-primary font-medium hover:underline gap-2 mt-4">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border p-8 shadow-sm space-y-6 sticky top-24">
                  <h2 className="font-headline text-2xl font-bold">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCedis(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : formatCedis(shipping)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold pt-2">
                      <span>Estimated Total</span>
                      <span>{formatCedis(total)}</span>
                    </div>
                  </div>

<div className="space-y-3 pt-4">
                     <Link href={`/checkout?amount=${total.toFixed(2)}`}>
                       <Button className="w-full h-14 text-lg rounded-xl shadow-lg">Checkout Now</Button>
                     </Link>
                     <p className="text-center text-xs text-muted-foreground pt-2">
                       By proceeding to checkout, you agree to our Terms & Conditions and Privacy Policy.
                     </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
