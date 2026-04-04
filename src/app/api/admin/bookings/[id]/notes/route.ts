import { NextResponse } from 'next/server';
import { createAdminBookingCommands } from '@/lib/booking-core/server';

const adminCommands = createAdminBookingCommands();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    if (!body.content) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }
    
    await adminCommands.addInternalNote(resolvedParams.id, body.content, 'system-admin');
    return NextResponse.json({ success: true, message: 'Note added successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Adding note failed' }, { status: 400 });
  }
}
