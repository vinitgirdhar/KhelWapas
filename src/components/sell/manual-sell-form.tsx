'use client';

import { useState, useEffect, useRef } from 'react';
import { SPORTS_CATEGORIES } from '@/lib/categories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UploadCloud, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const manualSellSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  category: z.string().min(1, 'Please select a category.'),
  title: z.string().trim().min(5, 'Title must be at least 5 characters.').max(160),
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(10000),
  price: z.coerce.number<number>().positive('Please enter a valid price.').max(10000000).multipleOf(0.01, 'Use no more than two decimal places.'),
  contactMethod: z.enum(['Email', 'Phone', 'WhatsApp']),
  contactDetail: z.string().optional(),
}).refine(data => {
    if (data.contactMethod === 'Phone' || data.contactMethod === 'WhatsApp') {
        return !!data.contactDetail?.trim().match(/^\+?[\d\s-]{10,16}$/);
    }
    return true;
}, {
    message: 'Enter a valid Phone/WhatsApp number.',
    path: ['contactDetail']
});

type ManualSellFormValues = z.infer<typeof manualSellSchema>;

export default function ManualSellForm() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const filesRef = useRef(files);
  filesRef.current = files;
  const { toast } = useToast();
  const { user } = useAuth();
  useEffect(() => () => filesRef.current.forEach(file => URL.revokeObjectURL(file.preview)), []);

  const form = useForm<ManualSellFormValues>({
    resolver: zodResolver(manualSellSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      category: '',
      title: '',
      description: '',
      price: 0,
      contactMethod: 'Email',
      contactDetail: '',
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    disabled: loading,
    onDropRejected: rejected => {
      toast({ variant: 'destructive', title: 'Some images could not be added', description: rejected.some(file => file.errors.some(error => error.code === 'file-too-large')) ? 'Each image must be 5 MB or smaller.' : 'Choose JPEG, PNG or WebP images.' });
    },
    onDrop: acceptedFiles => {
      if (files.length + acceptedFiles.length > 10) {
        toast({
          variant: 'destructive',
          title: 'Too many images',
          description: 'You can upload a maximum of 10 images.',
        });
        return;
      }
      if ([...files, ...acceptedFiles].reduce((total, file) => total + file.size, 0) > 25 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Images are too large together', description: 'Keep the total upload under 25 MB.' });
        return;
      }
      setFiles(prevFiles => [
          ...prevFiles,
          ...acceptedFiles.map(file => Object.assign(file, {
              preview: URL.createObjectURL(file)
          }))
      ]);
      form.clearErrors('root.images');
    }
  });

  const removeFile = (fileToRemove: File & { preview?: string }) => {
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
    setFiles(files => files.filter(file => file !== fileToRemove));
  };
  
  async function onSubmit(data: ManualSellFormValues) {
    if (loading) return;
    if (files.length < 3) {
        form.setError('root.images', { type: 'manual', message: 'Please upload at least 3 images.' });
        return;
    }
      
    setLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if(value !== undefined) {
            formData.append(key, String(value));
        }
    });

    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/manual-sell', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      toast({
        title: 'Success!',
        description: 'Your listing is awaiting review. Follow its progress under Account → Sell Requests.',
      });
      form.reset();
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const contactMethod = form.watch('contactMethod');

  return (
    <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-6 md:p-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" autoComplete="name" maxLength={100} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SPORTS_CATEGORIES.map(sport => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asking Price (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0.01" max="10000000" step="0.01" inputMode="decimal" placeholder="e.g., 5000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Title</FormLabel>
                            <FormControl>
                                <Input maxLength={160} placeholder="e.g., Grade A English Willow Cricket Bat" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Description</FormLabel>
                            <FormControl>
                                <Textarea maxLength={10000} rows={4} placeholder="Describe the item's condition, age, brand, and any wear or tear." {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />

                    <div>
                        <p id="listing-images-label" className="text-sm font-medium">Upload Images (Min 3, Max 10)</p>
                        <div {...getRootProps({ 'aria-labelledby': 'listing-images-label', 'aria-describedby': 'listing-images-guide' })} className={cn("mt-2 flex justify-center rounded-lg border-2 border-dashed border-input px-6 py-10 cursor-pointer hover:border-primary transition-colors", isDragActive && "border-primary bg-primary/10", form.formState.errors.root?.images && "border-destructive", loading && "pointer-events-none opacity-60")}>
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select'}
                                </p>
                                <p id="listing-images-guide" className="text-xs text-muted-foreground">3–10 JPEG, PNG or WebP images. Up to 5 MB each, 25 MB total.</p>
                                <Input {...getInputProps()} />
                            </div>
                        </div>
                        {form.formState.errors.root?.images && (
                            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.root.images.message}</p>
                        )}
                         {files.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {files.map((file, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <Image src={file.preview} alt={`Selected image ${i + 1}`} fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover rounded-md" />
                                        <Button type="button" variant="destructive" size="icon" disabled={loading} aria-label={`Remove image ${i + 1}`} className="absolute right-0 top-0 h-10 w-10 rounded-full shadow-md" onClick={() => removeFile(file)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <FormField control={form.control} name="contactMethod" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Preferred Contact Method</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col sm:flex-row gap-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="Email" /></FormControl>
                                        <FormLabel className="font-normal">Email</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="Phone" /></FormControl>
                                        <FormLabel className="font-normal">Phone Call</FormLabel>
                                    </FormItem>
                                     <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="WhatsApp" /></FormControl>
                                        <FormLabel className="font-normal">WhatsApp</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {(contactMethod === 'Phone' || contactMethod === 'WhatsApp') && (
                        <FormField control={form.control} name="contactDetail" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{contactMethod} Number</FormLabel>
                                <FormControl>
                                    <Input type="tel" autoComplete="tel" maxLength={16} placeholder="Enter your number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}

                    <Button type="submit" size="lg" className="w-full font-bold gap-2" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                        Submit Request
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
