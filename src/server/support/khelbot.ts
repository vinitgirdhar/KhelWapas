'use server';
import { z } from 'zod';
/** Offline help keeps the prototype useful without external AI credentials. */
export async function chatWithKhelbot(input: { message: string }): Promise<string> {
  const { message } = z.object({ message: z.string().trim().min(1).max(2000) }).parse(input);
  const query = message.toLowerCase();
  if (/pay|refund|card|upi/.test(query)) return 'This prototype uses a payment simulator. At checkout, choose a successful or declined demo payment. No money moves and no banking details are needed. Demo cancellations restore stock and mark the simulated payment as refunded.';
  if (/sell|list|photo/.test(query)) return 'To sell your sports equipment: sign in, open Sell your gear, add 3–10 JPEG, PNG or WebP photos, describe the condition, and set your price. Your listing goes live after admin review. Track it under Account → Sell Requests.';
  if (/order|deliver|ship|track/.test(query)) return 'Open Account → Orders to see your demo orders and their current status. You can open and print an invoice there. Shipping is simulated in this prototype; no courier is booked.';
  if (/grade|condition/.test(query)) return 'Condition grades: A means minimal signs of use, B means light wear, C means visible wear, and D means significant wear. Check the listing photos and description before choosing your gear.';
  if (/buy|find|shop|gear|cricket|football|racket/.test(query)) return 'Browse Pre-owned gear or New gear. Search by name, filter by sport or condition, and sort by price. Open a product to see photos and details, then add it to your bag and continue to demo checkout.';
  return 'I can help you explore gear, create a sell request, understand condition grades, or use demo checkout. Choose Shop, Sell, or Account in the navigation. This is a prototype help assistant and cannot change orders or contact support for you.';
}
