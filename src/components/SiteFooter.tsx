'use client'

import { formatCurrency } from '@/lib/utils'

export default function SiteFooter({ settings }: { settings: any }) {
  return (
    <footer className="bg-chocolate text-cream py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-serif text-3xl font-bold mb-6">Desserty House</h3>
          <p className="text-cream/70 max-w-sm mb-8 leading-relaxed">
            We bake happiness daily using only the finest ingredients. Artisanal treats delivered straight to your door.
          </p>
          <div className="flex gap-4">
            <span className="font-bold text-amber">Order via:</span>
            <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} className="underline hover:text-amber transition">WhatsApp</a>
            <a href={`mailto:${settings.supportEmail}`} className="underline hover:text-amber transition">Email</a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-wider text-sm mb-6 text-amber">Shop</h4>
          <ul className="space-y-4 text-cream/80 font-medium">
            <li><a href="/products" className="hover:text-amber transition">All Desserts</a></li>
            <li><a href="/custom-cakes" className="hover:text-amber transition">Custom Cakes</a></li>
            <li><a href="/wedding-cakes" className="hover:text-amber transition">Wedding Cakes</a></li>
            <li><a href="/showcase" className="hover:text-amber transition">Gallery</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-wider text-sm mb-6 text-amber">Support</h4>
          <ul className="space-y-4 text-cream/80 font-medium">
            <li><a href="/faq" className="hover:text-amber transition">FAQs</a></li>
            <li><a href="/contact" className="hover:text-amber transition">Contact Us</a></li>
            <li><a href="/privacy" className="hover:text-amber transition">Privacy Policy</a></li>
            <li><a href="/shipping-policy" className="hover:text-amber transition">Shipping Info</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-cream/10 mt-16 pt-8 text-center text-sm text-cream/40">
        © {new Date().getFullYear()} Desserty House. All treats reserved.
      </div>
    </footer>
  )
}
