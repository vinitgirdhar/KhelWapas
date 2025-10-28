
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, CreditCard, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    title: 'Payment Methods',
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
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    window.dispatchEvent(new Event('storage')); // Notify other tabs/windows
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  };

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
          <nav className="flex flex-col space-y-1">
            {sidebarNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2',
                    pathname === item.href
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline'
                  )}
                >
                  {item.icon}
                  {item.title}
                </Button>
              </Link>
            ))}
             <Separator className="my-2"/>
             <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleLogout}
             >
                <LogOut className="h-4 w-4"/>
                Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
