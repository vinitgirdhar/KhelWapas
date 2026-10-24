
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, BarChart, Truck } from 'lucide-react';
import { KhelwapasLogo } from '@/components/icons/khelwapas-logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { toast } = useToast();
    const [loggingOut, setLoggingOut] = useState(false);
    async function logout() {
      if (loggingOut) return;
      setLoggingOut(true);
      try {
        const response = await fetch('/api/admin/logout', { method: 'POST' });
        if (!response.ok) throw new Error('Could not log out. Please try again.');
        window.location.assign('/admin/login');
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : 'Could not log out', variant: 'destructive' });
        setLoggingOut(false);
      }
    }
    
    // Check if the current page is the login page
    const isLoginPage = pathname === '/admin/login';

    const navItems = [
        { href: "/admin/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
        { href: "/admin/requests", icon: <Package className="h-5 w-5" />, label: "Sell requests" },
        { href: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
        { href: "/admin/pickups", icon: <Truck className="h-5 w-5" />, label: "Pickups" },
        { href: "/admin/products", icon: <Package className="h-5 w-5" />, label: "Products" },
        { href: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
        { href: "/admin/revenue", icon: <BarChart className="h-5 w-5" />, label: "Revenue" },
    ]

  // If it's the login page, render without sidebar and without auth guard
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For authenticated pages, render with sidebar and auth guard
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen min-w-0 w-full bg-muted/40">
        <TooltipProvider>
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav aria-label="Admin navigation" className="flex flex-col items-center gap-3 overflow-y-auto px-1 sm:py-5">
              <Link
                href="/admin/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
              >
                <KhelwapasLogo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Khelwapas Admin</span>
              </Link>
              {navItems.map((item) => (
                   <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                          <Link
                          href={item.href}
                          aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                          className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                               pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                          )}
                          >
                          {item.icon}
                          <span className="sr-only">{item.label}</span>
                          </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
              ))}
            </nav>
          </aside>
        </TooltipProvider>
        <div className="flex min-w-0 flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-2 sm:mx-6 sm:rounded-xl sm:border"><Link href="/" className="flex min-h-11 items-center text-sm font-medium text-primary">Back to marketplace</Link><Button variant="ghost" disabled={loggingOut} onClick={() => void logout()}>{loggingOut ? 'Logging out…' : 'Log out'}</Button></div>
          <nav aria-label="Admin mobile navigation" className="flex min-w-0 gap-2 overflow-x-auto border-b bg-card p-3 sm:hidden">{navItems.map(item => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? 'page' : undefined} className={cn("flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm", pathname.startsWith(item.href) && "bg-primary text-primary-foreground")}>{item.label}</Link>)}</nav>
          {children}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
