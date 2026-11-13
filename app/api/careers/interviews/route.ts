import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';
import { logAudit, createNotification } from '@/lib/careersService';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth(request);
    const candidate = await verifyCandidateAuth(request);

    if (!admin && !candidate) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let sql = `
      SELECT i.*,
             j.title as job_title,
             j.job_id as job_code,
             c.first_name,
             c.last_name,
             c.email as candidate_email,
             c.mobile as candidate_mobile,
             a.application_id as app_code
      FROM interviews i
      JOIN jobs j ON i.job_id = j.id
      JOIN candidates c ON i.candidate_id = c.id
      JOIN applications a ON i.application_id = a.id
    `;

    let params: any[] = [];
    let conditions: string[] = [];
    let idx = 1;

    if (candidate && !admin) {
      conditions.push(`i.candidate_id = $${idx++}`);
      params.push(candidate.candidateId);
    }

    if (status) {
      conditions.push(`i.status = $${idx++}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY i.scheduled_date ASC, i.start_time ASC`;

    const { rows } = await query(sql, params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch interviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const {
      application_id,
      round_name,
      interview_type = 'Technical',
      interviewer_name,
      interviewer_email,
      scheduled_date,
      start_time,
      end_time,
      meeting_link,
      location_details,
      notes
    } = body;

    if (!application_id || !round_name || !scheduled_date || !start_time || !end_time) {
      return NextResponse.json({
        success: false,
        message: 'Application, round name, date and start/end times are required.'
      }, { status: 400 });
    }

    // Lookup application to get candidate_id and job_id
    const appRes = await query(
      `SELECT a.id, a.candidate_id, a.job_id, a.application_id, j.title as job_title
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1 OR a.application_id = $1::text`,
      [application_id]
    );

    if (appRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    const app = appRes.rows[0];
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const interviewId = `HC-INT-${year}-${randomSeq}`;

    const insertSql = `
      INSERT INTO interviews (
        interview_id, application_id, candidate_id, job_id, round_name,
        interview_type, interviewer_name, interviewer_email, scheduled_date,
        start_time, end_time, meeting_link, location_details, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Scheduled')
      RETURNING *
    `;

    const values = [
      interviewId, app.id, app.candidate_id, app.job_id, round_name,
      interview_type, interviewer_name, interviewer_email, scheduled_date,
      start_time, end_time, meeting_link, location_details, notes
    ];

    const { rows } = await query(insertSql, values);
    const newInterview = rows[0];

    // Also update application stage if appropriate
    await query(
      `UPDATE applications SET stage = $1, updated_at = NOW() WHERE id = $2`,
      [interview_type === 'HR' ? 'HR Screening' : 'Technical Interview', app.id]
    );

    // Notify candidate
    await createNotification({
      candidateId: app.candidate_id,
      title: `Interview Scheduled: ${round_name}`,
      message: `Your ${round_name} interview for ${app.job_title} is scheduled on ${scheduled_date} at ${start_time}.`,
      link: `/careers/applications/${app.application_id}`
    });

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'INTERVIEW_SCHEDULED',
      entity: 'Interview',
      entityId: interviewId,
      details: { round: round_name, date: scheduled_date, time: start_time }
    });

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: newInterview
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to schedule interview' }, { status: 500 });
  }
}

