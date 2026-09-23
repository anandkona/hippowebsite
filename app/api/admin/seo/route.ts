import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM seo_metadata ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching seo metadata' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== 'admin') return forbiddenResponse();

  try {
    const { page_path, title, description, keywords } = await request.json();
    
    // Check if exists
    const check = await query('SELECT id FROM seo_metadata WHERE page_path = $1', [page_path]);
    
    if (check.rows.length > 0) {
      // Update
      const { rows } = await query(
        'UPDATE seo_metadata SET title = $1, description = $2, keywords = $3, updated_at = CURRENT_TIMESTAMP WHERE page_path = $4 RETURNING *',
        [title, description, keywords, page_path]
      );
      return NextResponse.json(rows[0]);
    } else {
      // Insert
      const { rows } = await query(
        'INSERT INTO seo_metadata (page_path, title, description, keywords) VALUES ($1, $2, $3, $4) RETURNING *',
        [page_path, title, description, keywords]
      );
      return NextResponse.json(rows[0]);
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error saving seo metadata' }, { status: 500 });
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

    await query('DELETE FROM seo_metadata WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting seo metadata' }, { status: 500 });
  }
}
