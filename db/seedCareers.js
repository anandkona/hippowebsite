const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function seed() {
  console.log('Seeding demo careers data...');

  // 1. Seed sample jobs
  const sampleJobs = [
    {
      job_id: 'HC-JOB-2026-1001',
      slug: 'senior-flutter-developer-1001',
      title: 'Senior Flutter Developer',
      internal_title: 'Senior Mobile Engineer (Flutter)',
      department: 'Mobile Engineering',
      category: 'Engineering',
      business_unit: 'HippoCX & Mobile Apps',
      job_level: 'Senior Level',
      openings: 3,
      priority: 'High',
      employment_type: 'Full Time',
      experience_level: 'Senior (4-7 yrs)',
      min_experience: 4,
      max_experience: 7,
      fresher_eligible: false,
      notice_period: 'Immediate to 30 Days',
      joining_timeline: '30 Days',
      country: 'India',
      state: 'Andhra Pradesh',
      city: 'Visakhapatnam',
      office_address: 'HippoClouds Tech Park, MVP Colony, Visakhapatnam',
      work_mode: 'Hybrid',
      relocation_assistance: true,
      travel_required: false,
      short_summary: 'We are seeking a high-caliber Senior Flutter Developer to spearhead our cross-platform mobile apps ecosystem for next-generation enterprise clients.',
      about_role: 'As a Senior Flutter Developer at HippoClouds, you will lead the architecture, design, and deployment of mission-critical mobile applications that serve thousands of users daily.',
      responsibilities: '• Architect, build, and maintain high performance, reusable, and reliable Flutter code.\n• Collaborate with cross-functional teams including designers, backend engineers, and product managers.\n• Ensure high performance and responsiveness across both iOS and Android platforms.\n• Lead code reviews and mentor junior engineering talent.',
      deliverables: '• Deploy production-ready Flutter apps on Play Store and App Store.\n• Standardize CI/CD mobile pipelines with automated unit and widget testing.\n• Optimize app launch time and state management with Bloc/Riverpod.',
      education_requirements: "Bachelor's or Master's degree in Computer Science, IT, or related technical field.",
      required_skills: ['Flutter', 'Dart', 'Bloc', 'REST APIs', 'Firebase', 'State Management'],
      preferred_skills: ['Native Android/iOS', 'GraphQL', 'CI/CD Fastlane', 'Clean Architecture'],
      certifications: 'Flutter Certified Application Developer or equivalent preferred.',
      domain_knowledge: 'Enterprise Mobile, Offline-first architecture, Real-time sync.',
      salary_currency: 'INR',
      min_salary: 1200000,
      max_salary: 1800000,
      fixed_salary: 1400000,
      variable_salary: 200000,
      bonus_details: 'Annual performance bonus up to 15% of base salary',
      is_salary_public: true,
      benefits: ['Health & Life Insurance', 'Hybrid Work Flexibility', 'Annual Learning Allowance', 'Paid Certifications', 'Wellness Programs'],
      recruitment_process: ['HR Screening', 'Technical Assessment', 'Architecture Deep Dive', 'Leadership & Culture Fit', 'Offer Extension'],
      status: 'Published',
      featured: true,
      closing_date: '2026-12-31'
    },
    {
      job_id: 'HC-JOB-2026-1002',
      slug: 'full-stack-react-developer-1002',
      title: 'Full Stack React & Node.js Developer',
      internal_title: 'Full Stack Engineer (MERN / Next.js)',
      department: 'Software Development',
      category: 'Engineering',
      business_unit: 'Hippo BuildX & Core Cloud',
      job_level: 'Mid Level',
      openings: 4,
      priority: 'High',
      employment_type: 'Full Time',
      experience_level: 'Mid Level (2-5 yrs)',
      min_experience: 2,
      max_experience: 5,
      fresher_eligible: false,
      notice_period: '30 Days',
      joining_timeline: 'Immediate to 30 Days',
      country: 'India',
      state: 'Andhra Pradesh',
      city: 'Visakhapatnam',
      office_address: 'HippoClouds Tech Park, Visakhapatnam',
      work_mode: 'Onsite',
      relocation_assistance: true,
      travel_required: false,
      short_summary: 'Join HippoClouds as a Full Stack React & Node.js Developer to build responsive, blazing-fast cloud apps and scalable backend microservices.',
      about_role: 'You will work on full-stack web products using Next.js, Node.js, and modern PostgreSQL backends powering HippoClouds flagship digital products.',
      responsibilities: '• Develop performant web applications using React, Next.js, and Tailwind CSS.\n• Build robust REST and WebSocket APIs using Node.js and PostgreSQL.\n• Optimize web applications for maximum speed and SEO scalability.\n• Troubleshoot and resolve technical bottlenecks across the stack.',
      deliverables: '• Deliver production modules adhering to HippoClouds code quality and accessibility standards.\n• Implement secure authentication, authorization, and caching mechanisms.',
      education_requirements: 'B.Tech / B.E. / MCA in Computer Science or equivalent.',
      required_skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
      preferred_skills: ['Docker', 'AWS/Cloudflare', 'Redis', 'Jest/Playwright'],
      certifications: 'AWS Certified Cloud Practitioner or React Certification is a plus.',
      domain_knowledge: 'SaaS Platforms, Cloud Architecture, Responsive Web Design.',
      salary_currency: 'INR',
      min_salary: 800000,
      max_salary: 1400000,
      fixed_salary: 1000000,
      variable_salary: 150000,
      bonus_details: 'Performance linked incentive',
      is_salary_public: true,
      benefits: ['Comprehensive Health Coverage', 'Free Meals & Snacks', 'Skill Hub Access', 'Team Offsites'],
      recruitment_process: ['Recruiter Screen', 'Live Coding Challenge', 'Technical Discussion', 'Managerial Interview', 'HR Offer'],
      status: 'Published',
      featured: true,
      closing_date: '2026-12-15'
    },
    {
      job_id: 'HC-JOB-2026-1003',
      slug: 'cloud-devops-engineer-1003',
      title: 'Cloud DevOps & Infrastructure Engineer',
      internal_title: 'DevOps Specialist (AWS / Kubernetes)',
      department: 'Cloud Solutions',
      category: 'Cloud & Infrastructure',
      business_unit: 'Cloud Infrastructure & Security',
      job_level: 'Mid to Senior',
      openings: 2,
      priority: 'Medium',
      employment_type: 'Full Time',
      experience_level: '3-6 yrs',
      min_experience: 3,
      max_experience: 6,
      fresher_eligible: false,
      notice_period: '30-45 Days',
      joining_timeline: '30 Days',
      country: 'India',
      state: 'Andhra Pradesh',
      city: 'Visakhapatnam',
      office_address: 'HippoClouds Tech Park, Visakhapatnam',
      work_mode: 'Remote',
      relocation_assistance: false,
      travel_required: false,
      short_summary: 'Looking for a DevOps Engineer to automate, scale, and secure our multi-cloud infrastructure and continuous integration pipelines.',
      about_role: 'You will own the reliability, scalability, and security of HippoClouds infrastructure across AWS, Cloudflare, and Kubernetes clusters.',
      responsibilities: '• Design and manage automated CI/CD pipelines.\n• Manage containerized infrastructure using Docker & Kubernetes.\n• Implement proactive infrastructure monitoring, alerting, and log analytics with Prometheus/Grafana.\n• Enforce zero-trust security and infrastructure-as-code principles with Terraform.',
      deliverables: '• 99.99% uptime for core cloud services.\n• Fully automated multi-stage deployment workflows.',
      education_requirements: 'B.Tech/MCA/B.Sc Computer Science.',
      required_skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD Pipelines', 'Linux'],
      preferred_skills: ['Ansible', 'Cloudflare Workers', 'Prometheus', 'Bash/Python scripting'],
      certifications: 'AWS Solutions Architect or CKA (Certified Kubernetes Administrator).',
      domain_knowledge: 'Multi-cloud architectures, Site Reliability Engineering, High Availability.',
      salary_currency: 'INR',
      min_salary: 1100000,
      max_salary: 1700000,
      fixed_salary: 1300000,
      variable_salary: 200000,
      bonus_details: 'Discretionary company performance bonus',
      is_salary_public: true,
      benefits: ['Work from Anywhere', 'Home Office Stipend', 'Health Insurance', 'Annual Learning Credits'],
      recruitment_process: ['Screening Call', 'Hands-on DevOps Scenario', 'Systems Architecture Round', 'Final Culture Interview'],
      status: 'Published',
      featured: false,
      closing_date: '2026-11-30'
    },
    {
      job_id: 'HC-JOB-2026-1004',
      slug: 'ai-ml-engineer-1004',
      title: 'AI / Machine Learning Engineer',
      internal_title: 'AI Solutions Engineer',
      department: 'Artificial Intelligence',
      category: 'AI & Data Science',
      business_unit: 'Hippo AI Labs',
      job_level: 'Mid Level',
      openings: 2,
      priority: 'High',
      employment_type: 'Full Time',
      experience_level: '2-5 yrs',
      min_experience: 2,
      max_experience: 5,
      fresher_eligible: false,
      notice_period: '30 Days',
      joining_timeline: 'Immediate to 30 Days',
      country: 'India',
      state: 'Andhra Pradesh',
      city: 'Visakhapatnam',
      office_address: 'HippoClouds Tech Park, Visakhapatnam',
      work_mode: 'Hybrid',
      relocation_assistance: true,
      travel_required: false,
      short_summary: 'Build intelligent LLM integrations, retrieval augmented generation (RAG) pipelines, and computer vision models for HippoClouds enterprise solutions.',
      about_role: 'At Hippo AI Labs, you will turn groundbreaking machine learning research into production-grade AI features for our clients and internal systems.',
      responsibilities: '• Develop generative AI workflows using LLMs, embeddings, and vector databases.\n• Fine-tune domain-specific models for industry applications.\n• Build low-latency inference APIs with Python, FastAPI, and PyTorch.',
      deliverables: '• High-throughput vector search and contextual AI agent pipelines.',
      education_requirements: "Bachelor's or Master's degree in AI, Data Science, or Computer Science.",
      required_skills: ['Python', 'PyTorch', 'LLMs', 'LangChain / LlamaIndex', 'Vector DBs (pgvector/Pinecone)', 'FastAPI'],
      preferred_skills: ['Model fine-tuning', 'HuggingFace', 'ONNX', 'MLOps'],
      certifications: 'DeepLearning.AI or AWS Machine Learning Specialty.',
      domain_knowledge: 'Natural Language Processing, Generative AI, RAG Systems.',
      salary_currency: 'INR',
      min_salary: 1300000,
      max_salary: 2000000,
      fixed_salary: 1500000,
      variable_salary: 250000,
      bonus_details: 'Equity / ESOP options available for exceptional candidates',
      is_salary_public: true,
      benefits: ['GPU Compute Credits', 'AI Conference Sponsorships', 'Comprehensive Medical Cover', 'Flexible Schedule'],
      recruitment_process: ['Technical Screening', 'AI Project Presentation', 'System Architecture Discussion', 'Founder Chat'],
      status: 'Published',
      featured: true,
      closing_date: '2026-12-31'
    },
    {
      job_id: 'HC-JOB-2026-1005',
      slug: 'ui-ux-product-designer-1005',
      title: 'UI/UX Product Designer',
      internal_title: 'Senior Product Designer',
      department: 'Product Design',
      category: 'Design',
      business_unit: 'Hippo Design Studio',
      job_level: 'Mid to Senior',
      openings: 2,
      priority: 'Medium',
      employment_type: 'Full Time',
      experience_level: '3-6 yrs',
      min_experience: 3,
      max_experience: 6,
      fresher_eligible: false,
      notice_period: 'Immediate',
      joining_timeline: 'Immediate',
      country: 'India',
      state: 'Andhra Pradesh',
      city: 'Visakhapatnam',
      office_address: 'HippoClouds Tech Park, Visakhapatnam',
      work_mode: 'Onsite',
      relocation_assistance: true,
      travel_required: false,
      short_summary: 'Craft intuitive, aesthetically exceptional user journeys and design systems for enterprise software and consumer apps.',
      about_role: 'Own the visual and user experience design of our product ecosystem from discovery through wireframing, prototyping, and design token management.',
      responsibilities: '• Create wireframes, interactive prototypes, and design specs in Figma.\n• Conduct usability testing and user research sessions.\n• Collaborate closely with frontend engineers to ensure flawless design implementation.',
      deliverables: '• Complete design libraries and component tokens.\n• High-fidelity prototypes for web and mobile.',
      education_requirements: 'Degree in Design, HCI, or related field (or equivalent portfolio).',
      required_skills: ['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Prototyping', 'User Testing'],
      preferred_skills: ['Framer', 'Micro-animations', 'HTML/CSS understanding'],
      certifications: 'Nielsen Norman Group or Interaction Design Foundation.',
      domain_knowledge: 'Enterprise SaaS, Mobile First Design, Design Systems.',
      salary_currency: 'INR',
      min_salary: 700000,
      max_salary: 1200000,
      fixed_salary: 900000,
      variable_salary: 100000,
      bonus_details: 'Performance incentive',
      is_salary_public: true,
      benefits: ['Top-tier Hardware (Apple Mac M-series)', 'Design Subscriptions', 'Health Insurance', 'Mentorship Programs'],
      recruitment_process: ['Portfolio Review', 'Design Exercise', 'Cross-team Collaboration Round', 'Final Discussion'],
      status: 'Published',
      featured: false,
      closing_date: '2026-12-15'
    }
  ];

  for (const job of sampleJobs) {
    const res = await pool.query(
      `INSERT INTO jobs (
        job_id, slug, title, internal_title, department, category, business_unit,
        job_level, openings, priority, employment_type, experience_level,
        min_experience, max_experience, fresher_eligible, notice_period, joining_timeline,
        country, state, city, office_address, work_mode, relocation_assistance, travel_required,
        short_summary, about_role, responsibilities, deliverables, education_requirements,
        required_skills, preferred_skills, certifications, domain_knowledge,
        salary_currency, min_salary, max_salary, fixed_salary, variable_salary, bonus_details, is_salary_public,
        benefits, recruitment_process, status, featured, closing_date, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29,
        $30, $31, $32, $33,
        $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, 'Admin'
      ) ON CONFLICT (job_id) DO UPDATE SET title = EXCLUDED.title RETURNING id`,
      [
        job.job_id, job.slug, job.title, job.internal_title, job.department, job.category, job.business_unit,
        job.job_level, job.openings, job.priority, job.employment_type, job.experience_level,
        job.min_experience, job.max_experience, job.fresher_eligible, job.notice_period, job.joining_timeline,
        job.country, job.state, job.city, job.office_address, job.work_mode, job.relocation_assistance, job.travel_required,
        job.short_summary, job.about_role, job.responsibilities, job.deliverables, job.education_requirements,
        job.required_skills, job.preferred_skills, job.certifications, job.domain_knowledge,
        job.salary_currency, job.min_salary, job.max_salary, job.fixed_salary, job.variable_salary, job.bonus_details, job.is_salary_public,
        job.benefits, job.recruitment_process, job.status, job.featured, job.closing_date
      ]
    );

    const insertedJobId = res.rows[0].id;

    // Add sample screening questions
    await pool.query('DELETE FROM job_questions WHERE job_id = $1', [insertedJobId]);
    await pool.query(
      `INSERT INTO job_questions (job_id, question_text, question_type, options, required, display_order)
       VALUES
       ($1, 'How many years of relevant professional experience do you possess?', 'number', '[]'::jsonb, true, 1),
       ($1, 'Are you comfortable working from Visakhapatnam or relocating if required?', 'select', '["Yes, immediately", "Yes, within 30 days", "Prefer Remote only"]'::jsonb, true, 2),
       ($1, 'What is your current notice period in days?', 'text', '[]'::jsonb, true, 3),
       ($1, 'What is your current CTC and expected CTC (in INR LPA)?', 'text', '[]'::jsonb, true, 4)`,
      [insertedJobId]
    );
  }

  // 2. Seed a test candidate
  const demoEmail = 'candidate.demo@hippoclouds.com';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Candidate@123', salt);

  const candidateRes = await pool.query(
    `INSERT INTO candidates (
      candidate_id, first_name, last_name, email, mobile, password_hash,
      city, state, country, current_title, current_company, total_experience,
      relevant_experience, current_ctc, expected_ctc, notice_period, employment_status,
      linkedin_url, github_url, profile_completion
    ) VALUES (
      'HC-CAN-2026-99001', 'Anand', 'Kumar', $1, '+91 9876543210', $2,
      'Visakhapatnam', 'Andhra Pradesh', 'India', 'Senior Mobile Engineer', 'Tech Innovators Pvt Ltd', 4.5,
      4.0, '10,00,000 INR', '15,00,000 INR', '30 Days', 'Employed',
      'https://linkedin.com/in/anandkumar', 'https://github.com/anandkumar', 85
    ) ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name RETURNING id`,
    [demoEmail, hash]
  );

  const canId = candidateRes.rows[0].id;

  // Candidate Education
  await pool.query('DELETE FROM candidate_education WHERE candidate_id = $1', [canId]);
  await pool.query(
    `INSERT INTO candidate_education (candidate_id, qualification, degree, specialization, institution, start_year, end_year, percentage_or_cgpa)
     VALUES ($1, 'Graduation', 'B.Tech', 'Computer Science & Engineering', 'Andhra University College of Engineering', '2018', '2022', '8.4 CGPA')`,
    [canId]
  );

  // Candidate Experience
  await pool.query('DELETE FROM candidate_experience WHERE candidate_id = $1', [canId]);
  await pool.query(
    `INSERT INTO candidate_experience (candidate_id, company, job_title, employment_type, location, start_date, currently_working, responsibilities, technologies)
     VALUES ($1, 'Tech Innovators Pvt Ltd', 'Flutter Developer', 'Full Time', 'Visakhapatnam', '2022-07-01', true, 'Spearheaded mobile development and integrated REST APIs.', 'Flutter, Dart, Firebase')`,
    [canId]
  );

  // Candidate Skills
  await pool.query('DELETE FROM candidate_skills WHERE candidate_id = $1', [canId]);
  await pool.query(
    `INSERT INTO candidate_skills (candidate_id, skill_name, category, years_experience, proficiency)
     VALUES
     ($1, 'Flutter', 'Mobile', 4.0, 'Expert'),
     ($1, 'Dart', 'Mobile', 4.0, 'Expert'),
     ($1, 'React', 'Frontend', 2.0, 'Intermediate'),
     ($1, 'Firebase', 'Cloud', 3.0, 'Advanced')`,
    [canId]
  );

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

