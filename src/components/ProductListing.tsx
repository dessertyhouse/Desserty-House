'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import { Search, Filter } from 'lucide-react'

export default function ProductListing({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [dietary, setDietary] = useState<string[]>([])

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filter === 'All' || p.category.name === filter
    const matchesDietary = dietary.length === 0 || dietary.every(d => p.dietaryTags.includes(d))
    
    return matchesSearch && matchesCategory && matchesDietary
  })

  const toggleDietary = (tag: string) => {
    setDietary(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const categories = ['All', ...Array.from(new Set(initialProducts.map(p => p.category.name)))]

  return (
    <div className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for cakes, cupcakes, pastries..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-line bg-white focus:ring-amber focus:border-amber transition shadow-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white px-6 py-4 rounded-2xl border border-line font-bold text-chocolate hover:bg-cream transition shadow-sm appearance-none cursor-pointer pr-10 outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Eggless', 'Vegan', 'Gluten-Free', 'Bestsellers'].map(tag => (
            <button 
              key={tag}
              onClick={() => tag === 'Bestsellers' ? null : toggleDietary(tag)}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition ${
                dietary.includes(tag) ? 'bg-amber border-amber text-chocolate' : 'bg-white border-line text-chocolate/60 hover:border-amber'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found matching your criteria.
        </div>
      )}
    </div>
  )
}
