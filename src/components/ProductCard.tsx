'use client'

import { useCart } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Plus } from 'lucide-react'

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    })
  }

  return (
    <div className="group bg-white rounded-2xl border border-line overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.images[0] || '/placeholder.jpg'} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {product.isBestseller && (
          <span className="absolute top-4 left-4 bg-amber text-chocolate text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            Bestseller
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-1 mb-3">
          {product.dietaryTags.map((tag: string) => (
            <span key={tag} className="text-[9px] font-bold bg-cream text-chocolate/60 px-2 py-0.5 rounded-md border border-line">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="font-serif text-xl font-bold text-chocolate mb-2">{product.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-chocolate">{formatCurrency(product.price)}</span>
            {product.salePrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatCurrency(product.salePrice)}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="bg-chocolate text-white p-3 rounded-xl hover:bg-accent transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
