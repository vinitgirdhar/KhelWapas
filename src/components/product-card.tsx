'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export type Product = {
  id: string;
  stock?: number;
  sellerId?: string;
  name: string;
  category: string;
  type: 'new' | 'preowned';
  price: number;
  originalPrice?: number;
  grade?: 'A' | 'B' | 'C' | 'D';
  image: string;
  images?: string[];
  badge?: 'Inspected' | 'Refurbished' | 'Bestseller' | 'Sale';
  description?: string;
  specs?: Record<string, string>;
  dataAiHint: string;
  status: 'In Stock' | 'Out of Stock';
  listingDate: string;
  sku: string;
};

interface ProductCardProps {
  product: Product;
}

const getBadgeClass = (badge?: Product['badge']) => {
  switch (badge) {
    case 'Inspected':
      return 'bg-green-700 text-white';
    case 'Refurbished':
      return 'bg-blue-700 text-white';
    case 'Bestseller':
      return 'bg-yellow-500 text-black';
    case 'Sale':
      return 'bg-red-700 text-white';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo(card.current, { y: 20, opacity: 0.6 }, { y: 0, opacity: 1, duration: .6, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: card.current, start: 'top 96%', once: true } });
      }, card);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  const primaryImage = product.image || (product.images && product.images[0]) || '/images/products/background.jpg';
  return (
    <Card ref={card} className="product-card min-w-0 overflow-hidden group transition-[transform,box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-xl motion-safe:hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative overflow-hidden bg-slate-50">
            <Image
              src={primaryImage}
              alt={product.name}
              width={600}
              height={600}
              sizes="(max-width: 1023px) 50vw, 25vw"
              className="aspect-square object-cover w-full transition-transform duration-700 motion-safe:group-hover:scale-105"
              data-ai-hint={product.dataAiHint}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.src = '/images/products/background.jpg';
                  target.dataset.fallback = 'true';
                }
              }}
            />
            {product.badge && (
                <Badge className={`absolute top-2 right-2 max-w-[calc(100%-1rem)] text-[10px] sm:top-3 sm:right-3 sm:text-xs ${getBadgeClass(product.badge)}`}>
                  {product.badge}
                </Badge>
            )}
          </div>
          <div className="p-3 sm:p-4 flex min-w-0 flex-col flex-grow bg-card">
            <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
              <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
              {product.type === 'preowned' && product.grade && (
                <Badge variant="outline" className="flex items-center gap-1 text-[10px] sm:gap-1.5 sm:text-xs">
                  <Star className="h-3 w-3 text-yellow-500" /> Grade: {product.grade}
                </Badge>
              )}
            </div>
            
            <h3 className="font-headline text-sm sm:text-base font-semibold leading-snug text-card-foreground flex-grow break-words">{product.name}</h3>

            <div className="flex flex-wrap gap-2 justify-between items-center mt-3 sm:mt-4">
              <p className="text-lg sm:text-2xl font-bold font-headline text-primary">₹{product.price.toLocaleString('en-IN')}</p>
              {/* This is a visual-only element to avoid nested interactive elements */}
              <div className={cn(
                  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                  'h-9 px-2 sm:px-3', // Corresponds to size="sm"
                  'border border-input bg-background group-hover:bg-primary group-hover:text-primary-foreground' // Corresponds to variant="outline" with hover effects
              )}>
                <span className="hidden sm:inline">View Details</span><span className="sm:hidden">Details</span>
                <ArrowRight className="h-4 w-4 sm:ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
