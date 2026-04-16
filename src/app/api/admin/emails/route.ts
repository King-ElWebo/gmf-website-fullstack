import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const logs: any[] = []; // Model 'EmailLog' was removed from Prisma schema
    return NextResponse.json(logs);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
