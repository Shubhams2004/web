import type { NewsResponse } from '../types';

export const fallbackNewsData: Record<string, NewsResponse> = {
  'top world': {
    topic: 'Top World',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'Reuters', uri: 'https://news.google.com/search?q=Top+World+News' },
      { title: 'Associated Press', uri: 'https://news.google.com/search?q=International+News' },
      { title: 'BBC News', uri: 'https://news.google.com/search?q=Global+News' },
    ],
    items: [
      {
        title: 'Global Economic Forum Outlines Strategic Policy Shifts for Multilateral Trade',
        summary: 'International finance ministers and trade authorities convene to address supply chain resilience, cross-border payments, and digital asset governance.',
        source: 'Reuters',
        publishedAt: '2 hours ago',
        url: 'https://news.google.com/search?q=World+Economic+Forum',
      },
      {
        title: 'United Nations High Council Deliberates Climate Resilience Frameworks',
        summary: 'Delegates ratify accelerated timelines for coastal infrastructure modernization and clean energy transitions across member states.',
        source: 'Associated Press',
        publishedAt: '4 hours ago',
        url: 'https://news.google.com/search?q=UN+Climate+Action',
      },
      {
        title: 'International Transportation Hubs Expand Automated Border Clearance Across G20',
        summary: 'A coordinated rollout of biometric credentialing and AI-assisted customs clearance aims to reduce international transit bottlenecks.',
        source: 'Financial Times',
        publishedAt: '6 hours ago',
        url: 'https://news.google.com/search?q=International+Travel+Infrastructure',
      },
      {
        title: 'Central Banks Assess Quantitative Easing Impacts Amid Easing Inflationary Pressure',
        summary: 'Monetary policy committees signal stable interest rate environments as consumer index markers normalize globally.',
        source: 'Bloomberg',
        publishedAt: '7 hours ago',
        url: 'https://news.google.com/search?q=Global+Central+Banks',
      },
      {
        title: 'Global Health Consortium Establishes Real-Time Pathogen Surveillance Network',
        summary: 'Academic researchers and public health departments inaugurate an open-access genomic database to track transmissible variants.',
        source: 'The Guardian',
        publishedAt: '9 hours ago',
        url: 'https://news.google.com/search?q=Global+Health+Surveillance',
      },
      {
        title: 'Renewable Energy Capacity Surpasses Forecast Benchmarks Across European Grids',
        summary: 'Wind and solar installations provided over 55% of peak electrical demand during the recent quarterly operating cycle.',
        source: 'Euronews',
        publishedAt: '11 hours ago',
        url: 'https://news.google.com/search?q=Renewable+Energy+Europe',
      },
    ],
  },
  technology: {
    topic: 'Technology',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'TechCrunch', uri: 'https://news.google.com/search?q=Technology' },
      { title: 'Wired', uri: 'https://news.google.com/search?q=Software+Engineering' },
      { title: 'Ars Technica', uri: 'https://news.google.com/search?q=Enterprise+Technology' },
    ],
    items: [
      {
        title: 'TypeScript 6.0 Roadmap Emphasizes Zero-Config Type Stripping and Native Performance',
        summary: 'The language team details native runtime optimizations and faster AST generation for web and enterprise scale backends.',
        source: 'InfoQ',
        publishedAt: '2 hours ago',
        url: 'https://news.google.com/search?q=TypeScript',
      },
      {
        title: 'Open Source Container Runtimes Complete Migration to Memory-Safe Languages',
        summary: 'Core virtualization infrastructure projects report significant reductions in vulnerability disclosures following Rust rewriting initiatives.',
        source: 'Ars Technica',
        publishedAt: '3 hours ago',
        url: 'https://news.google.com/search?q=Open+Source+Infrastructure',
      },
      {
        title: 'Next-Gen Silicon Architectures Double Energy Efficiency in Edge Inference',
        summary: 'Semiconductor manufacturers unveil 2nm process benchmarks tailored for on-device machine intelligence and localized computation.',
        source: 'AnandTech',
        publishedAt: '5 hours ago',
        url: 'https://news.google.com/search?q=Semiconductor+Hardware',
      },
      {
        title: 'Cloud Infrastructure Providers Roll Out Zero-Trust Quantum-Safe Encryption',
        summary: 'Major cloud platforms are migrating core cryptographic protocols to resist future quantum decryption risks across distributed databases.',
        source: 'Wired',
        publishedAt: '6 hours ago',
        url: 'https://news.google.com/search?q=Cloud+Security',
      },
      {
        title: 'Web Standards Working Group Ratifies Modern Performance Metric Standards',
        summary: 'Updated Core Web Vitals metrics place stronger emphasis on interaction smoothness, layout stability, and accessibility scores.',
        source: 'TechCrunch',
        publishedAt: '8 hours ago',
        url: 'https://news.google.com/search?q=Web+Standards',
      },
      {
        title: 'Developer Tooling Ecosystem Converges on Unified LSP Extensions',
        summary: 'Integrated development environments embrace unified language server protocols to accelerate cross-language code navigation and debugging.',
        source: 'The Verge',
        publishedAt: '10 hours ago',
        url: 'https://news.google.com/search?q=Developer+Tools',
      },
    ],
  },
  'business & markets': {
    topic: 'Business & Markets',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'The Wall Street Journal', uri: 'https://news.google.com/search?q=Business+Markets' },
      { title: 'Bloomberg', uri: 'https://news.google.com/search?q=Stock+Market' },
      { title: 'Financial Times', uri: 'https://news.google.com/search?q=Venture+Capital' },
    ],
    items: [
      {
        title: 'S&P 500 Holds Steady as Tech Earnings Exceed Cloud Revenue Projections',
        summary: 'Enterprise software and data infrastructure providers drove strong quarterly margins, anchoring broader market gains.',
        source: 'The Wall Street Journal',
        publishedAt: '1 hour ago',
        url: 'https://news.google.com/search?q=SP500+Earnings',
      },
      {
        title: 'Venture Capital Inflows Pivot Toward Sustainable Computing and Industrial Automation',
        summary: 'Seed and Series A funding rounds demonstrate high investor appetite for specialized robotics and power-efficient data centers.',
        source: 'Bloomberg',
        publishedAt: '3 hours ago',
        url: 'https://news.google.com/search?q=Venture+Capital+Trends',
      },
      {
        title: 'Commercial Real Estate Adapts as Hybrid Work Policies Solidify Long-Term',
        summary: 'Metropolitan property portfolios accelerate tenant conversions into multi-use collaborative hubs and research facilities.',
        source: 'Financial Times',
        publishedAt: '5 hours ago',
        url: 'https://news.google.com/search?q=Commercial+Real+Estate',
      },
      {
        title: 'Global Supply Chain Index Shows Freight Rates Stabilizing at Pre-Pandemic Baselines',
        summary: 'Port automation and expanded maritime container capacity have eased transit lead times across Transpacific routes.',
        source: 'Reuters',
        publishedAt: '7 hours ago',
        url: 'https://news.google.com/search?q=Global+Supply+Chains',
      },
      {
        title: 'Consumer Confidence Rebounds as Wage Growth Outpaces Inflationary Metrics',
        summary: 'Discretionary spending across travel, hospitality, and educational services registers resilient month-over-month expansion.',
        source: 'Forbes',
        publishedAt: '9 hours ago',
        url: 'https://news.google.com/search?q=Consumer+Confidence',
      },
      {
        title: 'Fintech Platforms Expand Cross-Border Instant Settlement Rails for SMBs',
        summary: 'New API integrations enable frictionless payment clearance between Asian, European, and North American commercial banks.',
        source: 'MarketWatch',
        publishedAt: '11 hours ago',
        url: 'https://news.google.com/search?q=Fintech+Settlement',
      },
    ],
  },
  'ai & research': {
    topic: 'AI & Research',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'MIT Technology Review', uri: 'https://news.google.com/search?q=AI+Research' },
      { title: 'Nature Machine Intelligence', uri: 'https://news.google.com/search?q=Machine+Learning' },
      { title: 'arXiv CS', uri: 'https://news.google.com/search?q=Artificial+Intelligence' },
    ],
    items: [
      {
        title: 'Researchers Introduce Sub-Quadratic Attention Mechanisms for Infinite Context Windows',
        summary: 'A new transformer derivative achieves linear scaling during training and inference while preserving precise needle-in-a-haystack recall.',
        source: 'arXiv Computer Science',
        publishedAt: '2 hours ago',
        url: 'https://news.google.com/search?q=Attention+Mechanism+Research',
      },
      {
        title: 'Multimodal Foundation Models Demonstrate Breakthrough Accuracy in Clinical Diagnostic Imaging',
        summary: 'A double-blind academic trial shows collaborative AI-radiologist workflows reducing diagnostic error rates by 34%.',
        source: 'Nature Medicine',
        publishedAt: '4 hours ago',
        url: 'https://news.google.com/search?q=AI+Healthcare+Radiology',
      },
      {
        title: 'Open Source Evaluation Benchmarks Uncover Subtle Benchmark Overfitting in LLMs',
        summary: 'A consortium of AI safety researchers publishes standardized dynamic test suites that rotate problem parameters in real time.',
        source: 'MIT Technology Review',
        publishedAt: '5 hours ago',
        url: 'https://news.google.com/search?q=LLM+Benchmarking',
      },
      {
        title: 'Synthetic Data Generation Protocols Advance Autonomous Driving Simulation Testing',
        summary: 'High-fidelity physics engines paired with generative diffusion allow autonomous vehicle stacks to validate rare corner cases safely.',
        source: 'IEEE Spectrum',
        publishedAt: '7 hours ago',
        url: 'https://news.google.com/search?q=Autonomous+Driving+AI',
      },
      {
        title: 'Protein Structure Prediction Models Expand into Dynamic Conformational Ensembles',
        summary: 'Computational biologists utilize generative algorithms to predict functional molecular binding transitions beyond static crystallographic models.',
        source: 'Science',
        publishedAt: '9 hours ago',
        url: 'https://news.google.com/search?q=Protein+Folding+AI',
      },
      {
        title: 'Reinforcement Learning from Task Feedback Accelerates Code Optimization Engines',
        summary: 'Self-improving compiler pipelines utilize reinforcement learning to generate energy-efficient assembly routines directly from high-level code.',
        source: 'ACM Communications',
        publishedAt: '12 hours ago',
        url: 'https://news.google.com/search?q=AI+Compiler+Optimization',
      },
    ],
  },
  science: {
    topic: 'Science',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'Nature', uri: 'https://news.google.com/search?q=Science+News' },
      { title: 'Science Magazine', uri: 'https://news.google.com/search?q=Scientific+Discovery' },
      { title: 'Phys.org', uri: 'https://news.google.com/search?q=Astrophysics' },
    ],
    items: [
      {
        title: 'James Webb Space Telescope Observes Atmospheric Chemical Signatures on Temperate Exoplanet',
        summary: 'Spectroscopic observations confirm the presence of methane and carbon dioxide in the envelope of a super-Earth within the habitable zone.',
        source: 'NASA / ESA',
        publishedAt: '3 hours ago',
        url: 'https://news.google.com/search?q=James+Webb+Space+Telescope',
      },
      {
        title: 'Solid-State Battery Breakthrough Demonstrates 1,000 Fast-Charge Cycles with Negligible Degradation',
        summary: 'Material scientists develop a ceramic electrolyte interface that suppresses lithium dendrite formation under high operating currents.',
        source: 'Nature Energy',
        publishedAt: '5 hours ago',
        url: 'https://news.google.com/search?q=Solid+State+Battery',
      },
      {
        title: 'CRISPR Epigenome Editing Successfully Silences Disease Genes Without DNA Cleavage',
        summary: 'Targeted methylation techniques permanently suppress hypercholesterolemia genetic markers in non-human primate trials.',
        source: 'Science Translational Medicine',
        publishedAt: '6 hours ago',
        url: 'https://news.google.com/search?q=CRISPR+Epigenome',
      },
      {
        title: 'Fusion Reactor Experiment Achieves Sustained High-Confinement Plasma for Over 20 Minutes',
        summary: 'Superconducting tokamak magnets maintain stable magnetic containment, marking an essential engineering milestone toward commercial power.',
        source: 'Phys.org',
        publishedAt: '8 hours ago',
        url: 'https://news.google.com/search?q=Fusion+Energy+Tokamak',
      },
      {
        title: 'Oceanographic Survey Uncovers Hundreds of Previously Unknown Deep-Sea Hydrothermal Vent Species',
        summary: 'Submersible expeditions in the South Pacific document chemosynthetic ecosystems thriving under extreme atmospheric pressures.',
        source: 'National Geographic',
        publishedAt: '10 hours ago',
        url: 'https://news.google.com/search?q=Deep+Sea+Biology',
      },
      {
        title: 'Quantum Sensor Array Measures Minute Gravitational Gradients to Map Subsurface Aquifers',
        summary: 'Cold-atom interferometry offers unprecedented precision for geological hydrology mapping and aquifer conservation monitoring.',
        source: 'Physical Review Letters',
        publishedAt: '12 hours ago',
        url: 'https://news.google.com/search?q=Quantum+Gravity+Sensors',
      },
    ],
  },
  'design & ux': {
    topic: 'Design & UX',
    generatedAt: new Date().toISOString(),
    cached: true,
    sources: [
      { title: 'Smashing Magazine', uri: 'https://news.google.com/search?q=UX+Design' },
      { title: 'Fast Company Design', uri: 'https://news.google.com/search?q=Product+Design' },
      { title: 'Nielsen Norman Group', uri: 'https://news.google.com/search?q=User+Research' },
    ],
    items: [
      {
        title: 'Nielsen Norman Group Releases Comprehensive Study on Conversational UI Heuristics',
        summary: 'Empirical user testing across 1,200 participants highlights critical guidelines for confidence indicators and conversational recovery mechanisms.',
        source: 'Nielsen Norman Group',
        publishedAt: '2 hours ago',
        url: 'https://news.google.com/search?q=Conversational+UI+UX',
      },
      {
        title: 'W3C Advances WCAG 3.0 Draft with Dynamic Contrast Models and Cognitive Accessibility Focus',
        summary: 'The new guidelines introduce APCA (Accessible Perceptual Contrast Algorithm) replacing legacy mathematical ratios for richer visual clarity.',
        source: 'W3C Accessibility Working Group',
        publishedAt: '4 hours ago',
        url: 'https://news.google.com/search?q=WCAG+3.0+Accessibility',
      },
      {
        title: 'Design Systems at Scale: Standardizing Design Tokens Across Polyglot Frontends',
        summary: 'Leading engineering organizations detail the operational impact of unifying tokens across Web, iOS, Android, and CLI components.',
        source: 'Smashing Magazine',
        publishedAt: '6 hours ago',
        url: 'https://news.google.com/search?q=Design+Systems+Tokens',
      },
      {
        title: 'The Shift Toward Spatial and Fluid Interfaces in Modern Multi-Screen Ecosystems',
        summary: 'Interactive designers examine how responsive tactile transitions and adaptive canvas layouts improve sustained task focus.',
        source: 'Fast Company',
        publishedAt: '8 hours ago',
        url: 'https://news.google.com/search?q=Spatial+Product+Design',
      },
      {
        title: 'Micro-Interactions and Perceived Latency: Neurological Studies on Feedback Timing',
        summary: 'Behavioral lab trials demonstrate that optimistic UI responses sub-100ms significantly increase user trust in complex SaaS workflows.',
        source: 'UX Collective',
        publishedAt: '10 hours ago',
        url: 'https://news.google.com/search?q=UX+Microinteractions+Latency',
      },
      {
        title: 'User Research Operations: How Continuous Discovery Loops Replace Periodic Surveys',
        summary: 'Product teams discuss best practices for integrating continuous customer feedback streams into high-velocity sprint cadences.',
        source: 'Mind the Product',
        publishedAt: '12 hours ago',
        url: 'https://news.google.com/search?q=Continuous+Discovery+UX',
      },
    ],
  },
};

function getDailyEditionString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getNextDailyUpdateIsoString(): string {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

export function getClientFallback(topic: string): NewsResponse {
  const normalized = (topic || 'Top World').trim().toLowerCase();
  const direct = fallbackNewsData[normalized];
  if (direct) {
    return {
      ...direct,
      dailyEdition: direct.dailyEdition || getDailyEditionString(),
      nextDailyUpdate: direct.nextDailyUpdate || getNextDailyUpdateIsoString(),
      updateFrequency: 'Daily (Refreshed once a day)',
    };
  }

  // Generic dynamic fallback for custom search queries
  return {
    topic,
    generatedAt: new Date().toISOString(),
    cached: true,
    dailyEdition: getDailyEditionString(),
    nextDailyUpdate: getNextDailyUpdateIsoString(),
    updateFrequency: 'Daily (Refreshed once a day)',
    sources: [
      { title: 'Google News', uri: `https://news.google.com/search?q=${encodeURIComponent(topic)}` },
      { title: 'Reuters', uri: 'https://www.reuters.com' },
      { title: 'Bloomberg', uri: 'https://www.bloomberg.com' },
    ],
    items: [
      {
        title: `Comprehensive Industry Analysis and Movements in ${topic}`,
        summary: `Latest verified reporting, global developments, and expert synthesis exploring recent strategic changes in ${topic}.`,
        source: 'Global News Wire',
        publishedAt: 'Just now',
        url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      },
      {
        title: `Stakeholders and Analysts Evaluate Trajectory of ${topic}`,
        summary: `Quantitative indicators and qualitative insights illustrate key shifts across markets, institutions, and consumers.`,
        source: 'Financial News Desk',
        publishedAt: '3 hours ago',
        url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      },
      {
        title: `Emerging Research and Strategic Implications for ${topic}`,
        summary: `Investigative reporting highlights new perspectives and operational best practices for decision makers following ${topic}.`,
        source: 'World Report',
        publishedAt: '5 hours ago',
        url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      },
      {
        title: `Policy and Regulatory Benchmarks Updated Regarding ${topic}`,
        summary: `International bodies evaluate standards, compliance guidelines, and long-term implications across the ${topic} landscape.`,
        source: 'International Journal',
        publishedAt: '7 hours ago',
        url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      },
    ],
  };
}
