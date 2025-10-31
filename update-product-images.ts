import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProductImages() {
  console.log('🖼️  Updating product images to use existing placeholder...')
  
  const products = await prisma.product.findMany()
  
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrls: ['/images/products/background.jpg']
      }
    })
    console.log(`   ✓ Updated: ${product.name}`)
  }
  
  console.log(`\n✅ Updated ${products.length} products`)
  await prisma.$disconnect()
}

updateProductImages()
  .catch((error) => {
    console.error('❌ Error updating images:', error)
    process.exit(1)
  })
