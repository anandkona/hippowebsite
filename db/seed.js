const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Seed data definitions
const PRODUCTS = [
  {
    product_id: "hippocx",
    name: "HIPPOCX",
    tagline: "AI-Powered CRM & Digital Integration Platform",
    description: "An intelligent enterprise CRM that leverages AI to automate customer interactions, deliver predictive analytics, and integrate seamlessly across your digital ecosystem.",
    image_url: "/assets/product-crm.jpg",
    image_mode: "contain",
    logo_url: "/assets/HCX.png",
    features: [
      "AI-Driven Lead Scoring",
      "Omnichannel Integration",
      "Predictive Analytics",
      "Smart Workflow Automation",
      "Real-time Dashboards",
      "Enterprise API"
    ],
    is_active: true,
    display_order: 1,
    page_content: {
      heroTag: "AI CRM & AUTOMATION / TRANSFORMING ENTERPRISES",
      heroTitle: "AI-Powered CRM & Digital Integration Platform",
      heroSubtitle: "Transform how your enterprise engages customers. HIPPOCX combines automated lead intelligence, omnichannel conversations, and predictive analytics in one cohesive workspace.",
      heroBackgroundImage: "/assets/product-crm.jpg",
      heroPrimaryCtaText: "Request a Demo",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "Explore Features",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "99.99%", label: "Platform Uptime", subtitle: "Enterprise Reliability" },
        { value: "45%", label: "Shorter Sales Cycles", subtitle: "Automated Routing" },
        { value: "10x", label: "Faster Insights", subtitle: "Predictive Analytics" },
        { value: "100+", label: "Ecosystem Integrations", subtitle: "API & Webhooks" }
      ],
      coreCapabilitiesTag: "CORE CAPABILITIES / ENTERPRISE CRM",
      coreCapabilitiesTitle: "Everything needed to manage, scale, and automate customer journeys.",
      coreCapabilitiesSubtitle: "Empower your sales, marketing, and customer success teams with state-of-the-art tools and AI assistance.",
      detailedFeatures: [
        {
          title: "AI-Driven Lead Scoring",
          description: "Prioritize high-conversion prospects automatically using machine learning models trained on buyer intent and behavioral signals."
        },
        {
          title: "Omnichannel Communications",
          description: "Unify email, chat, WhatsApp, and telephony into a continuous timeline for uninterrupted customer context."
        },
        {
          title: "Predictive Pipeline Analytics",
          description: "Forecast deal closures, monitor revenue health, and spot bottleneck risks before they affect quarterly targets."
        },
        {
          title: "Automated Workflows & Playbooks",
          description: "Trigger follow-ups, reassign inactive accounts, and update CRM records automatically without manual data entry."
        },
        {
          title: "Real-time Operational Dashboards",
          description: "Gain granular visibility into team velocity, conversion rates, and SLA adherence with customizable dashboards."
        },
        {
          title: "Enterprise Integrations & REST API",
          description: "Connect with ERPs, accounting software, and data warehouses via secure and scalable webhooks and APIs."
        }
      ],
      pathTag: "ENTERPRISE CRM ARCHITECTURE",
      pathTitle: "A modern foundation for enterprise customer operations.",
      pathSubtitle: "Our platform bridges disparate touchpoints into an actionable, unified intelligence engine.",
      pathItems: [
        "AI-driven lead qualification and automated routing",
        "360-degree customer interaction history across all channels",
        "Configurable deal pipelines with stage-specific gate checks",
        "Strict role-based access control and enterprise encryption",
        "Real-time pipeline analytics and automated executive reports",
        "Seamless bi-directional sync with ERP and financial systems"
      ],
      stepsTag: "IMPLEMENTATION PROCESS",
      stepsTitle: "From onboarding to enterprise adoption in 4 simple steps.",
      steps: [
        { title: "Connect", description: "Connect existing email, telephony, ERP, and customer data sources." },
        { title: "Configure", description: "Define custom deal stages, pipeline SLAs, and automated trigger rules." },
        { title: "Empower", description: "Onboard sales and support teams with role-tailored dashboards and training." },
        { title: "Optimize", description: "Leverage predictive models and analytics to continuously refine conversion rates." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about HIPPOCX? We're here to help.",
      faqs: [
        {
          question: "How does HIPPOCX integrate with our current tech stack?",
          answer: "HIPPOCX provides robust REST APIs, webhooks, and out-of-the-box connectors for major ERPs, messaging channels, and productivity tools."
        },
        {
          question: "Can HIPPOCX scale to millions of customer records?",
          answer: "Yes, our cloud-native database architecture easily handles high data volumes, real-time event ingestion, and complex analytical queries."
        },
        {
          question: "What security measures are implemented?",
          answer: "We enforce end-to-end encryption in transit and at rest, SOC 2 compliance standards, and granular role-based permissions."
        }
      ],
      finalCtaTitle: "Ready to transform your customer experience with HIPPOCX?",
      finalCtaDescription: "Connect with our solution architects today to schedule a tailored live demonstration.",
      finalCtaButtonText: "Schedule Demo",
      finalCtaLink: "/contact",
      seoTitle: "HIPPOCX | AI-Powered Enterprise CRM & Digital Integration",
      seoDescription: "Empower your business with HIPPOCX — AI lead scoring, omnichannel communication, predictive analytics, and automated workflows.",
      seoKeywords: "HIPPOCX, CRM, AI CRM, enterprise automation, lead management, Hippocloud"
    }
  },
  {
    product_id: "hippoaqua",
    name: "HIPPOAQUA",
    tagline: "Intelligent Water Management System",
    description: "Advanced IoT-enabled water management platform for utilities and enterprises. Real-time monitoring, quality analytics, distribution optimization, and regulatory compliance.",
    image_url: "/assets/product-aqua.jpg",
    image_mode: "cover",
    logo_url: null,
    features: [
      "IoT Sensor Network",
      "Quality Monitoring",
      "Distribution Optimization",
      "Compliance Automation",
      "Leak Detection AI",
      "Usage Analytics"
    ],
    is_active: true,
    display_order: 2,
    page_content: {
      heroTag: "SMART WATER UTILITIES / IOT PLATFORM",
      heroTitle: "Intelligent Water Management & IoT Analytics",
      heroSubtitle: "End-to-end water monitoring, real-time quality analytics, and leak detection algorithms built for utilities, municipalities, and commercial facilities.",
      heroBackgroundImage: "/assets/product-aqua.jpg",
      heroPrimaryCtaText: "Discover HippoAqua",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "Explore Capabilities",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "98%", label: "Leak Detection Accuracy", subtitle: "AI Acoustic Sensing" },
        { value: "35%", label: "Water Loss Reduction", subtitle: "Smart Distribution" },
        { value: "24/7", label: "Real-time Telemetry", subtitle: "IoT Sensor Grid" },
        { value: "100%", label: "Regulatory Compliance", subtitle: "Audit Reports" }
      ],
      coreCapabilitiesTag: "CAPABILITIES & MONITORING",
      coreCapabilitiesTitle: "Total visibility across generation, treatment, and distribution networks.",
      coreCapabilitiesSubtitle: "Empowering municipal and industrial facilities with actionable insights to conserve water and eliminate non-revenue losses.",
      detailedFeatures: [
        {
          title: "IoT Sensor Network",
          description: "Connect wireless flow meters, pressure transducers, and acoustic leak detectors across vast geographical areas."
        },
        {
          title: "Real-Time Quality Monitoring",
          description: "Continuously track pH, turbidity, TDS, and chlorine levels to ensure drinking water safety standards."
        },
        {
          title: "AI-Powered Leak Detection",
          description: "Detect pressure anomalies and pipe fractures early, preventing catastrophic losses and infrastructure damage."
        },
        {
          title: "Distribution Optimization",
          description: "Balance pumping pressure with demand spikes using automated variable-frequency drive integrations."
        },
        {
          title: "Automated Compliance Reporting",
          description: "Generate regulatory and environmental water safety reports automatically with full audit trails."
        },
        {
          title: "Predictive Maintenance",
          description: "Anticipate pump and valve maintenance cycles before failures occur based on vibration and telemetry logs."
        }
      ],
      pathTag: "WATER INFRASTRUCTURE",
      pathTitle: "Modernizing water distribution with telemetry and intelligence.",
      pathSubtitle: "Transition from manual meter checks to a smart, closed-loop water management ecosystem.",
      pathItems: [
        "Automated meter reading (AMR) and cellular IoT telemetry",
        "Acoustic and pressure-based micro-leak identification",
        "Real-time water quality dashboards for public health compliance",
        "Automated pump control and pressure zoning optimization",
        "Granular billing reconciliation for industrial and domestic consumers",
        "Emergency shut-off workflows for contamination or burst events"
      ],
      stepsTag: "DEPLOYMENT PATHWAY",
      stepsTitle: "Fast-track rollout from sensor deployment to full oversight.",
      steps: [
        { title: "Survey", description: "Assess distribution pipelines, telemetry coverage, and monitoring requirements." },
        { title: "Install", description: "Deploy durable industrial IoT flow, pressure, and quality sensors." },
        { title: "Integrate", description: "Connect sensor streams to the HippoAqua centralized cloud platform." },
        { title: "Automate", description: "Activate AI leak detection, predictive alerts, and automated reporting." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Frequently asked questions regarding HippoAqua.",
      faqs: [
        {
          question: "What wireless protocols do HippoAqua sensors use?",
          answer: "We support LoRaWAN, NB-IoT, cellular (4G/5G), and satellite uplinks for remote locations."
        },
        {
          question: "Can it integrate with existing SCADA systems?",
          answer: "Yes, HippoAqua features bi-directional integration with standard SCADA protocols (Modbus, OPC-UA, MQTT)."
        },
        {
          question: "How does it detect leaks?",
          answer: "Our AI engine correlates high-frequency pressure wave data with acoustic sensor signals to locate leaks within meters."
        }
      ],
      finalCtaTitle: "Ready to build a smarter, resilient water network?",
      finalCtaDescription: "Connect with our environmental IoT engineers to plan a pilot deployment in your area.",
      finalCtaButtonText: "Talk to Specialists",
      finalCtaLink: "/contact",
      seoTitle: "HIPPOAQUA | Smart Water Management & IoT Analytics",
      seoDescription: "Advanced IoT-enabled water management platform for utilities and enterprises. Real-time monitoring, quality analytics, distribution optimization.",
      seoKeywords: "HippoAqua, water management, IoT water, leak detection, smart water grid, Hippocloud"
    }
  },
  {
    product_id: "hippobuildx",
    name: "HIPPO BUILDX",
    tagline: "Smart Construction & Project Management",
    description: "Digital construction management platform that streamlines planning, execution, and monitoring. From blueprint to handover, manage every phase with precision.",
    image_url: "/assets/product-buildx.jpg",
    image_mode: "cover",
    logo_url: null,
    features: [
      "BIM Integration",
      "Resource Planning",
      "Progress Tracking",
      "Team Collaboration",
      "Cost Management",
      "Safety Compliance"
    ],
    is_active: true,
    display_order: 3,
    page_content: {
      heroTag: "SMART CONSTRUCTION / INFRASTRUCTURE TECH",
      heroTitle: "Next-Gen Construction & Project Lifecycle Management",
      heroSubtitle: "From pre-construction blueprints to final handover, HIPPO BUILDX synchronizes job sites, field crews, subcontractors, and architects in one real-time workspace.",
      heroBackgroundImage: "/assets/product-buildx.jpg",
      heroPrimaryCtaText: "Request a Demo",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "View Features",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "25%", label: "Faster Project Delivery", subtitle: "Streamlined Workflows" },
        { value: "100%", label: "Digital Handover", subtitle: "Zero Paper Records" },
        { value: "30%", label: "Rework Cost Reduction", subtitle: "Real-time BIM Sync" },
        { value: "24/7", label: "Job Site Visibility", subtitle: "Mobile & Cloud Access" }
      ],
      coreCapabilitiesTag: "CORE CAPABILITIES / CONSTRUCTION TECH",
      coreCapabilitiesTitle: "Deliver massive projects on schedule and within budget.",
      coreCapabilitiesSubtitle: "Empowering project managers, general contractors, and safety officers with digital tools built for tough job site realities.",
      detailedFeatures: [
        {
          title: "BIM & CAD Model Integration",
          description: "View, measure, and annotate 3D BIM models directly on tablet devices on the job site."
        },
        {
          title: "Daily Logs & Progress Tracking",
          description: "Capture site photos, weather logs, manpower headcounts, and milestone completions in real time."
        },
        {
          title: "Material & Resource Management",
          description: "Track deliveries, manage inventory consumption, and prevent material run-out delays."
        },
        {
          title: "RFI & Submittal Workflows",
          description: "Accelerate approval cycles between subcontractors, general contractors, and structural engineers."
        },
        {
          title: "Budget & Change Order Tracking",
          description: "Maintain real-time financial transparency against initial contracts, labor rates, and variances."
        },
        {
          title: "Safety & Incident Compliance",
          description: "Enforce OSHA/ISO safety inspections, log hazard reports, and ensure compliance before work commences."
        }
      ],
      pathTag: "PROJECT LIFECYCLE ROADMAP",
      pathTitle: "Eliminate site disconnects from design to handover.",
      pathSubtitle: "A unified digital platform connecting the corporate office to field teams on site.",
      pathItems: [
        "Full 3D BIM and 2D drawing revision management",
        "Mobile-first field inspection and snagging checklists",
        "Subcontractor coordination and punch list tracking",
        "Automated safety hazard reporting and corrective action tracking",
        "Real-time cost code reconciliation with accounting ERPs",
        "Centralized digital repository for warranties, specs, and certificates"
      ],
      stepsTag: "PROJECT STEPS",
      stepsTitle: "Four phases to construction excellence.",
      steps: [
        { title: "Setup", description: "Upload models, drawings, project milestones, and assign contractor roles." },
        { title: "Mobilize", description: "Deploy field inspection apps to site supervisors and subcontractors." },
        { title: "Execute", description: "Track daily progress, verify quality milestones, and manage RFIs." },
        { title: "Handover", description: "Generate digital turnover packages, as-builts, and warranty records." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about HIPPO BUILDX?",
      faqs: [
        {
          question: "Does HIPPO BUILDX work offline on remote job sites?",
          answer: "Yes, our mobile apps store data offline and automatically sync whenever connectivity is re-established."
        },
        {
          question: "Which file formats are supported for drawings and models?",
          answer: "We support IFC, Revit, DWG, DXF, PDF, and standard image formats."
        },
        {
          question: "Can subcontractors access only their assigned work?",
          answer: "Yes, comprehensive permission gates allow subcontractors to only see relevant packages and punch items."
        }
      ],
      finalCtaTitle: "Ready to streamline your next construction project?",
      finalCtaDescription: "Contact our construction technology experts to discover how HIPPO BUILDX can empower your teams.",
      finalCtaButtonText: "Schedule Consultation",
      finalCtaLink: "/contact",
      seoTitle: "HIPPO BUILDX | Smart Construction & Project Management Platform",
      seoDescription: "Digital construction management platform that streamlines planning, BIM integration, progress tracking, and execution from blueprint to handover.",
      seoKeywords: "Hippo BuildX, construction management, BIM, project management software, site supervision, Hippocloud"
    }
  },
  {
    product_id: "hippomint",
    name: "HIPPO MINT",
    tagline: "Smart GST Billing & Inventory Management",
    description: "Streamline your business operations with our comprehensive GST billing and inventory management solution. Fast invoicing, stock tracking, and compliance.",
    image_url: "/assets/hippomint/1.png",
    image_mode: "contain",
    logo_url: null,
    features: [
      "GST Invoicing",
      "Real-Time Stock Alerts",
      "E-Way Bill Generation",
      "Multi-Branch Support",
      "Accounting Reports",
      "Customer Ledger"
    ],
    is_active: true,
    display_order: 4,
    page_content: {
      heroTag: "SMART BILLING & INVENTORY / SME TO ENTERPRISE",
      heroTitle: "Smart GST Billing, Invoicing & Inventory Management",
      heroSubtitle: "Create compliant GST invoices in seconds, track inventory across multiple warehouses, and automate e-way bill generation effortlessly.",
      heroBackgroundImage: "/assets/hippomint/1.png",
      heroPrimaryCtaText: "Get Started Free",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "Explore Features",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "5 Sec", label: "Invoice Creation", subtitle: "Lightning Fast" },
        { value: "100%", label: "GST Compliant", subtitle: "E-Invoicing Ready" },
        { value: "Multi", label: "Warehouse Sync", subtitle: "Real-time Stock" },
        { value: "0 Error", label: "Tax Calculation", subtitle: "Automated HSN/SAC" }
      ],
      coreCapabilitiesTag: "BILLING & STOCK CONTROL",
      coreCapabilitiesTitle: "Everything your business needs to stay compliant and profitable.",
      coreCapabilitiesSubtitle: "Designed for traders, retailers, wholesalers, and growing manufacturers who want simplicity without sacrificing power.",
      detailedFeatures: [
        {
          title: "Instant GST Invoicing",
          description: "Generate beautiful, GST-compliant tax invoices, proformas, and delivery challans in seconds."
        },
        {
          title: "Automated E-Way & E-Invoice",
          description: "Generate e-way bills and IRN QR codes with a single click directly from the invoice screen."
        },
        {
          title: "Multi-Location Inventory",
          description: "Manage stock across multiple branches and warehouses with batch tracking, expiry dates, and serial numbers."
        },
        {
          title: "Customer & Vendor Ledgers",
          description: "Track outstanding receivables, aging reports, and send automatic payment reminders via WhatsApp/SMS."
        },
        {
          title: "GST Filing Ready Reports",
          description: "Export GSTR-1, GSTR-3B, and audit-ready spreadsheets mapped directly to government portals."
        },
        {
          title: "POS & Barcode Scanner Integration",
          description: "Speed up retail counters with thermal printer support, barcode scanning, and fast keyboard shortcuts."
        }
      ],
      pathTag: "FINANCIAL WORKFLOW",
      pathTitle: "Simplify commerce from purchase order to tax filing.",
      pathSubtitle: "Say goodbye to complex spreadsheets and error-prone billing systems.",
      pathItems: [
        "Fast GST invoice creation with automated HSN/SAC code lookup",
        "Direct E-Invoice and E-Way bill generation",
        "Low stock warnings and automated reorder points",
        "Multi-user roles with cashier, manager, and accountant permissions",
        "Comprehensive balance sheet, P&L, and cash flow reports",
        "Cloud-synced mobile app for on-the-go invoicing and collection"
      ],
      stepsTag: "EASY ONBOARDING",
      stepsTitle: "Up and running in minutes.",
      steps: [
        { title: "Sign Up", description: "Register your business and input your GSTIN." },
        { title: "Import", description: "Import customer lists and inventory items via Excel in one click." },
        { title: "Bill", description: "Generate your first GST invoice and share via PDF or WhatsApp." },
        { title: "Reconcile", description: "View real-time profitability and file tax returns with confidence." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about Hippo Mint?",
      faqs: [
        {
          question: "Is Hippo Mint compliant with latest GST rules?",
          answer: "Yes, Hippo Mint updates regularly with all current GST rules, tax slabs, and e-invoicing thresholds."
        },
        {
          question: "Can I use Hippo Mint across multiple branches?",
          answer: "Yes, you can manage multiple shops or warehouses under a single company account with centralized stock reporting."
        },
        {
          question: "Can I print invoices on any printer?",
          answer: "Yes, Hippo Mint supports standard A4/A5 laser/inkjet printers as well as 2-inch and 3-inch POS thermal printers."
        }
      ],
      finalCtaTitle: "Ready to streamline your billing and stock management?",
      finalCtaDescription: "Start using Hippo Mint today and experience hassle-free business accounting.",
      finalCtaButtonText: "Start Free Trial",
      finalCtaLink: "/contact",
      seoTitle: "HIPPO MINT | Smart GST Billing & Inventory Management",
      seoDescription: "Streamline your business operations with our comprehensive GST billing, e-way bill generation, and inventory management solution.",
      seoKeywords: "Hippo Mint, GST billing, inventory software, invoice generator, e-way bill, accounting app, Hippocloud"
    }
  }
];

const SERVICES = [
  {
    title: "Cloud Solutions",
    description: "Plan, migrate, secure, and optimize enterprise cloud infrastructure with certified cloud architects and 24/7 governance.",
    highlight: "Cloud-First Architecture",
    icon_name: "Cloud",
    slug: "cloud-solutions",
    is_active: true,
    display_order: 1,
    page_content: {
      heroTag: "CLOUD OPERATING MODEL / RESILIENT INFRASTRUCTURE",
      heroTitle: "Cloud Solutions Built for Secure, Scalable Growth",
      heroSubtitle: "Plan, migrate, secure, and optimize cloud infrastructure with a team that keeps performance, uptime, and cost governance in the same conversation.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Schedule Architecture Review",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "Explore Capabilities",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "99.99%", label: "Guaranteed SLA", subtitle: "High Availability" },
        { value: "40%", label: "Cloud Cost Optimization", subtitle: "FinOps Practices" },
        { value: "100+", label: "Successful Migrations", subtitle: "Zero-Downtime Cuts" },
        { value: "24/7", label: "Managed SOC & NOC", subtitle: "Round-the-clock Care" }
      ],
      coreCapabilitiesTag: "CORE CAPABILITIES / CLOUD MATURITY",
      coreCapabilitiesTitle: "Everything needed to launch and operate cloud with confidence.",
      coreCapabilitiesSubtitle: "From migration planning to security and optimization, each capability is designed to work as part of one stable operating model.",
      detailedFeatures: [
        { title: "Cloud Migration", description: "Readiness assessment, migration waves, dependency mapping, and post-migration tuning." },
        { title: "Managed Infrastructure", description: "24/7 monitoring, patch governance, disaster recovery orchestration, and capacity planning." },
        { title: "Security & Compliance", description: "Protect cloud environments with identity controls, encrypted data flows, hardening standards, and audit-ready documentation." },
        { title: "Performance Optimization", description: "Improve speed, availability, and cost efficiency through right-sized architecture and continuous performance reviews." }
      ],
      pathTag: "CLOUD OPERATING MODEL",
      pathTitle: "A practical path from legacy systems to cloud maturity.",
      pathSubtitle: "Cloud transformation should simplify operations, not add another layer of complexity. Hippocloud designs cloud environments that balance performance, governance, security, and cost control from the beginning.",
      pathItems: [
        "Readiness and TCO assessment",
        "Clear cost controls and resource governance",
        "Security-first implementation with audit-friendly controls",
        "Operational dashboards for proactive decisions",
        "A practical roadmap for modernization and automation",
        "24/7 incident response and site reliability engineering"
      ],
      stepsTag: "MIGRATION ROADMAP",
      stepsTitle: "Clear steps from assessment to optimization.",
      steps: [
        { title: "Assess", description: "Evaluate current infrastructure, application dependencies, and compliance goals." },
        { title: "Architect", description: "Design a resilient, multi-region foundation following Well-Architected Frameworks." },
        { title: "Migrate", description: "Move workloads through planned waves with validation and rollback readiness." },
        { title: "Optimize", description: "Tune performance, cost, automation, and observability after go-live." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Cloud decisions made clearer.",
      faqs: [
        { question: "How long does a typical enterprise cloud migration take?", answer: "Timeline depends on workload complexity and data volume, typically ranging from 4 weeks for focused workloads to a phased 3 to 6-month plan for full legacy modernization." },
        { question: "How do you ensure zero data loss during cutover?", answer: "We use continuous replication, sandbox dry runs, and parallel syncs with strict rollback checkpoints." },
        { question: "Can you help optimize our existing high cloud bills?", answer: "Yes, our FinOps assessment identifies idle resources, unattached storage, reserved instance mismatches, and architectural bottlenecks to slash costs by 20-40%." }
      ],
      finalCtaTitle: "Ready to build a better cloud foundation?",
      finalCtaDescription: "Connect with our certified cloud architects to review your architecture and roadmap.",
      finalCtaButtonText: "Contact Us",
      finalCtaLink: "/contact",
      seoTitle: "Cloud Solutions & Enterprise Migration | Hippocloud",
      seoDescription: "Plan, migrate, secure, and optimize enterprise cloud infrastructure with certified cloud architects and 24/7 governance.",
      seoKeywords: "Cloud solutions, AWS migration, cloud architecture, managed cloud, DevOps, Hippocloud"
    }
  },
  {
    title: "Product Development",
    description: "End-to-end software engineering from ideation to deployment, using modern tech stacks, microservices, and agile methodologies.",
    highlight: "Full-Cycle Development",
    icon_name: "Code",
    slug: "product-development",
    is_active: true,
    display_order: 2,
    page_content: {
      heroTag: "SOFTWARE ENGINEERING / RAPID PROTOTYPING",
      heroTitle: "End-to-End Enterprise Product Development",
      heroSubtitle: "Turn bold concepts into production-grade digital software. We architect, design, build, and deploy resilient web, mobile, and cloud-native applications.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Start Your Project",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "View Capabilities",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "50+", label: "Products Shipped", subtitle: "From Concept to Scale" },
        { value: "2x", label: "Velocity Boost", subtitle: "Agile CI/CD Pipelines" },
        { value: "100%", label: "Code Quality", subtitle: "Automated Test Coverage" },
        { value: "Enterprise", label: "Grade Architecture", subtitle: "Microservices & APIs" }
      ],
      coreCapabilitiesTag: "ENGINEERING EXCELLENCE",
      coreCapabilitiesTitle: "Full-lifecycle software engineering designed for scale.",
      coreCapabilitiesSubtitle: "From MVP ideation to multi-tenant SaaS scaling, we build software that drives real commercial value.",
      detailedFeatures: [
        { title: "Frontend Engineering", description: "Fast, responsive web applications built with Next.js, React, TypeScript, and modern design systems." },
        { title: "Backend & Microservices", description: "Resilient APIs, event-driven pipelines, and distributed databases built with Node.js, Go, and PostgreSQL." },
        { title: "Mobile App Development", description: "High-performance cross-platform mobile apps for iOS and Android with offline-first capabilities." },
        { title: "QA & Automated Testing", description: "Comprehensive test suites including unit, integration, performance, and security regression testing." }
      ],
      pathTag: "DEVELOPMENT METHODOLOGY",
      pathTitle: "Agile, transparent, and built for speed.",
      pathSubtitle: "We partner with product leaders to deliver weekly working software with zero guesswork.",
      pathItems: [
        "Collaborative discovery sprints and rapid wireframing",
        "Modern cloud-native microservices architecture",
        "Bi-weekly sprint demos and continuous client feedback loops",
        "Automated deployment pipelines and staging environments",
        "Strict code reviews and security scanning at every pull request",
        "Comprehensive documentation and seamless knowledge transfer"
      ],
      stepsTag: "DEVELOPMENT PHASES",
      stepsTitle: "From idea to market in 4 structured phases.",
      steps: [
        { title: "Discover", description: "Define user personas, core feature sets, and technical specifications." },
        { title: "Design", description: "Craft intuitive UI/UX design systems and interactive prototypes." },
        { title: "Build", description: "Develop features in agile sprints with continuous automated testing." },
        { title: "Launch", description: "Deploy to production with real-time telemetry and scaling support." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about our product engineering process?",
      faqs: [
        { question: "Do you build MVPs for startups as well as enterprise software?", answer: "Yes! We specialize in both rapid 6-8 week MVP launches and complex enterprise replatforming." },
        { question: "Who owns the intellectual property (IP)?", answer: "You retain 100% ownership of all source code, designs, and intellectual property." },
        { question: "How do we stay updated on development progress?", answer: "You get access to Jira/GitHub, Slack channels, weekly sprint demos, and staging preview URLs." }
      ],
      finalCtaTitle: "Have an innovative product idea?",
      finalCtaDescription: "Let's discuss your requirements and turn your vision into an exceptional digital product.",
      finalCtaButtonText: "Discuss Your Product",
      finalCtaLink: "/contact",
      seoTitle: "Product Development & Software Engineering | Hippocloud",
      seoDescription: "End-to-end software engineering from ideation to deployment, using modern tech stacks, microservices, and agile methodologies.",
      seoKeywords: "Product development, custom software engineering, Next.js development, MVP, enterprise SaaS, Hippocloud"
    }
  },
  {
    title: "IT Services",
    description: "Comprehensive managed IT services including infrastructure management, cyber security, DevOps pipelines, and enterprise support.",
    highlight: "Managed Infrastructure",
    icon_name: "Cog",
    slug: "it-services",
    is_active: true,
    display_order: 3,
    page_content: {
      heroTag: "MANAGED IT / 24/7 OPERATIONS",
      heroTitle: "Enterprise IT Services & Infrastructure Management",
      heroSubtitle: "Keep your critical business systems running smoothly with proactive monitoring, cybersecurity defense, and expert helpdesk support.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Explore IT Services",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "View Offerings",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "15 min", label: "Average Response Time", subtitle: "Critical Incidents" },
        { value: "99.9%", label: "Uptime Maintenance", subtitle: "Proactive Monitoring" },
        { value: "360°", label: "Threat Protection", subtitle: "Endpoint & Cloud" },
        { value: "24/7", label: "Helpdesk Support", subtitle: "Always Available" }
      ],
      coreCapabilitiesTag: "MANAGED SERVICES",
      coreCapabilitiesTitle: "Reliable technology foundations for growing enterprises.",
      coreCapabilitiesSubtitle: "We manage the complexity of IT infrastructure so you can focus on core business growth.",
      detailedFeatures: [
        { title: "24/7 Infrastructure Monitoring", description: "Proactive health monitoring for servers, networks, cloud instances, and database clusters." },
        { title: "Cybersecurity & Threat Defense", description: "Endpoint protection, vulnerability scanning, firewall configuration, and automated patch management." },
        { title: "Backup & Disaster Recovery", description: "Immutable off-site backups, automated failover protocols, and periodic disaster recovery drills." },
        { title: "Enterprise Helpdesk & Support", description: "Multi-tiered support desk providing rapid resolution for workstation, identity, and application issues." }
      ],
      pathTag: "IT GOVERNANCE",
      pathTitle: "Proactive care that prevents downtime before it happens.",
      pathSubtitle: "Modern IT operations require automated maintenance, continuous auditing, and round-the-clock defense.",
      pathItems: [
        "Continuous automated vulnerability assessments",
        "Automated OS and software patch orchestration",
        "Real-time network anomaly detection",
        "Disaster recovery planning with strict RTO/RPO SLAs",
        "Identity & Access Management (IAM) governance",
        "Transparent monthly SLA and performance reporting"
      ],
      stepsTag: "ONBOARDING PROCESS",
      stepsTitle: "Seamless onboarding for your IT environment.",
      steps: [
        { title: "Audit", description: "Discover all hardware assets, cloud instances, and security risks." },
        { title: "Standardize", description: "Deploy monitoring agents, patch baselines, and security policies." },
        { title: "Support", description: "Activate 24/7 monitoring alerts and employee helpdesk channels." },
        { title: "Review", description: "Quarterly IT reviews to align infrastructure with business goals." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about our managed IT services?",
      faqs: [
        { question: "Do you support hybrid setups (on-premise and cloud)?", answer: "Yes, we support on-premise servers, multi-cloud architectures, and hybrid enterprise environments." },
        { question: "What is your response time for high-severity outages?", answer: "Our SLA guarantees a response within 15 minutes for critical severity-1 incidents 24/7/365." }
      ],
      finalCtaTitle: "Ready to elevate your IT reliability?",
      finalCtaDescription: "Get in touch for a comprehensive IT infrastructure and security health check.",
      finalCtaButtonText: "Request IT Assessment",
      finalCtaLink: "/contact",
      seoTitle: "Managed IT Services & Infrastructure Support | Hippocloud",
      seoDescription: "Comprehensive managed IT services including infrastructure management, cyber security, DevOps pipelines, and enterprise support.",
      seoKeywords: "Managed IT services, enterprise IT support, network monitoring, cybersecurity, IT infrastructure, Hippocloud"
    }
  },
  {
    title: "Strategic Consultancy",
    description: "Enterprise technology consulting to drive digital transformation, modernization roadmaps, and maximum ROI on IT investments.",
    highlight: "Digital Transformation",
    icon_name: "LineChart",
    slug: "strategic-consultancy",
    is_active: true,
    display_order: 4,
    page_content: {
      heroTag: "ENTERPRISE ADVISORY / DIGITAL STRATEGY",
      heroTitle: "Strategic Technology & Digital Advisory",
      heroSubtitle: "Bridge the gap between executive strategy and technological execution with battle-tested advisory and transformation blueprints.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Book Consultation",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "Explore Focus Areas",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "35%+", label: "Operational Efficiency Gain", subtitle: "Workflow Redesign" },
        { value: "100%", label: "Alignment with Goals", subtitle: "Strategic Blueprints" },
        { value: "Zero", label: "Vendor Bias", subtitle: "Objective Evaluation" },
        { value: "Multi-Yr", label: "Scalable Roadmaps", subtitle: "Long-term Value" }
      ],
      coreCapabilitiesTag: "CONSULTING PILLARS",
      coreCapabilitiesTitle: "Guiding enterprises through digital evolution.",
      coreCapabilitiesSubtitle: "Actionable roadmaps designed to modernize legacy processes, optimize IT budgets, and drive sustainable growth.",
      detailedFeatures: [
        { title: "Digital Transformation Blueprints", description: "Assess legacy technical debt, design modern operating models, and create realistic modernization roadmaps." },
        { title: "Vendor & Stack Selection", description: "Objective evaluations of ERP, CRM, and cloud vendors to match your specific business criteria." },
        { title: "Cost & Architecture Optimization", description: "Deep-dive IT expenditure audits to eliminate redundant licensing and right-size infrastructure." },
        { title: "Change Management & Training", description: "Empower leadership and operational teams with structured frameworks for smooth organizational adoption." }
      ],
      pathTag: "STRATEGIC METHODOLOGY",
      pathTitle: "Data-driven advisory tailored to your unique market position.",
      pathSubtitle: "We combine deep technical fluency with commercial acumen to drive measurable outcomes.",
      pathItems: [
        "Executive alignment interviews and KPI definitions",
        "Comprehensive legacy technology architecture audits",
        "Objective multi-vendor comparison matrices",
        "Cost-benefit and ROI projection modeling",
        "Step-by-step phased execution roadmaps",
        "Executive steering committee governance support"
      ],
      stepsTag: "ENGAGEMENT PHASES",
      stepsTitle: "Structured advisory lifecycle.",
      steps: [
        { title: "Diagnose", description: "Benchmark current operational bottlenecks and technical constraints." },
        { title: "Strategize", description: "Formulate strategic target architectures and procurement options." },
        { title: "Roadmap", description: "Deliver prioritized execution phases with clear milestones and budgets." },
        { title: "Guide", description: "Provide governance oversight during vendor selection and rollout." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about our consulting engagements?",
      faqs: [
        { question: "How long does a strategic advisory engagement take?", answer: "Typical diagnostic and roadmap engagements take 3 to 6 weeks depending on organizational scope." },
        { question: "Do you assist with implementation after creating the strategy?", answer: "Yes, our engineering and cloud divisions can either lead implementation or provide oversight for your internal team." }
      ],
      finalCtaTitle: "Ready to modernize your technology strategy?",
      finalCtaDescription: "Connect with our principal advisors to discuss your enterprise objectives.",
      finalCtaButtonText: "Consult an Advisor",
      finalCtaLink: "/contact",
      seoTitle: "Strategic Technology Consultancy | Hippocloud",
      seoDescription: "Enterprise technology consulting to drive digital transformation, modernization roadmaps, and maximum ROI on IT investments.",
      seoKeywords: "Strategic consultancy, digital transformation, IT roadmap, enterprise architecture, tech advisory, Hippocloud"
    }
  },
  {
    title: "Digital Marketing",
    description: "Data-driven strategies including SEO, SEM, and social media management to amplify your brand's global reach.",
    highlight: "Global Brand Reach",
    icon_name: "Megaphone",
    slug: "digital-marketing",
    is_active: true,
    display_order: 5,
    page_content: {
      heroTag: "GROWTH MARKETING / PERFORMANCE MEDIA",
      heroTitle: "Data-Driven Digital Marketing & Growth",
      heroSubtitle: "Scale your brand reach, capture high-intent inbound demand, and maximize conversion rates with full-funnel digital campaigns.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Request Growth Audit",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "View Services",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "3.5x", label: "Average ROI", subtitle: "Performance Ad Spend" },
        { value: "150%", label: "Organic Search Growth", subtitle: "Technical & Content SEO" },
        { value: "10M+", label: "Audience Impressions", subtitle: "Global Brand Reach" },
        { value: "24/7", label: "Attribution Tracking", subtitle: "Real-time Analytics" }
      ],
      coreCapabilitiesTag: "FULL-FUNNEL GROWTH",
      coreCapabilitiesTitle: "Acquire, convert, and retain high-value customers.",
      coreCapabilitiesSubtitle: "Combining creative storytelling with quantitative analytics to generate measurable pipeline growth.",
      detailedFeatures: [
        { title: "Search Engine Optimization (SEO)", description: "Technical site audits, programmatic keyword strategies, and high-authority backlink building." },
        { title: "Performance Paid Advertising", description: "Precision targeting across Google Ads, LinkedIn, Meta, and programmatic display networks." },
        { title: "Conversion Rate Optimization (CRO)", description: "A/B testing, user session recording analysis, and landing page UX refinements." },
        { title: "Content & Brand Storytelling", description: "Authoritative whitepapers, blog content, case studies, and brand messaging that builds trust." }
      ],
      pathTag: "GROWTH PLAYBOOK",
      pathTitle: "Predictable customer acquisition funnels.",
      pathSubtitle: "We turn marketing from a cost center into a scalable revenue driver.",
      pathItems: [
        "In-depth competitor keyword and media analysis",
        "Clean attribution tracking and Google Analytics 4 setup",
        "High-converting landing page creation and testing",
        "Omnichannel retargeting and lead nurturing workflows",
        "Transparent real-time reporting dashboards",
        "Continuous audience and budget optimization"
      ],
      stepsTag: "CAMPAIGN WORKFLOW",
      stepsTitle: "Our 4-step growth framework.",
      steps: [
        { title: "Audit", description: "Analyze historical marketing metrics, website traffic, and competitor share." },
        { title: "Setup", description: "Build attribution funnels, ad campaigns, and SEO content clusters." },
        { title: "Execute", description: "Launch coordinated paid and organic campaigns across target channels." },
        { title: "Scale", description: "Double down on winning channels and optimize customer acquisition costs." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about digital marketing?",
      faqs: [
        { question: "How do you measure campaign success?", answer: "We track qualified leads (MQLs/SQLs), customer acquisition cost (CAC), return on ad spend (ROAS), and organic traffic growth." },
        { question: "Which industries do you have experience in?", answer: "We specialize in B2B SaaS, enterprise tech, healthcare, manufacturing, and eCommerce." }
      ],
      finalCtaTitle: "Ready to amplify your digital presence?",
      finalCtaDescription: "Contact our growth strategists to receive a complimentary digital marketing audit.",
      finalCtaButtonText: "Get Free Growth Audit",
      finalCtaLink: "/contact",
      seoTitle: "Digital Marketing & Performance Growth | Hippocloud",
      seoDescription: "Data-driven strategies including SEO, SEM, and social media management to amplify your brand's global reach.",
      seoKeywords: "Digital marketing, enterprise SEO, B2B lead generation, performance marketing, Google Ads, Hippocloud"
    }
  },
  {
    title: "BPO Services",
    description: "Enterprise-grade business process outsourcing with dedicated teams for support, operations, and back-office.",
    highlight: "24/7 Global Support",
    icon_name: "Headphones",
    slug: "bpo-services",
    is_active: true,
    display_order: 6,
    page_content: {
      heroTag: "GLOBAL BPO / OPERATIONAL EXCELLENCE",
      heroTitle: "Enterprise Business Process Outsourcing & Support",
      heroSubtitle: "Scale your customer operations, back-office processing, and technical support with dedicated, well-trained teams operating 24/7.",
      heroBackgroundImage: "/assets/hero-bg.jpg",
      heroPrimaryCtaText: "Explore BPO Services",
      heroPrimaryCtaLink: "/contact",
      heroSecondaryCtaText: "View Solutions",
      heroSecondaryCtaLink: "#capabilities",
      stats: [
        { value: "24/7/365", label: "Continuous Coverage", subtitle: "Multi-Shift Teams" },
        { value: "95%+", label: "First Contact Resolution", subtitle: "Trained Specialists" },
        { value: "50%", label: "Operating Cost Savings", subtitle: "Optimized Scaling" },
        { value: "Multi-Lang", label: "Omnichannel Support", subtitle: "Voice, Chat, Email" }
      ],
      coreCapabilitiesTag: "OUTSOURCING CAPABILITIES",
      coreCapabilitiesTitle: "Reliable, high-quality operations at scale.",
      coreCapabilitiesSubtitle: "Dedicated teams equipped with rigorous training, strict SLA governance, and state-of-the-art contact infrastructure.",
      detailedFeatures: [
        { title: "Customer Care & Helpdesk", description: "Inbound voice, email, live chat, and social media ticket resolution with high empathy and precision." },
        { title: "Technical Support Tier 1 & 2", description: "Product troubleshooting, bug verification, and tier-escalation management for software and hardware." },
        { title: "Back-Office & Data Processing", description: "Document verification, transaction processing, invoice reconciliation, and data cleansing." },
        { title: "Quality Assurance & SLA Governance", description: "Regular call calibration, CSAT/NPS monitoring, and automated sentiment scoring." }
      ],
      pathTag: "OPERATIONAL STANDARDS",
      pathTitle: "World-class service standards tailored to your brand voice.",
      pathSubtitle: "Our agents act as a seamless extension of your in-house team.",
      pathItems: [
        "Comprehensive brand tone and process onboarding",
        "Rigorous quality monitoring and weekly scorecards",
        "Secure remote desktop environments and ISO/SOC compliance",
        "Omnichannel CRM integration with HIPPOCX, Zendesk, and Salesforce",
        "Elastic staffing models to handle peak seasonal volumes",
        "Transparent real-time operational KPI dashboards"
      ],
      stepsTag: "DEPLOYMENT PROCESS",
      stepsTitle: "4 steps to operational handover.",
      steps: [
        { title: "Define", description: "Document SOPs, call scripts, escalation paths, and target SLAs." },
        { title: "Recruit", description: "Staff dedicated team members matching your domain expertise requirements." },
        { title: "Train", description: "Intensive product training and shadow sessions before go-live." },
        { title: "Operate", description: "Launch operations with continuous quality auditing and leadership check-ins." }
      ],
      faqsTag: "FREQUENTLY ASKED QUESTIONS",
      faqsTitle: "Got questions about our BPO services?",
      faqs: [
        { question: "How quickly can you spin up a dedicated support team?", answer: "Typically within 2 to 3 weeks, including hiring, system setup, and comprehensive SOP training." },
        { question: "How do you ensure data security and compliance?", answer: "Our facilities operate clean-desk policies, encrypted networks, strict biometric access, and SOC 2 / HIPAA compliance frameworks." }
      ],
      finalCtaTitle: "Ready to scale your business operations?",
      finalCtaDescription: "Talk to our operations specialists to design a custom BPO team for your business.",
      finalCtaButtonText: "Discuss Operations",
      finalCtaLink: "/contact",
      seoTitle: "Enterprise BPO & Customer Operations | Hippocloud",
      seoDescription: "Enterprise-grade business process outsourcing with dedicated teams for support, operations, and back-office.",
      seoKeywords: "BPO services, business process outsourcing, customer support outsourcing, technical helpdesk, back-office processing, Hippocloud"
    }
  }
];

const BANNERS = [
  {
    title: "Empowering Global Business.",
    subtitle: "From AI-driven CRM to enterprise consultancy, we deliver technology solutions that scale across industries and borders.",
    image_url: "/assets/hero-bg.jpg",
    is_active: true
  }
];

const PARTNERS = [
  { name: "Deenaj", logo_url: "/assets/clients/deenaj.png", website_url: "https://deenaj.com", display_order: 1, is_active: true },
  { name: "Eastridge", logo_url: "/assets/clients/eastridge.png", website_url: "https://eastridge.com", display_order: 2, is_active: true },
  { name: "MK Builders", logo_url: "/assets/clients/mk-builders.png", website_url: "https://mkbuilders.in", display_order: 3, is_active: true },
  { name: "SNF Pharma", logo_url: "/assets/clients/snf-pharma.png", website_url: "https://snfpharma.com", display_order: 4, is_active: true },
  { name: "Vaibhav Jewellery", logo_url: "/assets/clients/vaibhav-jewellery.png", website_url: "https://vaibhavjewellers.com", display_order: 5, is_active: true },
  { name: "BTCTC", logo_url: "/assets/clients/btctc.png", website_url: "https://btctc.in", display_order: 6, is_active: true }
];

const SKILLS = [
  {
    title: "Full Stack Cloud Development",
    description: "Master enterprise Next.js, Node.js, distributed databases, and high-throughput microservices architecture with production projects.",
    image_url: "/assets/academy.jpg",
    display_order: 1,
    is_active: true
  },
  {
    title: "Cloud Architecture & DevOps",
    description: "Hands-on mastery of AWS, Docker, Kubernetes, CI/CD automation pipelines, and infrastructure-as-code with Terraform.",
    image_url: "/assets/academy.jpg",
    display_order: 2,
    is_active: true
  },
  {
    title: "Enterprise AI & Predictive Systems",
    description: "Design and implement machine learning workflows, predictive lead scoring engines, and conversational AI agents.",
    image_url: "/assets/academy.jpg",
    display_order: 3,
    is_active: true
  },
  {
    title: "IoT & Smart Telemetry",
    description: "Connect industrial edge sensors, protocol gateways, and real-time streaming pipelines for smart utility networks.",
    image_url: "/assets/academy.jpg",
    display_order: 4,
    is_active: true
  }
];

const BLOGS = [
  {
    title: "How AI is Revolutionizing Enterprise CRM in 2026",
    excerpt: "Discover how predictive intelligence and automated routing are cutting deal velocity cycles in half.",
    content: "In the evolving enterprise landscape, AI-driven CRM platforms like HIPPOCX are redefining how organizations understand and act on customer data. Rather than functioning simply as static rolodexes, modern CRMs ingest omnichannel interactions, evaluate real-time intent, and guide account executives with actionable next steps.",
    category: "AI & CRM",
    image_url: "/assets/product-crm.jpg",
    read_time: "5 min read",
    published_date: new Date("2026-09-15"),
    is_active: true
  },
  {
    title: "Smart Water Management: Slashing Non-Revenue Water Losses",
    excerpt: "Explore how acoustic IoT sensors and real-time pressure analytics detect underground leaks before bursts.",
    content: "Water utilities globally lose up to 30% of treated water before it reaches consumers. HIPPOAQUA solves this through IoT sensor networks that correlate high-frequency acoustic signals with pressure variations, pinpointing subterranean micro-leaks before they lead to structural road collapses or massive utility deficits.",
    category: "IoT & Utilities",
    image_url: "/assets/product-aqua.jpg",
    read_time: "4 min read",
    published_date: new Date("2026-09-18"),
    is_active: true
  },
  {
    title: "Next-Gen Construction: Moving Beyond Spreadsheets to Digital BIM",
    excerpt: "How digital workflows and field apps synchronize multi-tier contractors on fast-track construction projects.",
    content: "Modern construction demands seamless alignment between job site crews and office engineers. HIPPO BUILDX unites 3D BIM models, mobile daily inspection logs, and submittal workflows in a single pane of glass, eliminating costly rework and ensuring zero-paper project turnover.",
    category: "Construction Tech",
    image_url: "/assets/product-buildx.jpg",
    read_time: "6 min read",
    published_date: new Date("2026-09-22"),
    is_active: true
  }
];

const REVIEWS = [
  {
    author: "Rohan Mehta",
    role: "Director, Global Pharma Solutions",
    company: "Global Pharma Solutions",
    content: "Hippo Cloud Technologies transformed our legacy systems into a modern, cloud-native architecture. Their expertise in DevOps is unmatched in the Indian tech landscape.",
    stars: 5,
    display_order: 1,
    is_active: true
  },
  {
    author: "Ananya Iyer",
    role: "Founder, RetailFlow India",
    company: "RetailFlow India",
    content: "The custom software development team at Hippocloud is world-class. They built our e-commerce platform with a focus on Indian consumer behavior and scalability.",
    stars: 5,
    display_order: 2,
    is_active: true
  },
  {
    author: "Sanjay Vidya",
    role: "Head of IT, Bharat Logistics",
    company: "Bharat Logistics",
    content: "Managed IT services from Hippocloud have given us complete peace of mind. Their proactive monitoring and localized support are exactly what our enterprise needed.",
    stars: 5,
    display_order: 3,
    is_active: true
  }
];

async function seed() {
  const ssl =
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : process.env.DATABASE_SSL === 'false' || process.env.NODE_ENV !== 'production'
        ? false
        : { rejectUnauthorized: false };

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });

  try {
    await client.connect();
    console.log('Connected to database for comprehensive seeding.');

    // 1. Roles
    console.log('Checking roles...');
    const defaultRoles = [
      { name: 'Super Admin', permissions: ['manage_blogs', 'manage_skills', 'manage_partners', 'manage_products', 'manage_services', 'manage_seo', 'manage_banners', 'manage_reviews', 'manage_team', 'manage_chat'] },
      { name: 'Admin', permissions: ['manage_blogs', 'manage_skills', 'manage_partners', 'manage_products', 'manage_services', 'manage_banners', 'manage_reviews', 'manage_chat'] },
      { name: 'Editor', permissions: ['manage_blogs', 'manage_skills', 'manage_banners', 'manage_reviews'] },
      { name: 'Viewer', permissions: [] }
    ];

    for (const r of defaultRoles) {
      await client.query(`
        INSERT INTO roles (name, permissions)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions
      `, [r.name, JSON.stringify(r.permissions)]);
    }

    // 2. Admin User
    const username = process.argv[2] || 'sateesh';
    const password = process.argv[3] || 'Hippo@2026';
    const email = process.argv[4] || 'sateesh@hippoclouds.com';

    const checkRes = await client.query('SELECT id FROM admins WHERE username = $1', [username]);
    if (checkRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const roleRes = await client.query("SELECT id FROM roles WHERE name = 'Super Admin'");
      const roleId = roleRes.rows[0]?.id || null;

      await client.query(
        'INSERT INTO admins (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4)',
        [username, email, passwordHash, roleId]
      );
      console.log(`Created admin user '${username}'.`);
    } else {
      console.log(`Admin user '${username}' already exists.`);
    }

    // 3. Products
    console.log('Seeding products...');
    for (const p of PRODUCTS) {
      await client.query(`
        INSERT INTO products (
          product_id, name, tagline, description, image_url, image_mode, logo_url, features, is_active, display_order, page_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (product_id) DO UPDATE SET
          name = EXCLUDED.name,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          image_mode = EXCLUDED.image_mode,
          logo_url = EXCLUDED.logo_url,
          features = EXCLUDED.features,
          is_active = EXCLUDED.is_active,
          display_order = EXCLUDED.display_order,
          page_content = EXCLUDED.page_content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        p.product_id,
        p.name,
        p.tagline,
        p.description,
        p.image_url,
        p.image_mode,
        p.logo_url,
        JSON.stringify(p.features),
        p.is_active,
        p.display_order,
        JSON.stringify(p.page_content)
      ]);
      console.log(`- Seeded product: ${p.product_id}`);
    }

    // 4. Services
    console.log('Seeding services...');
    for (const s of SERVICES) {
      await client.query(`
        INSERT INTO services (
          title, description, highlight, icon_name, slug, is_active, display_order, page_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          highlight = EXCLUDED.highlight,
          icon_name = EXCLUDED.icon_name,
          is_active = EXCLUDED.is_active,
          display_order = EXCLUDED.display_order,
          page_content = EXCLUDED.page_content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        s.title,
        s.description,
        s.highlight,
        s.icon_name,
        s.slug,
        s.is_active,
        s.display_order,
        JSON.stringify(s.page_content)
      ]);
      console.log(`- Seeded service: ${s.slug}`);
    }

    // 5. Banners
    console.log('Seeding banners...');
    const bannerCount = await client.query('SELECT count(*) FROM banners');
    if (parseInt(bannerCount.rows[0].count) === 0) {
      for (const b of BANNERS) {
        await client.query(
          'INSERT INTO banners (title, subtitle, image_url, is_active) VALUES ($1, $2, $3, $4)',
          [b.title, b.subtitle, b.image_url, b.is_active]
        );
      }
      console.log('Banners seeded.');
    }

    // 6. Partners
    console.log('Seeding partners...');
    const partnerCount = await client.query('SELECT count(*) FROM partners');
    if (parseInt(partnerCount.rows[0].count) === 0) {
      for (const pt of PARTNERS) {
        await client.query(
          'INSERT INTO partners (name, logo_url, website_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5)',
          [pt.name, pt.logo_url, pt.website_url, pt.display_order, pt.is_active]
        );
      }
      console.log('Partners seeded.');
    }

    // 7. Skills
    console.log('Seeding skills...');
    const skillCount = await client.query('SELECT count(*) FROM skills');
    if (parseInt(skillCount.rows[0].count) === 0) {
      for (const sk of SKILLS) {
        await client.query(
          'INSERT INTO skills (title, description, image_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5)',
          [sk.title, sk.description, sk.image_url, sk.display_order, sk.is_active]
        );
      }
      console.log('Skills seeded.');
    }

    // 8. Blogs
    console.log('Seeding blogs...');
    const blogCount = await client.query('SELECT count(*) FROM blogs');
    if (parseInt(blogCount.rows[0].count) === 0) {
      for (const bl of BLOGS) {
        await client.query(
          'INSERT INTO blogs (title, excerpt, content, category, image_url, read_time, published_date, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [bl.title, bl.excerpt, bl.content, bl.category, bl.image_url, bl.read_time, bl.published_date, bl.is_active]
        );
      }
      console.log('Blogs seeded.');
    }

    // 9. Reviews / Client Success Stories
    console.log('Seeding reviews...');
    const reviewCount = await client.query('SELECT count(*) FROM reviews');
    if (parseInt(reviewCount.rows[0].count) === 0) {
      for (const rv of REVIEWS) {
        await client.query(
          'INSERT INTO reviews (author, role, company, content, stars, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [rv.author, rv.role, rv.company, rv.content, rv.stars, rv.display_order, rv.is_active]
        );
      }
      console.log('Reviews seeded.');
    }

    console.log('Database seeding finished successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
