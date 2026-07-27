import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import SiteHeader from '@/components/SiteHeader'
import { getSiteSettings } from '@/lib/settings'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const settings = await getSiteSettings()
  const bestsellers = await prisma.product.findMany({
    where: { isBestseller: true, isAvailable: true },
    take: 4,
    include: { category: true }
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />
      
      <main>
        <Hero settings={settings} />
        
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-amber font-bold tracking-[2px] uppercase text-xs">Customer Favorites</span>
              <h2 className="font-serif text-4xl md:text-5xl text-chocolate mt-4">Our Bestselling Treats</h2>
              <div className="w-20 h-1 bg-accent mx-auto mt-6 rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-cream border-y border-line">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-serif text-4xl text-chocolate">Explore Our Categories</h2>
                <p className="text-chocolate/70 mt-4 max-w-md">From artisan cakes to delicate pastries, find the perfect sweet treat for any occasion.</p>
              </div>
              <a href="/products" className="text-chocolate font-bold border-b-2 border-amber pb-1 hover:text-accent hover:border-accent transition">
                View Full Menu
              </a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Cakes', 'Cupcakes', 'Pastries', 'Specials'].map((cat) => (
                <div key={cat} className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-md">
                  <div className="absolute inset-0 bg-chocolate/40 group-hover:bg-chocolate/20 transition duration-300 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="text-white font-serif text-2xl font-bold">{cat}</span>
                  </div>
                  <img src={`https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

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
    </div>
  )
}
