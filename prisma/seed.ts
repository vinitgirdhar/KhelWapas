import { config } from 'dotenv'
config() // Load environment variables from .env file

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  console.log('🔗 DATABASE_URL =', process.env.DATABASE_URL)

  // Non-destructive: we no longer auto-delete products so real data persists.
  // Still clear ephemeral tables that are safe to rebuild.
  await prisma.order.deleteMany();
  await prisma.sellRequest.deleteMany();
  // NOTE: Products are NOT deleted automatically anymore.
  
  console.log('🧹 Cleared orders and sell requests...')

  console.log('👤 Ensuring admin user exists...')
  const adminEmail = 'admin@khelwapas.com'
  const adminPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPassword, fullName: 'Admin User', role: 'admin' },
    create: {
      fullName: 'Admin User',
      email: adminEmail,
      passwordHash: adminPassword,
      role: 'admin'
    }
  })
  console.log(`✅ Admin user ready: ${adminUser.email}`)

  // Seed 10 normal users (idempotent via upsert)
  console.log('👥 Seeding test users...')
  const testUserPasswordHash = await hashPassword('user@123')
  const testUsers: { fullName: string; email: string }[] = [
    { fullName: 'Kashmira Shah', email: 'kashmira@gmail.com' },
    { fullName: 'Rahul Sharma', email: 'rahul.sharma@gmail.com' },
    { fullName: 'Priya Patel', email: 'priya.patel@gmail.com' },
    { fullName: 'Amit Kumar', email: 'amit.kumar@gmail.com' },
    { fullName: 'Sneha Gupta', email: 'sneha.gupta@gmail.com' },
    { fullName: 'Vikash Singh', email: 'vikash.singh@gmail.com' },
    { fullName: 'Anjali Mehta', email: 'anjali.mehta@gmail.com' },
    { fullName: 'Rohan Joshi', email: 'rohan.joshi@gmail.com' },
    { fullName: 'Kavya Reddy', email: 'kavya.reddy@gmail.com' },
    { fullName: 'Arjun Nair', email: 'arjun.nair@gmail.com' }
  ]
  for (const u of testUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, passwordHash: testUserPasswordHash, role: 'user' },
      create: {
        fullName: u.fullName,
        email: u.email,
        passwordHash: testUserPasswordHash,
        role: 'user',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }
    })
    console.log(`   • User ready: ${created.fullName} (${created.email})`)
  }
  console.log('✅ Test users seeded / updated.')

  // Seed realistic orders and sell requests
  console.log('📦 Seeding orders and sell requests...')
  
  const allUsers = await prisma.user.findMany({ where: { role: 'user' } })
  const allProducts = await prisma.product.findMany({ where: { isAvailable: true } })
  
  if (allUsers.length > 0 && allProducts.length > 0) {
    // Seed Orders - realistic data based on revenue analytics
    const orderStatuses: ('Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled')[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    const pickupStatuses: ('Pending' | 'Scheduled' | 'In Progress' | 'Completed')[] = ['Pending', 'Scheduled', 'In Progress', 'Completed']
    
    const ordersToCreate = [
      { userId: allUsers[0].id, productIndex: 0, totalPrice: 18500, orderStatus: 'Delivered', pickupStatus: 'Completed', daysAgo: 15 },
      { userId: allUsers[1].id, productIndex: 1, totalPrice: 2500, orderStatus: 'Delivered', pickupStatus: 'Completed', daysAgo: 12 },
      { userId: allUsers[2].id, productIndex: 2, totalPrice: 800, orderStatus: 'Shipped', pickupStatus: 'In Progress', daysAgo: 3 },
      { userId: allUsers[3].id, productIndex: 3, totalPrice: 1500, orderStatus: 'Shipped', pickupStatus: 'Scheduled', daysAgo: 2 },
      { userId: allUsers[4].id, productIndex: 4, totalPrice: 3200, orderStatus: 'Confirmed', pickupStatus: 'Scheduled', daysAgo: 1 },
      { userId: allUsers[5].id, productIndex: 0, totalPrice: 18500, orderStatus: 'Pending', pickupStatus: 'Pending', daysAgo: 0 },
      { userId: allUsers[6].id, productIndex: 1, totalPrice: 2500, orderStatus: 'Delivered', pickupStatus: 'Completed', daysAgo: 20 },
      { userId: allUsers[7].id, productIndex: 2, totalPrice: 800, orderStatus: 'Delivered', pickupStatus: 'Completed', daysAgo: 18 },
      { userId: allUsers[8].id, productIndex: 3, totalPrice: 1500, orderStatus: 'Cancelled', pickupStatus: 'Pending', daysAgo: 5 },
      { userId: allUsers[1].id, productIndex: 4, totalPrice: 3200, orderStatus: 'Delivered', pickupStatus: 'Completed', daysAgo: 25 },
    ]
    
    for (const orderData of ordersToCreate) {
      const product = allProducts[orderData.productIndex % allProducts.length]
      const createdAt = new Date(Date.now() - orderData.daysAgo * 24 * 60 * 60 * 1000)
      
      await prisma.order.create({
        data: {
          userId: orderData.userId,
          items: JSON.stringify([{
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: Number(product.price),
            image: Array.isArray(product.imageUrls) ? product.imageUrls[0] : '/images/products/background.jpg'
          }]),
          totalPrice: orderData.totalPrice,
          paymentStatus: orderData.orderStatus === 'Cancelled' ? 'pending' : 'paid',
          fulfillmentStatus: orderData.orderStatus,
          createdAt,
          updatedAt: createdAt
        }
      })
    }
    console.log(`   • Created ${ordersToCreate.length} orders`)
    
    // Seed Sell Requests - diverse statuses and items
    const sellRequestsData = [
      {
        userId: allUsers[2].id,
        fullName: allUsers[2].fullName,
        email: allUsers[2].email,
        category: 'Cricket',
        title: 'SS Cricket Bat - Lightly Used',
        description: 'SS Ton Gutsy English Willow bat in excellent condition. Used only for 5 matches. No cracks, well-maintained.',
        price: 8500,
        contactMethod: 'WhatsApp' as const,
        contactDetail: '+91 98765 43210',
        imageUrls: ['/images/products/background.jpg'],
        status: 'Pending' as const,
        daysAgo: 1
      },
      {
        userId: allUsers[3].id,
        fullName: allUsers[3].fullName,
        email: allUsers[3].email,
        category: 'Badminton',
        title: 'Yonex Voltric Z-Force II',
        description: 'Pre-owned Yonex racket. Strings need replacement but frame is in perfect condition. Original grip included.',
        price: 6200,
        contactMethod: 'Email' as const,
        contactDetail: allUsers[3].email,
        imageUrls: ['/images/products/background.jpg'],
        status: 'Approved' as const,
        daysAgo: 5
      },
      {
        userId: allUsers[5].id,
        fullName: allUsers[5].fullName,
        email: allUsers[5].email,
        category: 'Football',
        title: 'Adidas Predator 19.1 FG - Size 9',
        description: 'Used football boots, worn 10 times. Slight wear on studs but upper is like new. Comes with original box.',
        price: 4500,
        contactMethod: 'Phone' as const,
        contactDetail: '+91 87654 32109',
        imageUrls: ['/images/products/background.jpg'],
        status: 'Pending' as const,
        daysAgo: 2
      },
      {
        userId: allUsers[6].id,
        fullName: allUsers[6].fullName,
        email: allUsers[6].email,
        category: 'Tennis',
        title: 'Wilson Pro Staff RF97 Autograph',
        description: 'Excellent condition tennis racquet. Only used for 3 months. Comes with cover and original strings.',
        price: 12000,
        contactMethod: 'WhatsApp' as const,
        contactDetail: '+91 76543 21098',
        imageUrls: ['/images/products/background.jpg'],
        status: 'Approved' as const,
        daysAgo: 8
      },
      {
        userId: allUsers[7].id,
        fullName: allUsers[7].fullName,
        email: allUsers[7].email,
        category: 'Basketball',
        title: 'Spalding TF-1000 Legacy Basketball',
        description: 'Indoor basketball in good condition. Some grip wear but holds air perfectly. Great for training.',
        price: 2800,
        contactMethod: 'Email' as const,
        contactDetail: allUsers[7].email,
        imageUrls: ['/images/products/background.jpg'],
        status: 'Rejected' as const,
        daysAgo: 10
      },
      {
        userId: allUsers[8].id,
        fullName: allUsers[8].fullName,
        email: allUsers[8].email,
        category: 'Cricket',
        title: 'MRF Genius Grand Edition Bat',
        description: 'English willow bat with minor edge marks. Great for leather ball cricket. Professionally knocked-in.',
        price: 15000,
        contactMethod: 'WhatsApp' as const,
        contactDetail: '+91 65432 10987',
        imageUrls: ['/images/products/background.jpg'],
        status: 'Pending' as const,
        daysAgo: 0
      }
    ]
    
    for (const requestData of sellRequestsData) {
      const createdAt = new Date(Date.now() - requestData.daysAgo * 24 * 60 * 60 * 1000)
      
      await prisma.sellRequest.create({
        data: {
          userId: requestData.userId,
          fullName: requestData.fullName,
          email: requestData.email,
          category: requestData.category,
          title: requestData.title,
          description: requestData.description,
          price: requestData.price,
          contactMethod: requestData.contactMethod,
          contactDetail: requestData.contactDetail,
          imageUrls: JSON.stringify(requestData.imageUrls),
          status: requestData.status,
          createdAt,
          updatedAt: createdAt
        }
      })
    }
    console.log(`   • Created ${sellRequestsData.length} sell requests`)
  } else {
    console.log('   ⚠️  Skipping orders/sell requests - no users or products available')
  }
  
  console.log('✅ Orders and sell requests seeded.')

  const shouldSeedMocks = process.env.SEED_MOCK_PRODUCTS === 'true';
  if (shouldSeedMocks) {
    console.log('📦 Creating mock product data (SEED_MOCK_PRODUCTS=true)...')
    const mockProducts = [
    {
      name: 'Yonex Astrox 100 ZZ',
      category: 'Badminton',
      type: 'new',
      price: 18500,
      originalPrice: 22000,
      description: 'The Astrox 100 ZZ is designed for advanced players seeking power and a steep-angled smash. Features a hyper-slim shaft and Rotational Generator System for ultimate control.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1758704389392-a3hqwomxjxg.jpg', '/uploads/products/1758704389393-53zj767bz9k.jpg'],
      badge: 'Bestseller',
      grade: 'A',
      specs: {
        'Flex': 'Extra Stiff',
        'Frame': 'HM Graphite / Namd / Tungsten / Black Micro Core / Nanometric',
        'Shaft': 'HM Graphite / Namd',
        'Weight': '4U (Avg. 83g)',
        'Grip Size': 'G5',
        'Color': 'Dark Navy'
      }
    },
    {
      name: 'SG Cobra Xtreme Kashmir Willow Bat',
      category: 'Cricket',
      type: 'new',
      price: 2500,
      originalPrice: 3200,
      description: 'A high-quality Kashmir Willow bat designed for club-level cricketers. Features a traditional shape with substantial edges for explosive power.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1758704397582-z3tvbxahbek.jpg', '/uploads/products/1758704476556-48bo0hzjms9.jpg'],
      badge: 'New Arrival',
      grade: 'B',
      specs: {
        'Willow': 'Kashmir Willow',
        'Handle': 'Singapore Cane Handle',
        'Grains': '5-7 Grains',
        'Weight': '1180-1250 grams',
        'Size': 'Short Handle (SH)'
      }
    },
    {
      name: 'Nivia Storm Football - Size 5',
      category: 'Football',
      type: 'new',
      price: 800,
      originalPrice: 1100,
      description: 'The Nivia Storm Football is a durable, all-weather ball suitable for training and matches on grass or artificial turf. Its 32-panel construction ensures true flight.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1758704860280-lno7vy9rapr.jpg', '/uploads/products/1758704900583-jhng6gnc2rr.jpg'],
      badge: 'Best Value',
      grade: 'C',
      specs: {
        'Material': 'Rubberized Stitched',
        'Panels': '32 Panels',
        'Size': '5',
        'Bladder': 'Latex Bladder',
        'Use': 'Training/Recreational'
      }
    },
    {
      name: 'Spalding NBA Zi/O Excel Basketball',
      category: 'Basketball',
      type: 'preowned',
      price: 1500,
      originalPrice: 2800,
      description: 'A pre-owned Spalding Zi/O Excel basketball with excellent grip and feel. Ideal for indoor and outdoor play. Shows minor signs of use but in great condition.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1758705025886-byvrb9rmi69.jpg', '/uploads/products/1758705262035-siy1v7l5ngr.jpg'],
      badge: 'Bestseller',
      grade: 'B',
      specs: {
        'Material': 'Zi/O Composite Leather',
        'Size': '7',
        'Feel': 'Soft, tacky feel',
        'Use': 'Indoor/Outdoor',
        'Condition': 'Used - Grade B'
      }
    },
    {
        name: 'Wilson Tour Slam Lite Tennis Racquet',
        category: 'Tennis',
        type: 'new',
        price: 3200,
        originalPrice: 4500,
        description: 'The Wilson Tour Slam Lite is perfect for beginners and recreational players. Its oversized head provides a larger sweet spot, and V-Matrix technology offers more power.',
        isAvailable: true,
        imageUrls: ['/uploads/products/1758705569512-nikx8k3r4g.jpg', '/uploads/products/1758705875862-zleju5xvyo.jpg'],
        badge: 'New Arrival',
        grade: 'B',
        specs: {
            'Head Size': '112 sq. in.',
            'Strung Weight': '10.3 oz / 291 g',
            'Length': '27.5 in',
            'String Pattern': '16x19',
            'Grip Size': '4 3/8"'
        }
    },
    {
        name: 'Cosco Sprint 66 Nylon Shuttlecock',
        category: 'Badminton',
        type: 'new',
        price: 450,
        originalPrice: 550,
        description: 'A pack of 6 durable nylon shuttlecocks from Cosco. Ideal for practice and club play, offering consistent flight and good durability.',
        isAvailable: true,
        imageUrls: ['/uploads/products/1758706675360-xnsz54k5czm.jpg', '/uploads/products/1758707146288-syuv5pjmes7.jpg'],
        badge: 'Best Value',
        grade: 'C',
        specs: {
            'Type': 'Nylon',
            'Speed': 'Medium',
            'Base': 'Cork',
            'Quantity': '6 Shuttles',
            'Color': 'Yellow'
        }
    }
    ]

    for (const product of mockProducts) {
      // Only create if a product with same name doesn't already exist
      const exists = await prisma.product.findFirst({ where: { name: product.name } });
      if (!exists) {
        await prisma.product.create({
          data: {
            ...product,
            type: product.type as 'new' | 'preowned',
            grade: product.grade as 'A' | 'B' | 'C' | 'D',
            specs: product.specs || {},
          },
        });
        console.log(`   • Mock product added: ${product.name}`);
      } else {
        console.log(`   • Skipped existing product: ${product.name}`);
      }
    }
  } else {
    console.log('📦 Skipping mock products (SEED_MOCK_PRODUCTS not true)')
  }

  console.log('✅ Database seed complete (admin + users + optional mocks).')
  // Print counts for verification
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.sellRequest.count()
  ])
  console.log(`👥 Users: ${counts[0]} | 📦 Products: ${counts[1]} | 🧾 Orders: ${counts[2]} | 🛒 SellRequests: ${counts[3]}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during setup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })