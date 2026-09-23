import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM banners ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== 'admin') return forbiddenResponse();

  try {
    const { title, subtitle, image_url, is_active } = await request.json();
    
    // Allow multiple active banners

    const { rows } = await query(
      'INSERT INTO banners (title, subtitle, image_url, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, subtitle, image_url, is_active || false]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating banner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== 'admin') return forbiddenResponse();

  try {
    const { id, title, subtitle, image_url, is_active } = await request.json();
    
    // Allow multiple active banners

    const { rows } = await query(
      'UPDATE banners SET title = $1, subtitle = $2, image_url = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [title, subtitle, image_url, is_active, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating banner' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== 'admin') return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    await query('DELETE FROM banners WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting banner' }, { status: 500 });
  }
}
