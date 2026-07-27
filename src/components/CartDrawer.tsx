'use client'

import { useCart } from '@/lib/store'
import { formatCurrency, generateWhatsAppLink, generateEmailLink } from '@/lib/utils'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

export default function CartDrawer({ isOpen, onClose, settings }: { isOpen: boolean, onClose: () => void, settings: any }) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  
  if (!isOpen) return null

  const handleWhatsAppOrder = () => {
    const link = generateWhatsAppLink(settings.whatsappNumber, items, totalPrice())
    window.open(link, '_blank')
  }

  const handleEmailOrder = () => {
    const link = generateEmailLink(settings.supportEmail, items, totalPrice())
    window.location.href = link
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-serif font-bold text-chocolate flex items-center gap-2">
              <ShoppingBag size={20} /> Your Cart
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-chocolate">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Your cart is empty. Start adding some treats!
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-chocolate">{item.title}</h3>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full border hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full border hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                    <X size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t bg-cream">
              <div className="flex justify-between mb-4 font-bold text-lg text-chocolate">
                <span>Total</span>
                <span>{formatCurrency(totalPrice())}</span>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  Order via WhatsApp
                </button>
                
                <button 
                  onClick={handleEmailOrder}
                  className="w-full bg-chocolate text-white py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Order via Email
                </button>
              </div>
              <p className="text-xs text-center mt-4 text-gray-500">
                Direct contact via WhatsApp or Email only. No automated payments yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
