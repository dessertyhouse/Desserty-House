import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({ where: { isAvailable: true } })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desserty-house.vercel.app'
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/products</loc><priority>0.8</priority></url>
  ${products.map(p => `<url><loc>${baseUrl}/products/${p.slug}</loc><priority>0.6</priority></url>`).join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}

import { NextResponse } from 'next/server'
