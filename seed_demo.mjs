import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const demoContent = {
  heroTag: 'CLOUD OPERATING MODEL',
  heroTitle: 'Cloud Solutions Built for Secure, Scalable Growth',
  heroSubtitle: 'Plan, migrate, secure, and optimize cloud infrastructure with a team that keeps performance, uptime, and cost governance in the same conversation.',
  heroPrimaryCtaText: 'Ready to Start Journey',
  heroPrimaryCtaLink: '/contact',
  heroSecondaryCtaText: 'Explore Expert',
  heroSecondaryCtaLink: '#capabilities',
  coreCapabilitiesTitle: 'Everything needed to launch and operate cloud with confidence.',
  coreCapabilitiesSubtitle: 'From migration planning to security and optimization, each capability is designed to work as part of one stable operating model.',
  detailedFeatures: [
    { title: 'Cloud Migration', description: 'Readiness assessment, Migration waves, Post-migration tuning' },
    { title: 'Managed Infrastructure', description: '24/7 monitoring, Patch governance, Capacity planning' },
    { title: 'Security & Compliance', description: 'Protect cloud environments with identity controls, encrypted data flows, hardening standards, and audit-ready documentation.' },
    { title: 'Performance Optimization', description: 'Improve speed, availability, and cost efficiency through right-sized architecture and continuous performance reviews.' }
  ],
  pathTag: 'Cloud operating model',
  pathTitle: 'A practical path from legacy systems to cloud maturity.',
  pathSubtitle: 'Cloud transformation should simplify operations, not add another layer of complexity. Hippocloud designs cloud environments that balance performance, governance, security, and cost control from the beginning.',
  pathItems: [
    'Enterprise benefits',
    'Operational benefits',
    'Clear cost controls and resource governance',
    'Security-first implementation with audit-friendly controls',
    'Operational dashboards for proactive decisions',
    'A practical roadmap for modernization and automation'
  ],
  stepsTitle: 'Clear steps from assessment to optimization.',
  steps: [
    { title: 'Assess', description: 'Evaluate current infrastructure.' },
    { title: 'Architect', description: 'Design scalable foundation.' },
    { title: 'Migrate', description: 'Move workloads through planned waves with validation and rollback readiness.' },
    { title: 'Optimize', description: 'Tune performance, cost, automation, and observability after go-live.' }
  ],
  faqsTitle: 'Cloud decisions made clearer.',
  faqs: [
    { question: 'How long does a typical migration take?', answer: 'It depends on the complexity of your workloads.' },
    { question: 'Is my data secure during migration?', answer: 'Yes, we use industry-standard encryption.' }
  ]
};

async function run() {
  await pool.query('UPDATE services SET page_content = $1 WHERE slug = $2', [demoContent, 'product-development']);
  console.log('Demo content seeded to product-development!');
  process.exit(0);
}
run();
