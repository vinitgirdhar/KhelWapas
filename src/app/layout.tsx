
import './globals.css';
import { cn } from '@/lib/utils';

import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import AppShell from '@/components/layout/app-shell';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning

    >
      <head>
        <title>KHELWAPAS - Marketplace for New & Pre-Owned Sports Gear</title>
        <meta
          name="description"
          content="Buy and sell new and used sports equipment. Get instant price estimates with our AI tool, enjoy free pickup, and shop quality-inspected gear."
        />
        <link rel="icon" type="image/png" href="/images/logo.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
