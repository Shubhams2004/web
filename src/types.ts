export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: 'Search' | 'FileSpreadsheet' | 'Users' | 'BarChart3' | 'ClipboardCheck' | 'LineChart' | 'CheckCircle2';
  deliverables: string[];
}

export interface Project {
  id: string;
  title: string;
  categoryTag: string; // e.g., "Research", "Analysis", "Usability Testing", "Survey Design"
  tagColor: 'blue' | 'slate' | 'indigo' | 'emerald';
  briefDescription: string;
  fullOverview?: string;
  methodsUsed: string[];
  keyOutcome: string;
  timeframe?: string;
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
