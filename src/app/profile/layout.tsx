
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, CreditCard, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/profile',
    icon: <User className="h-4 w-4" />,
  },
  {
    title: 'Orders',
    href: '/profile/orders',
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    title: 'Addresses',
    href: '/profile/addresses',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    title: 'Demo Payments',
    href: '/profile/payment',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: 'Sell Requests',
    href: '/profile/requests',
    icon: <ShoppingBag className="h-4 w-4" />,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { isLoggedIn, loading, logout: handleLogout } = useAuth();
  useEffect(() => { if (!loading && !isLoggedIn) router.replace('/login?redirect=' + encodeURIComponent(pathname)); }, [loading, isLoggedIn, router, pathname]);
  if (loading || !isLoggedIn) return <div className="container py-20" role="status">Loading your account…</div>;

  return (
    <div className="container space-y-12 py-12">
      <header className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          My Account
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings, orders, and addresses.
        </p>
      </header>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav aria-label="Account sections" className="flex overflow-x-auto gap-1 pb-2 lg:flex-col lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className="shrink-0">
                <span
                  className={cn(
                    'inline-flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium',
                    pathname === item.href
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline'
                  )}
                >
                  {item.icon}
                  {item.title}
                </span>
              </Link>
            ))}
             <Separator className="my-2 hidden lg:block"/>
             <Button
                variant="ghost"
                className="shrink-0 justify-start gap-2 text-destructive lg:w-full"
                onClick={handleLogout}
             >
                <LogOut className="h-4 w-4"/>
                Logout
            </Button>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
