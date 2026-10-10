export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const { rows } = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();
    if (user.role === 'viewer') return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await query('DELETE FROM enquiries WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}

