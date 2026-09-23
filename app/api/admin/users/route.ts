import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { rows } = await query(`
      SELECT a.id, a.username, a.email, a.created_at, a.role_id, r.name as role_name 
      FROM admins a 
      JOIN roles r ON a.role_id = r.id 
      ORDER BY a.id DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { username, email, password, role_id } = await request.json();
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const { rows } = await query(
      'INSERT INTO admins (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id, created_at',
      [username, email, password_hash, role_id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { id, username, email, role_id, password } = await request.json();

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      const { rows } = await query(
        'UPDATE admins SET username = $1, email = $2, role_id = $3, password_hash = $4 WHERE id = $5 RETURNING id, username, email, role_id',
        [username, email, role_id, password_hash, id]
      );
      return NextResponse.json(rows[0]);
    } else {
      const { rows } = await query(
        'UPDATE admins SET username = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING id, username, email, role_id',
        [username, email, role_id, id]
      );
      return NextResponse.json(rows[0]);
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    if (id === user.userId.toString()) {
      return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
    }

    await query('DELETE FROM admins WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
