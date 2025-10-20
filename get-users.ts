import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    console.log('\n=== ALL USERS IN DATABASE ===\n');
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.fullName}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone || 'N/A'}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.passwordHash}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('---');
    });

    console.log(`\nTotal users: ${users.length}`);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllUsers();
