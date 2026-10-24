import { Truck, CheckCircle, Zap } from 'lucide-react';
const features = [
  { icon: Truck, title: 'Simple selling', description: 'Upload photos, describe your equipment, and submit your listing for review.' },
  { icon: Zap, title: 'More value. More play.', description: 'Find equipment for your next game, with clear pricing and condition details.' },
  { icon: CheckCircle, title: 'Reviewed listings', description: 'Listings are reviewed before they go live, with photos and condition grades to guide you.' },
];
export default function FeatureCards() {
  return <section className="bg-muted/20 py-8 md:py-20"><div className="container">
    <div className="mb-5 text-center md:mb-12"><h2 className="font-headline text-xl font-bold tracking-tight md:text-4xl">Why choose KHELWAPAS?</h2><p className="mx-auto mt-2 hidden max-w-2xl text-lg text-muted-foreground md:block">We make buying and selling sports gear simpler, safer, and more sustainable.</p></div>
    <div className="grid grid-cols-3 gap-2 md:gap-8">{features.map(({ icon: Icon, title, description }) => <div key={title} className="glass-container rounded-2xl border p-3 text-center md:p-8"><div className="glass-filter" /><div className="glass-overlay" /><div className="glass-specular" /><div className="glass-content"><div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 md:mb-5 md:h-16 md:w-16"><Icon className="h-4 w-4 text-primary md:h-8 md:w-8" /></div><h3 className="font-headline text-xs font-semibold leading-snug md:text-xl">{title}</h3><p className="mt-3 hidden text-sm leading-relaxed text-muted-foreground md:block">{description}</p></div></div>)}</div>
  </div></section>;
}
