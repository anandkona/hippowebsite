import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hippoclouds_super_secret_key_2026';

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function verifyAuth(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
    
    // Dynamically fetch the latest role and permissions for this user
    const { rows } = await query(`
      SELECT r.name as role, r.permissions 
      FROM admins a 
      JOIN roles r ON a.role_id = r.id 
      WHERE a.id = $1
    `, [decoded.userId]);

    if (rows.length === 0) return null;

    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email || '',
      role: rows[0].role || 'viewer',
      permissions: rows[0].permissions || []
    };
  } catch (error) {
    return null;
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden: Insufficient permissions') {
  return NextResponse.json({ message }, { status: 403 });
}
