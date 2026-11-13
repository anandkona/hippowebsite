import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/careersService';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const sql = `
      SELECT o.*,
             c.first_name,
             c.last_name,
             c.email as candidate_email,
             c.mobile as candidate_mobile,
             of.annual_ctc,
             of.offer_id
      FROM onboarding o
      JOIN candidates c ON o.candidate_id = c.id
      JOIN offers of ON o.offer_id = of.id
      ORDER BY o.joining_date ASC
    `;

    const { rows } = await query(sql);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching onboarding:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch onboarding' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const {
      id,
      documents_submitted,
      bgv_status,
      it_laptop_ready,
      email_account_created,
      hr_welcome_kit,
      overall_status,
      notes
    } = body;

    const updateSql = `
      UPDATE onboarding SET
        documents_submitted = COALESCE($1, documents_submitted),
        bgv_status = COALESCE($2, bgv_status),
        it_laptop_ready = COALESCE($3, it_laptop_ready),
        email_account_created = COALESCE($4, email_account_created),
        hr_welcome_kit = COALESCE($5, hr_welcome_kit),
        overall_status = COALESCE($6, overall_status),
        notes = COALESCE($7, notes),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const { rows } = await query(updateSql, [
      documents_submitted, bgv_status, it_laptop_ready,
      email_account_created, hr_welcome_kit, overall_status, notes, id
    ]);

    return NextResponse.json({ success: true, message: 'Onboarding updated', data: rows[0] });
  } catch (error: any) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json({ success: false, message: 'Failed to update onboarding' }, { status: 500 });
  }
}

