
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Minus, Plus, ShoppingCart, Zap, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProductCard, { type Product } from '@/components/product-card';
// Product will be fetched from API
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { savePurchaseIntent } from '@/lib/purchase-intent';
// Address data will be fetched from user profile or localStorage


export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addItem } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  
  const productId = typeof params.id === 'string' ? params.id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  // Fetch product from API
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setProduct(null); setSuggestedProducts([]); setQuantity(1);
    const fetchProduct = async () => {
      if (!productId) { setLoading(false); return; }
      
      try {
        const response = await fetch(`/api/products/${productId}`, { signal: controller.signal });
        const data = await response.json();
        if (response.status === 404) return;
        if (!response.ok || !data.success) throw new Error('We could not load this gear. Please try again.');
        setProduct(data.product);
        setSelectedImage(data.product.image);
        setLoading(false);
        // Recommendations are optional and should not delay or hide the listing.
        try {
          const related = await fetch('/api/products?available=true&limit=4&category=' + encodeURIComponent(data.product.category), { signal: controller.signal });
          const suggestions = await related.json();
          if (related.ok && suggestions.success) setSuggestedProducts(suggestions.products.filter((p: Product) => p.id !== productId).slice(0,3));
        } catch { /* The product remains usable if recommendations are unavailable. */ }
      } catch (failure) {
        if (!controller.signal.aborted) setError((failure as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [productId, retry]);


  if (loading) {
    return (
      <div className="container py-20 text-center" role="status" aria-label="Loading product">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="container py-20 text-center" role="alert"><h1 className="text-2xl font-semibold">Gear could not be loaded</h1><p className="mt-3 text-muted-foreground">{error}</p><Button className="mt-6" onClick={() => setRetry(value => value + 1)}>Try again</Button></div>;

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-headline text-4xl font-bold">Product not found</h1>
        <Button asChild className="mt-6">
          <Link href="/shop/preowned">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>
    );
  }

  const ownListing = !!user && product.sellerId === user.id;
  const unavailable = product.status === 'Out of Stock' || product.stock === 0;

  const handleAddToCart = () => {
    if (!product || ownListing || unavailable) return;
    const loggedIn = isLoggedIn;
    if (!loggedIn) {
      savePurchaseIntent({
        action: 'add',
        product,
        quantity,
        returnTo: `/products/${productId}`,
        createdAt: Date.now(),
      });
      toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
      router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product || ownListing || unavailable) return;
    const loggedIn = isLoggedIn;
    if (!loggedIn) {
      savePurchaseIntent({
        action: 'buy',
        product,
        quantity,
        returnTo: `/products/${productId}`,
        createdAt: Date.now(),
      });
      toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
      router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    addItem(product, quantity);
    router.push('/checkout');
  };

  const allImages = Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean)));

  const gradeTooltip = {
    A: "Looks like new, with minimal to no signs of use.",
    B: "Good condition, with light signs of wear.",
    C: "Fair condition, with visible scratches or scuffs.",
    D: "Used condition, with significant signs of wear and tear."
  }

  return (
    <div className="container py-8 md:py-16">
      <Link href={product.type === 'new' ? '/shop/new' : '/shop/preowned'} className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} />Back to gear</Link>
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={selectedImage!}
                alt={product.name}
                width={800}
                height={800}
                className="aspect-square object-cover w-full transition-all duration-300"
                data-ai-hint={product.dataAiHint}
              />
            </CardContent>
          </Card>
          {product.specs?.['Image source'] === 'AI-generated product illustration' && <p className="text-xs leading-relaxed text-muted-foreground">AI-generated demo image · Illustrative product and condition.</p>}
          {allImages.length > 1 && <div className="grid grid-cols-5 gap-2">
            {allImages.map((img, index) => (
              <button key={index} type="button" aria-label={`View image ${index + 1} of ${allImages.length}`} aria-pressed={selectedImage === img} onClick={() => setSelectedImage(img)} className={cn("overflow-hidden rounded-md border-2", selectedImage === img ? "border-primary" : "border-transparent")}>
                 <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={150}
                  height={150}
                  className="aspect-square object-cover w-full"
                />
              </button>
            ))}
          </div>}
        </div>

        {/* Product Info */}
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">{product.category}</span>
              {product.badge && <Badge className="bg-yellow-500 text-black">{product.badge}</Badge>}
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mt-2 break-words">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <p className="text-3xl font-bold font-headline text-primary">₹{product.price.toLocaleString('en-IN')}</p>
              {product.originalPrice && <p className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
             {product.type === 'preowned' && product.grade && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <button type="button" aria-label={`Grade ${product.grade}: ${gradeTooltip[product.grade]}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold cursor-help">
                         <Star className="h-4 w-4 text-yellow-500" /> Grade: {product.grade}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{gradeTooltip[product.grade as keyof typeof gradeTooltip]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             )}
             <Badge variant="outline" className="min-h-10 text-sm py-1 px-3 border-green-700/30 bg-green-700/10 text-green-800 dark:text-green-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Reviewed listing
             </Badge>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">Description</h3>
            <p className="whitespace-pre-wrap break-words text-muted-foreground">{product.description}</p>
          </div>
          
          {product.specs && (
             <div className="space-y-4">
                <h3 className="font-headline text-lg font-semibold">Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                   {Object.entries(product.specs).map(([key, value]) =>(
                    <div key={key} className="min-w-0 bg-muted/30 p-3 rounded-md">
                      <dt className="break-words font-medium text-muted-foreground">{key}</dt>
                      <dd className="mt-1 break-words font-semibold">{value}</dd>
                    </div>
                   ))}
                </dl>
              </div>
          )}
          
          <Separator />

          {(ownListing || unavailable) && <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{ownListing ? 'This is your listing. You can follow its status in your sell requests.' : 'This item is currently out of stock. Explore similar gear below.'}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border rounded-xl p-1">
               <Button variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity === 1 || unavailable || ownListing}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" aria-label="Increase quantity" disabled={quantity >= (product.stock || 1) || unavailable || ownListing} onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" className="min-w-0 basis-full sm:basis-auto font-bold flex-grow" disabled={unavailable || ownListing} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2" /> Add to Cart
            </Button>
             <Button size="lg" variant="secondary" className="min-w-0 basis-full sm:basis-auto font-bold flex-grow" disabled={unavailable || ownListing} onClick={handleBuyNow}>
              <Zap className="mr-2" /> Buy Now
            </Button>
          </div>
        </div>
      </div>

       {suggestedProducts.length > 0 && (
         <div className="mt-12 md:mt-24">
            <Separator className="mb-6 md:mb-12"/>
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-center mb-6 md:mb-12">
                You Might Also Like
            </h2>
            <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {suggestedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
         </div>
       )}
    </div>
  );
}
