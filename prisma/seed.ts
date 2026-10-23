import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const email = process.env.DEMO_ADMIN_EMAIL, password = process.env.DEMO_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error('DEMO_ADMIN_PASSWORD must be at least 12 characters');
    await prisma.user.upsert({ where: { email: email.trim().toLowerCase() }, update: {}, create: { email: email.trim().toLowerCase(), fullName: 'Demo administrator', passwordHash: await bcrypt.hash(password, 12), role: 'admin' } });
  }
  if (process.env.SEED_MOCK_PRODUCTS !== 'true') return;
  const products = [
    { id: 'demo-cricket', name: 'Cricket practice bat', category: 'Cricket', price: 1499, type: 'preowned' as const, image: '/uploads/products/1758704389394-3q3u4exc3c5.jpg' },
    { id: 'demo-club-bat', name: 'Club cricket bat', category: 'Cricket', price: 899, type: 'preowned' as const, image: '/uploads/products/1758704860280-lno7vy9rapr.jpg' },
    { id: 'demo-badminton', name: 'Lightweight badminton racket', category: 'Badminton', price: 1199, type: 'preowned' as const, image: '/uploads/products/1758707706955-axp3q8784bt.jpg' },
    { id: 'demo-training-bat', name: 'Cricket training bat', category: 'Cricket', price: 1899, type: 'preowned' as const, image: '/uploads/products/1758706675360-xnsz54k5czm.jpg' },
    { id: 'demo-new-bat', name: 'New match cricket bat', category: 'Cricket', price: 2499, type: 'new' as const, image: '/uploads/products/1760994005557-tcq3zj7g2vi.webp' },
  ];
  for (const { image, ...product } of products) await prisma.product.upsert({ where: { id: product.id }, update: {}, create: { ...product, grade: product.type === 'preowned' ? 'B' : null, description: 'Sample listing for exploring the KhelWapas prototype. Photos and pricing are demonstration content.', imageUrls: [image], stock: 5, badge: 'Demo listing' } });
}
main().finally(() => prisma.$disconnect());
