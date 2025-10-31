import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  const products = await prisma.product.findMany({ take: 7 })
  
  console.log('First 7 products in database:')
  products.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`)
    console.log(`   Images: ${JSON.stringify(p.imageUrls)}`)
  })
  
  await prisma.$disconnect()
}

checkProducts()
