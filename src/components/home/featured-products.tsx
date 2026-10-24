'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ProductCard, { type Product } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CricketBatIcon,
} from '@/components/icons/cricket-bat';
import { Goal, DiscAlbum, Dumbbell, PersonStanding, Bike, Wind } from 'lucide-react';
import { ShuttlecockIcon } from '../icons/shuttlecock';
// Products will be fetched from API

const categories = [
  { name: 'All', icon: null },
  { name: 'Cricket', icon: <CricketBatIcon className="h-5 w-5" /> },
  { name: 'Football', icon: <Goal className="h-5 w-5" /> },
  { name: 'Badminton', icon: <ShuttlecockIcon className="h-5 w-5" /> },
  { name: 'Tennis', icon: <DiscAlbum className="h-5 w-5" /> },
];

export default function FeaturedProducts() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products from API
  useEffect(() => {
    if (!mounted) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products?available=true&limit=100');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load gear');
        if (data.success) {
          setAllProducts(data.products);
        }
      } catch (error) {
        setError('Could not load featured gear. Please refresh to try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    setFilteredProducts(activeCategory === 'All' ? allProducts.slice(0, 4) : allProducts.filter(p => p.category === activeCategory).slice(0,4));
  }, [activeCategory, allProducts, mounted]);
  

  return (
    <section className="py-20 bg-muted/20" suppressHydrationWarning>
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
            Featured Gear
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Top picks from our collection, ready for their next game.
          </p>
        </div>
        <div className="flex justify-center flex-wrap gap-2 mb-8" suppressHydrationWarning>
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? 'default' : 'outline'}
              onClick={() => {
                if(activeCategory !== category.name) {
                  setActiveCategory(category.name);
                }
              }}
              className="gap-2"
              suppressHydrationWarning
            >
              {category.icon}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
        {error && <p role="alert" className="mb-6 text-center text-destructive">{error}</p>}
        {!loading && !error && !filteredProducts.length && <p className="py-10 text-center text-muted-foreground">Fresh gear is on its way. Try another sport or list your own.</p>}
        <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {!mounted || loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ))
            : filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
        <div className="mt-8 text-center"><Button asChild variant="outline" className="rounded-full"><Link href="/shop/preowned">Explore pre-owned gear <ArrowUpRight /></Link></Button></div>
      </div>
    </section>
  );
}
