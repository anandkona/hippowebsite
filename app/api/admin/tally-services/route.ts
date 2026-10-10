import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM tally_services ORDER BY display_order ASC, id ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching tally_services', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { name, title, description, highlight, icon_name, is_active, display_order, page_content, slug } = await request.json();
    
    // Generate a basic slug if one isn't provided
    const finalTitle = title || name || '';
    const finalName = name || title || '';
    const finalSlug = slug || finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { rows } = await query(
      'INSERT INTO tally_services (name, title, description, highlight, icon_name, is_active, display_order, slug, page_content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [finalName, finalTitle, description, highlight, icon_name, is_active !== undefined ? is_active : true, display_order || 0, finalSlug, page_content || {}]
    );
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating service', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, name, title, description, highlight, icon_name, is_active, display_order, slug, page_content } = await request.json();
    
    // Generate a basic slug if one isn't provided
    const finalTitle = title || name || '';
    const finalName = name || title || '';
    const finalSlug = slug || finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { rows } = await query(
      'UPDATE tally_services SET name = $1, title = $2, description = $3, highlight = $4, icon_name = $5, is_active = $6, display_order = $7, slug = $8, page_content = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
      [finalName, finalTitle, description, highlight, icon_name, is_active, display_order, finalSlug, page_content || {}, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating service', error: error.message }, { status: 500 });
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

    await query('DELETE FROM tally_services WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting service', error: error.message }, { status: 500 });
  }
}
