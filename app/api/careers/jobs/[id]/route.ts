import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { logAudit } from '@/lib/careersService';
import { FALLBACK_JOBS } from '@/lib/fallbackData';

// GET Job by ID or Slug
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const admin = await verifyAuth(request);

    let sql = `
      SELECT j.*,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications_count
      FROM jobs j 
      WHERE (j.job_id = $1 OR j.slug = $1 OR (j.id::text = $1 AND $1 ~ '^[0-9]+$'))
    `;

    if (!admin) {
      sql += ` AND j.status = 'Published'`;
    }

    const { rows } = await query(sql, [id]);

    let job = rows[0];

    if (!job && !admin) {
      const fallback = FALLBACK_JOBS.find(
        (fj) => fj.slug === id || fj.job_id === id || String(fj.id) === id
      );
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback });
      }
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    // Fetch screening questions
    const questionsRes = await query(
      `SELECT * FROM job_questions WHERE job_id = $1 ORDER BY display_order ASC`,
      [job.id]
    );
    job.screening_questions = questionsRes.rows;

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    console.error('Error fetching job details:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT Update Job
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();

    // Check existing
    const existingRes = await query(
      `SELECT * FROM jobs WHERE (job_id = $1 OR slug = $1 OR (id::text = $1 AND $1 ~ '^[0-9]+$'))`,
      [id]
    );

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const job = existingRes.rows[0];

    const fields = [
      'title', 'internal_title', 'department', 'category', 'business_unit',
      'job_level', 'openings', 'priority', 'employment_type', 'experience_level',
      'min_experience', 'max_experience', 'fresher_eligible', 'notice_period', 'joining_timeline',
      'country', 'state', 'city', 'office_address', 'work_mode', 'relocation_assistance', 'travel_required',
      'short_summary', 'about_role', 'responsibilities', 'deliverables', 'education_requirements',
      'required_skills', 'preferred_skills', 'certifications', 'domain_knowledge',
      'salary_currency', 'min_salary', 'max_salary', 'fixed_salary', 'variable_salary', 'bonus_details', 'is_salary_public',
      'benefits', 'recruitment_process', 'status', 'featured', 'start_date', 'end_date', 'closing_date'
    ];

    let updateParts: string[] = [];
    let values: any[] = [];
    let idx = 1;

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateParts.push(`${field} = $${idx++}`);
        values.push(body[field]);
      }
    }

    updateParts.push(`updated_at = NOW()`);
    values.push(job.id);

    const updateSql = `
      UPDATE jobs SET ${updateParts.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const { rows } = await query(updateSql, values);
    const updatedJob = rows[0];

    // If screening questions provided, replace them
    if (Array.isArray(body.screening_questions)) {
      await query('DELETE FROM job_questions WHERE job_id = $1', [job.id]);
      for (let i = 0; i < body.screening_questions.length; i++) {
        const q = body.screening_questions[i];
        await query(
          `INSERT INTO job_questions (job_id, question_text, question_type, options, required, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [job.id, q.question_text || q.text, q.question_type || q.type || 'text', JSON.stringify(q.options || []), q.required !== false, i]
        );
      }
    }

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'JOB_UPDATED',
      entity: 'Job',
      entityId: updatedJob.job_id,
      details: { title: updatedJob.title, status: updatedJob.status }
    });

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update job' }, { status: 500 });
  }
}

// DELETE Job
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const { id } = await context.params;

    const { rows } = await query(
      `DELETE FROM jobs WHERE (job_id = $1 OR slug = $1 OR (id::text = $1 AND $1 ~ '^[0-9]+$')) RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'JOB_DELETED',
      entity: 'Job',
      entityId: rows[0].job_id,
      details: { title: rows[0].title }
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete job' }, { status: 500 });
  }
}

