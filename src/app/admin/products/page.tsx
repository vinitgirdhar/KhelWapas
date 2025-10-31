
'use client';

import * as React from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { type Product } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusConfig: Record<Product['status'], string> = {
  'In Stock': 'bg-green-100 text-green-800 border-green-200',
  'Out of Stock': 'bg-red-100 text-red-800 border-red-200',
};

const typeConfig: Record<Product['type'], string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    preowned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function AdminProductsPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [products, setProducts] = React.useState<Product[]>([]);
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch products from API - moved outside useEffect so it can be reused
    const fetchProducts = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products?limit=200');
            const data = await response.json();
            if (data.success) {
                console.log('Fetched products:', data.products);
                setAllProducts(data.products);
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount
    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        if (term) {
            setProducts(allProducts.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)));
        } else {
            setProducts(allProducts);
        }
    };
    
    const handleDeleteProduct = async (productId: string) => {
        // TODO: Implement delete API call
        setProducts(products.filter(p => p.id !== productId));
    };

    const getProductsForTab = (tab: string) => {
        if (tab === 'all') return products;
        return products.filter(p => p.type === tab);
    };

    const handleRefresh = async () => {
        await fetchProducts();
    };

    // Listen for product creation/updates from other pages
    React.useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'productUpdated' || e.key === 'productCreated') {
                fetchProducts();
                // Clear the flag
                localStorage.removeItem('productUpdated');
                localStorage.removeItem('productCreated');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check on focus (for same-tab updates)
        const handleFocus = () => {
            if (localStorage.getItem('productUpdated') || localStorage.getItem('productCreated')) {
                fetchProducts();
                localStorage.removeItem('productUpdated');
                localStorage.removeItem('productCreated');
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchProducts]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="preowned">Pre-owned</TabsTrigger>
          </TabsList>
           <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or SKU..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Refresh
              </span>
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1" asChild>
              <Link href="/admin/products/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Link>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <ProductTable products={getProductsForTab('all')} onDelete={handleDeleteProduct} loading={loading} />
        </TabsContent>
        <TabsContent value="new">
          <ProductTable products={getProductsForTab('new')} onDelete={handleDeleteProduct} loading={loading} />
        </TabsContent>
        <TabsContent value="preowned">
          <ProductTable products={getProductsForTab('preowned')} onDelete={handleDeleteProduct} loading={loading} />
        </TabsContent>
      </Tabs>
    </main>
  );
}


function ProductTable({ products, onDelete, loading }: { products: Product[], onDelete: (id: string) => void, loading: boolean }) {
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

    const handleAction = (action: string, productName: string) => {
        toast({
            title: `Action: ${action}`,
            description: `${productName} has been ${action.toLowerCase()}ed.`,
        });
    };
    
    const confirmDelete = () => {
        if (productToDelete) {
            onDelete(productToDelete.id);
            toast({
                variant: 'destructive',
                title: 'Product Deleted',
                description: `${productToDelete.name} has been deleted.`,
            });
            setProductToDelete(null);
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your products and view their sales performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading products...
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Listed On
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                   <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        {product.image ? (
                          <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            fill
                            src={product.image}
                            onError={(e) => {
                              console.error('Image load error for product:', product.name, 'URL:', product.image);
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/products/background.jpg';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully for:', product.name, 'URL:', product.image);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        {product.name}
                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[product.status]}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeConfig[product.type]}>
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ₹{product.price.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(product.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Paus', product.name)}>Pause Listing</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => {
                                setProductToDelete(product);
                                setIsDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
            </div>
          </CardFooter>
        </Card>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        "{productToDelete?.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     </>
    )
}
