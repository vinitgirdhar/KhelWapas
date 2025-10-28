import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeProducts() {
  try {
    console.log('\n=== PRODUCT DATABASE ANALYSIS ===\n');

    // Get all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        type: true,
        price: true,
        isAvailable: true,
        createdAt: true,
      },
      orderBy: {
        category: 'asc'
      }
    });

    console.log(`📊 Total Products in Database: ${allProducts.length}\n`);

    // Group by category
    const byCategory = allProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          total: 0,
          new: 0,
          preowned: 0,
          available: 0,
          unavailable: 0,
          products: []
        };
      }
      acc[product.category].total++;
      acc[product.category][product.type]++;
      if (product.isAvailable) {
        acc[product.category].available++;
      } else {
        acc[product.category].unavailable++;
      }
      acc[product.category].products.push(product);
      return acc;
    }, {} as Record<string, any>);

    // Display category breakdown
    console.log('📁 PRODUCTS BY CATEGORY:\n');
    console.log('='.repeat(80));
    
    Object.keys(byCategory).sort().forEach(category => {
      const stats = byCategory[category];
      console.log(`\n🏷️  ${category.toUpperCase()}`);
      console.log(`   Total Items: ${stats.total}`);
      console.log(`   - New: ${stats.new}`);
      console.log(`   - Pre-owned: ${stats.preowned}`);
      console.log(`   - Available: ${stats.available} ✅`);
      console.log(`   - Unavailable: ${stats.unavailable} ❌`);
      
      if (stats.unavailable > 0) {
        console.log(`\n   Unavailable Items:`);
        stats.products
          .filter((p: any) => !p.isAvailable)
          .forEach((p: any) => {
            console.log(`     - ${p.name} (${p.type}) - ID: ${p.id}`);
          });
      }
    });

    console.log('\n' + '='.repeat(80));

    // Overall statistics
    console.log('\n📈 OVERALL STATISTICS:\n');
    const totalNew = allProducts.filter(p => p.type === 'new').length;
    const totalPreowned = allProducts.filter(p => p.type === 'preowned').length;
    const totalAvailable = allProducts.filter(p => p.isAvailable).length;
    const totalUnavailable = allProducts.filter(p => !p.isAvailable).length;

    console.log(`Total Products: ${allProducts.length}`);
    console.log(`├─ New Products: ${totalNew}`);
    console.log(`└─ Pre-owned Products: ${totalPreowned}`);
    console.log(`\nAvailability Status:`);
    console.log(`├─ Available: ${totalAvailable} (${((totalAvailable/allProducts.length)*100).toFixed(1)}%)`);
    console.log(`└─ Unavailable: ${totalUnavailable} (${((totalUnavailable/allProducts.length)*100).toFixed(1)}%)`);

    console.log(`\nTotal Categories: ${Object.keys(byCategory).length}`);
    console.log(`Categories: ${Object.keys(byCategory).sort().join(', ')}`);

    // Check for potential sync issues
    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 SYNCHRONIZATION CHECK:\n');

    const unavailableProducts = allProducts.filter(p => !p.isAvailable);
    if (unavailableProducts.length > 0) {
      console.log(`⚠️  Warning: ${unavailableProducts.length} products are marked as UNAVAILABLE`);
      console.log(`   These will NOT appear in the user-facing shop interface.\n`);
      console.log(`   Unavailable Products:`);
      unavailableProducts.forEach(p => {
        console.log(`   - ${p.name} (${p.category} - ${p.type})`);
      });
    } else {
      console.log('✅ All products are marked as AVAILABLE');
      console.log('   All items should appear in both admin panel and user interface.');
    }

    // Check for products without images
    const productsWithImages = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        imageUrls: true,
      }
    });

    const productsWithoutImages = productsWithImages.filter(p => {
      const images = p.imageUrls as any;
      return !images || (Array.isArray(images) && images.length === 0);
    });

    console.log('\n📸 IMAGE CHECK:\n');
    if (productsWithoutImages.length > 0) {
      console.log(`⚠️  Warning: ${productsWithoutImages.length} products have NO images`);
      productsWithoutImages.forEach(p => {
        console.log(`   - ${p.name}`);
      });
    } else {
      console.log('✅ All products have images');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Analysis Complete!\n');

  } catch (error) {
    console.error('Error analyzing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeProducts();
