import { BusinessCaseStudy, BusinessRssStory } from '../types';

export const INITIAL_TRENDING_CASE_STUDIES: BusinessCaseStudy[] = [
  {
    id: 'nvidia-ai-fullstack-moat',
    company: 'NVIDIA Corporation',
    ticker: 'NVDA',
    industry: 'Semiconductors & AI Infrastructure',
    title: 'The Full-Stack AI Moat: How CUDA & Systems Engineering Defended an 85%+ Data Center Monopoly',
    whatHappened:
      'NVIDIA expanded beyond standalone GPUs to deliver full-rack computing superclusters (Blackwell NVL72), tightly coupling custom silicon, InfiniBand networking, and the CUDA software ecosystem to capture over 85% of global AI accelerator spending.',
    businessProblemOrOpportunity:
      'Capitalize on the generational shift toward accelerated computing while insulating margins against custom ASICs from hyperscale customers (Google TPU, AWS Trainium, Meta MTIA) and rival chipmakers (AMD MI300X).',
    marketContext:
      'Global enterprise capital expenditure on generative AI infrastructure exceeded $150 billion in 2024–2025. Cloud hyperscalers represent over 45% of NVIDIA revenue, creating immense customer concentration risk and pressure to build in-house silicon.',
    strategyActionTaken:
      'Shifted strategy from selling individual silicon boards to selling integrated data center architectures (DGX/NVLink/Spectrum-X). Maintained aggressive 1-year product cadence (Hopper to Blackwell to Rubin) and entrenched developers within CUDA, ensuring immense software switching friction.',
    importantDataOrResults: {
      metrics: [
        { label: 'Data Center Revenue', value: '$26.3B', change: '+154% YoY', isPositive: true },
        { label: 'Gross Margin', value: '75.1%', change: '+420 bps', isPositive: true },
        { label: 'AI Accelerator Share', value: '85%+', change: 'Dominant', isPositive: true },
        { label: 'Market Capitalization', value: '$3.2T', change: '+180%', isPositive: true },
      ],
      summary:
        'Data center revenue climbed past $26 billion in a single quarter with gross margins holding above 75%, establishing one of the most profitable hardware-software monopolies in corporate history.',
    },
    keyLessons: [
      'Software Ecosystems Protect Hardware Margins: CUDA created a two-decade switching barrier that raw hardware performance alone cannot overcome.',
      'System-Level Selling Expands TAM: Selling turnkey liquid-cooled racks rather than chips captured wallet share across networking, power, and optics.',
      'Speed as a Defensive Strategy: Compressing silicon architecture development cycles from 24 months to 12 months made customer in-house silicon obsolete upon arrival.',
    ],
    sources: [
      {
        title: 'NVIDIA Reports Record Quarterly Revenue Driven by Blackwell Demand',
        publisher: 'NVIDIA Investor Relations / SEC 10-Q',
        url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2025',
        date: 'Nov 2024',
      },
      {
        title: 'Inside NVIDIA’s AI Supercomputer Architecture and Interconnect Strategy',
        publisher: 'Reuters Technology Analysis',
        url: 'https://www.reuters.com/technology/nvidia-blackwell-chip-delay-analysts-2024-08-05/',
        date: 'Aug 2024',
      },
      {
        title: 'Why Cloud Giants Cannot Easily Replace CUDA with Custom Silicon',
        publisher: 'Financial Times',
        url: 'https://www.ft.com/content/1d71cb32-84b2-4d20-b8c7-4340798e1f0e',
        date: 'Oct 2024',
      },
    ],
    date: 'February 2025',
    readTime: '4 min read',
    status: 'Strategic Deep Dive',
    tags: ['Semiconductors', 'AI Hardware', 'Software Moat', 'Hyperscalers'],
    rssHeadlineReference: 'Nvidia suppliers scale liquid-cooling production as Blackwell shipments accelerate',
  },
  {
    id: 'starbucks-brian-niccol-reset',
    company: 'Starbucks Corporation',
    ticker: 'SBUX',
    industry: 'Consumer Goods & Retail Foodservice',
    title: 'Back to Starbucks: Brian Niccol’s Operations Overhaul to Restore In-Store Experience & Traffic',
    whatHappened:
      'Following consecutive quarters of declining same-store transactions in the US and China, Starbucks appointed former Chipotle CEO Brian Niccol with an unprecedented mandate to dismantle excessive mobile order bottlenecks and reinstate the cafe as a community hub.',
    businessProblemOrOpportunity:
      'Over-reliance on mobile order-and-pay created store congestion, degraded barista morale, alienated walk-in customers, and turned premium coffeehouses into chaotic pickup stations, driving an 8% drop in US transactions.',
    marketContext:
      'Aggressive competition from value-focused beverage brands and domestic Chinese rivals (Luckin Coffee) eroded market share, while inflationary pressures caused middle-income consumers to cut discretionary coffee spending.',
    strategyActionTaken:
      'Launched the "Back to Starbucks" four-pillar blueprint: 1) Streamlining complex 170,000+ custom beverage combinations; 2) Separating digital mobile order pickup from dine-in espresso stations; 3) Reinstating ceramic mugs and comfortable lounge seating; 4) Slowing promotional discounting to protect brand equity.',
    importantDataOrResults: {
      metrics: [
        { label: 'US Same-Store Sales', value: '-6%', change: 'FY24 Decline', isPositive: false },
        { label: 'Stock Reaction on Hire', value: '+24.5%', change: 'Single Day Gain', isPositive: true },
        { label: 'Menu Simplification', value: '30%', change: 'SKU Reduction', isPositive: true },
        { label: 'Service Time Target', value: '< 4 min', change: 'Operational KPI', isPositive: true },
      ],
      summary:
        'Market capitalization jumped $21.4 billion on the CEO announcement, despite fiscal 2024 revenue softening 3% to $35.9 billion, underscoring investor conviction in operational turnaround.',
    },
    keyLessons: [
      'Digital Efficiency Can Dilute Premium Brand Identity: Optimizing purely for throughput and mobile pickup destroyed the third-place experience that justified premium price points.',
      'Operational Friction Cascades Quickly: Complexity in recipe customizations clogged barista capacity, leading to long wait times, abandoned orders, and customer churn.',
      'Decisive Executive Mandates Reset Market Narrative: Clear operational prioritization (cafe comfort + barista workflow) calmed Wall Street and restored franchisee alignment.',
    ],
    sources: [
      {
        title: 'Starbucks Names Brian Niccol as Chairman and Chief Executive Officer',
        publisher: 'Starbucks Stories & IR',
        url: 'https://stories.starbucks.com/press/2024/starbucks-names-brian-niccol-as-chairman-and-ceo/',
        date: 'Aug 2024',
      },
      {
        title: 'How Mobile Ordering Broke Starbucks: Analysis of the Cafe Bottleneck',
        publisher: 'Wall Street Journal',
        url: 'https://www.wsj.com/business/retail/starbucks-mobile-order-brian-niccol-turnaround-0a950a29',
        date: 'Sep 2024',
      },
      {
        title: 'Starbucks Fourth Quarter and Full Year Fiscal 2024 Results',
        publisher: 'SEC Form 8-K',
        url: 'https://investor.starbucks.com',
        date: 'Oct 2024',
      },
    ],
    date: 'January 2025',
    readTime: '5 min read',
    status: 'Verified Research',
    tags: ['Retail Strategy', 'Operational Turnaround', 'Brand Dilution', 'Executive Leadership'],
    rssHeadlineReference: 'Starbucks CEO unveils multi-phase cafe redesign to separate digital pickup from dine-in',
  },
  {
    id: 'boeing-quality-crisis-governance',
    company: 'The Boeing Company',
    ticker: 'BA',
    industry: 'Aerospace & Defense',
    title: 'The Manufacturing Quality Crisis: Boeing’s $24B Capital Raise and Safety Culture Overhaul',
    whatHappened:
      'After the mid-air door-plug blowout on an Alaska Airlines 737 MAX 9 and a prolonged 33,000-worker machinist strike in the Pacific Northwest, Boeing executed a sweeping executive overhaul, brought in engineer-CEO Kelly Ortberg, and raised $24.3 billion in capital to avert a credit downgrade.',
    businessProblemOrOpportunity:
      'Erosion of manufacturing engineering standards, regulatory production caps (38 aircraft/month limit imposed by the FAA), burned supplier relations, and ballooning debt obligations threatening Boeing’s investment-grade credit rating.',
    marketContext:
      'Airbus widened its narrowbody delivery lead with the A321neo capturing 65% of order backlogs. Airlines worldwide faced severe fleet shortages while global travel demand surged post-pandemic.',
    strategyActionTaken:
      '1) Re-acquired fuselage supplier Spirit AeroSystems in an all-stock transaction to re-integrate outsourced manufacturing; 2) Raised $21B+ equity offering to shore up liquidity; 3) Relocated CEO office to Seattle to anchor leadership on factory floors; 4) Agreed to historic 38% wage hike to end the manufacturing stoppage.',
    importantDataOrResults: {
      metrics: [
        { label: 'Capital Raised', value: '$24.3B', change: 'Largest Secondary in US', isPositive: true },
        { label: 'Q3 2024 Net Loss', value: '-$6.17B', change: 'Free Cash Flow Drain', isPositive: false },
        { label: 'Order Backlog', value: '5,400+', change: '$511B Commercial', isPositive: true },
        { label: 'Machinist Wage Deal', value: '+38%', change: 'Ratified Nov 2024', isPositive: true },
      ],
      summary:
        'Boeing stabilized balance sheet solvency through a historic $24.3B stock and depository shares offering, yet faces a multi-year slog to ramp 737 MAX production back above 38 aircraft per month under stringent FAA oversight.',
    },
    keyLessons: [
      'Financial Engineering Cannot Substitute for Engineering Excellence: Aggressive cost-cutting and aggressive supplier outsourcing compromised safety margins and destroyed enterprise value.',
      'Vertical Integration is Critical for High-Consequence Assemblies: Re-acquiring Spirit AeroSystems proved that critical structural tolerances cannot be governed through arm’s-length vendor contracts.',
      'Workforce Alignment Determines Factory Yield: Long labor impasses disrupt complex precision supply chains, with restart costs far exceeding initial wage negotiation deltas.',
    ],
    sources: [
      {
        title: 'Boeing Closes $24.3 Billion Public Offering to Preserve Liquidity',
        publisher: 'Bloomberg Markets',
        url: 'https://www.bloomberg.com/news/articles/2024-10-30/boeing-raises-21-billion-in-one-of-largest-ever-share-sales',
        date: 'Oct 2024',
      },
      {
        title: 'FAA Audit Findings and Comprehensive Oversight on Boeing 737 MAX Production',
        publisher: 'Federal Aviation Administration',
        url: 'https://www.faa.gov/newsroom/updates-boeing-737-9-max-aircraft',
        date: 'Mar 2024',
      },
      {
        title: 'Boeing and Spirit AeroSystems Announce Definitive Merger Agreement',
        publisher: 'Boeing Newsroom',
        url: 'https://boeing.mediaroom.com/2024-07-01-Boeing-to-Acquire-Spirit-AeroSystems',
        date: 'Jul 2024',
      },
    ],
    date: 'December 2024',
    readTime: '6 min read',
    status: 'Strategic Deep Dive',
    tags: ['Aerospace', 'Quality Assurance', 'Supply Chain', 'Labor Relations', 'Crisis Management'],
    rssHeadlineReference: 'Boeing resumes 737 production lines in Renton following machinist contract ratification',
  },
  {
    id: 'crowdstrike-falcon-outage-resilience',
    company: 'CrowdStrike Holdings, Inc.',
    ticker: 'CRWD',
    industry: 'Enterprise Cybersecurity & Cloud Software',
    title: 'The Channel 291 Sensor Outage: Anatomy of an 8.5M Endpoint Crash & Customer Retention Defense',
    whatHappened:
      'On July 19, 2024, an automated rapid-response content update to CrowdStrike’s Falcon sensor triggered a logic error in Channel File 291, causing 8.5 million Microsoft Windows devices globally to encounter Blue Screen of Death (BSOD) failures, halting aviation, healthcare, and banking operations.',
    businessProblemOrOpportunity:
      'Mitigate reputational destruction, defend against multibillion-dollar customer litigation (Delta Air Lines), prevent customer defections to Microsoft Defender and SentinelOne, and re-architect kernel-level release validation.',
    marketContext:
      'CrowdStrike had captured undisputed leadership in Endpoint Detection and Response (EDR) with over $3.8B in Annual Recurring Revenue (ARR). The outage spotlighted the vulnerability of privileged Windows ring-0 kernel access across modern enterprise architecture.',
    strategyActionTaken:
      '1) Transparent Root Cause Analysis (RCA) published within days detailing Content Configuration System validator flaws; 2) Implemented staggered ring deployments, granular customer update scheduling, and enhanced test-time kernel fuzzing; 3) Deployed Customer Commitment Packages and executive-led retention programs offering tiered credits and extended services.',
    importantDataOrResults: {
      metrics: [
        { label: 'Affected Devices', value: '8.5M', change: '< 1% of Windows machines', isPositive: false },
        { label: 'Gross Retention Rate', value: '97%', change: 'Held steady in Q2/Q3', isPositive: true },
        { label: 'Annual Recurring Revenue', value: '$3.86B', change: '+32% YoY', isPositive: true },
        { label: 'Stock Recovery', value: '+45%', change: 'From post-crash trough', isPositive: true },
      ],
      summary:
        'Despite an immediate 40% stock plunge in July 2024, CrowdStrike retained 97% gross customer retention and grew ARR 32% year-over-year, avoiding systemic contract cancellations through radical transparency and client incentives.',
    },
    keyLessons: [
      'Kernel-Level Architectural Privileges Demand Staggered Canary Deployments: Global simultaneous updates bypass safety nets; canary rings and health rollback mechanisms are non-negotiable.',
      'Radical Post-Mortem Transparency Blunts Litigation Panic: Rapid, unvarnished disclosure of architectural bugs established good faith and prevented competitor weaponization.',
      'High Switching Costs Protect Sticky Enterprise Platforms: Replacing deeply embedded security agents is so operationally risky that enterprise buyers chose customer credits over platform migrations.',
    ],
    sources: [
      {
        title: 'CrowdStrike Falcon Sensor Content Issue Post Incident Review (PIR)',
        publisher: 'CrowdStrike Engineering Blog',
        url: 'https://www.crowdstrike.com/blog/falcon-update-remediation-steps/',
        date: 'Jul 2024',
      },
      {
        title: 'Microsoft Issues Global Assessment on Windows Endpoint Security Architecture',
        publisher: 'Microsoft Security Research',
        url: 'https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/',
        date: 'Jul 2024',
      },
      {
        title: 'CrowdStrike Reports Third Quarter Fiscal 2025 Financial Results',
        publisher: 'SEC 10-Q Filing',
        url: 'https://ir.crowdstrike.com',
        date: 'Nov 2024',
      },
    ],
    date: 'January 2025',
    readTime: '5 min read',
    status: 'Verified Research',
    tags: ['Cybersecurity', 'Disaster Recovery', 'SaaS Retention', 'Software Reliability'],
    rssHeadlineReference: 'Enterprise CISOs maintain CrowdStrike renewals following new canary update controls',
  },
  {
    id: 'openai-for-profit-restructuring',
    company: 'OpenAI',
    industry: 'Artificial Intelligence & Cloud Computing',
    title: 'The For-Profit Restructuring: Navigating Nonprofit Governance, Investor Demands, and a $157B Valuation',
    whatHappened:
      'OpenAI completed a record $6.6 billion funding round valuing the company at $157 billion, while simultaneously initiating a structural transition from a capped-profit subsidiary governed by a 501(c)(3) board to a traditional Delaware Public Benefit Corporation (PBC).',
    businessProblemOrOpportunity:
      'Securing hundreds of billions of dollars in compute capital to train next-generation frontier reasoning models (o1/o3) while dismantling the unusual governance model that triggered Sam Altman’s temporary ouster in November 2023.',
    marketContext:
      'Frontier model training costs are scaling exponentially toward $1B–$5B per frontier run. Rivals such as Anthropic (backed by Amazon/Google), xAI, and Meta (open-source Llama) are intensifying compute parity competition.',
    strategyActionTaken:
      '1) Structured funding with convertible notes tied to completing corporate reorganization within two years; 2) Expanded non-exclusive cloud partnerships, diversifying beyond Microsoft Azure to Oracle Cloud Infrastructure (OCI); 3) Commercialized specialized reasoning APIs and enterprise tiers, scaling ARR past $3.7 billion.',
    importantDataOrResults: {
      metrics: [
        { label: 'Valuation', value: '$157B', change: '+82% vs late 2023', isPositive: true },
        { label: 'Capital Raised', value: '$6.6B', change: 'Oversubscribed', isPositive: true },
        { label: 'Annualized Revenue', value: '$3.7B+', change: '+200% YoY', isPositive: true },
        { label: 'Weekly Active Users', value: '300M+', change: 'Global ChatGPT reach', isPositive: true },
      ],
      summary:
        'OpenAI cemented its position as the world’s most valuable private AI company, but faced leadership departures (CTO Mira Murati, Chief Scientist Ilya Sutskever) and complex fiduciary battles over nonprofit asset distribution.',
    },
    keyLessons: [
      'Capital Intensity Forces Corporate Realignment: High-capital technological frontiers inevitably clash with unconventional governance structures when single training runs cost billions.',
      'Ecosystem Diversification Mitigates Single-Sponsor Risk: Expanding compute agreements to Oracle and CoreWeave reduced total dependence on Microsoft’s data center delivery timelines.',
      'Talent Attrition Follows Strategic Pivots: Transitioning from pure academic safety research to commercial PBC sprint inevitably leads to ideological founder and research team splits.',
    ],
    sources: [
      {
        title: 'OpenAI Raises $6.6B at $157B Valuation to Accelerate Frontier AI Research',
        publisher: 'OpenAI Official Statement',
        url: 'https://openai.com/index/scale-next-generation-ai/',
        date: 'Oct 2024',
      },
      {
        title: 'OpenAI Considers Delaware Public Benefit Corporation Structure in Reorganization',
        publisher: 'The New York Times',
        url: 'https://www.nytimes.com/2024/09/25/technology/openai-restructuring-for-profit.html',
        date: 'Sep 2024',
      },
      {
        title: 'Microsoft and OpenAI Recalibrate Strategic Cloud Capacity Agreements',
        publisher: 'Wall Street Journal',
        url: 'https://www.wsj.com/tech/ai/openai-microsoft-partnership-deal-cloud-a400f074',
        date: 'Nov 2024',
      },
    ],
    date: 'February 2025',
    readTime: '6 min read',
    status: 'Strategic Deep Dive',
    tags: ['AI Strategy', 'Corporate Governance', 'Venture Capital', 'Hyperscalers'],
    rssHeadlineReference: 'OpenAI outlines timeline for nonprofit governance transition amid $157B milestone',
  },
  {
    id: 'tata-motors-demerger-strategy',
    company: 'Tata Motors Limited',
    ticker: 'TATAMOTORS.NS',
    industry: 'Automotive & Clean Mobility',
    title: 'The Demerger Blueprint: Splitting Commercial Vehicles and EV-Passenger Powerhouses to Unlock Shareholder Value',
    whatHappened:
      'Tata Motors initiated a landmark corporate demerger to segregate its business into two distinct listed entities: one housing Commercial Vehicles (trucks, buses), and the other combining Passenger Vehicles, Electric Vehicles (TPEM), and Jaguar Land Rover (JLR).',
    businessProblemOrOpportunity:
      'Conglomerate discount and divergent capital requirements. Commercial vehicles are cyclical, cash-flow generative, and tied to domestic infrastructure, whereas Passenger/EV/JLR requires aggressive R&D in software architectures and battery gigafactories.',
    marketContext:
      'India’s automobile market became the world’s third-largest, with electric vehicle adoption in personal transport climbing rapidly. Tata Motors commands over 68% of India’s passenger EV market while JLR accounts for roughly 70% of consolidated group revenues.',
    strategyActionTaken:
      '1) Structured a tax-neutral 1:1 share demerger giving existing shareholders identical stakes in both standalone companies; 2) Empowered the passenger mobility arm to attract targeted clean-tech ESG capital and autonomous vehicle partners; 3) Directed Commercial Vehicles to focus on hydrogen/CNG fleet modernization and high dividend payouts.',
    importantDataOrResults: {
      metrics: [
        { label: 'India Passenger EV Share', value: '68%', change: 'Market Leader', isPositive: true },
        { label: 'JLR Order Book', value: '148,000+', change: 'Defender/Range Rover focus', isPositive: true },
        { label: 'Consolidated Revenue', value: '₹4.38 Lakh Cr', change: '+26% YoY', isPositive: true },
        { label: 'Net Automotive Debt', value: 'Zero Target', change: 'Balance sheet turnaround', isPositive: true },
      ],
      summary:
        'The structural split removes operational cross-subsidization, allowing the passenger/JLR EV vehicle arm to be valued as a high-growth clean mobility leader rather than a cyclical heavy truck manufacturer.',
    },
    keyLessons: [
      'Unbundling Cyclical from Secular Growth Assets Eliminates Value Discounts: Merging heavy trucks with luxury electric SUVs obscured operational strengths of both divisions.',
      'Focused Capital Allocation Accelerates Product Development: Independent boards can calibrate debt, dividends, and R&D without competing internally for corporate treasury funds.',
      'First-Mover Domestic EV Moats Can Be Defended: Localized supply chains and early charging ecosystem partnerships created an enduring lead against foreign entrants in emerging markets.',
    ],
    sources: [
      {
        title: 'Tata Motors Board Approves Demerger into Two Distinct Listed Entities',
        publisher: 'BSE India Corporate Announcements',
        url: 'https://www.tatamotors.com/press-release/demerger-two-distinct-entities/',
        date: 'Mar 2024',
      },
      {
        title: 'JLR Delivers Record Q2 Profits with Range Rover and Defender Electrification Roadmap',
        publisher: 'Jaguar Land Rover Media',
        url: 'https://media.jaguarlandrover.com/news/2024/11/jlr-reports-q2-fy25-financial-results',
        date: 'Nov 2024',
      },
      {
        title: 'Analyst Assessment: How the Tata Motors Demerger Unlocks Equity Value',
        publisher: 'The Economic Times',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news/tata-motors-demerger-what-it-means-for-investors/articleshow/108226442.cms',
        date: 'Jun 2024',
      },
    ],
    date: 'January 2025',
    readTime: '4 min read',
    status: 'Verified Research',
    tags: ['Automotive', 'Corporate Demerger', 'Electric Vehicles', 'JLR Turnaround'],
    rssHeadlineReference: 'Tata Motors shareholder approvals advance for dual-entity stock exchange listing',
  },
];

export const INITIAL_BUSINESS_RSS_STORIES: BusinessRssStory[] = [
  {
    id: 'rss-1',
    title: 'Nvidia suppliers ramp next-generation liquid cooling infrastructure as Blackwell cloud clusters expand',
    source: 'Reuters Business',
    publishedAt: '2 hours ago',
    url: 'https://www.reuters.com/technology/nvidia-blackwell-chip-delay-analysts-2024-08-05/',
    summary: 'Cloud providers accelerate investments in specialized power and cooling data center designs to handle 120kW rack thermal loads.',
    suggestedCompany: 'NVIDIA Corporation',
    suggestedIndustry: 'Semiconductors & AI Hardware',
  },
  {
    id: 'rss-2',
    title: 'Starbucks introduces streamlined operational playbook to cut digital mobile order wait times in North America',
    source: 'Wall Street Journal',
    publishedAt: '4 hours ago',
    url: 'https://www.wsj.com/business/retail/starbucks-mobile-order-brian-niccol-turnaround-0a950a29',
    summary: 'New CEO Brian Niccol aims to reduce store congestion by redesigning order pickup counters and pacing mobile orders.',
    suggestedCompany: 'Starbucks Corporation',
    suggestedIndustry: 'Consumer & Retail Foodservice',
  },
  {
    id: 'rss-3',
    title: 'Boeing secures $24 billion liquidity buffer following worker contract deal to restart 737 MAX assembly line',
    source: 'Bloomberg Markets',
    publishedAt: '5 hours ago',
    url: 'https://www.bloomberg.com/news/articles/2024-10-30/boeing-raises-21-billion-in-one-of-largest-ever-share-sales',
    summary: 'Fresh executive leadership outlines multi-phase supplier inspections to satisfy FAA factory safety criteria.',
    suggestedCompany: 'The Boeing Company',
    suggestedIndustry: 'Aerospace & Defense',
  },
  {
    id: 'rss-4',
    title: 'CrowdStrike deepens enterprise platform partnerships with automated canary deployment rollout',
    source: 'CNBC Technology',
    publishedAt: '7 hours ago',
    url: 'https://www.crowdstrike.com/blog/falcon-update-remediation-steps/',
    summary: 'Cybersecurity leader records 97% gross customer retention as corporate buyers accept new phased kernel update options.',
    suggestedCompany: 'CrowdStrike Holdings',
    suggestedIndustry: 'Cybersecurity & Cloud',
  },
  {
    id: 'rss-5',
    title: 'OpenAI advances conversion toward public benefit corporation structure ahead of frontier compute milestones',
    source: 'Financial Times',
    publishedAt: '8 hours ago',
    url: 'https://www.ft.com',
    summary: 'The artificial intelligence lab balances nonprofit charter requirements with investor commitments in a $157B funding structure.',
    suggestedCompany: 'OpenAI',
    suggestedIndustry: 'Artificial Intelligence',
  },
  {
    id: 'rss-6',
    title: 'Tata Motors progresses landmark demerger timeline to separate commercial trucks from passenger EV unit',
    source: 'The Economic Times',
    publishedAt: '10 hours ago',
    url: 'https://economictimes.indiatimes.com',
    summary: 'Shareholders prepare for two distinct market listings to unlock pure-play electric vehicle and luxury mobility multiples.',
    suggestedCompany: 'Tata Motors',
    suggestedIndustry: 'Automotive & Clean Mobility',
  },
];
