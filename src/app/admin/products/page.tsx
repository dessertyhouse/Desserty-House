import { prisma } from '@/lib/prisma'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">Products</h1>
          <p className="text-gray-600">Manage your bakery menu and inventory.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-chocolate text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} /> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FDFBF9] border-b border-line">
            <tr>
              <th className="px-6 py-4 font-bold text-chocolate text-sm uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 font-bold text-chocolate text-sm uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 font-bold text-chocolate text-sm uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 font-bold text-chocolate text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-bold text-chocolate text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-cream/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-line" />
                    <div>
                      <div className="font-bold text-chocolate flex items-center gap-2">
                        {product.title}
                        {product.isBestseller && <Star size={14} className="fill-amber text-amber" />}
                      </div>
                      <div className="text-xs text-gray-500">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm bg-cream px-2 py-1 rounded border border-line">{product.category.name}</span>
                </td>
                <td className="px-6 py-4 font-bold text-chocolate">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4">
                  {product.isAvailable ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">In Stock</span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Sold Out</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-chocolate transition"><Edit2 size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
