import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      const { rows } = await query('SELECT * FROM blogs WHERE id = $1', [id]);
      if (rows.length === 0) return NextResponse.json({ message: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    } else {
      const { rows } = await query('SELECT * FROM blogs ORDER BY id DESC');
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error("GET Blogs Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { title, excerpt, content, category, image_url, read_time, published_date, is_active, seo_title, seo_description, seo_keywords } = await request.json();
    
    const { rows } = await query(
      'INSERT INTO blogs (title, excerpt, content, category, image_url, read_time, published_date, is_active, seo_title, seo_description, seo_keywords) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [title, excerpt, content || '', category, image_url, read_time, published_date, is_active || false, seo_title || null, seo_description || null, seo_keywords || null]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("POST Blogs Error:", error);
    return NextResponse.json({ message: 'Error creating blog' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, title, excerpt, content, category, image_url, read_time, published_date, is_active, seo_title, seo_description, seo_keywords } = await request.json();
    
    const { rows } = await query(
      'UPDATE blogs SET title = $1, excerpt = $2, content = $3, category = $4, image_url = $5, read_time = $6, published_date = $7, is_active = $8, seo_title = $9, seo_description = $10, seo_keywords = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
      [title, excerpt, content || '', category, image_url, read_time, published_date, is_active, seo_title || null, seo_description || null, seo_keywords || null, id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT Blogs Error:", error);
    return NextResponse.json({ message: 'Error updating blog' }, { status: 500 });
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

    await query('DELETE FROM blogs WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Blogs Error:", error);
    return NextResponse.json({ message: 'Error deleting blog' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

