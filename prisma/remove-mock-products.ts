import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { DEMO_PRODUCTS } from '../src/data/demo-catalog';

const prisma = new PrismaClient();
async function main() {
  const result = await prisma.product.updateMany({
    where: { id: { in: DEMO_PRODUCTS.map(product => product.id) }, badge: 'Demo listing', sellerId: null, sourceRequestId: null },
    data: { isAvailable: false },
  });
  console.log(`Archived ${result.count} demo listings. Order history and inventory are preserved.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
