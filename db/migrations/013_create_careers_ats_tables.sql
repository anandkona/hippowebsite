-- Migration 013: Careers & ATS Schema
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    dob DATE,
    gender VARCHAR(20),
    current_title VARCHAR(150),
    current_company VARCHAR(150),
    total_experience NUMERIC(4, 1) DEFAULT 0,
    relevant_experience NUMERIC(4, 1) DEFAULT 0,
    current_ctc VARCHAR(50),
    expected_ctc VARCHAR(50),
    notice_period VARCHAR(50),
    employment_status VARCHAR(50),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    other_links TEXT,
    resume_url TEXT,
    resume_filename TEXT,
    resume_uploaded_at TIMESTAMPTZ,
    cover_letter TEXT,
    profile_completion INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_education (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    qualification VARCHAR(100),
    degree VARCHAR(150),
    specialization VARCHAR(150),
    institution VARCHAR(255),
    university VARCHAR(255),
    start_year VARCHAR(10),
    end_year VARCHAR(10),
    percentage_or_cgpa VARCHAR(20),
    grade VARCHAR(20),
    currently_studying BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_experience (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    company VARCHAR(150),
    job_title VARCHAR(150),
    employment_type VARCHAR(50),
    location VARCHAR(100),
    start_date DATE,
    end_date DATE,
    currently_working BOOLEAN DEFAULT FALSE,
    responsibilities TEXT,
    technologies TEXT,
    achievements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Technical',
    years_experience NUMERIC(3, 1),
    proficiency VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_documents (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    doc_type VARCHAR(50),
    file_name VARCHAR(255),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    internal_title VARCHAR(200),
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    business_unit VARCHAR(100) DEFAULT 'HippoClouds Core',
    job_level VARCHAR(50) DEFAULT 'Mid Level',
    openings INTEGER DEFAULT 1,
    priority VARCHAR(50) DEFAULT 'Medium',
    employment_type VARCHAR(50) DEFAULT 'Full Time',
    experience_level VARCHAR(50),
    min_experience NUMERIC(3, 1) DEFAULT 0,
    max_experience NUMERIC(3, 1),
    fresher_eligible BOOLEAN DEFAULT FALSE,
    notice_period VARCHAR(50),
    joining_timeline VARCHAR(50),
    country VARCHAR(100) DEFAULT 'India',
    state VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Visakhapatnam',
    office_address TEXT,
    work_mode VARCHAR(50) DEFAULT 'Onsite',
    relocation_assistance BOOLEAN DEFAULT FALSE,
    travel_required BOOLEAN DEFAULT FALSE,
    short_summary TEXT,
    about_role TEXT,
    responsibilities TEXT,
    deliverables TEXT,
    education_requirements TEXT,
    required_skills TEXT[],
    preferred_skills TEXT[],
    certifications TEXT,
    domain_knowledge TEXT,
    salary_currency VARCHAR(10) DEFAULT 'INR',
    min_salary NUMERIC(12, 2),
    max_salary NUMERIC(12, 2),
    fixed_salary NUMERIC(12, 2),
    variable_salary NUMERIC(12, 2),
    bonus_details TEXT,
    is_salary_public BOOLEAN DEFAULT FALSE,
    benefits TEXT[],
    recruitment_process TEXT[],
    status VARCHAR(50) DEFAULT 'Published',
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    closing_date DATE,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_questions (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'text',
    options JSONB,
    required BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    stage VARCHAR(50) DEFAULT 'Applied',
    status VARCHAR(50) DEFAULT 'Active',
    expected_ctc VARCHAR(50),
    notice_period VARCHAR(50),
    current_location VARCHAR(100),
    cover_letter TEXT,
    resume_url TEXT,
    screening_answers JSONB,
    source VARCHAR(50) DEFAULT 'HippoClouds Careers Portal',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_candidate_job UNIQUE(candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS application_status_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    previous_stage VARCHAR(50),
    new_stage VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) DEFAULT 'System',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_notes (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_candidate_saved_job UNIQUE(candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS job_alerts (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    keywords VARCHAR(200),
    department VARCHAR(100),
    location VARCHAR(100),
    work_mode VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    interview_id VARCHAR(50) UNIQUE NOT NULL,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'Technical',
    interviewer_name VARCHAR(150),
    interviewer_email VARCHAR(150),
    scheduled_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    meeting_link TEXT,
    location_details TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_feedback (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    interviewer_name VARCHAR(150),
    technical_skills INTEGER DEFAULT 5,
    communication INTEGER DEFAULT 5,
    problem_solving INTEGER DEFAULT 5,
    coding_skills INTEGER DEFAULT 5,
    domain_knowledge INTEGER DEFAULT 5,
    culture_fit INTEGER DEFAULT 5,
    overall_rating NUMERIC(3, 1) DEFAULT 4.0,
    strengths TEXT,
    weaknesses TEXT,
    comments TEXT,
    recommendation VARCHAR(50) DEFAULT 'Hire',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    assessment_id VARCHAR(50) UNIQUE NOT NULL,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    assessment_type VARCHAR(50) DEFAULT 'Technical Coding',
    duration_minutes INTEGER DEFAULT 60,
    total_questions INTEGER DEFAULT 10,
    max_score NUMERIC(5, 1) DEFAULT 100,
    passing_score NUMERIC(5, 1) DEFAULT 70,
    candidate_score NUMERIC(5, 1),
    status VARCHAR(50) DEFAULT 'Pending',
    result VARCHAR(50) DEFAULT 'Pending',
    attempted_at TIMESTAMPTZ,
    assessment_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(50) UNIQUE NOT NULL,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    designation VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    location VARCHAR(100) DEFAULT 'Visakhapatnam, Andhra Pradesh',
    employment_type VARCHAR(50) DEFAULT 'Full Time',
    annual_ctc NUMERIC(12, 2) NOT NULL,
    fixed_component NUMERIC(12, 2),
    variable_component NUMERIC(12, 2),
    joining_bonus NUMERIC(12, 2) DEFAULT 0,
    probation_period VARCHAR(50) DEFAULT '3 Months',
    notice_period VARCHAR(50) DEFAULT '30 Days',
    expiry_date DATE,
    benefits_summary TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    offer_letter_url TEXT,
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding (
    id SERIAL PRIMARY KEY,
    onboarding_id VARCHAR(50) UNIQUE NOT NULL,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    designation VARCHAR(150),
    department VARCHAR(100),
    joining_date DATE,
    reporting_manager VARCHAR(150),
    documents_submitted BOOLEAN DEFAULT FALSE,
    bgv_status VARCHAR(50) DEFAULT 'Pending',
    it_laptop_ready BOOLEAN DEFAULT FALSE,
    email_account_created BOOLEAN DEFAULT FALSE,
    hr_welcome_kit BOOLEAN DEFAULT FALSE,
    overall_status VARCHAR(50) DEFAULT 'In Progress',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) DEFAULT 'candidate',
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(150) NOT NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

