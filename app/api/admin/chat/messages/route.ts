import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();
  if (!user.permissions.includes('manage_chat')) return forbiddenResponse();

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  try {
    const result = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    // Mark messages as read
    await query(
      "UPDATE chat_messages SET status = 'READ' WHERE session_id = $1 AND sender = 'USER' AND status != 'READ'",
      [sessionId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
