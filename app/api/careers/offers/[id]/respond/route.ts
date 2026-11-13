import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';
import { logAudit, createNotification } from '@/lib/careersService';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const admin = await verifyAuth(request);
    const candidate = await verifyCandidateAuth(request);

    if (!admin && !candidate) return unauthorizedResponse();

    const body = await request.json();
    const { action } = body; // 'accept', 'decline', 'send'

    const offerRes = await query(
      `SELECT o.*, a.candidate_id as app_candidate_id, a.id as app_id, a.application_id as app_code, j.title as job_title
       FROM offers o
       JOIN applications a ON o.application_id = a.id
       JOIN jobs j ON o.job_id = j.id
       WHERE o.id = $1 OR o.offer_id = $1`,
      [id]
    );

    if (offerRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    const offer = offerRes.rows[0];

    // Check candidate permissions
    if (candidate && !admin && offer.candidate_id !== candidate.candidateId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (action === 'accept') {
      await query(
        `UPDATE offers SET status = 'Accepted', responded_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [offer.id]
      );
      await query(
        `UPDATE applications SET stage = 'Offer Accepted', updated_at = NOW() WHERE id = $1`,
        [offer.application_id]
      );

      // Create Onboarding entry
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const onbId = `HC-ONB-${year}-${rand}`;
      const empId = `HC-EMP-${year}-${Math.floor(100 + Math.random() * 900)}`;

      await query(
        `INSERT INTO onboarding (
          onboarding_id, candidate_id, offer_id, employee_id,
          designation, department, joining_date, overall_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'In Progress')
        ON CONFLICT DO NOTHING`,
        [onbId, offer.candidate_id, offer.id, empId, offer.designation, offer.department, offer.joining_date]
      );

      await createNotification({
        candidateId: offer.candidate_id,
        title: 'Offer Acceptance Confirmed',
        message: 'You have accepted the offer. Welcome to the HippoClouds team! Your onboarding journey starts now.',
        link: `/careers/applications/${offer.app_code}`
      });

      return NextResponse.json({ success: true, message: 'Offer accepted successfully' });
    }

    if (action === 'decline') {
      await query(
        `UPDATE offers SET status = 'Declined', responded_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [offer.id]
      );
      await query(
        `UPDATE applications SET stage = 'Offer Declined', status = 'Closed', updated_at = NOW() WHERE id = $1`,
        [offer.application_id]
      );

      return NextResponse.json({ success: true, message: 'Offer declined' });
    }

    if (action === 'send' && admin) {
      await query(
        `UPDATE offers SET status = 'Sent', sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [offer.id]
      );
      await query(
        `UPDATE applications SET stage = 'Offer Released', updated_at = NOW() WHERE id = $1`,
        [offer.application_id]
      );

      await createNotification({
        candidateId: offer.candidate_id,
        title: 'Official Offer Released',
        message: `An offer has been extended to you for the role of ${offer.designation} at HippoClouds.`,
        link: `/careers/applications/${offer.app_code}`
      });

      return NextResponse.json({ success: true, message: 'Offer sent to candidate' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error responding to offer:', error);
    return NextResponse.json({ success: false, message: 'Failed to process offer action' }, { status: 500 });
  }
}

