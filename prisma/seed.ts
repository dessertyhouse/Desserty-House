const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.siteSettings.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create Site Settings
  await prisma.siteSettings.create({
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

  // Create Categories
  const cakes = await prisma.category.create({
    data: { name: 'Cakes', slug: 'cakes' }
  })
  
  const cupcakes = await prisma.category.create({
    data: { name: 'Cupcakes', slug: 'cupcakes' }
  })

  // Create Products
  await prisma.product.create({
    data: {
      title: 'Chocolate Fudge Cake',
      slug: 'chocolate-fudge-cake',
      description: 'Rich, moist chocolate cake layered with silky smooth chocolate ganache.',
      price: 35.00,
      images: ['https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp'],
      isBestseller: true,
      dietaryTags: ['Eggless'],
      categoryId: cakes.id,
      variants: {
        create: [
          { name: '500g', price: 35.00 },
          { name: '1kg', price: 60.00 }
        ]
      }
    }
  })

  await prisma.product.create({
    data: {
      title: 'Vanilla Dream Cupcakes',
      slug: 'vanilla-dream-cupcakes',
      description: 'Fluffy vanilla cupcakes topped with Madagascar vanilla bean buttercream.',
      price: 18.00,
      images: ['https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp'],
      isBestseller: true,
      dietaryTags: ['Gluten-Free'],
      categoryId: cupcakes.id
    }
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
