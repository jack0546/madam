
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and About */}
          <div className="space-y-6">
            <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
              Elegance <span className="text-foreground">Boutique</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Elegance Boutique offers a curated selection of premium women's fashion accessories, from designer handbags to sophisticated high heels.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-headline text-lg font-bold">Shopping</h4>
            <ul className="space-y-4">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Handbags" className="text-muted-foreground hover:text-primary transition-colors">Luxury Handbags</Link></li>
              <li><Link href="/shop?category=High Heels" className="text-muted-foreground hover:text-primary transition-colors">Stiletto & Heels</Link></li>
              <li><Link href="/shop?category=Clutch Bags" className="text-muted-foreground hover:text-primary transition-colors">Evening Clutches</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-headline text-lg font-bold">Support</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+233 24 000 0000</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>hello@elegance.com</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Accra, Ghana</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-headline text-lg font-bold">Newsletter</h4>
            <p className="text-muted-foreground">Join our list for 10% off your first order and exclusive access to new arrivals.</p>
            <div className="flex flex-col space-y-3">
              <Input placeholder="Your email address" className="bg-muted border-none" />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Elegance Boutique. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
