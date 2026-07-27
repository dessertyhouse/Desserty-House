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
      whatsappNumber: "+919000000000",
      supportEmail: "orders@dessertyhouse.com",
      heroTitle: "Artisanal Brownies, Cakes & Pizzas in Chennai",
      heroSubtitle: "Hand-crafted treats and fresh artisanal pizzas made to order for your sweetest moments.",
      announcementText: "✦ Now Serving Artisanal Pizzas! ✦ Chennai Delivery ✦ Egg & Eggless Choices",
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
  
  const pizzas = await prisma.category.create({
    data: { name: 'Artisanal Pizzas', slug: 'pizzas' }
  })

  const brownies = await prisma.category.create({
    data: { name: 'Brownies', slug: 'brownies' }
  })

  // Create Products
  await prisma.product.create({
    data: {
      title: 'Classic Margherita Pizza',
      slug: 'margherita-pizza',
      description: 'Hand-stretched sourdough crust, premium mozzarella, fresh basil, and our signature tomato sauce.',
      price: 12.00,
      images: ['https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp'],
      isBestseller: true,
      dietaryTags: ['Vegetarian'],
      categoryId: pizzas.id
    }
  })

  await prisma.product.create({
    data: {
      title: 'Chocolate Fudge Brownie Box',
      slug: 'chocolate-fudge-brownies',
      description: 'Ultra-gooey fudge brownies made with premium dark chocolate. Box of 6.',
      price: 15.00,
      images: ['https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp'],
      isBestseller: true,
      dietaryTags: ['Eggless'],
      categoryId: brownies.id
    }
  })

  await prisma.product.create({
    data: {
      title: 'Chocolate Fudge Cake',
      slug: 'chocolate-fudge-cake',
      description: 'Rich, moist chocolate cake layered with silky smooth chocolate ganache.',
      price: 35.00,
      images: ['https://res.cloudinary.com/pjn0251d/image/upload/v1784551591/dh-showcase-46_ehsejs.webp'],
      isBestseller: true,
      dietaryTags: ['Eggless'],
      categoryId: cakes.id
    }
  })

  console.log('Seed data with Pizzas created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
