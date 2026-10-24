import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedDemoMarketplace } from '../src/server/demo/fixtures';

const prisma = new PrismaClient();
seedDemoMarketplace(prisma)
  .then(users => console.log(`Prototype activity ready: ${users.length} fictional users with linked orders, seller requests and demo pickups. Existing demo edits were preserved.`))
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
