import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { rows } = await query('SELECT * FROM roles ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching roles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { name, permissions } = await request.json();
    
    if (!name || !Array.isArray(permissions)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
    
    const { rows } = await query(
      'INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *',
      [name, JSON.stringify(permissions)]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating role' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_team')) return forbiddenResponse();

  try {
    const { id, name, permissions } = await request.json();

    if (!id || !name || !Array.isArray(permissions)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    if (name === 'Super Admin') {
      return NextResponse.json({ message: 'Cannot edit Super Admin role' }, { status: 400 });
    }

    const { rows } = await query(
      'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *',
      [name, JSON.stringify(permissions), id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating role' }, { status: 500 });
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

    const check = await query('SELECT name FROM roles WHERE id = $1', [id]);
    if (check.rows.length > 0 && check.rows[0].name === 'Super Admin') {
      return NextResponse.json({ message: 'Cannot delete Super Admin role' }, { status: 400 });
    }

    // Check if any users are assigned to this role
    const users = await query('SELECT id FROM admins WHERE role_id = $1', [id]);
    if (users.rows.length > 0) {
      return NextResponse.json({ message: 'Cannot delete role assigned to users' }, { status: 400 });
    }

    await query('DELETE FROM roles WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting role' }, { status: 500 });
  }
}
