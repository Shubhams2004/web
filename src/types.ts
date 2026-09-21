export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName:
    | 'Search'
    | 'FileSpreadsheet'
    | 'Users'
    | 'BarChart3'
    | 'ClipboardCheck'
    | 'LineChart'
    | 'CheckCircle2'
    | 'BookOpen'
    | 'FileText'
    | 'PenTool';
  deliverables: string[];
}

export interface ProjectTechStackItem {
  category: string;
  recommended_tool: string;
  purpose: string;
}

export interface ProjectWorkflowItem {
  id: number;
  title: string;
  user_prompt: string;
  intent_resolution?: {
    intent: string;
    task: string;
    scheduled_at: string;
  };
  execution?: string;
  agentic_execution_sequence?: string[];
}

export interface ProjectRoadmapItem {
  phase: number;
  title: string;
  description: string;
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface CaseStudySource {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
}

export interface BusinessCaseStudy {
  id: string;
  company: string;
  ticker?: string;
  industry: string;
  title: string;
  whatHappened: string;
  businessProblemOrOpportunity: string;
  marketContext: string;
  strategyActionTaken: string;
  importantDataOrResults: {
    metrics: CaseStudyMetric[];
    summary: string;
  };
  keyLessons: string[];
  sources: CaseStudySource[];
  date: string;
  readTime: string;
  status: 'Verified Research' | 'Breaking Catalyst' | 'Strategic Deep Dive';
  tags: string[];
  rssHeadlineReference?: string;
  generatedByGroq?: boolean;
  generatedAt?: string;
}

export interface BusinessRssStory {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  suggestedCompany?: string;
  suggestedIndustry?: string;
}

export interface ProjectFreeTierLimit {
  service: string;
  quota: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  categoryTag: string; // e.g., "Research", "Analysis", "Usability Testing", "Survey Design", "AI Systems"
  tagColor: 'blue' | 'slate' | 'indigo' | 'emerald';
  briefDescription: string;
  fullOverview?: string;
  methodsUsed: string[];
  keyOutcome: string;
  timeframe?: string;
  architecturePrinciple?: string;
  techStack?: ProjectTechStackItem[];
  workflows?: ProjectWorkflowItem[];
  engineeringRoadmap?: ProjectRoadmapItem[];
  freeTierLimits?: ProjectFreeTierLimit[];
  rawSpecification?: Record<string, unknown>;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface ContactInfo {
  email: string;
  availability: string;
  location: string;
  responseTime: string;
  socials: {
    platform: string;
    url: string;
    handle: string;
  }[];
}

export interface PortfolioData {
  person: {
    fullName: string;
    headline: string;
    tagline: string;
    avatarInitials: string;
    statusBadge: string;
    locationBadge: string;
  };
  navigation: NavItem[];
  about: {
    bioParagraphs: string[];
    highlights: {
      label: string;
      value: string;
    }[];
    skills: SkillCategory[];
    services: ServiceItem[];
  };
  projects: Project[];
  contact: ContactInfo;
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  publishedAt?: string;
  url?: string;
}

export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsResponse {
  items: NewsItem[];
  sources: NewsSource[];
  topic: string;
  generatedAt: string;
  cached?: boolean;
}

export type NewsCategory =
  | 'All'
  | 'India'
  | 'Maharashtra'
  | 'World'
  | 'Politics'
  | 'Business'
  | 'Technology'
  | 'Sports'
  | 'Entertainment';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  imageCaption?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  tags: string[];
  viewsCount?: string;
  location?: string;
}
