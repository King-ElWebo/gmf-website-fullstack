import { NextResponse } from 'next/server';
import { createAdminBookingCommands } from '@/lib/booking-core/server';

const adminCommands = createAdminBookingCommands();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const conflicts = await adminCommands.detectConflicts(resolvedParams.id);
    return NextResponse.json(conflicts);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Conflict detection failed' }, { status: 400 });
  }
}
