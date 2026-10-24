'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, ShoppingBag, UserRound } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop/preowned', label: 'Explore', icon: Search },
  { href: '/sell', label: 'Sell gear', icon: Plus },
  { href: '/cart', label: 'Bag', icon: ShoppingBag },
  { href: '/profile', label: 'You', icon: UserRound },
];
export default function MobileNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { isLoggedIn, loading } = useAuth();
  if (!isLoggedIn || loading || pathname === '/') return null;
  return <nav aria-label="Mobile navigation" className="mobile-dock liquid-glass md:hidden">
    {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={cn('relative flex min-h-14 min-w-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors', pathname === href ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', href === '/sell' && 'bg-accent text-accent-foreground')}><Icon size={19} strokeWidth={1.8} /></span>{label}
      {href === '/cart' && items.length > 0 && <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-accent"><span className="sr-only">Items in your bag</span></span>}
    </Link>)}
  </nav>;
}
