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
