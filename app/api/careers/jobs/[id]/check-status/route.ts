import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: true, applied: false });
    }

    const { id } = await context.params;

    const jobRes = await query(
      `SELECT id FROM jobs WHERE (job_id = $1 OR slug = $1 OR (id::text = $1 AND $1 ~ '^[0-9]+$'))`,
      [id]
    );

    if (jobRes.rows.length === 0) {
      return NextResponse.json({ success: true, applied: false });
    }

    const jobId = jobRes.rows[0].id;

    const { rows } = await query(
      `SELECT application_id, applied_at, stage, status
       FROM applications
       WHERE candidate_id = $1 AND job_id = $2`,
      [candidate.candidateId, jobId]
    );

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        applied: true,
        application: rows[0]
      });
    }

    return NextResponse.json({
      success: true,
      applied: false
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json({ success: false, applied: false }, { status: 500 });
  }
}

