import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_chat')) return forbiddenResponse();

  try {
    const result = await query(
      `SELECT 
        s.*,
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as message_count,
        (SELECT text FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_sessions s
      ORDER BY s.last_message_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
