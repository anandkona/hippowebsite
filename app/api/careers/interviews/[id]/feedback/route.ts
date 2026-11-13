import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/careersService';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();
    const {
      interviewer_name = admin.username,
      technical_skills = 5,
      communication = 5,
      problem_solving = 5,
      coding_skills = 5,
      domain_knowledge = 5,
      culture_fit = 5,
      overall_rating = 4.0,
      strengths = '',
      weaknesses = '',
      comments = '',
      recommendation = 'Hire'
    } = body;

    const intRes = await query('SELECT * FROM interviews WHERE id = $1 OR interview_id = $1', [id]);
    if (intRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Interview not found' }, { status: 404 });
    }

    const interview = intRes.rows[0];

    const insertSql = `
      INSERT INTO interview_feedback (
        interview_id, interviewer_name, technical_skills, communication,
        problem_solving, coding_skills, domain_knowledge, culture_fit,
        overall_rating, strengths, weaknesses, comments, recommendation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      interview.id, interviewer_name, technical_skills, communication,
      problem_solving, coding_skills, domain_knowledge, culture_fit,
      overall_rating, strengths, weaknesses, comments, recommendation
    ];

    const { rows } = await query(insertSql, values);

    // Update interview status to Completed
    await query('UPDATE interviews SET status = $1, updated_at = NOW() WHERE id = $2', ['Completed', interview.id]);

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'INTERVIEW_FEEDBACK_SUBMITTED',
      entity: 'Interview',
      entityId: interview.interview_id,
      details: { rating: overall_rating, recommendation }
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: rows[0]
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit feedback' }, { status: 500 });
  }
}

