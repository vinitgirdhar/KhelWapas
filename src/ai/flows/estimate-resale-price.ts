'use server';
/**
 * @fileOverview Estimates the resale price of sports equipment using AI.
 *
 * - estimateResalePrice - Estimates the resale price based on equipment data.
 * - EstimateResalePriceInput - The input type for estimateResalePrice.
 * - EstimateResalePriceOutput - The return type for estimateResalePrice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateResalePriceInputSchema = z.object({
  equipmentType: z.string().describe('The type of sports equipment (e.g., cricket bat, football).'),
  equipmentGrade: z.string().describe('The grade of the equipment (e.g., A, B, C, D).'),
  equipmentAge: z.number().describe('The age of the equipment in years.'),
  equipmentConditionDescription: z.string().describe('A detailed description of the equipment condition.'),
  pastSalesData: z.string().describe('Past sales data of similar equipment, if available.'),
});
export type EstimateResalePriceInput = z.infer<typeof EstimateResalePriceInputSchema>;

const EstimateResalePriceOutputSchema = z.object({
  estimatedPrice: z.number().describe('The estimated resale price of the equipment in INR.'),
  confidenceLevel: z.string().describe('A qualitative measure of the confidence in the price estimate (e.g., High, Medium, Low).'),
  reasoning: z.string().describe('The reasoning behind the price estimate, considering condition, age, and market data.'),
});
export type EstimateResalePriceOutput = z.infer<typeof EstimateResalePriceOutputSchema>;

export async function estimateResalePrice(input: EstimateResalePriceInput): Promise<EstimateResalePriceOutput> {
  return estimateResalePriceFlow(input);
}

const estimateResalePricePrompt = ai.definePrompt({
  name: 'estimateResalePricePrompt',
  input: {schema: EstimateResalePriceInputSchema},
  output: {schema: EstimateResalePriceOutputSchema},
  prompt: `You are an expert in pricing used sports equipment for the Indian market. Based on the following information, provide an estimated resale price in INR.

Equipment Type: {{{equipmentType}}}
Equipment Grade: {{{equipmentGrade}}}
Equipment Age: {{{equipmentAge}}} years
Condition Description: {{{equipmentConditionDescription}}}
Past Sales Data: {{{pastSalesData}}}

Consider the equipment type, grade, age, condition, and any provided past sales data to estimate the resale price. Also, estimate the confidence level in your price estimate. Provide a brief reasoning for your estimate.

Output the estimated price as a number, the confidence level as High, Medium, or Low, and the reasoning in a few sentences.
`,
});

const estimateResalePriceFlow = ai.defineFlow(
  {
    name: 'estimateResalePriceFlow',
    inputSchema: EstimateResalePriceInputSchema,
    outputSchema: EstimateResalePriceOutputSchema,
  },
  async input => {
    const {output} = await estimateResalePricePrompt(input);
    return output!;
  }
);