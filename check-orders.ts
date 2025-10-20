import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n📦 Total orders in database: ${orders.length}\n`)

    if (orders.length > 0) {
      console.log('Orders:')
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order.id}`)
        console.log(`   User: ${order.user.fullName} (${order.user.email})`)
        console.log(`   Status: ${order.fulfillmentStatus}`)
        console.log(`   Total: ₹${order.totalPrice}`)
        console.log(`   Created: ${order.createdAt}`)
        console.log(`   Items: ${typeof order.items === 'string' ? order.items : JSON.stringify(order.items)}`)
      })
    } else {
      console.log('❌ No orders found in database!')
      console.log('\nRun: npx tsx prisma/seed.ts')
    }
  } catch (error) {
    console.error('Error checking orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders()
