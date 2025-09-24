import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting clean database setup...')

  // Clear all existing data
  await prisma.order.deleteMany()
  await prisma.sellRequest.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@khelwapas.com',
      passwordHash: await hashPassword('admin123'),
      role: 'admin'
    }
  })

  console.log('Creating mock product data...')
  const mockProducts = [
    {
      name: 'Yonex Astrox 100 ZZ',
      category: 'Badminton',
      type: 'new',
      price: 18500,
      originalPrice: 22000,
      description: 'The Astrox 100 ZZ is designed for advanced players seeking power and a steep-angled smash. Features a hyper-slim shaft and Rotational Generator System for ultimate control.',
      isAvailable: true,
      imageUrls: ['/images/products/astrox-100.webp'],
      badge: 'A',
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
      imageUrls: ['/images/products/sg-cobra.webp'],
      badge: 'B',
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
      imageUrls: ['/images/products/nivia-storm.webp'],
      badge: 'C',
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
      imageUrls: ['/images/products/spalding-excel.webp'],
      badge: 'A',
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
        imageUrls: ['/images/products/wilson-tour-slam.webp'],
        badge: 'B',
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
        imageUrls: ['/images/products/cosco-sprint.webp'],
        badge: 'C',
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
    await prisma.product.create({
      data: {
        ...product,
        type: product.type as 'new' | 'preowned',
        grade: product.grade as 'A' | 'B' | 'C' | 'D',
        specs: product.specs || {},
      },
    });
  }

  console.log('✅ Database seeded with admin user and mock products!')
}

main()
  .catch((e) => {
    console.error('❌ Error during setup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })