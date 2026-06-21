"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Heart, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, isAdmin } = useAuth();
  
  const router = useRouter();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-2",
      isScrolled || searchOpen ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 relative">
        {/* Search Overlay inside Header */}
        {searchOpen && (
          <form 
            onSubmit={handleSearchSubmit} 
            className="absolute inset-0 bg-background flex items-center z-50 animate-in fade-in slide-in-from-top duration-200"
          >
            <div className="flex items-center w-full gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search handbags, high heels, clutches..." 
                className="flex-grow border-none shadow-none focus-visible:ring-0 text-base md:text-lg h-10 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            Elegance <span className="text-foreground">Boutique</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">Shop All</Link>
          <Link href="/handbags" className="text-sm font-medium hover:text-primary transition-colors">Handbags</Link>
          <Link href="/heels" className="text-sm font-medium hover:text-primary transition-colors">High Heels</Link>
          <Link href="/clutches" className="text-sm font-medium hover:text-primary transition-colors">Clutches</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="flex">
            <Search className="w-5 h-5" />
          </Button>
          {user ? (
            isAdmin ? (
              <Link href="/admin/orders">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Link href="/shop?trending=true">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-background z-[60] transition-transform duration-300 md:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex justify-between items-center border-b">
          <span className="font-headline text-xl font-bold">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col p-6 space-y-6">
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">All Collections</Link>
          <Link href="/handbags" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Handbags</Link>
          <Link href="/heels" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">High Heels</Link>
          <Link href="/clutches" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Clutch Bags</Link>
          <hr />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg text-muted-foreground">My Account</Link>
          <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="text-lg text-muted-foreground">Shopping Bag ({cartCount})</Link>
        </div>
      </div>
    </header>
  );
}
