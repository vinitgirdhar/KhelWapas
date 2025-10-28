
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Tag } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="relative bg-cover bg-center md:bg-fixed min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/images/products/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative container flex flex-col items-center justify-center text-center text-white p-4">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter !leading-tight">
            Keep the Game Going.
            <br />
            <span className="text-primary-foreground/80">New & Pre-Owned Gear.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            India’s first marketplace to buy and sell quality-inspected sports equipment. Give your gear a second life or find your next favorite piece.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
              <Link href="/sell">
                Sell Now <Tag className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
              <Link href="/shop/preowned">
                Shop Pre-Owned <ShoppingCart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
