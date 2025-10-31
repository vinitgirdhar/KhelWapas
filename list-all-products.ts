import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAllProducts() {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  
  console.log(`\nTotal products: ${products.length}\n`)
  
  const withRealImages = products.filter(p => p.imageUrls.some(url => url.includes('/uploads/')))
  const withPlaceholder = products.filter(p => p.imageUrls.some(url => url.includes('/images/products/background')))
  
  console.log(`✅ Products with REAL images (${withRealImages.length}):`)
  withRealImages.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name}`)
  })
  
  console.log(`\n📦 Products with placeholder (${withPlaceholder.length}):`)
  withPlaceholder.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name}`)
  })
  
  await prisma.$disconnect()
}

listAllProducts()
