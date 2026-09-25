import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query(
      'SELECT * FROM reviews ORDER BY CASE WHEN display_order = 0 THEN 999999 ELSE display_order END ASC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { author, role, company, content, stars, avatar_url, display_order, is_active } = await request.json();

    if (!author || !role || !content) {
      return NextResponse.json({ message: 'Author, role, and content are required' }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO reviews (author, role, company, content, stars, avatar_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        author,
        role,
        company || null,
        content,
        stars ? parseInt(stars, 10) : 5,
        avatar_url || null,
        display_order ? parseInt(display_order, 10) : 0,
        is_active !== false
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, author, role, company, content, stars, avatar_url, display_order, is_active } = await request.json();

    if (!id || !author || !role || !content) {
      return NextResponse.json({ message: 'ID, author, role, and content are required' }, { status: 400 });
    }

    const { rows } = await query(
      `UPDATE reviews
       SET author = $1, role = $2, company = $3, content = $4, stars = $5, avatar_url = $6, display_order = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [
        author,
        role,
        company || null,
        content,
        stars ? parseInt(stars, 10) : 5,
        avatar_url || null,
        display_order ? parseInt(display_order, 10) : 0,
        is_active !== false,
        id
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ message: 'Error updating review' }, { status: 500 });
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

    await query('DELETE FROM reviews WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ message: 'Error deleting review' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
