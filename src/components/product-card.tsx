import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Product = {
  id: string;
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
      return 'bg-green-500 text-white';
    case 'Refurbished':
      return 'bg-blue-500 text-white';
    case 'Bestseller':
      return 'bg-yellow-500 text-black';
    case 'Sale':
      return 'bg-red-500 text-white';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.image || (product.images && product.images[0]) || '/images/products/background.jpg';
  return (
    <Card className="overflow-hidden group transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      <Link 
        href={`/products/${product.id}`} 
        className="flex flex-col h-full"
        prefetch={true}
      >
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative">
            <Image
              src={primaryImage}
              alt={product.name}
              width={600}
              height={600}
              className="aspect-square object-cover w-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint}
              loading="lazy"
              quality={85}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.src = '/images/products/background.jpg';
                  target.dataset.fallback = 'true';
                }
              }}
            />
            {product.badge && (
                <Badge className={`absolute top-3 right-3 transition-all duration-200 ${getBadgeClass(product.badge)}`}>
                  {product.badge}
                </Badge>
            )}
          </div>
          <div className="p-4 flex flex-col flex-grow bg-card">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">{product.category}</p>
              {product.type === 'preowned' && product.grade && (
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-yellow-500" /> Grade: {product.grade}
                </Badge>
              )}
            </div>
            
            <h3 className="font-headline font-semibold text-card-foreground flex-grow">{product.name}</h3>

            <div className="flex justify-between items-center mt-4">
              <p className="text-2xl font-bold font-headline text-primary">₹{product.price.toLocaleString('en-IN')}</p>
              {/* This is a visual-only element to avoid nested interactive elements */}
              <div className={cn(
                  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150',
                  'h-9 px-3', // Corresponds to size="sm"
                  'border border-input bg-background group-hover:bg-primary group-hover:text-primary-foreground' // Corresponds to variant="outline" with hover effects
              )}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
