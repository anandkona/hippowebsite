import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { logAudit } from '@/lib/careersService';
import { FALLBACK_JOBS } from '@/lib/fallbackData';

// Public & Admin GET: Search and filter jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const location = searchParams.get('location') || '';
    const workMode = searchParams.get('workMode') || '';
    const employmentType = searchParams.get('employmentType') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const sort = searchParams.get('sort') || 'recent';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
    const offset = (page - 1) * limit;

    // Check if requester is an admin
    const admin = await verifyAuth(request);

    let conditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // If not admin or admin asking for public view, show only Published jobs that have not expired
    if (!admin) {
      conditions.push(`status = 'Published'`);
      conditions.push(`(end_date IS NULL OR end_date >= CURRENT_DATE)`);
      conditions.push(`(closing_date IS NULL OR closing_date >= CURRENT_DATE)`);
    } else if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(
        title ILIKE $${paramIndex} OR 
        department ILIKE $${paramIndex} OR 
        city ILIKE $${paramIndex} OR 
        short_summary ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(required_skills)
      )`);
      params.push(`%${search}%`);
      params.push(search);
      paramIndex += 2;
    }

    if (department && department !== 'All') {
      conditions.push(`department ILIKE $${paramIndex++}`);
      params.push(department);
    }

    if (location && location !== 'All') {
      conditions.push(`(city ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (workMode && workMode !== 'All') {
      conditions.push(`work_mode ILIKE $${paramIndex++}`);
      params.push(workMode);
    }

    if (employmentType && employmentType !== 'All') {
      conditions.push(`employment_type ILIKE $${paramIndex++}`);
      params.push(employmentType);
    }

    if (experienceLevel && experienceLevel !== 'All') {
      conditions.push(`(job_level ILIKE $${paramIndex} OR experience_level ILIKE $${paramIndex})`);
      params.push(`%${experienceLevel}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY featured DESC, created_at DESC';
    if (sort === 'salary_high') {
      orderBy = 'ORDER BY max_salary DESC NULLS LAST';
    } else if (sort === 'salary_low') {
      orderBy = 'ORDER BY min_salary ASC NULLS LAST';
    } else if (sort === 'oldest') {
      orderBy = 'ORDER BY created_at ASC';
    }

    // Count query
    const countRes = await query(`SELECT COUNT(*) as total FROM jobs ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || '0');

    // Data query with applications count
    const dataQuery = `
      SELECT j.*,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications_count
      FROM jobs j
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const { rows } = await query(dataQuery, params);

    // Automatic fallback if database has no jobs added yet
    let finalJobs = rows;
    let finalTotal = total;

    if ((!finalJobs || finalJobs.length === 0) && !search && (!department || department === 'All') && !admin) {
      finalJobs = FALLBACK_JOBS;
      finalTotal = FALLBACK_JOBS.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: finalJobs,
        pagination: {
          total: finalTotal,
          page,
          limit,
          totalPages: Math.ceil(finalTotal / limit) || 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// Admin POST: Create Job
export async function POST(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const {
      title,
      internal_title,
      department,
      category,
      business_unit = 'HippoClouds Core',
      job_level = 'Mid Level',
      openings = 1,
      priority = 'Medium',
      employment_type = 'Full Time',
      experience_level = 'Mid Level',
      min_experience = 0,
      max_experience,
      fresher_eligible = false,
      notice_period = '30 Days',
      joining_timeline = 'Immediate to 30 Days',
      country = 'India',
      state = 'Andhra Pradesh',
      city = 'Visakhapatnam',
      office_address = 'HippoClouds Tech Park, Visakhapatnam',
      work_mode = 'Onsite',
      relocation_assistance = false,
      travel_required = false,
      short_summary = '',
      about_role = '',
      responsibilities = '',
      deliverables = '',
      education_requirements = '',
      required_skills = [],
      preferred_skills = [],
      certifications = '',
      domain_knowledge = '',
      salary_currency = 'INR',
      min_salary,
      max_salary,
      fixed_salary,
      variable_salary,
      bonus_details,
      is_salary_public = false,
      benefits = [],
      recruitment_process = ['HR Screening', 'Technical Interview', 'Managerial Round', 'HR & Offer'],
      status = 'Published',
      featured = false,
      start_date,
      end_date,
      closing_date,
      screening_questions = []
    } = body;

    if (!title || !department) {
      return NextResponse.json({ success: false, message: 'Title and department are required' }, { status: 400 });
    }

    // Auto generate Job ID: HC-JOB-YYYY-XXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const jobId = `HC-JOB-${year}-${randomSuffix}`;
    
    // Auto generate slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${randomSuffix}`;

    const insertSql = `
      INSERT INTO jobs (
        job_id, slug, title, internal_title, department, category, business_unit,
        job_level, openings, priority, employment_type, experience_level,
        min_experience, max_experience, fresher_eligible, notice_period, joining_timeline,
        country, state, city, office_address, work_mode, relocation_assistance, travel_required,
        short_summary, about_role, responsibilities, deliverables, education_requirements,
        required_skills, preferred_skills, certifications, domain_knowledge,
        salary_currency, min_salary, max_salary, fixed_salary, variable_salary, bonus_details, is_salary_public,
        benefits, recruitment_process, status, featured, start_date, end_date, closing_date, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29,
        $30, $31, $32, $33,
        $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48
      ) RETURNING *
    `;

    const values = [
      jobId, slug, title, internal_title || title, department, category || department, business_unit,
      job_level, openings, priority, employment_type, experience_level,
      min_experience, max_experience || null, fresher_eligible, notice_period, joining_timeline,
      country, state, city, office_address, work_mode, relocation_assistance, travel_required,
      short_summary, about_role, responsibilities, deliverables, education_requirements,
      required_skills, preferred_skills, certifications, domain_knowledge,
      salary_currency, min_salary || null, max_salary || null, fixed_salary || null, variable_salary || null, bonus_details || null, is_salary_public,
      benefits, recruitment_process, status, featured, start_date || null, end_date || null, closing_date || end_date || null, admin.username
    ];

    const { rows } = await query(insertSql, values);
    const newJob = rows[0];

    // If screening questions provided, insert them
    if (Array.isArray(screening_questions) && screening_questions.length > 0) {
      for (let i = 0; i < screening_questions.length; i++) {
        const q = screening_questions[i];
        await query(
          `INSERT INTO job_questions (job_id, question_text, question_type, options, required, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newJob.id, q.question_text || q.text, q.question_type || q.type || 'text', JSON.stringify(q.options || []), q.required !== false, i]
        );
      }
    }

    await logAudit({
      userEmail: admin.email || admin.username,
      userName: admin.username,
      action: 'JOB_CREATED',
      entity: 'Job',
      entityId: newJob.job_id,
      details: { title: newJob.title, department: newJob.department }
    });

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create job' }, { status: 500 });
  }
}

