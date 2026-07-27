'use client'

import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/store'
import CartDrawer from './CartDrawer'

export default function SiteHeader({ settings }: { settings: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40">
        {settings.announcementActive && (
          <div className="bg-chocolate text-amber text-center text-sm py-2 px-4 font-bold">
            {settings.announcementText}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
              <Link href="/" className="font-serif text-2xl font-bold text-chocolate">
                Desserty House
                <small className="block text-[10px] uppercase tracking-[3px] text-amber -mt-1 font-sans">
                  Freshly Baked Happiness
                </small>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="/products" className="text-chocolate font-semibold hover:text-accent transition">Shop Menu</Link>
              <Link href="/about" className="text-chocolate font-semibold hover:text-accent transition">Our Story</Link>
              <Link href="/contact" className="text-chocolate font-semibold hover:text-accent transition">Contact</Link>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-chocolate hover:text-accent transition"
              >
                <ShoppingCart size={24} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems()}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-chocolate hover:text-accent transition"
              >
                <ShoppingCart size={24} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems()}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-chocolate"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/products" className="block px-3 py-4 text-chocolate font-bold border-b" onClick={() => setIsMenuOpen(false)}>Shop Menu</Link>
              <Link href="/about" className="block px-3 py-4 text-chocolate font-bold border-b" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
              <Link href="/contact" className="block px-3 py-4 text-chocolate font-bold border-b" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        settings={settings}
      />
    </>
  )
}
