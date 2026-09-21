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
    headline: 'Research Analyst & Strategy Writer',
    tagline:
      'Synthesizing real-time market catalysts, corporate disruptions, and public filings into empirical, publication-grade business case studies.',
    avatarInitials: 'SS',
    statusBadge: 'Available for Business Research & Strategic Case Studies',
    locationBadge: 'Available Worldwide (Remote)',
  },

  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  about: {
    bioParagraphs: [
      'I synthesize breaking market catalysts, corporate disruptions, and SEC filings into concise, publication-grade business case studies and strategic intelligence.',
      'Combining investigative corporate inquiry with quantitative rigor, I help leaders evaluate strategic dilemmas, capital allocation trade-offs, and competitive dynamics.',
    ],
    highlights: [
      { label: 'Methodology', value: 'Case Study Framework' },
      { label: 'Focus', value: 'Market Catalysts & Strategy' },
      { label: 'Source Rigor', value: 'Public Filings & Wires' },
      { label: 'Engagement', value: 'Consulting & Publications' },
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

  // Projects / Case Studies
  projects: [
    {
      id: 'project-ai-assistant',
      title: 'AI Personal Assistant & Task Automation',
      subtitle:
        'Low-Cost Infrastructure Stack, Agentic Workflows, Function Calling & Strategic Roadmap',
      categoryTag: 'AI Systems & Agentic Workflows',
      tagColor: 'blue',
      briefDescription:
        'Low-cost agentic task automation infrastructure leveraging Groq API reasoning, Supabase persistent state, and Cloudflare Workers serverless execution.',
      fullOverview:
        'Building an AI Personal Assistant & Task Automation platform does not require expensive enterprise infrastructure. By orchestrating modern serverless hosting, managed database platforms, edge computing triggers, and LLM APIs, developers can build production-ready agentic automation systems virtually free of cost for development and personal usage.\n\nArchitecture Triad: Reasoning Brain (Groq API) + Persistent Data & State (Supabase) + Action Execution Engine (Cloudflare Workers / Cron & API Integrations) ➔ Web/Mobile User Dashboard.',
      architecturePrinciple:
        'Architecture Triad: Reasoning Brain (Groq API) + Persistent Data & State (Supabase) + Action Execution Engine (Cloudflare Workers / Cron & API Integrations) ➔ Web/Mobile User Dashboard.',
      methodsUsed: [
        'Groq Function Calling & Entity Extraction',
        'Supabase PostgreSQL & Auth State Machines',
        'Cloudflare Workers Cron & Edge Functions',
        'Multi-Step Agentic Workflow Orchestration',
        'Gmail, Calendar & Telegram Integration',
      ],
      keyOutcome:
        'Engineered an enterprise-grade agentic workflow architecture executing zero-cost personal automation across search, scheduling, and multi-step tool actions.',
      timeframe: 'Architecture & Roadmap Specification',
      techStack: [
        {
          category: '🧠 AI Engine',
          recommended_tool: 'Groq Cloud / Groq API',
          purpose:
            'Natural language intent parsing, reasoning, entity extraction, and function calling.',
        },
        {
          category: '🎨 Frontend UI',
          recommended_tool: 'React / Next.js',
          purpose:
            'Interactive user dashboard, real-time activity feeds, chat interface, and task management UI.',
        },
        {
          category: '🌐 Cloud Hosting',
          recommended_tool: 'Cloudflare Pages / Vercel',
          purpose:
            'Edge deployment providing globally distributed hosting with automated CI/CD pipelines.',
        },
        {
          category: '🗄️ Database',
          recommended_tool: 'Supabase (PostgreSQL)',
          purpose:
            'Structured storage for user profiles, task state machines, schedule configurations, and chat histories.',
        },
        {
          category: '⚡ Backend Engine',
          recommended_tool: 'Cloudflare Workers / Edge Functions',
          purpose:
            'Serverless execution logic for API webhooks, authentication validation, and external tool calls.',
        },
        {
          category: '🔐 Authentication',
          recommended_tool: 'Supabase Auth',
          purpose:
            'Secure JWT user registration, session handling, and OAuth integration (Google, GitHub).',
        },
        {
          category: '⏰ Scheduled Execution',
          recommended_tool: 'Cloudflare Workers Cron',
          purpose:
            'Background cron schedules to trigger automated tasks, daily digests, and reminders asynchronously.',
        },
        {
          category: '🔗 Integrations',
          recommended_tool: 'REST APIs / Webhooks',
          purpose:
            'Connections to third-party services like Gmail, Google Calendar, Telegram, and Slack.',
        },
        {
          category: '📢 Notifications',
          recommended_tool: 'Telegram API / Web Push / Email',
          purpose:
            'Instant alert delivery for task completions, daily briefings, and time-sensitive reminders.',
        },
      ],
      workflows: [
        {
          id: 1,
          title: 'Structured Reminders & Task Creation',
          user_prompt: 'Remind me tomorrow at 9 AM to call Rahul.',
          intent_resolution: {
            intent: 'CREATE_REMINDER',
            task: 'Call Rahul',
            scheduled_at: '2026-09-21T09:00:00Z',
          },
          execution:
            'The serverless backend inserts the record into Supabase PostgreSQL and schedules a Cloudflare Worker Cron trigger to dispatch a Telegram or Web Push notification at 9 AM.',
        },
        {
          id: 2,
          title: 'Advanced Multi-Step Tool Execution (Agentic Workflow)',
          user_prompt:
            'Find the email from Amazon about my latest order and add the delivery date to my tasks.',
          agentic_execution_sequence: [
            "1. Search Gmail API — Query recent inbox messages matching vendor 'Amazon'.",
            '2. Read Relevant Email — Retrieve plain text/HTML body of the matching message.',
            '3. Entity Extraction — Groq parses the message body to extract target date strings.',
            '4. Task Persistence — Write new task entry to Supabase Database with extracted metadata.',
            '5. Confirmation Dispatch — Send completion response back to User UI.',
          ],
        },
      ],
      engineeringRoadmap: [
        {
          phase: 1,
          title: 'Conversational Foundation (Chat)',
          description:
            'Set up Next.js UI, integrate Groq API via serverless backend, configure Supabase Auth, and enable basic multi-turn chat persistence.',
        },
        {
          phase: 2,
          title: 'Intent Engine & Reminders (Tasks)',
          description:
            'Implement Groq Function Calling to parse natural language queries into JSON schema tasks; persist state in Supabase.',
        },
        {
          phase: 3,
          title: 'Automated Scheduling (Cron & Alerts)',
          description:
            'Deploy Cloudflare Workers Cron jobs to periodically check due tasks and dispatch alerts via Telegram Bot or Webhooks.',
        },
        {
          phase: 4,
          title: 'External Tool Integration (Calendar & Gmail)',
          description:
            'Incorporate Google OAuth scopes to allow full reads/writes for Google Calendar events and Gmail search.',
        },
        {
          phase: 5,
          title: 'Autonomous Background Agents',
          description:
            'Connect agentic workflow orchestration (e.g., n8n or LangChain) for multi-step background task execution without manual triggers.',
        },
      ],
      freeTierLimits: [
        {
          service: 'Groq API',
          quota:
            'Generous free tier with ultra-fast LPU inference (up to 30 RPM / 14,400 RPD on Llama 3 models), ideal for personal automation.',
        },
        {
          service: 'Cloudflare Pages & Workers',
          quota:
            'Unlimited static hosting; Workers provide 100,000 free request executions per day.',
        },
        {
          service: 'Supabase PostgreSQL',
          quota:
            '500 MB database storage, 50,000 active monthly users, and 1 GB file storage on the free tier.',
        },
        {
          service: 'Telegram Bot API',
          quota:
            'Completely free unlimited notification and interactive bot messaging capability.',
        },
      ],
      rawSpecification: {
        project: {
          title: 'AI Personal Assistant & Task Automation',
          subtitle:
            'Low-Cost Infrastructure Stack, Agentic Workflows, Function Calling & Strategic Roadmap',
          overview: {
            summary:
              'Building an AI Personal Assistant & Task Automation platform does not require expensive enterprise infrastructure. By orchestrating modern serverless hosting, managed database platforms, edge computing triggers, and LLM APIs, developers can build production-ready agentic automation systems virtually free of cost for development and personal usage.',
            core_architecture_principle:
              'Architecture Triad: Reasoning Brain (Groq API) + Persistent Data & State (Supabase) + Action Execution Engine (Cloudflare Workers / Cron & API Integrations) ➔ Web/Mobile User Dashboard.',
          },
          tech_stack: [
            {
              category: '🧠 AI Engine',
              recommended_tool: 'Groq Cloud / Groq API',
              purpose:
                'Natural language intent parsing, reasoning, entity extraction, and function calling.',
            },
            {
              category: '🎨 Frontend UI',
              recommended_tool: 'React / Next.js',
              purpose:
                'Interactive user dashboard, real-time activity feeds, chat interface, and task management UI.',
            },
            {
              category: '🌐 Cloud Hosting',
              recommended_tool: 'Cloudflare Pages / Vercel',
              purpose:
                'Edge deployment providing globally distributed hosting with automated CI/CD pipelines.',
            },
            {
              category: '🗄️ Database',
              recommended_tool: 'Supabase (PostgreSQL)',
              purpose:
                'Structured storage for user profiles, task state machines, schedule configurations, and chat histories.',
            },
            {
              category: '⚡ Backend Engine',
              recommended_tool: 'Cloudflare Workers / Edge Functions',
              purpose:
                'Serverless execution logic for API webhooks, authentication validation, and external tool calls.',
            },
            {
              category: '🔐 Authentication',
              recommended_tool: 'Supabase Auth',
              purpose:
                'Secure JWT user registration, session handling, and OAuth integration (Google, GitHub).',
            },
            {
              category: '⏰ Scheduled Execution',
              recommended_tool: 'Cloudflare Workers Cron',
              purpose:
                'Background cron schedules to trigger automated tasks, daily digests, and reminders asynchronously.',
            },
            {
              category: '🔗 Integrations',
              recommended_tool: 'REST APIs / Webhooks',
              purpose:
                'Connections to third-party services like Gmail, Google Calendar, Telegram, and Slack.',
            },
            {
              category: '📢 Notifications',
              recommended_tool: 'Telegram API / Web Push / Email',
              purpose:
                'Instant alert delivery for task completions, daily briefings, and time-sensitive reminders.',
            },
          ],
          workflows: [
            {
              id: 1,
              title: 'Structured Reminders & Task Creation',
              user_prompt: 'Remind me tomorrow at 9 AM to call Rahul.',
              intent_resolution: {
                intent: 'CREATE_REMINDER',
                task: 'Call Rahul',
                scheduled_at: '2026-09-21T09:00:00Z',
              },
              execution:
                'The serverless backend inserts the record into Supabase PostgreSQL and schedules a Cloudflare Worker Cron trigger to dispatch a Telegram or Web Push notification at 9 AM.',
            },
            {
              id: 2,
              title: 'Advanced Multi-Step Tool Execution (Agentic Workflow)',
              user_prompt:
                'Find the email from Amazon about my latest order and add the delivery date to my tasks.',
              agentic_execution_sequence: [
                "1. Search Gmail API — Query recent inbox messages matching vendor 'Amazon'.",
                '2. Read Relevant Email — Retrieve plain text/HTML body of the matching message.',
                '3. Entity Extraction — Groq parses the message body to extract target date strings.',
                '4. Task Persistence — Write new task entry to Supabase Database with extracted metadata.',
                '5. Confirmation Dispatch — Send completion response back to User UI.',
              ],
            },
          ],
          engineering_roadmap: [
            {
              phase: 1,
              title: 'Conversational Foundation (Chat)',
              description:
                'Set up Next.js UI, integrate Groq API via serverless backend, configure Supabase Auth, and enable basic multi-turn chat persistence.',
            },
            {
              phase: 2,
              title: 'Intent Engine & Reminders (Tasks)',
              description:
                'Implement Groq Function Calling to parse natural language queries into JSON schema tasks; persist state in Supabase.',
            },
            {
              phase: 3,
              title: 'Automated Scheduling (Cron & Alerts)',
              description:
                'Deploy Cloudflare Workers Cron jobs to periodically check due tasks and dispatch alerts via Telegram Bot or Webhooks.',
            },
            {
              phase: 4,
              title: 'External Tool Integration (Calendar & Gmail)',
              description:
                'Incorporate Google OAuth scopes to allow full reads/writes for Google Calendar events and Gmail search.',
            },
            {
              phase: 5,
              title: 'Autonomous Background Agents',
              description:
                'Connect agentic workflow orchestration (e.g., n8n or LangChain) for multi-step background task execution without manual triggers.',
            },
          ],
          free_tier_limits: [
            {
              service: 'Groq API',
              quota:
                'Generous free tier with ultra-fast LPU inference (up to 30 RPM / 14,400 RPD on Llama 3 models), ideal for personal automation.',
            },
            {
              service: 'Cloudflare Pages & Workers',
              quota:
                'Unlimited static hosting; Workers provide 100,000 free request executions per day.',
            },
            {
              service: 'Supabase PostgreSQL',
              quota:
                '500 MB database storage, 50,000 active monthly users, and 1 GB file storage on the free tier.',
            },
            {
              service: 'Telegram Bot API',
              quota:
                'Completely free unlimited notification and interactive bot messaging capability.',
            },
          ],
        },
      },
    },
  ],

  contact: {
    email: 'shubhamsonale2004@gmail.com',
    availability: 'Available for Q3/Q4 contracts & freelance research sprints',
    location: 'Remote (Worldwide)',
    responseTime: 'Typically responds within 24 business hours',
    socials: [
      {
        platform: 'GitHub',
        url: 'https://github.com',
        handle: 'github.com/shubhamsonale',
      },
    ],
  },
};

export const projects = portfolioData.projects;
