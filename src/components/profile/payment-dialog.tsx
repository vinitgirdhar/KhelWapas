'use client';
import type { PaymentMethod } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function PaymentDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onSave: (method: PaymentMethod) => void }) { return <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Demo payments</DialogTitle><DialogDescription>Use the payment simulator at checkout. No real payment information is collected.</DialogDescription></DialogHeader></DialogContent></Dialog>; }
