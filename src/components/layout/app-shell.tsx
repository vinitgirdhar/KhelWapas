"use client";

import { usePathname } from 'next/navigation';
import Head from 'next/head';
import PageMotion from '@/components/motion/page-motion';
import MobileNav from './mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import KhelbotWidget from '@/components/khelbot/khelbot-widget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAuth();
  const showMobileNav = isLoggedIn && !loading && pathname !== '/' && !pathname.startsWith('/admin') && !pathname.startsWith('/invoice');
  const isAdminRoute = pathname.startsWith('/admin');
  const isInvoiceRoute = pathname.startsWith('/invoice');

  return (
    <PageMotion><div className={cn("relative flex min-h-dvh flex-col", showMobileNav && "has-mobile-dock pb-24 md:pb-0")}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      {isInvoiceRoute && (
        <Head>
          <link rel="stylesheet" href="/invoice-print.css" />
        </Head>
      )}
      {isAdminRoute || isInvoiceRoute ? null : <Header />}
      <main id="main-content" tabIndex={-1}
        className={cn('flex-1', {
          'bg-muted/40': isAdminRoute,
          'bg-muted': isInvoiceRoute,
        })}
      >
        {children}
      </main>
      {isAdminRoute || isInvoiceRoute ? null : <Footer />}
      <Toaster />
      {!isAdminRoute && !isInvoiceRoute && <>{!pathname.startsWith('/checkout') && pathname !== '/cart' && <KhelbotWidget />}{showMobileNav && <MobileNav />}</>}
    </div></PageMotion>
  );
}
