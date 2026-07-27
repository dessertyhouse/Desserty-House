import { prisma } from '@/lib/prisma'
import { Check, X, Star, Heart } from 'lucide-react'

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">Customer Reviews</h1>
        <p className="text-gray-600">Approve, feature, or manage customer feedback.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-line text-center text-gray-500">
            No reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`bg-white p-6 rounded-2xl border transition-all ${review.isApproved ? 'border-line' : 'border-amber bg-amber/5'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center font-serif text-xl font-bold text-chocolate">
                    {review.userName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-chocolate">{review.userName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      on <span className="font-semibold text-chocolate">{review.product.title}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? 'fill-amber' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              
              <p className="text-chocolate/80 italic mb-6">"{review.comment}"</p>
              
              <div className="flex justify-between items-center border-t border-line pt-4">
                <div className="flex gap-4">
                  {review.isApproved ? (
                    <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition">
                      <X size={14} /> Unapprove
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 transition">
                      <Check size={14} /> Approve Review
                    </button>
                  )}
                  
                  <button className={`flex items-center gap-2 text-xs font-bold transition ${review.isFeatured ? 'text-accent' : 'text-gray-400 hover:text-accent'}`}>
                    <Heart size={14} className={review.isFeatured ? 'fill-accent' : ''} /> 
                    {review.isFeatured ? 'Featured on Home' : 'Feature on Home'}
                  </button>
                </div>
                
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
