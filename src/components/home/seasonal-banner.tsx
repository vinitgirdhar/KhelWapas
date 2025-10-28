import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

export default function SeasonalBanner() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-12 px-6 text-center">
        <div 
          className="bg-primary/80 bg-blend-overlay bg-cover bg-center rounded-lg p-8 md:p-12"
          style={{ backgroundImage: "url('/images/products/background.jpg')" }}
          data-ai-hint="stadium lights rain"
        >
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Monsoon Sports Gear Sale</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-primary-foreground/80">
            Don't let the rain stop you. Get up to 40% off on all-weather gear, pre-owned and new!
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/shop/new">Shop The Sale <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
