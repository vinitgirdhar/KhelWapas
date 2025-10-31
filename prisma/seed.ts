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
    // ===========================
    // ORIGINAL PRODUCTS WITH REAL IMAGES (7 items)
    // ===========================
    {
      name: 'Yonex Astrox 100 ZZ',
      category: 'Badminton',
      type: 'new',
      price: 18500,
      originalPrice: null,
      description: 'Professional badminton racket with Rotational Generator System for maximum power and control. Perfect for advanced players.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652547789-yxkwoyek8z.webp'],
      badge: 'Bestseller',
      grade: null,
      sku: 'BDM-RAC-YON-001',
      specs: {
        'Brand': 'Yonex',
        'Model': 'Astrox 100 ZZ',
        'Weight': '4U (80-84g)',
        'Grip Size': 'G5',
        'Flexibility': 'Stiff',
        'Balance': 'Head Heavy',
        'Material': 'HM Graphite / Namd',
        'String Tension': 'Up to 30 lbs',
        'Condition': 'Brand New',
        'Stock': '15 units'
      }
    },
    {
      name: 'SG Cobra Xtreme Kashmir Willow Bat',
      category: 'Cricket',
      type: 'new',
      price: 2500,
      originalPrice: null,
      description: 'High-quality Kashmir Willow cricket bat from SG. Features thick edges and a balanced profile for powerful stroke play.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652514201-i8wohxqv29r.webp', '/uploads/products/1761652518849-mbsw06sc7ko.webp', '/uploads/products/1761652518850-s3yj4z4zmyi.webp', '/uploads/products/1761652518851-xn3o8svngha.webp'],
      badge: 'Bestseller',
      grade: null,
      sku: 'CRK-BAT-SG-002',
      specs: {
        'Brand': 'SG (Sanspareils Greenlands)',
        'Model': 'Cobra Xtreme',
        'Willow Type': 'Kashmir Willow',
        'Handle': 'Cane Handle',
        'Weight': '1100-1200 grams',
        'Size': 'Full Size (Short Handle)',
        'Blade Profile': 'Mid-Heavy',
        'Edge Thickness': '35-38mm',
        'Condition': 'Brand New',
        'Stock': '30 units'
      }
    },
    {
      name: 'Nivia Storm Football - Size 5',
      category: 'Football',
      type: 'new',
      price: 800,
      originalPrice: null,
      description: 'FIFA standard Size 5 football from Nivia. Perfect for match play and training with excellent durability and flight characteristics.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652627669-q494kc3xme.webp', '/uploads/products/1761652627670-z05bmo4jxc.webp', '/uploads/products/1761652627670-wkpt4grnutp.webp'],
      badge: 'Bestseller',
      grade: null,
      sku: 'FB-BALL-NIV-001',
      specs: {
        'Brand': 'Nivia',
        'Model': 'Storm',
        'Size': '5 (Official)',
        'Material': 'PU Synthetic Leather',
        'Bladder': 'Butyl Bladder',
        'Panels': '32 Hand-Stitched Panels',
        'Weight': '410-450 grams',
        'Circumference': '68-70 cm',
        'Condition': 'Brand New',
        'Stock': '50 units'
      }
    },
    {
      name: 'Spalding NBA Zi/O Excel Basketball',
      category: 'Basketball',
      type: 'preowned',
      price: 3200,
      originalPrice: 5000,
      description: 'Official NBA indoor basketball in excellent condition. Shows minimal wear with great grip and bounce retention.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652653406-qgdpbu8t5ld.jpg', '/uploads/products/1761652656740-tt10fdw9hsh.jpg', '/uploads/products/1761652656741-e6zgd47bqz.jpg'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'BKB-BALL-SPA-001',
      specs: {
        'Brand': 'Spalding',
        'Model': 'NBA Zi/O Excel',
        'Size': '7 (Official Men\'s)',
        'Material': 'Composite Leather',
        'Surface': 'Indoor',
        'Weight': '600 grams',
        'Circumference': '75 cm',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '12 units'
      }
    },
    {
      name: 'Wilson Tour Slam Lite Tennis Racquet',
      category: 'Tennis',
      type: 'new',
      price: 1500,
      originalPrice: null,
      description: 'Lightweight tennis racquet perfect for beginners and recreational players. Great balance of power and control.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652684450-gt3i11dzyat.jpg', '/uploads/products/1761652688744-lw3to0gv3g.jpg', '/uploads/products/1761652688745-jps0o1u65h.jpg', '/uploads/products/1761652688746-flp4qtfne68.jpg', '/uploads/products/1761652688747-pjo7kvbfn4e.jpg'],
      badge: 'Best Value',
      grade: null,
      sku: 'TEN-RAC-WIL-001',
      specs: {
        'Brand': 'Wilson',
        'Model': 'Tour Slam Lite',
        'Head Size': '110 sq in',
        'Weight': '280 grams (Unstrung)',
        'Grip Size': '4 3/8"',
        'Length': '27.5 inches',
        'String Pattern': '16x19',
        'Material': 'Volcanic Frame',
        'Condition': 'Brand New',
        'Stock': '20 units'
      }
    },
    {
      name: 'Cosco Sprint 66 Nylon Shuttlecock',
      category: 'Badminton',
      type: 'new',
      price: 350,
      originalPrice: null,
      description: 'Pack of 6 durable nylon shuttlecocks for recreational and practice play. Long-lasting and consistent flight.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652705537-1nsbfownr7a.jpg', '/uploads/products/1761652705538-m1ihndngr0n.jpg'],
      badge: 'Best Value',
      grade: null,
      sku: 'BDM-SHU-COS-001',
      specs: {
        'Brand': 'Cosco',
        'Model': 'Sprint 66',
        'Type': 'Nylon Shuttlecock',
        'Pack Size': '6 pieces',
        'Speed': 'Medium',
        'Durability': 'High',
        'Base': 'Cork Base',
        'Skirt': 'Nylon',
        'Condition': 'Brand New',
        'Stock': '100 packs'
      }
    },
    {
      name: 'MRF Genius Grand Edition Bat',
      category: 'Cricket',
      type: 'preowned',
      price: 15000,
      originalPrice: 22000,
      description: 'Premium English Willow cricket bat from MRF. Professional-grade bat with excellent pickup and balance. Lightly used with minimal wear.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761652959824-nx1uzmjjaz.webp'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'CRK-BAT-MRF-003',
      specs: {
        'Brand': 'MRF',
        'Model': 'Genius Grand Edition',
        'Willow Type': 'English Willow',
        'Grade': 'Grade 1',
        'Handle': 'Premium Sarawak Cane',
        'Weight': '1180-1220 grams',
        'Size': 'Full Size (Short Handle)',
        'Grains': '10-12 Straight Grains',
        'Edge Thickness': '38-42mm',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '8 units'
      }
    },

    // ===========================
    // NEW CRICKET EQUIPMENT (8 items)
    // ===========================
    {
      name: 'English Willow Bat',
      category: 'Cricket',
      type: 'preowned',
      price: 5950,
      originalPrice: 9999,
      description: 'Premium English Willow cricket bat in excellent playing condition. Features superior grain structure and perfect balance for professional-level performance. Ideal for leather ball cricket.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653260211-0w0qk6z4r1x.png'],
      badge: 'Inspected',
      grade: 'B',
      sku: 'CRK-BAT-EW-001',
      specs: {
        'Willow Type': 'English Willow',
        'Grade': 'Grade 2',
        'Handle': 'Premium Cane Handle',
        'Weight': '1150-1200 grams',
        'Size': 'Full Size (Short Handle)',
        'Grains': '8-10 Straight Grains',
        'Condition': 'Pre-Owned - Grade B',
        'Stock': '25 units'
      }
    },
    {
      name: 'Kashmir Willow Bat',
      category: 'Cricket',
      type: 'new',
      price: 3500,
      originalPrice: null,
      description: 'Brand new Kashmir Willow cricket bat perfect for club-level and amateur cricket. Well-balanced design with good pickup and traditional shape. Ready to play after light knocking.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653274327-1ivgcsfvpbb.png'],
      badge: 'Bestseller',
      grade: null,
      sku: 'CRK-BAT-KW-002',
      specs: {
        'Willow Type': 'Kashmir Willow',
        'Handle': 'Cane Handle',
        'Weight': '1180-1250 grams',
        'Size': 'Full Size',
        'Grains': '5-7 Grains',
        'Condition': 'Brand New',
        'Stock': '40 units'
      }
    },
    {
      name: 'Tennis Ball Cricket Ball',
      category: 'Cricket',
      type: 'preowned',
      price: 212,
      originalPrice: 350,
      description: 'High-quality tennis balls suitable for street and practice cricket. Durable rubber construction with excellent bounce. Pack includes premium quality balls in good playing condition.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653284634-pzu8uaqqg8n.png'],
      badge: 'Best Value',
      grade: 'A',
      sku: 'CRK-BALL-TN-003',
      specs: {
        'Type': 'Tennis Cricket Ball',
        'Material': 'Rubber',
        'Bounce': 'High',
        'Durability': 'Excellent',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '100 units'
      }
    },
    {
      name: 'Leather Cricket Ball',
      category: 'Cricket',
      type: 'new',
      price: 1200,
      originalPrice: null,
      description: 'Premium quality leather cricket ball for professional matches and tournaments. Four-piece construction with excellent seam strength. Conforms to international cricket standards.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653295661-86uifnridwe.png'],
      badge: 'Bestseller',
      grade: null,
      sku: 'CRK-BALL-LT-004',
      specs: {
        'Type': 'Leather Ball',
        'Weight': '155-163 grams',
        'Color': 'Red',
        'Construction': '4-Piece',
        'Standard': 'Match Quality',
        'Condition': 'Brand New',
        'Stock': '30 units'
      }
    },
    {
      name: 'Batting Gloves',
      category: 'Cricket',
      type: 'preowned',
      price: 990,
      originalPrice: 2200,
      description: 'Professional cricket batting gloves with excellent protection and flexibility. Features high-density foam padding and comfortable leather palm. Shows minor wear but fully functional.',
      isAvailable: true,
      imageUrls: ['/images/products/background.jpg'],
      badge: 'Refurbished',
      grade: 'C',
      sku: 'CRK-GLOVE-BAT-005',
      specs: {
        'Material': 'Leather Palm',
        'Protection': 'High-Density Foam',
        'Finger': 'Pre-curved',
        'Wrist': 'Adjustable Strap',
        'Size': 'Medium/Large',
        'Condition': 'Pre-Owned - Grade C',
        'Stock': '45 units'
      }
    },
    {
      name: 'Cricket Leg Pads',
      category: 'Cricket',
      type: 'preowned',
      price: 1750,
      originalPrice: 3000,
      description: 'High-quality cricket leg guards with superior protection and lightweight design. Three-section construction for better movement. Suitable for both amateur and professional players.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653748856-hfcr2nc6dnw.png'],
      badge: 'Inspected',
      grade: 'B',
      sku: 'CRK-PADS-LEG-006',
      specs: {
        'Type': 'Leg Guards',
        'Sections': '3-Section',
        'Material': 'PU + High-Density Foam',
        'Knee Protection': 'Extra Padding',
        'Size': 'Adult',
        'Condition': 'Pre-Owned - Grade B',
        'Stock': '35 units'
      }
    },
    {
      name: 'Abdominal Guard (Cricket Box)',
      category: 'Cricket',
      type: 'new',
      price: 1500,
      originalPrice: null,
      description: 'Essential protective gear for cricket. Ergonomic design with comfortable fit and maximum protection. Made from high-impact resistant material with soft inner lining.',
      isAvailable: true,
      imageUrls: ['/uploads/products/abdominal-guard-1.jpg', '/uploads/products/abdominal-guard-2.jpg'],
      badge: null,
      grade: null,
      sku: 'CRK-GUARD-ABD-007',
      specs: {
        'Type': 'Abdominal Guard',
        'Material': 'High-Impact Plastic',
        'Lining': 'Soft Cotton',
        'Size': 'Adult (Adjustable)',
        'Condition': 'Brand New',
        'Stock': '50 units'
      }
    },
    {
      name: 'Cricket Helmet',
      category: 'Cricket',
      type: 'preowned',
      price: 2975,
      originalPrice: 4500,
      description: 'Professional cricket helmet with titanium grille and superior impact protection. Comfortable padding and adjustable fit. Meets international safety standards.',
      isAvailable: true,
      imageUrls: ['/uploads/products/cricket-helmet-1.jpg', '/uploads/products/cricket-helmet-2.jpg'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'CRK-HELMET-001',
      specs: {
        'Grille': 'Titanium',
        'Shell': 'High-Impact ABS',
        'Padding': 'Multi-Layer Foam',
        'Ventilation': 'Air Flow System',
        'Size': 'Adjustable (M-L)',
        'Standard': 'ICC Approved',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '28 units'
      }
    },
    
    // ===========================
    // FOOTBALL EQUIPMENT (4 items)
    // ===========================
    {
      name: 'Football - Size 3',
      category: 'Football',
      type: 'preowned',
      price: 480,
      originalPrice: 1500,
      description: 'Size 3 football ideal for young players and training. Durable construction with good grip. Shows signs of use but maintains excellent bounce and shape.',
      isAvailable: true,
      imageUrls: ['/uploads/products/football-size3-1.jpg', '/uploads/products/football-size3-2.jpg'],
      badge: 'Best Value',
      grade: 'D',
      sku: 'FB-BALL-S3-016',
      specs: {
        'Size': '3',
        'Material': 'Synthetic Leather',
        'Bladder': 'Butyl',
        'Panels': '32 Panels',
        'Use': 'Training/Kids',
        'Condition': 'Pre-Owned - Grade D',
        'Stock': '50 units'
      }
    },
    {
      name: 'Football - Size 4',
      category: 'Football',
      type: 'new',
      price: 1500,
      originalPrice: null,
      description: 'Brand new Size 4 football perfect for youth players. Professional-grade construction with excellent flight characteristics and durability.',
      isAvailable: true,
      imageUrls: ['/uploads/products/football-size4-1.jpg', '/uploads/products/football-size4-2.jpg'],
      badge: 'Bestseller',
      grade: null,
      sku: 'FB-BALL-S4-017',
      specs: {
        'Size': '4',
        'Material': 'PU Leather',
        'Bladder': 'Latex',
        'Panels': '32 Panels',
        'Use': 'Match/Training',
        'Condition': 'Brand New',
        'Stock': '45 units'
      }
    },
    {
      name: 'Football - Size 5',
      category: 'Football',
      type: 'preowned',
      price: 1750,
      originalPrice: 3200,
      description: 'Professional Size 5 football in excellent playing condition. Premium quality with superior touch and control. Suitable for competitive matches and serious training.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653590110-51uanp6ydsk.png'],
      badge: 'Inspected',
      grade: 'B',
      sku: 'FB-BALL-S5-018',
      specs: {
        'Size': '5',
        'Material': 'Premium PU Leather',
        'Bladder': 'Latex',
        'Panels': '32 Hand-Stitched',
        'Use': 'Professional Match',
        'Weight': '410-450g',
        'Condition': 'Pre-Owned - Grade B',
        'Stock': '30 units'
      }
    },
    {
      name: 'Football Boots',
      category: 'Football',
      type: 'preowned',
      price: 2475,
      originalPrice: 5900,
      description: 'High-performance football boots with excellent traction and comfort. Designed for firm ground play. Shows moderate wear but still offers great performance.',
      isAvailable: true,
      imageUrls: ['/uploads/products/football-boots-1.jpg', '/uploads/products/football-boots-2.jpg'],
      badge: 'Refurbished',
      grade: 'C',
      sku: 'FB-BOOTS-021',
      specs: {
        'Type': 'Firm Ground (FG)',
        'Upper': 'Synthetic Leather',
        'Sole': 'Molded Studs',
        'Size Range': 'UK 7-10',
        'Fit': 'Regular',
        'Condition': 'Pre-Owned - Grade C',
        'Stock': '40 units'
      }
    },
    
    // ===========================
    // BASKETBALL EQUIPMENT (2 items)
    // ===========================
    {
      name: 'Basketball - Indoor',
      category: 'Basketball',
      type: 'new',
      price: 2500,
      originalPrice: null,
      description: 'Premium indoor basketball with superior grip and consistent bounce. Perfect for competitive play and training. Features composite leather construction for excellent feel.',
      isAvailable: true,
      imageUrls: ['/uploads/products/basketball-indoor-1.jpg', '/uploads/products/basketball-indoor-2.jpg'],
      badge: 'Bestseller',
      grade: null,
      sku: 'BK-BALL-IN-026',
      specs: {
        'Type': 'Indoor',
        'Size': '7',
        'Material': 'Composite Leather',
        'Panels': '8-Panel',
        'Grip': 'Deep Channel Design',
        'Condition': 'Brand New',
        'Stock': '40 units'
      }
    },
    {
      name: 'Basketball Shoes',
      category: 'Basketball',
      type: 'preowned',
      price: 3570,
      originalPrice: 5500,
      description: 'High-performance basketball shoes with excellent ankle support and cushioning. Designed for explosive movements and maximum court grip. Gently used with plenty of life left.',
      isAvailable: true,
      imageUrls: ['/uploads/products/basketball-shoes-1.jpg', '/uploads/products/basketball-shoes-2.jpg'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'BK-SHOES-030',
      specs: {
        'Type': 'High-Top',
        'Cushioning': 'Air Cushion',
        'Traction': 'Herringbone Pattern',
        'Upper': 'Mesh + Synthetic',
        'Size Range': 'US 8-12',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '45 units'
      }
    },
    
    // ===========================
    // TENNIS EQUIPMENT (1 item)
    // ===========================
    {
      name: 'Tennis Racket',
      category: 'Tennis',
      type: 'preowned',
      price: 4550,
      originalPrice: 8500,
      description: 'Professional tennis racket with excellent power and control. Lightweight frame with large sweet spot. Strung and ready to play. Perfect for intermediate to advanced players.',
      isAvailable: true,
      imageUrls: ['/uploads/products/tennis-racket-pro-1.jpg', '/uploads/products/tennis-racket-pro-2.jpg'],
      badge: 'Inspected',
      grade: 'B',
      sku: 'TEN-RACKET-033',
      specs: {
        'Head Size': '100 sq. in.',
        'Weight': '300g (Strung)',
        'Length': '27 inches',
        'String Pattern': '16x19',
        'Grip Size': '4 3/8"',
        'Balance': 'Even',
        'Condition': 'Pre-Owned - Grade B',
        'Stock': '25 units'
      }
    },
    
    // ===========================
    // BADMINTON EQUIPMENT (1 item)
    // ===========================
    {
      name: 'Badminton Racket',
      category: 'Badminton',
      type: 'preowned',
      price: 1320,
      originalPrice: 3300,
      description: 'Lightweight badminton racket suitable for recreational and intermediate players. Good string tension and frame integrity. Shows cosmetic wear but plays well.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653713045-7n24l0g8v8.jpg'],
      badge: null,
      grade: 'D',
      sku: 'BD-RACKET-040',
      specs: {
        'Weight': '85-89g',
        'Flex': 'Medium',
        'Balance': 'Even',
        'String Tension': '20-24 lbs',
        'Grip Size': 'G4',
        'Condition': 'Pre-Owned - Grade D',
        'Stock': '50 units'
      }
    },
    
    // ===========================
    // HOCKEY EQUIPMENT (1 item)
    // ===========================
    {
      name: 'Hockey Stick - Field',
      category: 'Hockey',
      type: 'new',
      price: 3500,
      originalPrice: null,
      description: 'Brand new field hockey stick with excellent balance and power. Composite construction for durability and performance. Suitable for competitive play.',
      isAvailable: true,
      imageUrls: ['/uploads/products/hockey-stick-1.jpg', '/uploads/products/hockey-stick-2.jpg'],
      badge: 'Bestseller',
      grade: null,
      sku: 'HK-STICK-F-048',
      specs: {
        'Type': 'Field Hockey',
        'Material': 'Composite (Fiberglass)',
        'Length': '36.5 inches',
        'Weight': '520-540g',
        'Bow': '24mm Low Bow',
        'Condition': 'Brand New',
        'Stock': '30 units'
      }
    },
    
    // ===========================
    // TABLE TENNIS EQUIPMENT (1 item)
    // ===========================
    {
      name: 'Table Tennis Bat / Paddle',
      category: 'Table Tennis',
      type: 'preowned',
      price: 1375,
      originalPrice: 3200,
      description: 'Quality table tennis bat with good spin and control. Rubber in decent condition with some wear. Great for club-level and recreational play.',
      isAvailable: true,
      imageUrls: ['/uploads/products/table-tennis-bat-1.jpg', '/uploads/products/table-tennis-bat-2.jpg'],
      badge: 'Refurbished',
      grade: 'C',
      sku: 'TT-BAT-057',
      specs: {
        'Blade': '5-Ply Wood',
        'Rubber': 'Inverted',
        'Sponge': '2.0mm',
        'Handle': 'Flared',
        'Speed': 'Medium-Fast',
        'Condition': 'Pre-Owned - Grade C',
        'Stock': '45 units'
      }
    },
    
    // ===========================
    // VOLLEYBALL EQUIPMENT (1 item)
    // ===========================
    {
      name: 'Volleyball',
      category: 'Volleyball',
      type: 'preowned',
      price: 1700,
      originalPrice: 2600,
      description: 'Professional volleyball in excellent playing condition. Soft touch with consistent flight. Perfect for indoor competitive play and training sessions.',
      isAvailable: true,
      imageUrls: ['/uploads/products/1761653551102-u9oqid835i.png'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'VB-BALL-063',
      specs: {
        'Type': 'Indoor',
        'Material': 'Synthetic Leather',
        'Panels': '18 Panels',
        'Circumference': '65-67 cm',
        'Weight': '260-280g',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '50 units'
      }
    },
    
    // ===========================
    // ATHLETICS / FITNESS (1 item)
    // ===========================
    {
      name: 'Dumbbells / Kettlebells Set',
      category: 'Fitness',
      type: 'new',
      price: 8500,
      originalPrice: null,
      description: 'Complete dumbbell and kettlebell set for home gym. Includes multiple weight options with durable cast iron construction. Perfect for strength training and fitness.',
      isAvailable: true,
      imageUrls: ['/uploads/products/dumbbells-set-1.jpg', '/uploads/products/dumbbells-set-2.jpg'],
      badge: 'Bestseller',
      grade: null,
      sku: 'AF-DUMBBELL-069',
      specs: {
        'Type': 'Dumbbell + Kettlebell Set',
        'Material': 'Cast Iron',
        'Weights': '2kg, 4kg, 6kg, 8kg, 10kg',
        'Coating': 'Vinyl Coating',
        'Handles': 'Ergonomic Grip',
        'Condition': 'Brand New',
        'Stock': '30 units'
      }
    },
    
    // ===========================
    // MARTIAL ARTS (1 item)
    // ===========================
    {
      name: 'Boxing Gloves',
      category: 'Boxing',
      type: 'preowned',
      price: 2450,
      originalPrice: 4500,
      description: 'Professional boxing gloves with excellent padding and wrist support. Suitable for training and sparring. Shows minor wear but maintains structural integrity.',
      isAvailable: true,
      imageUrls: ['/uploads/products/boxing-gloves-1.jpg', '/uploads/products/boxing-gloves-2.jpg'],
      badge: 'Inspected',
      grade: 'B',
      sku: 'MA-GLOVE-078',
      specs: {
        'Weight': '12 oz',
        'Material': 'Synthetic Leather',
        'Padding': 'Multi-Layer Foam',
        'Closure': 'Velcro Strap',
        'Use': 'Training/Sparring',
        'Condition': 'Pre-Owned - Grade B',
        'Stock': '40 units'
      }
    },
    
    // ===========================
    // ARCHERY (1 item)
    // ===========================
    {
      name: 'Recurve Bow',
      category: 'Archery',
      type: 'preowned',
      price: 6375,
      originalPrice: 9800,
      description: 'Professional recurve bow perfect for target archery and competitions. Excellent draw weight and accuracy. Includes sight and stabilizer. Well-maintained and ready to use.',
      isAvailable: true,
      imageUrls: ['/uploads/products/recurve-bow-1.jpg', '/uploads/products/recurve-bow-2.jpg'],
      badge: 'Inspected',
      grade: 'A',
      sku: 'AR-BOW-REC-085',
      specs: {
        'Type': 'Recurve Bow',
        'Draw Weight': '30-40 lbs',
        'Length': '66-70 inches',
        'Material': 'Carbon/Fiberglass Composite',
        'Riser': 'Aluminum Alloy',
        'Accessories': 'Sight + Stabilizer',
        'Condition': 'Pre-Owned - Grade A',
        'Stock': '20 units'
      }
    }
    ]

      for (const product of mockProducts) {
      // Only create if a product with same name doesn't already exist
      const exists = await prisma.product.findFirst({ where: { name: product.name } });
      if (!exists) {
        // Remove sku field as it doesn't exist in the schema
        const { sku, ...productData } = product as any;
        await prisma.product.create({
          data: {
            ...productData,
            type: productData.type as 'new' | 'preowned',
            grade: productData.grade as 'A' | 'B' | 'C' | 'D' | null,
            specs: productData.specs || {},
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