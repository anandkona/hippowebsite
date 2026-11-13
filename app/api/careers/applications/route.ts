import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    const admin = await verifyAuth(request);

    if (!candidate && !admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || '';
    const jobId = searchParams.get('jobId') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    let conditions: string[] = [];
    let params: any[] = [];
    let idx = 1;

    // If candidate, show only candidate's applications
    if (candidate && !admin) {
      conditions.push(`a.candidate_id = $${idx++}`);
      params.push(candidate.candidateId);
    }

    if (stage && stage !== 'All') {
      conditions.push(`a.stage = $${idx++}`);
      params.push(stage);
    }

    if (jobId) {
      conditions.push(`(j.job_id = $${idx} OR j.id::text = $${idx})`);
      params.push(jobId);
      idx++;
    }

    if (search) {
      conditions.push(`(
        c.first_name ILIKE $${idx} OR
        c.last_name ILIKE $${idx} OR
        c.email ILIKE $${idx} OR
        j.title ILIKE $${idx} OR
        a.application_id ILIKE $${idx}
      )`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) as total
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN candidates c ON a.candidate_id = c.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.total || '0');

    const dataSql = `
      SELECT
        a.*,
        j.title as job_title,
        j.job_id as job_code,
        j.department as job_department,
        j.city as job_city,
        j.work_mode as job_work_mode,
        j.employment_type as job_employment_type,
        c.first_name,
        c.last_name,
        c.email as candidate_email,
        c.mobile as candidate_mobile,
        c.current_title as candidate_current_title,
        c.total_experience as candidate_experience,
        c.profile_completion,
        c.city as candidate_city,
        (SELECT COUNT(*) FROM interviews i WHERE i.application_id = a.id) as interview_count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const { rows } = await query(dataSql, params);

    return NextResponse.json({
      success: true,
      data: {
        applications: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch applications' }, { status: 500 });
  }
}

