import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSiteSettings()
// ... rest of code
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { category: true }
  })

  const context = `
# Desserty House - AI Context File
Location: Chennai, India
Contact: WhatsApp (${settings.whatsappNumber}), Email (${settings.supportEmail})

## Hero
Title: ${settings.heroTitle}
Subtitle: ${settings.heroSubtitle}

## Menu Summary
${products.map(p => `- ${p.title} (${p.category.name}): ${p.description} - Price: ${p.price}`).join('\n')}

## SEO Information
Description: Artisanal bakery in Chennai specializing in brownies, bento cakes, and custom fondant cakes.
Egg & Eggless options available.
  `
  return new NextResponse(context, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
