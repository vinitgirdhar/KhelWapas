
'use client';

import Link from 'next/link';
import {
    ChevronLeft,
    Upload,
    X,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { Product } from '@/components/product-card';

// Define a proper type for our file state
interface FileWithPreview {
    id: string;
    name: string;
    preview: string;
    isExisting: boolean;
    originalUrl?: string;
    file?: File; // Add the actual file object for uploads
}

export default function ProductFormPage() {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // Pricing states start as empty string for new product UX; internally we parse to number when saving
    const [price, setPrice] = useState<string>('');
    const [originalPrice, setOriginalPrice] = useState<string>('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState(0);
    const [status, setStatus] = useState<'In Stock' | 'Out of Stock'>('In Stock');
    const [type, setType] = useState<'new' | 'preowned'>('new');
    const [category, setCategory] = useState('');
    const [badge, setBadge] = useState<'A' | 'B' | 'C' | 'D' | undefined>(undefined);
    const [grade, setGrade] = useState<'A' | 'B' | 'C' | 'D' | undefined>(undefined);
    
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const productId = typeof params.id === 'string' ? params.id : null;
    const isEditing = productId !== 'new';

    useEffect(() => {
        if (isEditing && productId) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`/api/products/${productId}`);
                    const data = await response.json();
                    if (data.success && data.product) {
                        const product = data.product;
                        setName(product.name);
                        setDescription(product.description || '');
                        setPrice(product.price?.toString() ?? '');
                        setOriginalPrice((product.originalPrice ?? '').toString());
                        setSku(product.sku);
                        setStock(product.status === 'In Stock' ? 1 : 0);
                        setStatus(product.status);
                        setType(product.type);
                        setCategory(product.category);
                        setBadge(product.badge || undefined);
                        setGrade(product.grade || undefined);
                        
                        // Load all existing images properly
                        const existingImages: FileWithPreview[] = [];
                        if (product.images && product.images.length > 0) {
                            // Add all images from the product
                            product.images.forEach((imageUrl: string, index: number) => {
                                // Validate that the URL is not a blob URL
                                if (imageUrl && !imageUrl.startsWith('blob:')) {
                                    existingImages.push({
                                        id: `existing-${index}`,
                                        name: `existing-image-${index}`,
                                        preview: imageUrl,
                                        isExisting: true,
                                        originalUrl: imageUrl
                                    });
                                }
                            });
                        } else if (product.image && !product.image.startsWith('blob:')) {
                            // Fallback to single image if images array is not available
                            existingImages.push({
                                id: 'existing-0',
                                name: 'existing-image-0',
                                preview: product.image,
                                isExisting: true,
                                originalUrl: product.image
                            });
                        }
                        setFiles(existingImages);
                    } else {
                        toast({ variant: 'destructive', title: 'Product not found' });
                        router.push('/admin/products');
                    }
                } catch (error) {
                    console.error('Failed to fetch product:', error);
                    toast({ variant: 'destructive', title: 'Failed to load product' });
                    router.push('/admin/products');
                }
            };

            fetchProduct();
        }
    }, [isEditing, productId, router, toast]);

    const [isUploading, setIsUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: async (acceptedFiles) => {
            if (files.length + acceptedFiles.length > 10) {
                toast({
                    variant: 'destructive',
                    title: 'Too many images',
                    description: 'You can upload a maximum of 10 images.',
                });
                return;
            }

            setIsUploading(true);

            const newFilesWithPreview = acceptedFiles.map((file, index) => ({
                id: `new-${Date.now()}-${index}`,
                name: file.name,
                preview: URL.createObjectURL(file),
                isExisting: false,
                file: file,
            }));

            setFiles(prevFiles => [...prevFiles, ...newFilesWithPreview]);

            const formData = new FormData();
            acceptedFiles.forEach(file => {
                formData.append('files', file);
            });

            try {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Upload failed');
                }

                const uploadData = await uploadResponse.json();

                if (!uploadData.success || !uploadData.files) {
                    throw new Error(uploadData.message || 'Failed to get uploaded file URLs');
                }

                const uploadedUrls = uploadData.files as string[];

                setFiles(prevFiles => {
                    // Create a copy to modify
                    const updatedFiles = [...prevFiles];

                    // Replace temporary blob URLs with permanent URLs from the server
                    newFilesWithPreview.forEach((tempFile, index) => {
                        const correspondingUrl = uploadedUrls[index];
                        const fileIndex = updatedFiles.findIndex(f => f.id === tempFile.id);
                        if (fileIndex !== -1 && correspondingUrl) {
                            updatedFiles[fileIndex] = {
                                ...updatedFiles[fileIndex],
                                preview: correspondingUrl,
                                originalUrl: correspondingUrl,
                                isExisting: true, // It's now saved on the server
                                file: undefined, // No need to hold the file object anymore
                            };
                            URL.revokeObjectURL(tempFile.preview); // Clean up blob URL
                        }
                    });
                    return updatedFiles;
                });

                toast({
                    title: 'Upload successful',
                    description: `${acceptedFiles.length} image(s) have been uploaded.`,
                });

            } catch (error) {
                console.error('Failed to upload files:', error);
                toast({
                    variant: 'destructive',
                    title: 'Upload Error',
                    description: 'Could not upload images. Please try again.',
                });
                // Remove the temporary previews if upload fails
                setFiles(prevFiles => prevFiles.filter(f => !newFilesWithPreview.some(nf => nf.id === f.id)));
            } finally {
                setIsUploading(false);
            }
        }
    });

    const removeFile = (fileToRemove: FileWithPreview) => {
        setFiles(prevFiles => {
            const filtered = prevFiles.filter(file => file.id !== fileToRemove.id);
            
            // Clean up object URLs for new files
            if (!fileToRemove.isExisting) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            
            return filtered;
        });
    };

    const handleSave = async () => {
        if (!isEditing) {
            // Create new product
            try {
                // First upload images if there are new files
                let imageUrls: string[] = [];
                
                const newFilesToUpload = files.filter(f => f.file && !f.isExisting);
                
                if (newFilesToUpload.length > 0) {
                    const formData = new FormData();
                    newFilesToUpload.forEach(fileWithPreview => {
                        if (fileWithPreview.file) {
                            formData.append('files', fileWithPreview.file);
                        }
                    });
                    
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        if (uploadData.success && uploadData.files) {
                            imageUrls = uploadData.files;
                        } else {
                            throw new Error(uploadData.message || 'Failed to get image URLs from upload response');
                        }
                    } else {
                        const errorData = await uploadResponse.json();
                        throw new Error(errorData.message || 'Failed to upload images');
                    }
                }
                
                // Create product payload
                const payload: any = {
                    name,
                    category,
                    type,
                    price,
                    originalPrice,
                    description,
                    isAvailable: status === 'In Stock',
                    imageUrls,
                    specs: {}
                };
                
                // Only add badge and grade if they have values
                if (badge) payload.badge = badge;
                if (grade) payload.grade = grade;
                
                console.log('Creating new product with payload:', payload);
                
                const createResponse = await fetch('/api/products/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                
                const createData = await createResponse.json();
                
                if (!createResponse.ok || !createData.success) {
                    throw new Error(createData?.message || 'Failed to create product');
                }
                
                toast({
                    title: 'Success!',
                    description: 'Product created successfully!',
                });
                
                // Trigger real-time update on products page
                localStorage.setItem('productCreated', 'true');
                
                router.push('/admin/products');
                return;
                
            } catch (error) {
                console.error('Failed to create product:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to create product',
                });
                return;
            }
        } else if (productId) {
            try {
                // Build payload matching API schema
                const payload: any = {
                    name,
                    category,
                    type,
                    price,
                    originalPrice,
                    description,
                    isAvailable: status === 'In Stock',
                    badge: badge ?? null,
                    grade: grade ?? null,
                }

                // All images are already uploaded and have permanent URLs
                const allImageUrls = files
                    .map(f => f.originalUrl)
                    .filter((url): url is string => !!url);

                payload.imageUrls = allImageUrls;

                console.log('=== DEBUGGING PRODUCT UPDATE ===');
                console.log('Product ID:', productId);
                console.log('Payload being sent:', JSON.stringify(payload, null, 2));
                console.log('Form state - badge:', badge);
                console.log('Form state - grade:', grade);
                console.log('Form state - status:', status);
                console.log('Image URLs:', allImageUrls);

                const res = await fetch(`/api/products/${productId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                console.log('Response status:', res.status);
                console.log('Response ok:', res.ok);
                console.log('Response headers:', Object.fromEntries(res.headers.entries()));

                let data;
                try {
                    const responseText = await res.text();
                    console.log('Raw response text:', responseText);
                    data = responseText ? JSON.parse(responseText) : {};
                } catch (parseError) {
                    console.error('Failed to parse response as JSON:', parseError);
                    data = {};
                }

                console.log('Parsed response data:', JSON.stringify(data, null, 2));

                if (!res.ok || !data.success) {
                    console.error('Backend validation failed:', {
                        status: res.status,
                        statusText: res.statusText,
                        data: data
                    });
                    throw new Error(data?.message || `Request failed with status ${res.status}`)
                }

                // Update local UI from response to reflect immediate change
                const updated = data.product as Product
                setName(updated.name)
                setDescription(updated.description || '')
                setPrice(updated.price != null ? String(updated.price) : '')
                setOriginalPrice(updated.originalPrice != null ? String(updated.originalPrice) : '')
                setStatus(updated.status as 'In Stock' | 'Out of Stock')
                setType(updated.type as 'new' | 'preowned')
                setCategory(updated.category)
                
                // Update files state with the new images from the API response
                if (updated.images && updated.images.length > 0) {
                    const newFiles: FileWithPreview[] = updated.images.map((imageUrl: string, index: number) => ({
                        id: `updated-${index}`,
                        name: `updated-image-${index}`,
                        preview: imageUrl,
                        isExisting: true,
                        originalUrl: imageUrl
                    }));
                    setFiles(newFiles);
                } else {
                    setFiles([]);
                }

                toast({
                    title: 'Product Updated',
                    description: `The product "${updated.name}" has been updated.`,
                })

                // Trigger real-time update on products page
                localStorage.setItem('productUpdated', 'true');

                // Navigate back to products list (or stay and keep editing)
                router.push('/admin/products')
            } catch (err: any) {
                console.error('Update product failed:', err)
                toast({ variant: 'destructive', title: 'Update failed', description: err?.message || 'Unable to update product' })
            }
        } else {
            toast({ variant: 'destructive', title: 'Invalid product', description: 'Missing product id' })
        }
    }

    // Cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (!file.isExisting) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Helper to determine dynamic step based on current numeric value
    const dynamicStep = (valStr: string) => {
        const v = parseInt(valStr || '0', 10);
        if (v >= 1000) return 100;
        if (v >= 100) return 10;
        return 1;
    };

    const sanitizeInput = (raw: string) => {
        // Remove non-digits
        let cleaned = raw.replace(/[^0-9]/g, '');
        // Strip leading zeros unless the value is exactly '0'
        if (cleaned.length > 1) {
            cleaned = cleaned.replace(/^0+/, '');
        }
        return cleaned;
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = sanitizeInput(e.target.value);
        setPrice(cleaned);
    };
    const handleOriginalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = sanitizeInput(e.target.value);
        setOriginalPrice(cleaned);
    };

    const adjustValue = (valueStr: string, direction: 1 | -1, setter: (v: string) => void) => {
        const current = parseInt(valueStr || '0', 10);
        const step = dynamicStep(valueStr);
        let next = current + direction * step;
        if (next < 0) next = 0;
        setter(next === 0 ? '' : next.toString());
    };

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="h-7 w-7">
                        <Link href="/admin/products">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Link>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        {isEditing ? 'Edit Product' : 'New Product'}
                    </h1>
                    <div className="hidden items-center gap-2 md:ml-auto md:flex">
                        <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
                            Discard
                        </Button>
                        <Button size="sm" onClick={handleSave}>Save Product</Button>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                                <CardDescription>
                                    Fill in the basic information about the product.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            className="w-full"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="min-h-32"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Images</CardTitle>
                                <CardDescription>
                                    Upload up to 10 images for the product. The first image will be the thumbnail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div {...getRootProps()} className={`flex justify-center rounded-lg border-2 border-dashed border-input px-6 py-10 transition-colors ${isUploading ? 'cursor-not-allowed bg-muted' : 'cursor-pointer hover:border-primary'}`}>
                                    <div className="text-center">
                                        {isUploading ? (
                                            <>
                                                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                                                <p className="mt-4 text-sm text-muted-foreground">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                                <p className="mt-4 text-sm text-muted-foreground">
                                                    {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select'}
                                                </p>
                                            </>
                                        )}
                                        <Input {...getInputProps()} disabled={isUploading} />
                                    </div>
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {files.map((file, i) => (
                                            <div key={file.id} className="relative aspect-square group">
                                                <Image 
                                                    src={file.preview} 
                                                    alt={`Preview ${i}`} 
                                                    fill 
                                                    className="object-cover rounded-md" 
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                    onClick={() => removeFile(file)}
                                                    disabled={isUploading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                {!file.preview.startsWith('blob:') && (
                                                    <div className="absolute bottom-1 left-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            Saved
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            type="text"
                                            className="w-full"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="e.g. Cricket, Football"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="price"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={price}
                                                placeholder=""
                                                onChange={handlePriceChange}
                                                onFocus={() => { if (price === '0') setPrice(''); }}
                                            />
                                            <div className="flex flex-col gap-1">
                                                <Button type="button" variant="outline" size="icon" className="h-6 w-8"
                                                    title={`Increase by ${dynamicStep(price)}`}
                                                    onClick={() => adjustValue(price, 1, setPrice)}>
                                                    <ChevronUp className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" variant="outline" size="icon" className="h-6 w-8"
                                                    title={`Decrease by ${dynamicStep(price)}`}
                                                    onClick={() => adjustValue(price, -1, setPrice)} disabled={!price}>
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="originalPrice"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={originalPrice}
                                                placeholder=""
                                                onChange={handleOriginalPriceChange}
                                                onFocus={() => { if (originalPrice === '0') setOriginalPrice(''); }}
                                            />
                                            <div className="flex flex-col gap-1">
                                                <Button type="button" variant="outline" size="icon" className="h-6 w-8"
                                                    title={`Increase by ${dynamicStep(originalPrice)}`}
                                                    onClick={() => adjustValue(originalPrice, 1, setOriginalPrice)}>
                                                    <ChevronUp className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" variant="outline" size="icon" className="h-6 w-8"
                                                    title={`Decrease by ${dynamicStep(originalPrice)}`}
                                                    onClick={() => adjustValue(originalPrice, -1, setOriginalPrice)} disabled={!originalPrice}>
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory & Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={(value) => setStatus(value as 'In Stock' | 'Out of Stock')}>
                                            <SelectTrigger id="status" aria-label="Select status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="In Stock">In Stock</SelectItem>
                                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={type} onValueChange={(value) => setType(value as 'new' | 'preowned')}>
                                            <SelectTrigger id="type" aria-label="Select type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="preowned">Pre-owned</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="badge">Badge</Label>
                                        <Select value={badge} onValueChange={(value) => setBadge(value as 'A' | 'B' | 'C' | 'D' | undefined)}>
                                            <SelectTrigger id="badge" aria-label="Select badge">
                                                <SelectValue placeholder="Select badge" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A - Premium</SelectItem>
                                                <SelectItem value="B">B - Standard</SelectItem>
                                                <SelectItem value="C">C - Basic</SelectItem>
                                                <SelectItem value="D">D - Economy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="grade">Grade (for pre-owned items)</Label>
                                        <Select value={grade} onValueChange={(value) => setGrade(value as 'A' | 'B' | 'C' | 'D' | undefined)}>
                                            <SelectTrigger id="grade" aria-label="Select grade">
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A - Excellent</SelectItem>
                                                <SelectItem value="B">B - Good</SelectItem>
                                                <SelectItem value="C">C - Fair</SelectItem>
                                                <SelectItem value="D">D - Poor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 md:hidden">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')}>
                        Discard
                    </Button>
                    <Button size="sm" onClick={handleSave}>Save Product</Button>
                </div>
            </div>
        </main>
    );
}

