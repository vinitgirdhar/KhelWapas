import Hero from '@/components/home/hero';
import FeatureCards from '@/components/home/feature-cards';
import FeaturedProducts from '@/components/home/featured-products';
import SeasonalBanner from '@/components/home/seasonal-banner';
import Testimonials from '@/components/home/testimonials';

export default function Home() {
  return (
    <div className="landing-page-background min-h-screen">
      <div className="flex flex-col">
        {/* Wrap sections with a div for glassmorphism effect if needed, or apply to individual components */}
        <Hero />
        <div className="glassmorphic-container">
          <FeatureCards />
        </div>
        <div className="glassmorphic-container">
          <FeaturedProducts />
        </div>
        <div className="glassmorphic-container">
          <SeasonalBanner />
        </div>
        <div className="glassmorphic-container">
          <Testimonials />
        </div>
      </div>
    </div>
  );
}
