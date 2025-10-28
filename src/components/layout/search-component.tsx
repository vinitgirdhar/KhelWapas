
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Mic, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Product } from '@/components/product-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

// Extend the Window interface for Safari support
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setAllProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsLoading(true);
      const results = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(results);
      setIsPopoverOpen(true);
      setIsLoading(false);
    } else {
      setFilteredProducts([]);
      setIsPopoverOpen(false);
      setIsLoading(false);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const SpeechRecognition = (window as SpeechRecognitionWindow).SpeechRecognition || (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        setIsListening(false);
        toast({
          variant: 'destructive',
          title: 'Voice Search Error',
          description: event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Something went wrong.',
        });
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: "Your browser doesn't support voice search.",
      });
      return;
    }
    recognitionRef.current.start();
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search gear..."
            className="pl-9 pr-16"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {searchQuery && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleVoiceSearch}>
              <Mic className={cn("h-4 w-4", isListening && "text-red-500 animate-pulse")} />
            </Button>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] md:w-[450px] p-0" align="start">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : filteredProducts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <p className="p-3 text-sm font-semibold text-muted-foreground">Products</p>
              {filteredProducts.map((product, index) => (
                <Link key={product.id} href={`/products/${product.id}`} onClick={() => setIsPopoverOpen(false)}>
                    <div className="p-3 hover:bg-muted transition-colors">
                        <div className="flex items-start gap-4">
                            <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-md object-cover" />
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                            <p className="ml-auto font-bold text-sm text-primary">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                     {index < filteredProducts.length - 1 && <Separator />}
                </Link>
              ))}
            </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery.length > 1 ? 'No products found.' : 'Start typing to search...'}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
