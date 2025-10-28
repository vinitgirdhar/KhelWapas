'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const manualSellSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  category: z.string().min(1, 'Please select a category.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.coerce.number().min(1, 'Please enter a valid price.'),
  contactMethod: z.enum(['Email', 'Phone', 'WhatsApp']),
  contactDetail: z.string().optional(),
}).refine(data => {
    if (data.contactMethod === 'Phone' || data.contactMethod === 'WhatsApp') {
        return !!data.contactDetail && data.contactDetail.length > 5;
    }
    return true;
}, {
    message: 'Phone/WhatsApp number is required.',
    path: ['contactDetail']
});

type ManualSellFormValues = z.infer<typeof manualSellSchema>;

export default function ManualSellForm() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const { toast } = useToast();

  const form = useForm<ManualSellFormValues>({
    resolver: zodResolver(manualSellSchema),
    defaultValues: {
      fullName: '',
      email: '',
      category: '',
      title: '',
      description: '',
      price: 0,
      contactMethod: 'Email',
      contactDetail: '',
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: acceptedFiles => {
      if (files.length + acceptedFiles.length > 10) {
        toast({
          variant: 'destructive',
          title: 'Too many images',
          description: 'You can upload a maximum of 10 images.',
        });
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

  const removeFile = (fileToRemove: File) => {
    setFiles(files => files.filter(file => file !== fileToRemove));
  };
  
  async function onSubmit(data: ManualSellFormValues) {
    if (files.length < 5) {
        form.setError('root.images', { type: 'manual', message: 'Please upload at least 5 images.' });
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
        description: 'Your sell request has been submitted. We will get back to you shortly.',
      });
      form.reset();
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
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cricket">Cricket</SelectItem>
                                        <SelectItem value="Football">Football</SelectItem>
                                        <SelectItem value="Badminton">Badminton</SelectItem>
                                        <SelectItem value="Tennis">Tennis</SelectItem>
                                        <SelectItem value="Hockey">Hockey</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asking Price (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 5000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Grade A English Willow Cricket Bat" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Description</FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="Describe the item's condition, age, brand, and any wear or tear." {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />

                    <div>
                        <FormLabel>Upload Images (Min 5, Max 10)</FormLabel>
                        <div {...getRootProps()} className={cn("mt-2 flex justify-center rounded-lg border-2 border-dashed border-input px-6 py-10 cursor-pointer hover:border-primary transition-colors", isDragActive && "border-primary bg-primary/10", form.formState.errors.root?.images && "border-destructive")}>
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select'}
                                </p>
                                <p className="text-xs text-muted-foreground/80">PNG, JPG, up to 10MB each</p>
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
                                        <Image src={file.preview} alt={`Preview ${i}`} fill className="object-cover rounded-md" onLoad={() => URL.revokeObjectURL(file.preview)} />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFile(file)}>
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
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
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
                                    <Input placeholder="Enter your number" {...field} />
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
