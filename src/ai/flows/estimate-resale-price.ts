'use server';
/**
 * @fileOverview Estimates the resale price of sports equipment using AI.
 *
 * - estimateResalePrice - Estimates the resale price based on equipment data.
 * - EstimateResalePriceInput - The input type for estimateResalePrice.
 * - EstimateResalePriceOutput - The return type for estimateResalePrice.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const EstimateResalePriceInputSchema = z.object({
  equipmentType: z.string().describe('The type of sports equipment (e.g., cricket bat, football).'),
  equipmentGrade: z.string().describe('The grade of the equipment (e.g., A, B, C, D).'),
  equipmentAge: z.number().describe('The age of the equipment in years.'),
  equipmentConditionDescription: z.string().describe('A detailed description of the equipment condition.'),
  pastSalesData: z.string().optional().describe('Past sales data of similar equipment, if available.'),
});
export type EstimateResalePriceInput = z.infer<typeof EstimateResalePriceInputSchema>;

const EstimateResalePriceOutputSchema = z.object({
  estimatedPrice: z.number().describe('The estimated resale price of the equipment in INR.'),
  confidenceLevel: z.string().describe('A qualitative measure of the confidence in the price estimate (e.g., High, Medium, Low).'),
  reasoning: z.string().describe('The reasoning behind the price estimate, considering condition, age, and market data.'),
});
export type EstimateResalePriceOutput = z.infer<typeof EstimateResalePriceOutputSchema>;

export async function estimateResalePrice(input: EstimateResalePriceInput): Promise<EstimateResalePriceOutput> {
  // Validate input with zod (runtime guard in case callers are untyped)
  const parsed = EstimateResalePriceInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input for estimateResalePrice: ${parsed.error.message}`);
  }

  const { equipmentType, equipmentGrade, equipmentAge, equipmentConditionDescription, pastSalesData } = parsed.data;

  const system = `You are an expert in pricing used sports equipment for the Indian market. Provide realistic prices in INR.`;
  const user = `Based on the following information, estimate the resale price and return ONLY a compact JSON object with this shape:
{
  "estimatedPrice": number,  // numeric INR value only
  "confidenceLevel": "High" | "Medium" | "Low",
  "reasoning": string
}

Equipment Type: ${equipmentType}
Equipment Grade: ${equipmentGrade}
Equipment Age: ${equipmentAge} years
Condition Description: ${equipmentConditionDescription}
Past Sales Data: ${pastSalesData ?? 'Not available'}

Rules:
- Only output the JSON object with keys exactly as specified.
- estimatedPrice must be a number (no currency symbol).
- Keep reasoning concise (1-3 sentences).`;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY or GOOGLE_GENAI_API_KEY.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `${system}\n\n${user}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Try to parse JSON from the response
  let jsonText = text;
  // If the model returned markdown code block, strip it
  const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    // Fallback: attempt to extract JSON object substring
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (!braceMatch) {
      throw new Error('Model response did not contain valid JSON.');
    }
    parsedJson = JSON.parse(braceMatch[0]);
  }

  const outputParsed = EstimateResalePriceOutputSchema.safeParse(parsedJson);
  if (!outputParsed.success) {
    throw new Error(`Model output did not match expected schema: ${outputParsed.error.message}`);
  }
  return outputParsed.data;
}