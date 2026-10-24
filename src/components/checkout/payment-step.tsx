import type { PaymentMethod } from '@/types/user';
export default function PaymentStep(_: { selectedPayment: PaymentMethod | null; onSelectPayment: (payment: PaymentMethod) => void }) { return <p>This prototype uses a demo payment simulator at checkout. No real card details are needed.</p>; }
