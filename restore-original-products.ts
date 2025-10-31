import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function restoreOriginalProducts() {
  console.log('🔄 Restoring original products with proper images...')
  
  // Original 7 products with their actual image URLs
  const originalProducts = [
    {
      name: 'Yonex Astrox 100 ZZ',
      category: 'Badminton',
      imageUrls: ['/uploads/products/badminton-racket-1.jpg', '/uploads/products/badminton-racket-2.jpg']
    },
    {
      name: 'SG Cobra Xtreme Kashmir Willow Bat',
      category: 'Cricket',
      imageUrls: ['/uploads/products/cricket-bat-1.jpg', '/uploads/products/cricket-bat-2.jpg']
    },
    {
      name: 'Nivia Storm Football - Size 5',
      category: 'Football',
      imageUrls: ['/uploads/products/football-1.jpg', '/uploads/products/football-2.jpg']
    },
    {
      name: 'Spalding NBA Zi/O Excel Basketball',
      category: 'Basketball',
      imageUrls: ['/uploads/products/basketball-1.jpg', '/uploads/products/basketball-2.jpg']
    },
    {
      name: 'Wilson Tour Slam Lite Tennis Racquet',
      category: 'Tennis',
      imageUrls: ['/uploads/products/tennis-racket-1.jpg', '/uploads/products/tennis-racket-2.jpg']
    },
    {
      name: 'Cosco Sprint 66 Nylon Shuttlecock',
      category: 'Badminton',
      imageUrls: ['/uploads/products/shuttlecock-1.jpg', '/uploads/products/shuttlecock-2.jpg']
    },
    {
      name: 'MRF Genius Grand Edition Bat',
      category: 'Cricket',
      imageUrls: ['/uploads/products/mrf-bat-1.jpg', '/uploads/products/mrf-bat-2.jpg']
    }
  ]
  
  for (const productData of originalProducts) {
    const product = await prisma.product.findFirst({
      where: { name: productData.name }
    })
    
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageUrls: productData.imageUrls
        }
      })
      console.log(`   ✓ Restored: ${productData.name}`)
    }
  }
  
  console.log('\n✅ Original products restored with proper image URLs')
  await prisma.$disconnect()
}

restoreOriginalProducts()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
