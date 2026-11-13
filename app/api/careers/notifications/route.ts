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
      `SELECT * FROM notifications WHERE candidate_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [candidate.candidateId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await query('UPDATE notifications SET is_read = TRUE WHERE candidate_id = $1', [candidate.candidateId]);
    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking notifications:', error);
    return NextResponse.json({ success: false, message: 'Failed to update notifications' }, { status: 500 });
  }
}

