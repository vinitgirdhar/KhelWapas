import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { DEMO_PRODUCTS, RETIRED_DEMO_PRODUCTS } from '../src/data/demo-catalog';
const prisma = new PrismaClient();
async function main() {
  const email = process.env.DEMO_ADMIN_EMAIL, password = process.env.DEMO_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error('DEMO_ADMIN_PASSWORD must be at least 12 characters');
    await prisma.user.upsert({ where: { email: email.trim().toLowerCase() }, update: {}, create: { email: email.trim().toLowerCase(), fullName: 'Demo administrator', passwordHash: await bcrypt.hash(password, 12), role: 'admin' } });
  }
  if (process.env.SEED_MOCK_PRODUCTS !== 'true') return;
  for (const product of DEMO_PRODUCTS) {
    if (!existsSync(path.join(process.cwd(), 'public', product.imageUrls[0]))) throw new Error(`Missing demo product asset: ${product.imageUrls[0]}`);
  }
  const existing = await prisma.product.findMany({ where: { id: { in: [...DEMO_PRODUCTS, ...RETIRED_DEMO_PRODUCTS].map(product => product.id) } }, select: { id: true, sellerId: true, sourceRequestId: true } });
  if (existing.some(product => product.sellerId || product.sourceRequestId)) throw new Error('A demo catalog ID belongs to a seller listing. No demo products were changed.');
  const now = Date.now();
  const refresh = DEMO_PRODUCTS.map(({ photograph, sheet, cell, featuredRank, stock, ...product }, index) => {
    // Curated first picks keep the landing page diverse. Reseeding updates demo
    // content and images while preserving stock and publication decisions.
    const createdAt = new Date(now - (featuredRank === null ? 60 + index : featuredRank) * 60000);
    return prisma.product.upsert({ where: { id: product.id }, update: { ...product, createdAt }, create: { ...product, stock, createdAt } });
  });
  const retire = RETIRED_DEMO_PRODUCTS.map(product => prisma.product.updateMany({
    where: { id: product.id, sellerId: null, sourceRequestId: null },
    data: { ...product, category: 'Cricket', isAvailable: false, badge: 'Retired demo listing', originalPrice: null,
      imageUrls: ['/images/demo-catalog/cricket-practice-bat.webp'],
      description: 'Retired cricket bat demonstration. This listing is archived to preserve earlier product links, order snapshots and inventory history.',
      specs: { Sport: 'Cricket', 'Image source': 'AI-generated product illustration', 'Catalog use': 'Archived prototype listing' },
    },
  }));
  await prisma.$transaction([...refresh, ...retire]);
  console.log(`Demo catalog ready: ${DEMO_PRODUCTS.length} products across 22 categories.`);
}
main().finally(() => prisma.$disconnect());
