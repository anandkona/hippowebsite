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

    let sql = `
      SELECT o.*,
             j.title as job_title,
             j.job_id as job_code,
             c.first_name,
             c.last_name,
             c.email as candidate_email,
             c.mobile as candidate_mobile,
             a.application_id as app_code
      FROM offers o
      JOIN jobs j ON o.job_id = j.id
      JOIN candidates c ON o.candidate_id = c.id
      JOIN applications a ON o.application_id = a.id
    `;

    let params: any[] = [];
    if (candidate && !admin) {
      sql += ` WHERE o.candidate_id = $1`;
      params.push(candidate.candidateId);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const { rows } = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const {
      application_id,
      designation,
      department,
      joining_date,
      location = 'Visakhapatnam, Andhra Pradesh',
      employment_type = 'Full Time',
      annual_ctc,
      fixed_component,
      variable_component,
      joining_bonus = 0,
      probation_period = '3 Months',
      notice_period = '30 Days',
      expiry_date,
      benefits_summary,
      status = 'Draft'
    } = body;

    if (!application_id || !designation || !annual_ctc || !joining_date) {
      return NextResponse.json({
        success: false,
        message: 'Application, designation, joining date, and annual CTC are required.'
      }, { status: 400 });
    }

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
    const offerId = `HC-OFR-${year}-${randomSeq}`;

    const insertSql = `
      INSERT INTO offers (
        offer_id, application_id, candidate_id, job_id, designation,
        department, joining_date, location, employment_type,
        annual_ctc, fixed_component, variable_component, joining_bonus,
        probation_period, notice_period, expiry_date, benefits_summary, status,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      offerId, app.id, app.candidate_id, app.job_id, designation,
      department || 'Engineering', joining_date, location, employment_type,
      annual_ctc, fixed_component || null, variable_component || null, joining_bonus,
      probation_period, notice_period, expiry_date || null, benefits_summary || null, status,
      status === 'Sent' ? new Date() : null
    ];

    const { rows } = await query(insertSql, values);
    const newOffer = rows[0];

    // If sent, update application stage and notify candidate
    if (status === 'Sent') {
      await query(`UPDATE applications SET stage = 'Offer Released', updated_at = NOW() WHERE id = $1`, [app.id]);
      await createNotification({
        candidateId: app.candidate_id,
        title: 'Congratulations! Official Offer Released',
        message: `An offer has been extended to you for the role of ${designation} at HippoClouds.`,
        link: `/careers/applications/${app.application_id}`
      });
    }

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'OFFER_CREATED',
      entity: 'Offer',
      entityId: offerId,
      details: { designation, annual_ctc, status }
    });

    return NextResponse.json({
      success: true,
      message: 'Offer generated successfully',
      data: newOffer
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating offer:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create offer' }, { status: 500 });
  }
}

