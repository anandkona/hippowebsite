import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signCandidateToken } from '@/lib/candidateAuth';
import { logAudit, createNotification } from '@/lib/careersService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      mobile,
      password,
      confirm_password,
      city = 'Visakhapatnam',
      country = 'India'
    } = body;

    // Validation
    if (!first_name || !last_name || !email || !mobile || !password) {
      return NextResponse.json({
        success: false,
        message: 'Please fill in all required fields.'
      }, { status: 400 });
    }

    if (password !== confirm_password) {
      return NextResponse.json({
        success: false,
        message: 'Passwords do not match.'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      }, { status: 400 });
    }

    // Check duplicate email
    const existing = await query('SELECT id FROM candidates WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      }, { status: 409 });
    }

    // Generate Candidate ID: HC-CAN-YYYY-XXXX
    const year = new Date().getFullYear();
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const candidateId = `HC-CAN-${year}-${randomCode}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO candidates (
        candidate_id, first_name, last_name, email, mobile,
        password_hash, city, country, profile_completion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 25)
      RETURNING id, candidate_id, first_name, last_name, email, mobile, city, country, profile_completion, created_at
    `;

    const { rows } = await query(insertSql, [
      candidateId,
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase().trim(),
      mobile.trim(),
      passwordHash,
      city,
      country
    ]);

    const candidate = rows[0];

    const token = signCandidateToken({
      candidateId: candidate.id,
      candidateCode: candidate.candidate_id,
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      email: candidate.email,
      mobile: candidate.mobile
    });

    await createNotification({
      candidateId: candidate.id,
      title: 'Welcome to HippoClouds Careers!',
      message: 'Your candidate account has been created. Complete your profile to apply for exciting roles.',
      link: '/careers/profile'
    });

    await logAudit({
      userEmail: candidate.email,
      userName: `${candidate.first_name} ${candidate.last_name}`,
      action: 'CANDIDATE_REGISTERED',
      entity: 'Candidate',
      entityId: candidate.candidate_id
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        candidate,
        token
      }
    }, { status: 201 });

    response.cookies.set('candidate_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Candidate registration error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Registration failed'
    }, { status: 500 });
  }
}

