import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

export default function SeasonalBanner() {
  return (
    <section className="hidden md:block bg-[hsl(var(--brand-navy))] text-white">
      <div className="container py-12 px-6 text-center">
        <div 
          className="bg-[#14245e]/80 bg-blend-overlay bg-cover bg-center rounded-lg p-8 md:p-12"
          style={{ backgroundImage: "url('/images/products/background.jpg')" }}
          data-ai-hint="stadium lights rain"
        >
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">The next chapter starts with you.</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-white/80">
            From your first practice to your next personal best. Find the equipment that gets you moving.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/shop/new">Explore new gear <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
