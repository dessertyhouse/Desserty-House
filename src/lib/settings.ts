import { prisma } from '@/lib/prisma'

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    })
    
    if (!settings) {
      return prisma.siteSettings.create({
        data: {
          id: 'default',
          whatsappNumber: "+919000000000",
          supportEmail: "orders@dessertyhouse.com",
          heroTitle: "Handmade cakes & brownies in Chennai, made for the sweetest moments.",
          heroSubtitle: "Fresh brownies, bento cakes, birthday cakes and hand-crafted fondant creations — made to order by Desserty House.",
          announcementText: "✦ Egg & Eggless choices ✦ Made to order ✦ Chennai delivery",
          announcementActive: true,
          enableAutomatedEmails: false,
          enableOnlinePayments: false,
          enableAutoOrderTrack: false,
        }
      })
    }
    
    return settings
  } catch (error) {
    console.error("Database connection error in getSiteSettings:", error);
    // Return defaults if DB fails to prevent total crash
    return {
      id: 'default',
      whatsappNumber: "+919000000000",
      supportEmail: "orders@dessertyhouse.com",
      heroTitle: "Handmade cakes & brownies in Chennai",
      heroSubtitle: "Hand-crafted fondant creations made to order in Chennai.",
      announcementText: "Chennai delivery available",
      announcementActive: true,
      enableAutomatedEmails: false,
      enableOnlinePayments: false,
      enableAutoOrderTrack: false,
    }
  }
}
