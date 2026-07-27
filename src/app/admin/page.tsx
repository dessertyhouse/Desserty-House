import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import { AlertCircle, CheckCircle2, ShoppingCart, MessageSquare, TrendingUp, Tag, ShoppingBag } from 'lucide-react'

export default async function AdminDashboard() {
  const productCount = await prisma.product.count()
  const reviewCount = await prisma.review.count()
  const categoryCount = await prisma.category.count()
  const settings = await getSiteSettings()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">Welcome Back, Admin</h1>
        <p className="text-gray-600">Here's what's happening at Desserty House today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Products" value={productCount} icon={<ShoppingBag className="text-amber" />} />
        <KPICard title="Categories" value={categoryCount} icon={<Tag className="text-amber" />} />
        <KPICard title="Pending Reviews" value={reviewCount} icon={<MessageSquare className="text-amber" />} />
        <KPICard title="WhatsApp Orders" value="N/A" icon={<TrendingUp className="text-amber" />} subtitle="Tracked via WA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Automation Status */}
        <div className="bg-white p-6 rounded-2xl border border-line shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-chocolate mb-6 flex items-center gap-2">
            Automation Status
          </h2>
          <div className="space-y-4">
            <StatusItem label="Direct WhatsApp Ordering" active={true} description="Main ordering flow is active" />
            <StatusItem label="Automated Emails" active={settings.enableAutomatedEmails} description="Phase 2 Feature" />
            <StatusItem label="Payment Gateway" active={settings.enableOnlinePayments} description="Phase 2 Feature" />
            <StatusItem label="Live Tracking" active={settings.enableAutoOrderTrack} description="Phase 2 Feature" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-line shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-chocolate mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionBtn label="Add New Product" href="/admin/products/new" />
            <QuickActionBtn label="Edit Hero Banner" href="/admin/settings" />
            <QuickActionBtn label="View Storefront" href="/" />
            <QuickActionBtn label="Manage Reviews" href="/admin/reviews" />
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-line shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-cream rounded-lg">{icon}</div>
      </div>
      <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</span>
      <div className="text-3xl font-bold text-chocolate mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    </div>
  )
}

function StatusItem({ label, active, description }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#FDFBF9] rounded-xl border border-line/50">
      <div>
        <div className="font-bold text-chocolate text-sm">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      {active ? (
        <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
          <CheckCircle2 size={12} /> ACTIVE
        </span>
      ) : (
        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-50 px-2 py-1 rounded-full">
          <AlertCircle size={12} /> DISABLED
        </span>
      )}
    </div>
  )
}

function QuickActionBtn({ label, href }: any) {
  return (
    <a href={href} className="flex items-center justify-center p-4 bg-cream text-chocolate font-bold rounded-xl border border-line hover:bg-amber hover:border-amber transition-colors text-sm text-center">
      {label}
    </a>
  )
}


