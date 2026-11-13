import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    let conditions: string[] = [];
    let params: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(
        first_name ILIKE $${idx} OR
        last_name ILIKE $${idx} OR
        email ILIKE $${idx} OR
        mobile ILIKE $${idx} OR
        current_title ILIKE $${idx} OR
        candidate_id ILIKE $${idx}
      )`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as total FROM candidates ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataSql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM applications a WHERE a.candidate_id = c.id) as applications_count,
        (SELECT a.stage FROM applications a WHERE a.candidate_id = c.id ORDER BY a.applied_at DESC LIMIT 1) as latest_stage
      FROM candidates c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const { rows } = await query(dataSql, params);

    return NextResponse.json({
      success: true,
      data: {
        candidates: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch candidates' }, { status: 500 });
  }
}

