import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hippoclouds_super_secret_key_2026';

export interface CandidateUser {
  candidateId: number;
  candidateCode: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export function signCandidateToken(candidate: CandidateUser): string {
  return jwt.sign(
    {
      candidateId: candidate.candidateId,
      candidateCode: candidate.candidateCode,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      mobile: candidate.mobile,
      type: 'candidate'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function verifyCandidateAuth(request: Request): Promise<CandidateUser | null> {
  const authHeader = request.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Check cookies if passed via cookie header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/candidate_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'candidate' && !decoded.candidateId) return null;

    const { rows } = await query(
      'SELECT id, candidate_id, first_name, last_name, email, mobile FROM candidates WHERE id = $1',
      [decoded.candidateId]
    );

    if (rows.length === 0) return null;

    return {
      candidateId: rows[0].id,
      candidateCode: rows[0].candidate_id,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      email: rows[0].email,
      mobile: rows[0].mobile
    };
  } catch (err) {
    return null;
  }
}

