import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateUserPasswords() {
  try {
    const newPassword = 'qwerty123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    console.log('\n=== Updating Regular User Passwords ===\n');

    // Get all users with role 'user' (excluding admin)
    const regularUsers = await prisma.user.findMany({
      where: {
        role: 'user'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });

    console.log(`Found ${regularUsers.length} regular users to update.\n`);

    // Update each regular user's password
    for (const user of regularUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });
      
      console.log(`✓ Updated password for: ${user.fullName} (${user.email})`);
    }

    console.log(`\n✅ Successfully updated passwords for ${regularUsers.length} regular users.`);
    console.log(`New password for all regular users: ${newPassword}`);
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPasswords();
