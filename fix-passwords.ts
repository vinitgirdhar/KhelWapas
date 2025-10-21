import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUserPasswords() {
  try {
    const correctPassword = 'qwerty123';
    const saltRounds = 12;
    
    // Generate the correct hash
    console.log('\n=== FIXING USER PASSWORDS ===\n');
    console.log(`Setting password to: ${correctPassword}`);
    console.log('Generating hash...\n');
    
    const passwordHash = await bcrypt.hash(correctPassword, saltRounds);
    console.log(`Generated hash: ${passwordHash}\n`);
    
    // Verify the hash works
    const testHash = await bcrypt.compare(correctPassword, passwordHash);
    console.log(`Hash verification: ${testHash ? '✅ WORKS' : '❌ FAILED'}\n`);
    
    if (!testHash) {
      console.log('❌ Hash generation failed! Aborting.');
      return;
    }

    // List of users to update (excluding admin)
    const usersToUpdate = [
      'kashmira@gmail.com',
      'rahul.sharma@gmail.com',
      'priya.patel@gmail.com',
      'amit.kumar@gmail.com',
      'sneha.gupta@gmail.com',
      'vikash.singh@gmail.com',
      'anjali.mehta@gmail.com',
      'rohan.joshi@gmail.com',
      'kavya.reddy@gmail.com',
      'arjun.nair@gmail.com',
      'co@khelwapas.com' // Also update Vinit's account
    ];

    console.log(`Updating ${usersToUpdate.length} user accounts...\n`);

    for (const email of usersToUpdate) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, fullName: true, email: true }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash }
        });
        console.log(`✅ Updated: ${user.fullName} (${user.email})`);
      } else {
        console.log(`⚠️  Not found: ${email}`);
      }
    }

    console.log(`\n✅ Successfully updated passwords for all users.`);
    console.log(`\nAll users can now login with password: ${correctPassword}`);
    
    // Verify one user
    console.log('\n--- VERIFICATION TEST ---\n');
    const testUser = await prisma.user.findUnique({
      where: { email: 'kashmira@gmail.com' }
    });
    
    if (testUser) {
      const isValid = await bcrypt.compare(correctPassword, testUser.passwordHash);
      console.log(`Test login for kashmira@gmail.com: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserPasswords();
