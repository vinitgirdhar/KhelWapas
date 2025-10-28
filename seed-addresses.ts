import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAddresses() {
  try {
    console.log('\n🏠 Seeding user addresses...\n')

    // Get all users
    const users = await prisma.user.findMany()

    const addresses = [
      {
        title: 'Home',
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      {
        title: 'Office',
        street: '456 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
      },
      {
        title: 'Home',
        street: '789 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
      },
      {
        title: 'Home',
        street: '321 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700016',
      },
      {
        title: 'Office',
        street: '654 Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600002',
      },
    ]

    let addressCount = 0

    for (const user of users) {
      // Check if user already has addresses
      const existingAddresses = await prisma.address.findMany({
        where: { userId: user.id }
      })

      if (existingAddresses.length === 0) {
        // Add a random address for this user
        const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
        
        await prisma.address.create({
          data: {
            userId: user.id,
            title: randomAddress.title,
            fullName: user.fullName,
            phone: user.phone || '+91 98765 43210',
            street: randomAddress.street,
            city: randomAddress.city,
            state: randomAddress.state,
            postalCode: randomAddress.postalCode,
            country: 'India',
            isDefault: true,
          }
        })

        addressCount++
        console.log(`   ✓ Added address for ${user.fullName}`)
      }
    }

    console.log(`\n✅ Successfully added ${addressCount} addresses!`)
  } catch (error) {
    console.error('Error seeding addresses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAddresses()
