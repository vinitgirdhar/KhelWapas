import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.sellRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('\n📋 RECENT SELL REQUESTS\n');
  console.log('='.repeat(80));

  requests.forEach((req, i) => {
    console.log(`\n${i + 1}. ${req.title}`);
    console.log(`   Status: ${req.status}`);
    console.log(`   Category: ${req.category}`);
    console.log(`   Price: ₹${req.price}`);
    console.log(`   Submitted by: ${req.fullName} (${req.email})`);
    console.log(`   Date: ${req.createdAt.toLocaleString()}`);
    if (req.description) {
      console.log(`   Description: ${req.description.substring(0, 100)}...`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal Sell Requests in DB: ${requests.length}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
