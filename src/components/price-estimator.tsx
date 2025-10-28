'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  estimateResalePrice,
  type EstimateResalePriceOutput,
} from '@/ai/flows/estimate-resale-price';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, Loader2, AlertTriangle, BadgeDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  equipmentType: z.string().min(3, 'Please enter a valid equipment type.'),
  equipmentGrade: z.enum(['A', 'B', 'C', 'D']),
  equipmentAge: z.coerce.number().min(0, 'Age must be a positive number.'),
  equipmentConditionDescription: z
    .string()
    .min(10, 'Please provide a more detailed description.'),
  pastSalesData: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PriceEstimator() {
  const [result, setResult] = useState<EstimateResalePriceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentType: '',
      equipmentAge: 0,
      equipmentConditionDescription: '',
      pastSalesData: 'Not available',
    },
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const estimation = await estimateResalePrice(values);
      setResult(estimation);
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
                <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline text-2xl">
                AI Price Estimator
                </CardTitle>
                <CardDescription>Get an instant resale value estimate.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="equipmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cricket Bat, Football" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipmentGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A (Like New)</SelectItem>
                        <SelectItem value="B">B (Good)</SelectItem>
                        <SelectItem value="C">C (Fair)</SelectItem>
                        <SelectItem value="D">D (Used)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="equipmentConditionDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any wear, tear, or special features."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Estimate Price
            </Button>
          </form>
        </Form>
        
        <div className="mt-8">
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-20 w-full" />
                </div>
            )}
            {error && (
                <div className="flex flex-col items-center gap-2 text-center text-destructive bg-destructive/10 p-4 rounded-lg">
                    <AlertTriangle className="h-8 w-8" />
                    <p className="font-semibold">Estimation Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {result && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="text-center items-center">
                        <div className="bg-green-500/10 p-4 rounded-full border border-green-500/20">
                            <BadgeDollarSign className="h-10 w-10 text-green-600" />
                        </div>
                        <CardDescription>Estimated Resale Value</CardDescription>
                        <p className="font-headline text-5xl font-bold text-primary">
                           ₹{result.estimatedPrice.toLocaleString('en-IN')}
                        </p>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="font-semibold">Confidence: <span className="font-normal text-muted-foreground">{result.confidenceLevel}</span></p>
                        <p className="mt-2 text-sm text-muted-foreground italic">&quot;{result.reasoning}&quot;</p>
                         <Button className="mt-6 w-full font-bold" size="lg">Schedule Pickup</Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </CardContent>
    </Card>
  );
}