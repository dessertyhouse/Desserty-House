import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Settings, MessageSquare, Tag, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F3EEE7]">
      {/* Sidebar */}
      <aside className="w-64 bg-chocolate text-cream p-6 flex flex-col fixed inset-y-0">
        <div className="mb-10">
          <Link href="/admin" className="font-serif text-2xl font-bold flex items-center gap-2">
            DH <span className="text-amber">Admin</span>
          </Link>
          <small className="block text-[10px] tracking-[2px] uppercase text-amber mt-1">Management Portal</small>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink href="/admin/products" icon={<ShoppingBag size={20} />} label="Products" />
          <SidebarLink href="/admin/categories" icon={<Tag size={20} />} label="Categories" />
          <SidebarLink href="/admin/reviews" icon={<MessageSquare size={20} />} label="Reviews" />
          <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Site Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-cream/10">
          <Link href="/" className="flex items-center gap-3 text-cream/70 hover:text-white mb-4">
            <LayoutDashboard size={20} /> View Storefront
          </Link>
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full text-left">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function SidebarLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors font-medium text-cream/80 hover:text-white"
    >
      {icon}
      {label}
    </Link>
  )
}
