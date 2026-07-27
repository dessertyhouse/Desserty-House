'use client'

import { useState } from 'react'

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage('Error saving settings.')
      }
    } catch (err) {
      setMessage('Error saving settings.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
        <h2 className="text-xl font-serif font-bold text-chocolate mb-4 border-b pb-2">Automation Control Center (Feature Flags)</h2>
        <p className="text-sm text-gray-600 mb-6 italic">Manage advanced automations. All default to OFF for Phase 1.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureToggle 
            label="Enable Automated Emails" 
            active={settings.enableAutomatedEmails} 
            onToggle={() => toggleFeature('enableAutomatedEmails')} 
          />
          <FeatureToggle 
            label="Enable Online Payment Gateways" 
            active={settings.enableOnlinePayments} 
            onToggle={() => toggleFeature('enableOnlinePayments')} 
          />
          <FeatureToggle 
            label="Enable Automated Order Tracking" 
            active={settings.enableAutoOrderTrack} 
            onToggle={() => toggleFeature('enableAutoOrderTrack')} 
          />
          {/* Add more as needed */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
        <h2 className="text-xl font-serif font-bold text-chocolate mb-4 border-b pb-2">Storefront & Contact Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-chocolate mb-1">WhatsApp Number (Orders Destination)</label>
            <input 
              type="text" 
              value={settings.whatsappNumber} 
              onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-chocolate mb-1">Support Email</label>
            <input 
              type="email" 
              value={settings.supportEmail} 
              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="orders@dessertyhouse.com"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
        <h2 className="text-xl font-serif font-bold text-chocolate mb-4 border-b pb-2">Hero & Announcement Bar</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-chocolate mb-1">Hero Title</label>
            <input 
              type="text" 
              value={settings.heroTitle} 
              onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-chocolate mb-1">Hero Subtitle</label>
            <textarea 
              value={settings.heroSubtitle} 
              onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
              className="w-full p-2 border rounded min-h-[80px]"
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <input 
              type="checkbox" 
              checked={settings.announcementActive} 
              onChange={() => setSettings({...settings, announcementActive: !settings.announcementActive})}
              className="w-5 h-5 accent-amber"
            />
            <label className="text-sm font-bold text-chocolate">Show Announcement Bar</label>
          </div>
          <div>
            <label className="block text-sm font-bold text-chocolate mb-1">Announcement Text</label>
            <input 
              type="text" 
              value={settings.announcementText || ''} 
              onChange={(e) => setSettings({...settings, announcementText: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-chocolate text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <span className={message.includes('Error') ? 'text-red-600' : 'text-green-600'}>{message}</span>}
      </div>
    </div>
  )
}

function FeatureToggle({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition ${active ? 'border-amber bg-amber/5' : 'border-gray-200 bg-gray-50'}`}
    >
      <span className="font-bold text-chocolate">{label}</span>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-amber' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-6' : ''}`} />
      </div>
    </div>
  )
}
