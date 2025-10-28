import { config } from 'dotenv'
config() // Load environment variables from .env file

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const mockNames = [
    'Yonex Astrox 100 ZZ',
    'SG Cobra Xtreme Kashmir Willow Bat',
    'Nivia Storm Football - Size 5',
    'Spalding NBA Zi/O Excel Basketball',
    'Wilson Tour Slam Lite Tennis Racquet',
    'Cosco Sprint 66 Nylon Shuttlecock'
  ];
  const deleted = await prisma.product.deleteMany({ where: { name: { in: mockNames } } });
  console.log(`🧹 Removed ${deleted.count} mock products.`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
