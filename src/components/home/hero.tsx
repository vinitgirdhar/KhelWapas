import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDown, RotateCcw, ShieldCheck, MoveUpRight } from 'lucide-react';
export default function Hero() {
  return <section data-hero className="relative isolate overflow-hidden bg-[hsl(var(--brand-navy))] text-white">
    <Image data-hero-background src="/images/products/background.jpg" alt="Sports equipment ready for the next game" fill priority sizes="100vw" className="object-cover object-center opacity-40" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#101d4b]/95 via-[#101d4b]/70 to-[#101d4b]/10" />
    <div className="hero-orb absolute -left-40 top-16 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl" />
    <div className="container relative grid min-h-0 items-center gap-8 py-10 md:min-h-[720px] md:gap-12 md:grid-cols-[1.35fr_0.65fr] md:py-24">
      <div className="max-w-3xl">
        <p data-hero-reveal className="mb-5 md:mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide backdrop-blur-xl"><span className="h-2 w-2 rounded-full bg-accent" /> A second life for gear.<span className="hidden sm:inline"> A new start for you.</span></p>
        <h1 data-hero-reveal className="font-headline text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.99] tracking-[-0.065em]">Keep the<br />game <span className="text-orange-400">going.</span></h1>
        <p data-hero-reveal className="mt-5 md:mt-7 max-w-lg text-sm sm:text-base leading-relaxed text-white/80 md:text-lg">Great gear deserves another innings. Discover new and pre-owned sports equipment, or pass yours on to the next player.</p>
        <div data-hero-reveal className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap md:mt-9"><Button size="lg" asChild className="h-12 sm:h-14 rounded-full bg-accent px-3 sm:px-7 text-accent-foreground hover:bg-accent/90"><Link href="/shop/preowned"><span className="hidden sm:inline">Find your next gear</span><span className="sm:hidden">Shop gear</span> <ArrowUpRight /></Link></Button><Button size="lg" asChild variant="outline" className="h-12 sm:h-14 rounded-full border-white/30 bg-white/10 px-3 sm:px-7 text-white backdrop-blur-xl hover:bg-white/20 hover:text-white"><Link href="/sell">Sell your gear <MoveUpRight /></Link></Button></div>
        <div data-hero-reveal className="mt-12 hidden sm:flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/75"><span className="flex items-center gap-2"><ShieldCheck size={17} /> Reviewed listings</span><span className="flex items-center gap-2"><RotateCcw size={17} /> More play. Less waste.</span></div>
      </div>
      <Link data-hero-reveal href="/sell" className="hero-glass group hidden self-end md:block rounded-[2rem] border border-white/30 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl md:mb-4">
        <div className="mb-12 flex items-start justify-between"><span className="text-xs uppercase tracking-[0.2em] text-white/70">Made for the next player</span><ArrowUpRight className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="font-headline text-3xl font-medium tracking-tight">Your old favorite.<br />Their new beginning.</p><p className="mt-4 text-sm leading-relaxed text-white/75">Cricket to cycling. Badminton to basketball. Give every sport a second shot.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-300">Start selling <ArrowUpRight size={16} /></span>
      </Link>
      <a href="#discover" aria-label="Discover the marketplace" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-white/60 md:block"><ArrowDown size={20} /></a>
    </div>
  </section>;
}
