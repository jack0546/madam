"use client"

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Left: Logo + Wordmark */}
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Lithos</span>
      </div>

      {/* Center Pill (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        <button className="text-white px-4 py-1.5 rounded-full text-sm font-medium bg-white/10">Course</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Field Guides</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Geology</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Plans</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Live Tour</button>
      </div>

      {/* Right: Sign Up (Desktop) + Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
          Sign Up
        </button>
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[110] bg-black/95 md:hidden flex flex-col">
          <div className="flex justify-between items-center p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
              </svg>
              <span className="text-white text-2xl font-playfair italic">Lithos</span>
            </div>
            <button className="p-2 text-white" onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
            <button className="text-white text-2xl font-medium" onClick={() => setMobileOpen(false)}>Course</button>
            <button className="text-white/70 text-2xl font-medium" onClick={() => setMobileOpen(false)}>Field Guides</button>
            <button className="text-white/70 text-2xl font-medium" onClick={() => setMobileOpen(false)}>Geology</button>
            <button className="text-white/70 text-2xl font-medium" onClick={() => setMobileOpen(false)}>Plans</button>
            <button className="text-white/70 text-2xl font-medium" onClick={() => setMobileOpen(false)}>Live Tour</button>
            <div className="mt-8">
              <button className="bg-white text-gray-900 text-lg font-semibold px-10 py-3 rounded-full hover:bg-gray-100 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
