import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hippoclouds_super_secret_key_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const { rows } = await query(`
      SELECT a.id, a.username, a.email, a.password_hash, r.name as role_name, r.permissions 
      FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.username = $1 OR a.email = $1
    `, [identifier]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      username: user.username,
      email: user.email,
      role: user.role_name,
      permissions: user.permissions,
      isAdmin: user.permissions.includes('manage_team')
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
