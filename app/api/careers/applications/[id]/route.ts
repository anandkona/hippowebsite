import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAudit, createNotification } from '@/lib/careersService';

// GET Application Details
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const candidate = await verifyCandidateAuth(request);
    const admin = await verifyAuth(request);

    if (!candidate && !admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    let appSql = `
      SELECT
        a.*,
        j.title as job_title,
        j.job_id as job_code,
        j.department as job_department,
        j.business_unit as job_business_unit,
        j.city as job_city,
        j.work_mode as job_work_mode,
        j.employment_type as job_employment_type,
        j.experience_level as job_experience_level,
        j.recruitment_process,
        c.first_name,
        c.last_name,
        c.email as candidate_email,
        c.mobile as candidate_mobile,
        c.current_title as candidate_current_title,
        c.current_company as candidate_current_company,
        c.total_experience as candidate_experience,
        c.current_ctc as candidate_current_ctc,
        c.expected_ctc as candidate_expected_ctc,
        c.notice_period as candidate_notice_period,
        c.linkedin_url,
        c.github_url,
        c.portfolio_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      WHERE (a.application_id = $1 OR (a.id::text = $1 AND $1 ~ '^[0-9]+$'))
    `;

    if (candidate && !admin) {
      appSql += ` AND a.candidate_id = ${candidate.candidateId}`;
    }

    const { rows } = await query(appSql, [id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    const app = rows[0];

    // Status history
    const historyRes = await query(
      `SELECT * FROM application_status_history WHERE application_id = $1 ORDER BY created_at ASC`,
      [app.id]
    );
    app.timeline = historyRes.rows;

    // Interviews
    let interviewSql = `SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_date ASC`;
    const interviewRes = await query(interviewSql, [app.id]);
    
    // For each interview, if admin, include feedback
    if (admin) {
      for (const item of interviewRes.rows) {
        const fbRes = await query(`SELECT * FROM interview_feedback WHERE interview_id = $1`, [item.id]);
        item.feedback = fbRes.rows;
      }
      // Internal HR notes
      const notesRes = await query(`SELECT * FROM application_notes WHERE application_id = $1 ORDER BY created_at DESC`, [app.id]);
      app.notes = notesRes.rows;
    } else {
      // Candidate must NOT see internal HR feedback or internal notes
      interviewRes.rows.forEach(item => {
        delete (item as any).notes;
      });
    }
    app.interviews = interviewRes.rows;

    // Assessments
    const assessRes = await query(`SELECT * FROM assessments WHERE application_id = $1 ORDER BY created_at ASC`, [app.id]);
    app.assessments = assessRes.rows;

    // Offer details
    const offerRes = await query(`SELECT * FROM offers WHERE application_id = $1`, [app.id]);
    app.offer = offerRes.rows[0] || null;

    return NextResponse.json({ success: true, data: app });
  } catch (error: any) {
    console.error('Error in GET /api/careers/applications/[id]:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch application details' }, { status: 500 });
  }
}

// POST Status / Stage Change (Admin only)
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();
    const { stage, status = 'Active', notes = '' } = body;

    if (!stage) {
      return NextResponse.json({ success: false, message: 'Stage is required' }, { status: 400 });
    }

    const appRes = await query(
      `SELECT a.*, j.title as job_title, c.email as candidate_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN candidates c ON a.candidate_id = c.id
       WHERE (a.application_id = $1 OR (a.id::text = $1 AND $1 ~ '^[0-9]+$'))`,
      [id]
    );

    if (appRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    const app = appRes.rows[0];
    const previousStage = app.stage;

    // Update application stage and status
    const updateRes = await query(
      `UPDATE applications SET stage = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [stage, status, app.id]
    );

    // Record in history
    await query(
      `INSERT INTO application_status_history (application_id, previous_stage, new_stage, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [app.id, previousStage, stage, admin.username, notes]
    );

    // Notify candidate
    await createNotification({
      candidateId: app.candidate_id,
      title: `Application Update: ${stage}`,
      message: `Your application for ${app.job_title} has been moved to: ${stage}.`,
      link: `/careers/applications/${app.application_id}`
    });

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'APPLICATION_STAGE_CHANGED',
      entity: 'Application',
      entityId: app.application_id,
      details: { previousStage, newStage: stage, notes }
    });

    return NextResponse.json({
      success: true,
      message: `Application moved to ${stage}`,
      data: updateRes.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating application stage:', error);
    return NextResponse.json({ success: false, message: 'Failed to update stage' }, { status: 500 });
  }
}

