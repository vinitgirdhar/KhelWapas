// Test script to check orders API
// This simulates what the frontend does

async function testOrdersAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    console.log('\n📊 Orders API Response:')
    console.log('Status:', response.status)
    console.log('Success:', data.success)
    
    if (data.success && data.orders) {
      console.log(`\n✅ Found ${data.orders.length} orders\n`)
      data.orders.forEach((order: any, index: number) => {
        console.log(`${index + 1}. ${order.orderId}`)
        console.log(`   Customer: ${order.customer.name}`)
        console.log(`   Product: ${order.product.name}`)
        console.log(`   Status: ${order.orderStatus}`)
        console.log(`   Amount: ₹${order.amount}`)
        console.log('')
      })
    } else {
      console.log('\n❌ Error:', data.message)
      if (response.status === 401) {
        console.log('\n💡 You need to be logged in as admin to view orders')
        console.log('   Visit: http://localhost:3000/admin/login')
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error)
    console.log('\n💡 Make sure the Next.js server is running:')
    console.log('   npm run dev')
  }
}

testOrdersAPI()
