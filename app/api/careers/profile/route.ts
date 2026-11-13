import { NextResponse } from 'next/server';
import { verifyCandidateAuth } from '@/lib/candidateAuth';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/careersService';

export async function GET(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await query(
      `SELECT id, candidate_id, first_name, last_name, email, mobile,
              city, state, country, dob, gender, current_title, current_company,
              total_experience, relevant_experience, current_ctc, expected_ctc,
              notice_period, employment_status, linkedin_url, github_url, portfolio_url,
              other_links, resume_url, resume_filename, resume_uploaded_at, cover_letter,
              profile_completion, created_at, updated_at
       FROM candidates WHERE id = $1`,
      [candidate.candidateId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 });
    }

    const profile = rows[0];

    const education = await query('SELECT * FROM candidate_education WHERE candidate_id = $1 ORDER BY id ASC', [candidate.candidateId]);
    const experience = await query('SELECT * FROM candidate_experience WHERE candidate_id = $1 ORDER BY id ASC', [candidate.candidateId]);
    const skills = await query('SELECT * FROM candidate_skills WHERE candidate_id = $1 ORDER BY id ASC', [candidate.candidateId]);

    profile.education = education.rows;
    profile.experience = experience.rows;
    profile.skills = skills.rows;

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error in GET /api/careers/profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      mobile,
      city,
      state,
      country,
      dob,
      gender,
      current_title,
      current_company,
      total_experience,
      relevant_experience,
      current_ctc,
      expected_ctc,
      notice_period,
      employment_status,
      linkedin_url,
      github_url,
      portfolio_url,
      other_links,
      cover_letter,
      education,
      experience,
      skills
    } = body;

    // Calculate dynamic profile completion percentage
    let score = 20; // base registered
    if (current_title && current_company) score += 20;
    if (total_experience !== undefined) score += 10;
    if (city && state) score += 10;
    if (linkedin_url || github_url || portfolio_url) score += 10;
    if (Array.isArray(education) && education.length > 0) score += 10;
    if (Array.isArray(experience) && experience.length > 0) score += 10;
    if (Array.isArray(skills) && skills.length > 0) score += 10;
    score = Math.min(100, score);

    const updateSql = `
      UPDATE candidates SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        mobile = COALESCE($3, mobile),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        country = COALESCE($6, country),
        dob = COALESCE($7, dob),
        gender = COALESCE($8, gender),
        current_title = COALESCE($9, current_title),
        current_company = COALESCE($10, current_company),
        total_experience = COALESCE($11, total_experience),
        relevant_experience = COALESCE($12, relevant_experience),
        current_ctc = COALESCE($13, current_ctc),
        expected_ctc = COALESCE($14, expected_ctc),
        notice_period = COALESCE($15, notice_period),
        employment_status = COALESCE($16, employment_status),
        linkedin_url = COALESCE($17, linkedin_url),
        github_url = COALESCE($18, github_url),
        portfolio_url = COALESCE($19, portfolio_url),
        other_links = COALESCE($20, other_links),
        cover_letter = COALESCE($21, cover_letter),
        profile_completion = $22,
        updated_at = NOW()
      WHERE id = $23
      RETURNING *
    `;

    const values = [
      first_name, last_name, mobile, city, state, country,
      dob || null, gender, current_title, current_company,
      total_experience !== undefined ? parseFloat(total_experience) : null,
      relevant_experience !== undefined ? parseFloat(relevant_experience) : null,
      current_ctc, expected_ctc, notice_period, employment_status,
      linkedin_url, github_url, portfolio_url, other_links,
      cover_letter, score, candidate.candidateId
    ];

    const { rows } = await query(updateSql, values);
    const updatedCandidate = rows[0];

    // Education upsert
    if (Array.isArray(education)) {
      await query('DELETE FROM candidate_education WHERE candidate_id = $1', [candidate.candidateId]);
      for (const edu of education) {
        if (edu.degree || edu.qualification || edu.institution) {
          await query(
            `INSERT INTO candidate_education (candidate_id, qualification, degree, specialization, institution, university, start_year, end_year, percentage_or_cgpa, grade, currently_studying)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [candidate.candidateId, edu.qualification, edu.degree, edu.specialization, edu.institution, edu.university, edu.start_year, edu.end_year, edu.percentage_or_cgpa, edu.grade, edu.currently_studying || false]
          );
        }
      }
    }

    // Experience upsert
    if (Array.isArray(experience)) {
      await query('DELETE FROM candidate_experience WHERE candidate_id = $1', [candidate.candidateId]);
      for (const exp of experience) {
        if (exp.company || exp.job_title) {
          await query(
            `INSERT INTO candidate_experience (candidate_id, company, job_title, employment_type, location, start_date, end_date, currently_working, responsibilities, technologies, achievements)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [candidate.candidateId, exp.company, exp.job_title, exp.employment_type || 'Full Time', exp.location, exp.start_date || null, exp.end_date || null, exp.currently_working || false, exp.responsibilities, exp.technologies, exp.achievements]
          );
        }
      }
    }

    // Skills upsert
    if (Array.isArray(skills)) {
      await query('DELETE FROM candidate_skills WHERE candidate_id = $1', [candidate.candidateId]);
      for (const sk of skills) {
        if (sk.skill_name || (typeof sk === 'string' && sk.trim())) {
          const name = typeof sk === 'string' ? sk.trim() : sk.skill_name;
          const cat = sk.category || 'Technical';
          const expYears = sk.years_experience ? parseFloat(sk.years_experience) : 1;
          const prof = sk.proficiency || 'Intermediate';
          await query(
            `INSERT INTO candidate_skills (candidate_id, skill_name, category, years_experience, proficiency)
             VALUES ($1, $2, $3, $4, $5)`,
            [candidate.candidateId, name, cat, expYears, prof]
          );
        }
      }
    }

    await logAudit({
      userEmail: candidate.email,
      userName: `${candidate.firstName} ${candidate.lastName}`,
      action: 'PROFILE_UPDATED',
      entity: 'Candidate',
      entityId: candidate.candidateCode
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCandidate
    });
  } catch (error: any) {
    console.error('Error updating candidate profile:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

