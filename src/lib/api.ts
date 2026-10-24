import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ success: false, message: error.message, error: error.message }, { status: error.status });
  if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ success: false, message: error instanceof ZodError ? error.issues[0]?.message : 'Invalid JSON', error: 'Invalid input' }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return NextResponse.json({ success: false, message: 'This record already exists' }, { status: 409 });
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    if (['P1008', 'P2034', 'P2028'].includes(error.code)) return NextResponse.json({ success: false, message: 'Please retry this request' }, { status: 409 });
  }
  console.error('API request failed', error instanceof Error ? error.name : 'UnknownError');
  return NextResponse.json({ success: false, message: 'Unable to complete this request. Please try again.' }, { status: 500 });
}
export function pagination(params: URLSearchParams, defaultLimit = 20) {
  const page = Number(params.get('page') ?? 1), limit = Number(params.get('limit') ?? defaultLimit);
  if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new ApiError(400, 'Invalid pagination: limit must be 1–100');
  return { page, limit, skip: (page - 1) * limit };
}
