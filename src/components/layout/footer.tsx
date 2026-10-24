import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { KhelwapasLogo } from '@/components/icons/khelwapas-logo';
export default function Footer() {
  return <footer className="border-t bg-muted/35">
    <div className="container grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10 md:py-14">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2"><KhelwapasLogo /><span className="font-bold tracking-tight text-primary">KHELWAPAS</span></div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">More life for your gear. More possibilities for the next player. Keep the game going.</p>
        <Link href="/sell" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary">Pass your gear forward <ArrowUpRight size={16} /></Link>
      </div>
      <nav aria-label="Explore"><h2 className="mb-3 text-sm font-semibold">Find your games</h2><div className="grid gap-1 text-sm text-muted-foreground md:gap-2">{[['/shop/preowned','Pre-owned gear'],['/shop/new','New gear'],['/sell','Sell your equipment'],['/help','How it works & condition guide']].map(([href,label]) => <Link key={href} href={href} className="flex min-h-10 items-center transition-colors hover:text-primary">{label}</Link>)}</div></nav>
      <nav aria-label="Your account"><h2 className="mb-3 text-sm font-semibold">Your corner</h2><div className="grid gap-1 text-sm text-muted-foreground md:gap-2">{[['/profile','Your account'],['/profile/orders','Your orders'],['/profile/requests','Your sell requests'],['/profile/addresses','Delivery addresses']].map(([href,label]) => <Link key={href} href={href} className="flex min-h-10 items-center transition-colors hover:text-primary">{label}</Link>)}</div></nav>
    </div>
    <div className="container flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t py-5 text-xs leading-relaxed text-muted-foreground"><p>© {new Date().getFullYear()} KHELWAPAS. Keep the game going.</p><span>Prototype · Payments and delivery are simulated</span><Link href="/admin/login" className="py-2 hover:text-primary">Admin sign in</Link></div>
  </footer>;
}
