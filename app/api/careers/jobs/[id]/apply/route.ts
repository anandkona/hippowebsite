import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';
import { logAudit, createNotification } from '@/lib/careersService';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const candidateAuth = await verifyCandidateAuth(request);
    const { id } = await context.params;

    // 1. Verify Job existence and status
    const jobRes = await query(
      `SELECT * FROM jobs WHERE (job_id = $1 OR slug = $1 OR (id::text = $1 AND $1 ~ '^[0-9]+$'))`,
      [id]
    );

    if (jobRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const job = jobRes.rows[0];

    if (job.status !== 'Published') {
      return NextResponse.json({
        success: false,
        message: `This position is currently ${job.status.toLowerCase()} and is not accepting applications.`
      }, { status: 400 });
    }

    if (job.closing_date && new Date(job.closing_date) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'The deadline for applying to this position has passed.'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      mobile,
      total_experience,
      current_company,
      expected_ctc,
      notice_period,
      current_location,
      cover_letter,
      resume_url,
      screening_answers
    } = body;

    let candidateId = candidateAuth?.candidateId;
    let applicantEmail = (candidateAuth?.email || email || '').trim().toLowerCase();
    let applicantName = candidateAuth 
      ? `${candidateAuth.firstName} ${candidateAuth.lastName}`
      : `${first_name || ''} ${last_name || ''}`.trim() || 'Applicant';

    // Check if phone or email is already registered/applied
    if (applicantEmail || mobile) {
      const existingCandidateCheck = await query(
        `SELECT c.id, c.email, c.mobile, a.id as application_id, a.applied_at
         FROM candidates c
         LEFT JOIN applications a ON a.candidate_id = c.id AND a.job_id = $1
         WHERE (LOWER(c.email) = LOWER($2) AND $2 <> '') OR (c.mobile = $3 AND $3 <> '')
         LIMIT 1`,
        [job.id, applicantEmail, mobile ? mobile.trim() : '']
      );

      if (existingCandidateCheck.rows.length > 0) {
        const found = existingCandidateCheck.rows[0];
        const matchType = found.email.toLowerCase() === applicantEmail.toLowerCase() ? 'Email' : 'Phone number';
        
        return NextResponse.json({
          success: false,
          code: 'ALREADY_EXISTS',
          message: `${matchType} (${matchType === 'Email' ? applicantEmail : mobile}) already exists on file. You have already registered or submitted an application.`,
          applicationId: found.application_id,
          appliedAt: found.applied_at
        }, { status: 409 });
      }
    }

    if (!candidateId) {
      if (!applicantEmail) {
        return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 });
      }
      if (!first_name?.trim()) {
        return NextResponse.json({ success: false, message: 'First name is required.' }, { status: 400 });
      }

      // Create candidate record
      const year = new Date().getFullYear();
      const randCode = Math.floor(1000 + Math.random() * 9000);
      const candidateCode = `HC-CAN-${year}-${randCode}`;

      const newCandRes = await query(
        `INSERT INTO candidates (
          candidate_id, first_name, last_name, email, mobile, password_hash,
          city, country, current_company, total_experience, expected_ctc, notice_period,
          resume_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'DIRECT_APPLICATION', $6, 'India', $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id`,
        [
          candidateCode,
          first_name.trim(),
          (last_name || '').trim(),
          applicantEmail,
          mobile ? mobile.trim() : '',
          current_location || 'Visakhapatnam',
          current_company || '',
          total_experience || null,
          expected_ctc || null,
          notice_period || '30 Days',
          resume_url || null
        ]
      );
      candidateId = newCandRes.rows[0].id;
    }

    // Generate Application ID: HC-APP-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `HC-APP-${year}-${randomSeq}`;

    // Get candidate's default resume if not passed
    let finalResumeUrl = resume_url;
    if (!finalResumeUrl && candidateId) {
      const canRes = await query('SELECT resume_url FROM candidates WHERE id = $1', [candidateId]);
      finalResumeUrl = canRes.rows[0]?.resume_url;
    }

    // 3. Database Insert
    const insertSql = `
      INSERT INTO applications (
        application_id, candidate_id, job_id, stage, status,
        expected_ctc, notice_period, current_location, cover_letter,
        resume_url, screening_answers, source, applied_at
      ) VALUES ($1, $2, $3, 'Applied', 'Active', $4, $5, $6, $7, $8, $9, 'HippoClouds Careers Portal', NOW())
      RETURNING *
    `;

    const values = [
      applicationId,
      candidateId,
      job.id,
      expected_ctc || null,
      notice_period || null,
      current_location || null,
      cover_letter || null,
      finalResumeUrl || null,
      screening_answers ? JSON.stringify(screening_answers) : null
    ];

    const { rows } = await query(insertSql, values);
    const app = rows[0];

    // Record stage change in history
    await query(
      `INSERT INTO application_status_history (application_id, previous_stage, new_stage, changed_by, notes)
       VALUES ($1, NULL, 'Applied', 'Candidate', 'Direct application submitted successfully')`,
      [app.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully!',
      data: {
        applicationId: app.application_id,
        jobTitle: job.title,
        appliedAt: app.applied_at,
        stage: app.stage,
        status: app.status
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Apply job error:', error);
    if (error.code === '23505' || error.message?.includes('unique_candidate_job')) {
      return NextResponse.json({
        success: false,
        code: 'ALREADY_APPLIED',
        message: 'You have already submitted an application for this position.'
      }, { status: 409 });
    }
    return NextResponse.json({
      success: false,
      message: 'Unable to submit your application. Please check your details and try again.'
    }, { status: 500 });
  }
}

