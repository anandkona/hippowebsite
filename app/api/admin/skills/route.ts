import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM skills ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching skills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { title, description, image_url, display_order, is_active, seo_title, seo_description, seo_keywords } = await request.json();
    
    const { rows } = await query(
      'INSERT INTO skills (title, description, image_url, display_order, is_active, seo_title, seo_description, seo_keywords) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, image_url, display_order || 0, is_active !== false, seo_title || null, seo_description || null, seo_keywords || null]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating skill' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, title, description, image_url, display_order, is_active, seo_title, seo_description, seo_keywords } = await request.json();

    const { rows } = await query(
      'UPDATE skills SET title = $1, description = $2, image_url = $3, display_order = $4, is_active = $5, seo_title = $6, seo_description = $7, seo_keywords = $8 WHERE id = $9 RETURNING *',
      [title, description, image_url, display_order || 0, is_active !== false, seo_title || null, seo_description || null, seo_keywords || null, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating skill' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    await query('DELETE FROM skills WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting skill' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

