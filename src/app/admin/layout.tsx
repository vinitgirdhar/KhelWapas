
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Check if the current page is the login page
    const isLoginPage = pathname === '/admin/login';

    const navItems = [
        { href: "/admin/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
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
      <div className="flex min-h-screen w-full bg-muted/40">
        <TooltipProvider>
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
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
                          className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
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
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
          {children}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
