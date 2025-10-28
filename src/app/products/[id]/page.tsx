
'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.product);
          setSelectedImage(data.product.image);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);


  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

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

  const handleAddToCart = () => {
    if (!product) return;
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
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
    addItem({ ...product, quantity });
  };

  const handleBuyNow = () => {
    if (!product) return;
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
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
    addItem({ ...product, quantity });
    // Try to preselect default address if present
    try {
      const stored = localStorage.getItem('userAddresses');
      const addresses = stored ? JSON.parse(stored) : [];
      const defaultAddress = Array.isArray(addresses) ? addresses.find((a: any) => a?.isDefault) : null;
      if (defaultAddress) {
        sessionStorage.setItem('selectedAddress', JSON.stringify(defaultAddress));
      }
    } catch {}
    router.push('/checkout');
  };

  // For now, we'll use placeholder suggested products
  // In a real app, you'd fetch related products from the API
  const suggestedProducts = [
    {
      id: 'suggested1',
      name: 'Similar Product 1',
      category: product.category,
      type: 'preowned',
      price: 1500,
              image: '/images/products/background.jpg',
      badge: 'Inspected'
    },
    {
      id: 'suggested2',
      name: 'Similar Product 2',
      category: product.category,
      type: 'new',
      price: 2000,
              image: '/images/products/background.jpg',
      badge: 'Bestseller'
    }
  ];
  
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const gradeTooltip = {
    A: "Looks like new, with minimal to no signs of use.",
    B: "Good condition, with light signs of wear.",
    C: "Fair condition, with visible scratches or scuffs.",
    D: "Used condition, with significant signs of wear and tear."
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4 sticky top-24">
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
          <div className="grid grid-cols-5 gap-2">
            {allImages.map((img, index) => (
              <button key={index} onClick={() => setSelectedImage(img)} className={cn("overflow-hidden rounded-md border-2", selectedImage === img ? "border-primary" : "border-transparent")}>
                 <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={150}
                  height={150}
                  className="aspect-square object-cover w-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">{product.category}</span>
              {product.badge && <Badge className="bg-yellow-500 text-black">{product.badge}</Badge>}
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mt-2">{product.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-3xl font-bold font-headline text-primary">₹{product.price.toLocaleString('en-IN')}</p>
              {product.originalPrice && <p className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>}
            </div>
          </div>
          
          <div className="flex gap-2">
             {product.type === 'preowned' && product.grade && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Badge variant="outline" className="text-lg py-1 px-3 cursor-help flex items-center gap-2">
                         <Star className="h-4 w-4 text-yellow-500" /> Grade: {product.grade}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{gradeTooltip[product.grade as keyof typeof gradeTooltip]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             )}
             <Badge variant="outline" className="text-lg py-1 px-3 border-green-500 bg-green-50 text-green-700 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> KHELWAPAS Assured
             </Badge>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          {product.specs && (
             <div className="space-y-4">
                <h3 className="font-headline text-lg font-semibold">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   {Object.entries(product.specs).map(([key, value]) =>(
                    <div key={key} className="bg-muted/30 p-2 rounded-md">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      <span className="float-right font-semibold">{value}</span>
                    </div>
                   ))}
                </div>
              </div>
          )}
          
          <Separator />

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 border rounded-md p-1">
               <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity === 1}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" className="w-full sm:w-auto font-bold flex-grow" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2" /> Add to Cart
            </Button>
             <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold flex-grow" onClick={handleBuyNow}>
              <Zap className="mr-2" /> Buy Now
            </Button>
          </div>
        </div>
      </div>

       {suggestedProducts.length > 0 && (
         <div className="mt-24">
            <Separator className="mb-12"/>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-center mb-12">
                You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {suggestedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
         </div>
       )}
    </div>
  );
}
