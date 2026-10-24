'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, LogOut, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KhelwapasLogo } from '@/components/icons/khelwapas-logo';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SearchComponent from './search-component';
import { HeaderCartButton } from './header-cart-button';
import { useAuth } from '@/hooks/use-auth';
import ThemeToggle from './theme-toggle';
import KhelbotWidget from '@/components/khelbot/khelbot-widget';
const mainNav = [{ href: '/shop/preowned', label: 'Pre-owned gear' }, { href: '/shop/new', label: 'New gear' }, { href: '/sell', label: 'Sell your gear' }];
export default function Header() {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  useEffect(() => { setOpen(false); setHelpOpen(false); }, [pathname]);
  const restoreHelpFocus = () => {
    const trigger = helpButton.current?.getClientRects().length ? helpButton.current : menuButton.current;
    trigger?.focus();
  };
  return <header className="sticky top-0 z-50 border-b border-border/70 liquid-glass">
    <div className="container flex h-[76px] items-center justify-between gap-5">
      <Link href="/" aria-label="KhelWapas home" className="flex shrink-0 items-center gap-2"><KhelwapasLogo /><span className="text-sm font-bold tracking-tight text-primary sm:text-base">KHELWAPAS</span></Link>
      <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 rounded-full bg-primary/[0.04] p-1">
        {mainNav.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:bg-card/80 hover:text-primary'}`}>{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <Button ref={helpButton} variant="ghost" size="icon" className="hidden xl:inline-flex" aria-label="Ask KhelBot" onClick={() => setHelpOpen(true)}><MessageCircle /></Button>
        <div className="hidden md:block"><SearchComponent /></div>
        <div className="hidden md:block"><HeaderCartButton /></div>
        <div className="hidden md:block">{isLoggedIn ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Your account"><UserRound /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href="/profile">My profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/profile/orders">My orders</Link></DropdownMenuItem><DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <Button asChild className="rounded-full"><Link href="/login">Sign in <ArrowUpRight /></Link></Button>}</div>
        <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button ref={menuButton} variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger><SheetContent className="liquid-glass w-full overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]" side="right" onCloseAutoFocus={event => { if (helpOpen) event.preventDefault(); }}><SheetTitle className="pr-6 font-headline text-2xl">Your next game starts here.</SheetTitle><SheetDescription>Explore, buy, and sell sports equipment.</SheetDescription><nav className="mt-6 grid gap-2">{mainNav.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl bg-primary/5 p-4 text-lg font-semibold text-primary">{item.label}</Link>)}<Link href="/cart" onClick={() => setOpen(false)} className="p-4">Your bag</Link><Link href={isLoggedIn ? '/profile' : '/login'} onClick={() => setOpen(false)} className="p-4">{isLoggedIn ? 'Your account' : 'Sign in / Register'}</Link><Button variant="ghost" className="h-12 justify-start px-4" onClick={() => { setOpen(false); setHelpOpen(true); }}><MessageCircle />Ask KhelBot</Button></nav><div className="mt-6"><SearchComponent /></div></SheetContent></Sheet>
      </div>
    </div>
    <KhelbotWidget open={helpOpen} onOpenChange={setHelpOpen} onCloseFocus={restoreHelpFocus} />
  </header>;
}
