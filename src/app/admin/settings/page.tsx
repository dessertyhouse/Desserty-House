import { getSiteSettings } from '@/lib/settings'
import SettingsClient from './SettingsClient'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold text-chocolate mb-2">Site Settings</h1>
        <p className="text-gray-600">Configure your storefront, contact details, and automation preferences.</p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  )
}
