import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyLogin() {
  const testEmail = 'kashmira@gmail.com';
  const testPassword = 'qwerty123';

  console.log('\n=== LOGIN VERIFICATION TEST ===\n');
  console.log(`Testing login for: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.passwordHash}`);
    console.log('');

    // Test password
    console.log('Testing password comparison...');
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    
    console.log(`Password Match: ${isValid ? '✅ YES' : '❌ NO'}`);
    
    if (isValid) {
      console.log('\n✅ LOGIN SUCCESSFUL - Password is correct!');
    } else {
      console.log('\n❌ LOGIN FAILED - Password does not match!');
      
      // Test what the hash should be
      console.log('\nGenerating new hash for comparison...');
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log(`New hash: ${newHash}`);
      
      const testNewHash = await bcrypt.compare(testPassword, newHash);
      console.log(`New hash works: ${testNewHash ? '✅ YES' : '❌ NO'}`);
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLogin();
