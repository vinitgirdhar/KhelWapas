import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProductCount() {
  const total = await prisma.product.count()
  console.log(`\n📊 Total products in database: ${total}`)
  
  const available = await prisma.product.count({ where: { isAvailable: true } })
  console.log(`✅ Available products: ${available}`)
  
  const newProducts = await prisma.product.count({ where: { type: 'new' } })
  console.log(`🆕 New products: ${newProducts}`)
  
  const preowned = await prisma.product.count({ where: { type: 'preowned' } })
  console.log(`♻️  Pre-owned products: ${preowned}`)
  
  console.log('\nFirst 5 products:')
  const first5 = await prisma.product.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  first5.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.name} (${p.type}, Available: ${p.isAvailable})`)
  })
  
  await prisma.$disconnect()
}

testProductCount()
