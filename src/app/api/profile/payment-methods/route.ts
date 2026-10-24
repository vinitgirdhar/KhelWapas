import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api';
export async function GET(request: NextRequest) { try { await requireUser(request); return NextResponse.json([]); } catch (e) { return apiError(e); } }
export async function POST(request: NextRequest) { try { await requireUser(request); return NextResponse.json({ message: 'Use the demo payment simulator at checkout. No real payment details are stored.' }, { status: 400 }); } catch (e) { return apiError(e); } }
