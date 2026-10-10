import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM partners ORDER BY display_order ASC, id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { name, logo_url, website_url, display_order, is_active, is_tally_partner, seo_title, seo_description, seo_keywords } = await request.json();
    
    const { rows } = await query(
      'INSERT INTO partners (name, logo_url, website_url, display_order, is_active, is_tally_partner, seo_title, seo_description, seo_keywords) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, logo_url, website_url, display_order || 0, is_active !== false, is_tally_partner || false, seo_title || null, seo_description || null, seo_keywords || null]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating partner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, name, logo_url, website_url, display_order, is_active, is_tally_partner, seo_title, seo_description, seo_keywords } = await request.json();

    const { rows } = await query(
      'UPDATE partners SET name = $1, logo_url = $2, website_url = $3, display_order = $4, is_active = $5, is_tally_partner = $6, seo_title = $7, seo_description = $8, seo_keywords = $9 WHERE id = $10 RETURNING *',
      [name, logo_url, website_url, display_order || 0, is_active !== false, is_tally_partner || false, seo_title || null, seo_description || null, seo_keywords || null, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating partner' }, { status: 500 });
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

    await query('DELETE FROM partners WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting partner' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';



