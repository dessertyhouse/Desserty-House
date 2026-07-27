import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
  })
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const data = await req.json()
  
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      ...data,
    },
  })
  
  return NextResponse.json(settings)
}
