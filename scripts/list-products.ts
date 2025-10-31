import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      imageUrls: true,
      isAvailable: true,
      type: true,
    },
  });

  console.log('Total products:', products.length);
  for (const product of products) {
    console.log(`${product.createdAt.toISOString()} | ${product.name} | available=${product.isAvailable} | type=${product.type} | images=${product.imageUrls}`);
  }

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
