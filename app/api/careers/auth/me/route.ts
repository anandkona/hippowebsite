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

    // Fetch education, experience, skills
    const educationRes = await query('SELECT * FROM candidate_education WHERE candidate_id = $1 ORDER BY start_year DESC', [candidate.candidateId]);
    const experienceRes = await query('SELECT * FROM candidate_experience WHERE candidate_id = $1 ORDER BY start_date DESC', [candidate.candidateId]);
    const skillsRes = await query('SELECT * FROM candidate_skills WHERE candidate_id = $1 ORDER BY proficiency DESC', [candidate.candidateId]);

    profile.education = educationRes.rows;
    profile.experience = experienceRes.rows;
    profile.skills = skillsRes.rows;

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Candidate profile fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch candidate' }, { status: 500 });
  }
}

