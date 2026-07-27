import { prisma } from './prisma'

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  })
  
  if (!settings) {
    return prisma.siteSettings.create({
      data: {
        id: 'default',
        whatsappNumber: "+1234567890",
        supportEmail: "orders@dessertyhouse.com",
        heroTitle: "Freshly Baked Happiness",
        heroSubtitle: "Artisanal treats made fresh daily. Order directly via WhatsApp!",
        announcementText: "Orders delivered daily! Chat with us on WhatsApp to customize.",
        announcementActive: true,
        enableAutomatedEmails: false,
        enableOnlinePayments: false,
        enableAutoOrderTrack: false,
      }
    })
  }
  
  return settings
}
