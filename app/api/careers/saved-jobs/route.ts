import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await query(
      `SELECT s.id, s.created_at, j.*
       FROM saved_jobs s
       JOIN jobs j ON s.job_id = j.id
       WHERE s.candidate_id = $1
       ORDER BY s.created_at DESC`,
      [candidate.candidateId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Please login to save jobs' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    const jobRes = await query('SELECT id FROM jobs WHERE id = $1 OR job_id = $1 OR slug = $1', [jobId]);
    if (jobRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const targetJobId = jobRes.rows[0].id;

    // Check if already saved
    const existing = await query('SELECT id FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2', [candidate.candidateId, targetJobId]);
    if (existing.rows.length > 0) {
      // Toggle off / remove
      await query('DELETE FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2', [candidate.candidateId, targetJobId]);
      return NextResponse.json({ success: true, saved: false, message: 'Job removed from saved list' });
    }

    await query('INSERT INTO saved_jobs (candidate_id, job_id) VALUES ($1, $2)', [candidate.candidateId, targetJobId]);
    return NextResponse.json({ success: true, saved: true, message: 'Job saved successfully' });
  } catch (error: any) {
    console.error('Error saving job:', error);
    return NextResponse.json({ success: false, message: 'Failed to save job' }, { status: 500 });
  }
}

