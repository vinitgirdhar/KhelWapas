"use client";

import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import KhelbotWidget from '@/components/khelbot/khelbot-widget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isInvoiceRoute = pathname.startsWith('/invoice');

  return (
    <div className="relative flex min-h-dvh flex-col">
      {isInvoiceRoute && (
        <Head>
          <link rel="stylesheet" href="/invoice-print.css" />
        </Head>
      )}
      {isAdminRoute || isInvoiceRoute ? null : <Header />}
      <main
        className={cn('flex-1', {
          'bg-muted/40': isAdminRoute,
          'bg-gray-100': isInvoiceRoute,
        })}
      >
        {children}
      </main>
      {isAdminRoute || isInvoiceRoute ? null : <Footer />}
      <Toaster />
      {!isAdminRoute && <KhelbotWidget />}
    </div>
  );
}
