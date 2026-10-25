'use server';
import { z } from 'zod';
import { getCurrentUser } from '@/server/auth';
import { rateLimit } from '@/server/rate-limit';
import { prisma } from '@/server/db';
import { ApiError } from '@/server/api';
import { containsText } from '@/server/search';
const inputSchema = z.object({ equipmentType: z.string().trim().min(2).max(100), equipmentGrade: z.enum(['A','B','C','D']), equipmentAge: z.number().min(0).max(50), equipmentConditionDescription: z.string().max(2000) });
export type EstimateResalePriceInput = z.infer<typeof inputSchema>;
export type EstimateResalePriceOutput = { estimatedPrice: number; confidenceLevel: string; reasoning: string };
export async function estimateResalePrice(input: EstimateResalePriceInput): Promise<EstimateResalePriceOutput> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in to use the estimator');
  const data = inputSchema.parse(input);
  await rateLimit('estimate', user.userId, 10, 3600000);
  const comparable = await prisma.product.findMany({ where: { isAvailable: true, OR: [{ name: containsText(data.equipmentType) }, { category: containsText(data.equipmentType) }] }, select: { price: true }, take: 30 });
  if (!comparable.length) throw new ApiError(422, 'Not enough comparable listings to estimate this gear. You can set your asking price in the listing form.');
  const prices = comparable.map(p => Number(p.price)).sort((a,b) => a-b);
  const midpoint = prices[Math.floor(prices.length / 2)];
  const gradeFactor = { A: .85, B: .65, C: .45, D: .25 }[data.equipmentGrade];
  const estimate = Math.max(1, Math.round(midpoint * gradeFactor * Math.max(.4, 1 - data.equipmentAge * .04)));
  return { estimatedPrice: estimate, confidenceLevel: 'Low · indicative only', reasoning: `A rough guide based on ${comparable.length} current asking-price listing(s), adjusted for the condition grade and age you entered. This is a prototype estimate, not an AI valuation or verified sale price. Set the asking price that works for you.` };
}
