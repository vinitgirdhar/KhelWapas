
'use client';

import { useState, useEffect } from 'react';
import ProductCard, { type Product } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Products will be fetched from API
import { Filter, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export default function PreownedGearPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortedAndFilteredProducts, setSortedAndFilteredProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Filter states
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [grades, setGrades] = useState<string[]>([]);

  // Sorting state
  const [sortBy, setSortBy] = useState('newest');
  
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const allCategories = Array.from(new Set(allProducts.filter(p => p.type === 'preowned').map(p => p.category)));
  const allGrades = ['A', 'B', 'C', 'D'];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?type=preowned&available=true');
        const data = await response.json();
        if (data.success) {
          setAllProducts(data.products);
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  useEffect(() => {
    let filteredItems = products;

    if (categories.length > 0) {
      filteredItems = filteredItems.filter(p => categories.includes(p.category));
    }
    
    if (grades.length > 0) {
      filteredItems = filteredItems.filter(p => p.grade && grades.includes(p.grade));
    }

    filteredItems = filteredItems.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    let sortedItems = [...filteredItems];
    switch (sortBy) {
        case 'price-asc':
            sortedItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedItems.sort((a, b) => b.price - a.price);
            break;
        case 'condition':
            sortedItems.sort((a, b) => (a.grade || 'Z').localeCompare(b.grade || 'Z'));
            break;
        case 'newest':
            // The default order is assumed to be 'newest', so no extra sorting is needed.
            break;
    }

    setSortedAndFilteredProducts(sortedItems);

  }, [categories, grades, priceRange, products, sortBy]);


  const handleCategoryChange = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleGradeChange = (grade: string) => {
    setGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const clearFilters = () => {
    setCategories([]);
    setGrades([]);
    setPriceRange([0, 20000]);
  }
  
  const activeFiltersCount = categories.length + grades.length + (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0);

  const FilterPanelContent = () => (
    <div className="flex flex-col h-full">
        <SheetHeader className="p-6 border-b">
            <SheetTitle className="font-headline text-xl font-semibold">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-grow p-6 overflow-y-auto">
            <Accordion type="multiple" defaultValue={['category', 'grade', 'price']} className="w-full">
                <AccordionItem value="category">
                <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                    {allCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`cat-${category}`} 
                            checked={categories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                            />
                        <Label htmlFor={`cat-${category}`}>{category}</Label>
                        </div>
                    ))}
                    </div>
                </AccordionContent>
                </AccordionItem>

                <AccordionItem value="grade">
                <AccordionTrigger className="font-semibold">Condition</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                    {allGrades.map(grade => (
                        <div key={grade} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`grade-${grade}`} 
                            checked={grades.includes(grade)}
                            onCheckedChange={() => handleGradeChange(grade)}
                            />
                        <Label htmlFor={`grade-${grade}`}>Grade {grade}</Label>
                        </div>
                    ))}
                    </div>
                </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
                <AccordionContent>
                    <div className="py-4">
                    <Slider
                        min={0}
                        max={20000}
                        step={500}
                        value={priceRange}
                        onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                        <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                    </div>
                    </div>
                </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        <div className="p-6 border-t mt-auto grid grid-cols-2 gap-4">
             <Button variant="ghost" onClick={clearFilters}>Clear All</Button>
             <Button onClick={() => setIsFilterSheetOpen(false)}>Apply</Button>
        </div>
    </div>
  );


  return (
    <div className="bg-muted/20">
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
          Pre-Owned Marketplace
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Find quality-inspected, pre-loved sports gear at great prices.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                         {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full max-w-sm">
                   <FilterPanelContent />
                </SheetContent>
            </Sheet>

            {activeFiltersCount > 0 && (
                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                    {categories.map(cat => (
                         <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                            {cat}
                            <button onClick={() => handleCategoryChange(cat)} className="h-4 w-4 rounded-full bg-background text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                     {grades.map(grade => (
                         <Badge key={grade} variant="secondary" className="gap-1 pr-1">
                            Grade {grade}
                            <button onClick={() => handleGradeChange(grade)} className="h-4 w-4 rounded-full bg-background text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                     {(priceRange[0] > 0 || priceRange[1] < 20000) && (
                         <Badge variant="secondary" className="gap-1 pr-1">
                            Price
                            <button onClick={() => setPriceRange([0, 20000])} className="h-4 w-4 rounded-full bg-background text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                     <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">Clear All</Button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground shrink-0">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="condition">Best Condition</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>


      <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                ))
              : sortedAndFilteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
          {sortedAndFilteredProducts.length === 0 && !loading && (
            <div className="text-center py-20 col-span-full">
              <h3 className="font-headline text-2xl">No Products Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters.</p>
            </div>
          )}
        </main>
    </div>
  </div>
  );
}
