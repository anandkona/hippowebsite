import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signCandidateToken } from '@/lib/candidateAuth';
import { logAudit } from '@/lib/careersService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required.'
      }, { status: 400 });
    }

    const { rows } = await query(
      `SELECT id, candidate_id, first_name, last_name, email, mobile, password_hash,
              current_title, city, state, country, profile_completion, resume_url
       FROM candidates WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password.'
      }, { status: 401 });
    }

    const candidate = rows[0];
    const passwordMatch = await bcrypt.compare(password, candidate.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password.'
      }, { status: 401 });
    }

    const token = signCandidateToken({
      candidateId: candidate.id,
      candidateCode: candidate.candidate_id,
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      email: candidate.email,
      mobile: candidate.mobile
    });

    // Remove password_hash from response
    delete candidate.password_hash;

    await logAudit({
      userEmail: candidate.email,
      userName: `${candidate.first_name} ${candidate.last_name}`,
      action: 'CANDIDATE_LOGIN',
      entity: 'Candidate',
      entityId: candidate.candidate_id
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        candidate,
        token
      }
    });

    response.cookies.set('candidate_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Candidate login error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Login failed'
    }, { status: 500 });
  }
}

