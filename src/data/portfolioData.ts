import { PortfolioData } from '../types';

/**
 * =======================================================================
 * PERSONAL WEBSITE CONTENT CONFIGURATION
 * =======================================================================
 * You can easily customize any text, project, skill, service, or link here.
 * All changes made in this file will automatically reflect across the website!
 */

export const portfolioData: PortfolioData = {
  person: {
    fullName: 'Shubham Sonale',
    headline: 'Research Writer',
    tagline:
      'Translating complex human behavior, scientific findings, and quantitative data into clear, high-impact research writing, strategic white papers, and evidence-backed case studies.',
    avatarInitials: 'SS',
    statusBadge: 'Open for Freelance & Contract Projects',
    locationBadge: 'Available Worldwide (Remote)',
  },

  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'News', href: '#news' },
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#portfolio' },
    { label: 'Contact', href: '#contact' },
  ],

  about: {
    bioParagraphs: [
      'I am an independent research writer dedicated to helping founders, product teams, and publications articulate deep findings, empirical data, and user insights into compelling narratives.',
      'With a grounded background in research synthesis, quantitative inquiry, and analytical reporting, I turn complex subjects into structured publications and evidence-backed writing that engages stakeholders.',
      'Whether authoring in-depth market analyses, investigative tech reports, or executive research summaries, I bridge rigorous analysis with clear, authoritative prose.',
    ],
    highlights: [
      { label: 'Methodology', value: 'Mixed-Methods' },
      { label: 'Experience', value: '4+ Years' },
      { label: 'Core Focus', value: 'Actionable Insights' },
      { label: 'Engagement', value: 'Direct & Remote' },
    ],
    skills: [
      {
        title: 'Research Methodologies',
        skills: [
          'In-Depth User Interviews',
          'Qualitative Thematic Coding',
          'Usability Testing (Moderated & Unmoderated)',
          'Card Sorting & Tree Testing',
          'Ethnographic Observation',
          'Heuristic Evaluations',
        ],
      },
      {
        title: 'Quantitative & Surveys',
        skills: [
          'Large-Scale Survey Architecture',
          'Sample Sizing & Bias Mitigation',
          'Likert & NPS Benchmarking',
          'Conjoint Analysis Principles',
          'Cross-Tabulation & Segmentation',
          'A/B Experiment Hypothesis Design',
        ],
      },
      {
        title: 'Analytics & Tools',
        skills: [
          'Statistical Analysis (R, Python, SPSS)',
          'SQL & Relational Querying',
          'Google Analytics 4 & Mixpanel',
          'Qualtrics, Typeform, SurveyMonkey',
          'Figma (Wireframing & Prototypes)',
          'Executive Stakeholder Dashboards',
        ],
      },
    ],
    services: [
      {
        id: 'user-research',
        title: 'Qualitative User Research',
        description:
          'Deep-dive interviews, exploratory user studies, and diary studies designed to uncover root motivations, workflows, and core friction points.',
        iconName: 'Users',
        deliverables: [
          'User persona archetypes',
          'Customer journey friction maps',
          'Video clip synthesis & findings deck',
        ],
      },
      {
        id: 'surveys-polling',
        title: 'Survey Design & Polling',
        description:
          'Methodologically sound questionnaires that eliminate leading questions, capture representative samples, and produce statistically reliable datasets.',
        iconName: 'ClipboardCheck',
        deliverables: [
          'Custom survey instrumentation',
          'Stratified audience segmentation',
          'Executive summary with confidence intervals',
        ],
      },
      {
        id: 'usability-testing',
        title: 'Usability Testing & Audits',
        description:
          'Rigorous task-based testing on live products or prototypes to pinpoint cognitive load, drop-off barriers, and navigation confusion.',
        iconName: 'CheckCircle2',
        deliverables: [
          'Task completion rate & SUS scores',
          'Prioritized heuristic severity matrix',
          'Immediate redesign recommendations',
        ],
      },
      {
        id: 'data-analytics',
        title: 'Data Analysis & Synthesis',
        description:
          'Connecting qualitative narratives with quantitative behavioral metrics to build unambiguous executive dashboards and strategic reports.',
        iconName: 'BarChart3',
        deliverables: [
          'Cross-tabulated analytical models',
          'Correlation & trend summaries',
          'Decision-ready slide deck presentation',
        ],
      },
    ],
  },

  // 3-4 Project highlights ready for you to customize or update
  projects: [
    {
      id: 'project-1',
      title: 'B2B SaaS Onboarding Friction & Churn Audit',
      categoryTag: 'Usability Testing & Research',
      tagColor: 'blue',
      briefDescription:
        'Conducted 18 moderated usability walkthroughs and cohort telemetry analysis to identify root causes of a 34% drop-off during user activation.',
      fullOverview:
        'A comprehensive mixed-methods inquiry evaluating new user signup, team invite loops, and core feature discovery across self-serve enterprise accounts.',
      methodsUsed: [
        '18 Moderated Remote Sessions',
        'Cohort Funnel Analysis',
        'System Usability Scale (SUS)',
        'Heuristic Walkthroughs',
      ],
      keyOutcome:
        'Identified 4 critical navigation bottlenecks; recommended flow updates projected to lift Day-7 activation by 22%.',
      timeframe: '4 Weeks',
    },
    {
      id: 'project-2',
      title: 'Global Consumer FinTech Survey & Segmentation',
      categoryTag: 'Survey & Quantitative Analysis',
      tagColor: 'slate',
      briefDescription:
        'Architected a 1,250-respondent cross-regional survey investigating trust factors, privacy comfort, and recurring transaction preferences.',
      fullOverview:
        'Designed question matrices, managed sample quotas, performed cross-tabulation, and authored a 28-page strategic decision paper for executive leaders.',
      methodsUsed: [
        'Quotas & Stratified Sampling',
        'Cross-Tabulation Analysis',
        'Statistical Significance Testing',
        'Executive Readout Deck',
      ],
      keyOutcome:
        'Segmented users into 3 distinct risk-tolerance clusters, shaping product pricing and regulatory disclosures.',
      timeframe: '6 Weeks',
    },
    {
      id: 'project-3',
      title: 'E-Commerce Checkout Heuristic & Field Benchmarking',
      categoryTag: 'Data Analysis & Optimization',
      tagColor: 'indigo',
      briefDescription:
        'Synthesized 6 months of behavioral analytics, user heatmaps, and competitive benchmarks to overhaul a mobile payment flow.',
      fullOverview:
        'Analyzed high cart-abandonment instances using event tracking and concurrent user test recordings across iOS and Android mobile web users.',
      methodsUsed: [
        'Event Log & Drop-off Modeling',
        'Competitive Gap Benchmarking',
        'Tree Testing & Field Notes',
        'UX Prioritization Matrix',
      ],
      keyOutcome:
        'Delivered 9 high-impact interface adjustments that reduced checkout steps from 5 to 3 screens.',
      timeframe: '3 Weeks',
    },
    {
      id: 'project-4',
      title: 'Healthcare Patient Portal Discovery Study',
      categoryTag: 'Exploratory Qualitative Research',
      tagColor: 'emerald',
      briefDescription:
        'Conducted qualitative stakeholder and patient interviews to map digital appointment scheduling readiness among elderly demographics.',
      fullOverview:
        'Designed accessibility-focused interview protocols, documented accessibility friction points, and formulated guidelines for WCAG-compliant appointment bookings.',
      methodsUsed: [
        'Semi-Structured Patient Interviews',
        'Affinity Diagramming',
        'Assistive Tech Observation',
        'Accessibility Action Plan',
      ],
      keyOutcome:
        'Uncovered key cognitive hesitations around telehealth links, prompting an automated SMS verification workflow.',
      timeframe: '5 Weeks',
    },
  ],

  contact: {
    email: 'shubhamsonale2004@gmail.com',
    availability: 'Available for Q3/Q4 contracts & freelance research sprints',
    location: 'Remote (Worldwide)',
    responseTime: 'Typically responds within 24 business hours',
    socials: [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com',
        handle: 'linkedin.com/in/shubham-sonale',
      },
      {
        platform: 'GitHub',
        url: 'https://github.com',
        handle: 'github.com/shubhamsonale',
      },
      {
        platform: 'Twitter / X',
        url: 'https://twitter.com',
        handle: '@shubham_sonale',
      },
    ],
  },
};
