import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY display_order ASC, id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { product_id, name, tagline, description, image_url, image_mode, logo_url, features, is_active, display_order, page_content } = await request.json();
    
    const { rows } = await query(
      'INSERT INTO products (product_id, name, tagline, description, image_url, image_mode, logo_url, features, is_active, display_order, page_content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [
        product_id, 
        name, 
        tagline, 
        description, 
        image_url, 
        image_mode || 'cover', 
        logo_url || null, 
        features ? JSON.stringify(features) : '[]', 
        is_active || false,
        display_order || 0,
        page_content ? JSON.stringify(page_content) : '{}'
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("POST Products Error:", error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (user.role === 'viewer') return forbiddenResponse();

  try {
    const { id, product_id, name, tagline, description, image_url, image_mode, logo_url, features, is_active, display_order, page_content } = await request.json();
    
    const { rows } = await query(
      'UPDATE products SET product_id = $1, name = $2, tagline = $3, description = $4, image_url = $5, image_mode = $6, logo_url = $7, features = $8, is_active = $9, display_order = $10, page_content = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
      [
        product_id, 
        name, 
        tagline, 
        description, 
        image_url, 
        image_mode || 'cover', 
        logo_url || null, 
        features ? JSON.stringify(features) : '[]', 
        is_active,
        display_order || 0,
        page_content ? JSON.stringify(page_content) : '{}',
        id
      ]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PUT Products Error:", error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
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

    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Products Error:", error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
