/**
 * Utility to dynamically update meta tags, OpenGraph tags, Twitter cards,
 * canonical links, and JSON-LD structured data based on current page context.
 */

export interface RegionalAlternate {
  lang: string;
  href: string;
}

export interface PageMetaContext {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  author?: string;
  section?: string;
  publishedTime?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  locale?: string;
  alternates?: RegionalAlternate[];
  structuredData?: Record<string, unknown>;
}

const DEFAULT_META: Required<Omit<PageMetaContext, 'publishedTime' | 'structuredData' | 'alternates'>> & {
  alternates?: RegionalAlternate[];
  structuredData?: Record<string, unknown>;
} = {
  title: 'Shubham Sonale | Research Writer & Analyst',
  description:
    'Professional portfolio of Shubham Sonale, Research Writer. Translating complex data, scientific findings, and quantitative trends into authoritative white papers, case studies, and research publications.',
  keywords: [
    'Research Writer',
    'Freelance Research Writer',
    'White Paper Specialist',
    'B2B Case Studies',
    'Market Research Reports',
    'Data Synthesis',
    'Quantitative Analysis',
    'Shubham Sonale',
  ],
  canonicalUrl: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://shubhamsonale.com',
  ogType: 'website',
  ogImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=630&q=80',
  author: 'Shubham Sonale',
  section: 'home',
  lang: 'en',
  dir: 'ltr',
  locale: 'en_US',
  alternates: [
    { lang: 'en', href: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://shubhamsonale.com' },
    { lang: 'x-default', href: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://shubhamsonale.com' },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shubham Sonale',
    jobTitle: 'Research Writer & Analyst',
    description:
      'Independent research writer dedicated to translating complex human behavior, data, and scientific research into clear, evidence-backed publications and white papers.',
    sameAs: ['https://github.com/shubhamsonale'],
    knowsAbout: [
      'Research Writing',
      'White Papers',
      'Quantitative Analysis',
      'Case Studies',
      'Survey Architecture',
      'User Research',
    ],
  },
};

/**
 * Helper to update or create a meta tag by name or property attribute.
 */
function setMetaTag(attrName: 'name' | 'property' | 'http-equiv', attrValue: string, content: string): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a link tag (e.g. rel="canonical").
 */
function setLinkTag(rel: string, href: string, extraAttrs?: Record<string, string>): void {
  if (typeof document === 'undefined') return;

  let selector = `link[rel="${rel}"]`;
  if (extraAttrs?.hreflang) {
    selector = `link[rel="${rel}"][hreflang="${extraAttrs.hreflang}"]`;
  }

  let link = document.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    if (extraAttrs) {
      Object.entries(extraAttrs).forEach(([k, v]) => link!.setAttribute(k, v));
    }
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Helper to synchronize regional hreflang link tags for multi-region search indexing.
 */
function setHreflangTags(alternates: RegionalAlternate[], canonicalUrl: string): void {
  if (typeof document === 'undefined') return;

  // Remove existing hreflang tags to prevent stale duplicates
  const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());

  const list = alternates.length > 0 ? alternates : [
    { lang: 'en', href: canonicalUrl },
    { lang: 'x-default', href: canonicalUrl },
  ];

  list.forEach((item) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', item.lang);
    link.setAttribute('href', item.href);
    document.head.appendChild(link);
  });
}

/**
 * Helper to update document root language and text direction attributes.
 */
function setDocumentLanguage(lang: string, dir: 'ltr' | 'rtl' = 'ltr'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

/**
 * Helper to inject or update Schema.org JSON-LD structured data.
 */
function setStructuredData(data: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;

  const SCRIPT_ID = 'seo-structured-data';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

/**
 * Dynamically updates document title, standard SEO meta tags, OpenGraph tags,
 * Twitter card tags, canonical link, and JSON-LD structured data based on the current page context.
 *
 * @param context - The page or modal context (title, description, section, project, etc.)
 */
export function updatePageSEO(context: PageMetaContext = {}): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const resolved = {
    title: context.title ? `${context.title} | Shubham Sonale` : DEFAULT_META.title,
    description: context.description || DEFAULT_META.description,
    keywords: context.keywords && context.keywords.length > 0 ? context.keywords : DEFAULT_META.keywords,
    canonicalUrl: context.canonicalUrl || (window.location.origin + window.location.pathname + (window.location.hash || '')),
    ogType: context.ogType || DEFAULT_META.ogType,
    ogImage: context.ogImage || DEFAULT_META.ogImage,
    author: context.author || DEFAULT_META.author,
    section: context.section || 'General',
    publishedTime: context.publishedTime,
    lang: context.lang || DEFAULT_META.lang,
    dir: context.dir || DEFAULT_META.dir,
    locale: context.locale || DEFAULT_META.locale,
    alternates: context.alternates || DEFAULT_META.alternates || [],
    structuredData: context.structuredData || DEFAULT_META.structuredData,
  };

  // 1. Language & Direction attributes (on <html> root)
  setDocumentLanguage(resolved.lang, resolved.dir);

  // 2. Primary Title
  document.title = resolved.title;

  // 3. Standard Search Engine Meta Tags & Regional Language Tags
  setMetaTag('name', 'description', resolved.description);
  setMetaTag('name', 'keywords', resolved.keywords.join(', '));
  setMetaTag('name', 'author', resolved.author);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMetaTag('http-equiv', 'content-language', resolved.lang);
  setMetaTag('name', 'language', resolved.lang);

  // 4. OpenGraph Social Sharing Tags (Facebook, LinkedIn, Slack, WhatsApp)
  setMetaTag('property', 'og:site_name', 'Shubham Sonale – Research Writer');
  setMetaTag('property', 'og:title', resolved.title);
  setMetaTag('property', 'og:description', resolved.description);
  setMetaTag('property', 'og:type', resolved.ogType);
  setMetaTag('property', 'og:url', resolved.canonicalUrl);
  setMetaTag('property', 'og:image', resolved.ogImage);
  setMetaTag('property', 'og:image:alt', resolved.title);
  setMetaTag('property', 'og:locale', resolved.locale);

  if (resolved.publishedTime) {
    setMetaTag('property', 'article:published_time', resolved.publishedTime);
    setMetaTag('property', 'article:section', resolved.section);
  }

  // 5. Twitter / X Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:site', '@shubhamsonale');
  setMetaTag('name', 'twitter:creator', '@shubhamsonale');
  setMetaTag('name', 'twitter:title', resolved.title);
  setMetaTag('name', 'twitter:description', resolved.description);
  setMetaTag('name', 'twitter:image', resolved.ogImage);
  setMetaTag('name', 'twitter:image:alt', resolved.title);

  // 6. Canonical URL Link Tag
  setLinkTag('canonical', resolved.canonicalUrl);

  // 7. Regional Alternate Hreflang Tags for Search Indexing
  setHreflangTags(resolved.alternates, resolved.canonicalUrl);

  // 8. Schema.org JSON-LD Structured Data
  if (resolved.structuredData) {
    setStructuredData(resolved.structuredData);
  }
}

/**
 * Contextual SEO presets tailored for specific sections or view states of the portfolio.
 */
export const SECTION_SEO_PRESETS: Record<string, PageMetaContext> = {
  home: {
    title: 'Research Writer & White Paper Specialist',
    description:
      'Professional portfolio of Shubham Sonale, Research Writer. Translating complex data, scientific findings, and quantitative trends into authoritative white papers, case studies, and research publications.',
    section: 'Home',
    keywords: [
      'Research Writer',
      'White Paper Specialist',
      'Case Study Writer',
      'Quantitative Analysis',
      'Market Research Reports',
      'Shubham Sonale',
    ],
  },
  news: {
    title: 'Live Market & Tech Intelligence Feed',
    description:
      'Real-time curated news intelligence across global markets, technology, AI research, science, and digital product trends.',
    section: 'Live Intelligence',
    keywords: [
      'Market Intelligence',
      'Technology Trends',
      'AI Research News',
      'Real-time Industry Feed',
      'Tech Research',
    ],
  },
  about: {
    title: 'About Shubham Sonale | Methodology & Analytical Background',
    description:
      'Learn about Shubham Sonale’s mixed-methods research framework, quantitative data synthesis, and experience authoring reports for high-growth ventures.',
    section: 'About',
    keywords: [
      'Research Methodology',
      'Mixed-Methods Research',
      'Quantitative Synthesis',
      'About Shubham Sonale',
      'Analytical Reporting',
    ],
  },
  portfolio: {
    title: 'Selected Research Writing & Analytical Case Studies',
    description:
      'Explore deep-dive case studies, white papers, and empirical inquiry into UX architecture, e-commerce retention, and patient portals.',
    section: 'Portfolio',
    keywords: [
      'Research Case Studies',
      'White Papers',
      'UX Research Reports',
      'E-Commerce Retention Study',
      'Healthcare Analytics Case Study',
    ],
  },
  contact: {
    title: 'Hire a Research Writer | Contact & Inquiries',
    description:
      'Get in touch with Shubham Sonale for freelance research writing, technical white papers, custom analytical reports, and project discovery calls.',
    section: 'Contact',
    keywords: [
      'Hire Research Writer',
      'Freelance White Paper Specialist',
      'Contact Shubham Sonale',
      'Research Consultation',
      'Writing Services',
    ],
  },
};
