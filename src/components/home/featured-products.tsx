'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Goal, DiscAlbum } from 'lucide-react';
import ProductCard, { type Product } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CricketBatIcon,
} from '@/components/icons/cricket-bat';
import { ShuttlecockIcon } from '../icons/shuttlecock';

const categories = [
  { name: 'All', icon: null },
  { name: 'Cricket', icon: <CricketBatIcon className="h-5 w-5" /> },
  { name: 'Football', icon: <Goal className="h-5 w-5" /> },
  { name: 'Badminton', icon: <ShuttlecockIcon className="h-5 w-5" /> },
  { name: 'Tennis', icon: <DiscAlbum className="h-5 w-5" /> },
];

export default function FeaturedProducts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [retry, setRetry] = useState(0);

  // Fetch products from API
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ available: 'true', limit: '4' });
        if (activeCategory !== 'All') params.set('category', activeCategory);
        const response = await fetch(`/api/products?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load gear');
        if (data.success) {
          setFilteredProducts(data.products);
        }
      } catch {
        if (!controller.signal.aborted) setError('Could not load featured gear. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [activeCategory, retry]);

  return (
    <section className="py-8 md:py-20 bg-muted/20" aria-label="Featured gear">
      <div className="container">
        <div className="text-center mb-5 md:mb-12">
          <h2 className="font-headline text-2xl md:text-4xl font-bold tracking-tight">
            Featured Gear
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Top picks from our collection, ready for their next game.
          </p>
        </div>
        <div className="flex justify-start gap-2 mb-5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center md:mb-8" role="group" aria-label="Featured sport">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? 'default' : 'outline'}
              aria-pressed={activeCategory === category.name}
              onClick={() => {
                if(activeCategory !== category.name) {
                  setActiveCategory(category.name);
                }
              }}
              className="shrink-0 gap-2 rounded-full"
            >
              {category.icon}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
        {error && <div role="alert" className="mb-6 text-center"><p className="text-destructive">{error}</p><Button variant="outline" className="mt-3" onClick={() => setRetry(value => value + 1)}>Try again</Button></div>}
        {!loading && !error && !filteredProducts.length && <p className="py-10 text-center text-muted-foreground">Fresh gear is on its way. Try another sport or list your own.</p>}
        <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" aria-busy={loading}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ))
            : !error && filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
        <div className="mt-6 md:mt-8 text-center"><Button asChild variant="outline" className="rounded-full"><Link href="/shop/preowned">Explore pre-owned gear <ArrowUpRight /></Link></Button></div>
      </div>
    </section>
  );
}
