import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageUrls: true,
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log('\n📸 PRODUCT IMAGE MAPPINGS\n');
  console.log('=' .repeat(80));

  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Images:`);
    
    const images = typeof product.imageUrls === 'string' 
      ? JSON.parse(product.imageUrls) 
      : product.imageUrls;
    
    if (Array.isArray(images)) {
      images.forEach((url: string) => {
        console.log(`   - ${url}`);
      });
    } else {
      console.log(`   - ${product.imageUrls}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal products: ${products.length}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
