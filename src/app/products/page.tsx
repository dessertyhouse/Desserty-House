import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import ProductListing from '@/components/ProductListing'
import SiteHeader from '@/components/SiteHeader'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<any> }) {
  const sParams = await searchParams
  const settings = await getSiteSettings()
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-chocolate mb-4">Our Menu</h1>
          <p className="text-chocolate/60 max-w-2xl">Browse our full collection of artisanal treats. All items are baked fresh to order and delivered to your doorstep.</p>
        </div>

        <ProductListing initialProducts={products} />
      </main>

      <footer className="bg-chocolate text-cream py-16 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-serif text-3xl font-bold mb-6">Can't find what you're looking for?</h3>
          <p className="text-cream/70 max-w-md mx-auto mb-8">
            We specialize in custom orders for birthdays, weddings, and special events.
          </p>
          <a 
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi! I'd like to inquire about a custom cake order.`}
            className="inline-block bg-amber text-chocolate px-10 py-4 rounded-full font-bold hover:bg-white transition shadow-lg"
          >
            Inquire for Custom Cakes
          </a>
        </div>
      </footer>
    </div>
  )
}
