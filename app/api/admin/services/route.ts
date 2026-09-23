import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM services ORDER BY display_order ASC, id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { title, description, highlight, icon_name, is_active, display_order, page_content, slug } = await request.json();
    
    // Generate a basic slug if one isn't provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { rows } = await query(
      'INSERT INTO services (title, description, highlight, icon_name, is_active, display_order, slug, page_content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, highlight, icon_name, is_active !== undefined ? is_active : true, display_order || 0, finalSlug, page_content || {}]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating service' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, title, description, highlight, icon_name, is_active, display_order, slug, page_content } = await request.json();
    
    // Generate a basic slug if one isn't provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { rows } = await query(
      'UPDATE services SET title = $1, description = $2, highlight = $3, icon_name = $4, is_active = $5, display_order = $6, slug = $7, page_content = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [title, description, highlight, icon_name, is_active, display_order, finalSlug, page_content || {}, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating service' }, { status: 500 });
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

    await query('DELETE FROM services WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting service' }, { status: 500 });
  }
}
