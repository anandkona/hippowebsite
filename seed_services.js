const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const services = [
  {
    icon: "Code",
    title: "Product Development",
    description: "End-to-end software engineering from ideation to deployment, using modern tech stacks and agile methodologies.",
    highlight: "Full-cycle development",
  },
  {
    icon: "LineChart",
    title: "Strategic Consultancy",
    description: "Enterprise technology consulting to drive digital transformation, optimize operations, and maximize ROI.",
    highlight: "Digital transformation",
  },
  {
    icon: "Megaphone",
    title: "Digital Marketing",
    description: "Data-driven strategies including SEO, SEM, and social media management to amplify your brand's global reach.",
    highlight: "Global brand reach",
  },
  {
    icon: "Cog",
    title: "IT Services",
    description: "Comprehensive managed IT services including cloud migration, infrastructure management, and enterprise solutions.",
    highlight: "Cloud-first approach",
  },
  {
    icon: "GraduationCap",
    title: "Skill Academy",
    description: "Corporate upskilling programs in AI, cloud computing, full-stack development, and emerging technologies.",
    highlight: "1000+ trained professionals",
  },
  {
    icon: "Headphones",
    title: "BPO Services",
    description: "Enterprise-grade business process outsourcing with dedicated teams for support, operations, and back-office.",
    highlight: "24/7 global support",
  }
];

async function seed() {
  console.log("Seeding services...");
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await pool.query(
      'INSERT INTO services (title, description, highlight, icon_name, display_order) VALUES ($1, $2, $3, $4, $5)',
      [s.title, s.description, s.highlight, s.icon, i + 1]
    );
  }
  console.log("Services seeded!");
  process.exit(0);
}

seed();
