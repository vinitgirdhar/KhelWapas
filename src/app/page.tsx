import Hero from '@/components/home/hero';
import FeatureCards from '@/components/home/feature-cards';
import FeaturedProducts from '@/components/home/featured-products';
import SeasonalBanner from '@/components/home/seasonal-banner';
import HowItWorks from '@/components/home/how-it-works';

export default function Home() {
  return <div className="min-h-screen">
    <Hero />
    <div id="discover" className="scroll-mt-24"><FeatureCards /></div>
    <FeaturedProducts />
    <SeasonalBanner />
    <HowItWorks />
  </div>;
}
