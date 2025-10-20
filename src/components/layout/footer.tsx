
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Github, Twitter, Instagram } from 'lucide-react';
import { KhelwapasLogo } from '@/components/icons/khelwapas-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t" suppressHydrationWarning>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" aria-label="Khelwapas Home">
              <KhelwapasLogo />
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The premier marketplace for new and pre-owned sports gear. Join our community and play on!
            </p>
            <div className="flex items-center gap-2 mt-2" suppressHydrationWarning>
              <a href="#" aria-label="Twitter">
                <Button variant="ghost" size="icon" suppressHydrationWarning>
                  <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </a>
              <a href="#" aria-label="Instagram">
                <Button variant="ghost" size="icon" suppressHydrationWarning>
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </a>
              <a href="#" aria-label="Github">
                <Button variant="ghost" size="icon" suppressHydrationWarning>
                  <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop/preowned" className="text-muted-foreground hover:text-primary">Pre-Owned Gear</Link></li>
              <li><Link href="/shop/new" className="text-muted-foreground hover:text-primary">New Gear</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Bundles & Kits</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Clearance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Sell</h4>
            <ul className="space-y-2">
              <li><Link href="/sell" className="text-muted-foreground hover:text-primary">Sell Your Gear</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Grading Guide</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Pickup Service</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="font-headline font-semibold mb-4">Stay Connected</h4>
            <p className="text-muted-foreground mb-2 text-sm">Get the latest deals and new arrivals.</p>
            <form className="flex gap-2" suppressHydrationWarning>
              <Input type="email" placeholder="Enter your email" className="bg-background" suppressHydrationWarning />
              <Button type="submit" variant="secondary" className="shrink-0" suppressHydrationWarning>Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground" suppressHydrationWarning>
          <p>&copy; {currentYear} KHELWAPAS. All Rights Reserved. | <Link href="/admin/login" className="hover:text-primary hover:underline">Admin Login</Link></p>
        </div>
      </div>
    </footer>
  );
}
