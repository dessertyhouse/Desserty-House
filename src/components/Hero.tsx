'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function Hero({ settings }: { settings: any }) {
  return (
    <section className="relative min-h-[600px] flex items-center bg-[#FFFDF9] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9] via-[#FFFDF9]/80 to-transparent z-10" />
        <img 
          src="https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp" 
          alt="Desserty House Showcase" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-2xl">
          <span className="inline-block text-amber font-bold tracking-[3px] uppercase text-sm mb-4">
            Artisanal & Handcrafted
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-chocolate leading-tight mb-6">
            {settings.heroTitle}
          </h1>
          <p className="text-xl text-chocolate/80 mb-10 max-w-lg leading-relaxed">
            {settings.heroSubtitle}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/products" 
              className="bg-chocolate text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-chocolate/20"
            >
              <ShoppingBag size={20} /> Browse Menu
            </Link>
            <Link 
              href="/custom-cakes" 
              className="bg-white border-2 border-chocolate text-chocolate px-8 py-4 rounded-full font-bold text-lg hover:bg-cream transition"
            >
              Custom Inquiry
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap gap-6 items-center text-sm font-bold text-chocolate/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Egg & Eggless Choices
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Made to Order
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              Chennai Delivery
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
