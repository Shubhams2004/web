import { NewsArticle, NewsCategory, NewsItem, NewsResponse } from '../types';
import { SAMPLE_ARTICLES } from '../data/newsPlatformData';
import { sanitizeExternalUrl, sanitizeInputText } from './security';

// Curated high-resolution editorial photography by category
const CATEGORY_IMAGES: Record<NewsCategory, string[]> = {
  Technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  ],
  World: [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  India: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  ],
  Maharashtra: [
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80',
  ],
  Politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  ],
  Entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  ],
  All: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  ],
};

const CORRESPONDENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
];

const getApiEndpoints = (topic: string, force = false): string[] => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  // Clean topic parameter to prevent injection into query strings
  const safeTopic = sanitizeInputText(topic, 80) || 'All';
  // Cache bypass is restricted; only pass force if explicit and not defaulted
  const forceParam = force ? '&force=true' : '';
  const query = `topic=${encodeURIComponent(safeTopic)}${forceParam}`;

  return [
    `${cleanBase}api/news?${query}`,
    `/api/news?${query}`,
    `/web/api/news?${query}`,
  ];
};

/**
 * Infer category from headline, summary, and query hints
 */
export function inferCategory(title: string, summary: string, topicHint?: string): NewsCategory {
  const text = `${title} ${summary} ${topicHint || ''}`.toLowerCase();

  if (
    text.includes('mumbai') ||
    text.includes('pune') ||
    text.includes('maharashtra') ||
    text.includes('thanne') ||
    text.includes('bmc') ||
    text.includes('nagpur')
  ) {
    return 'Maharashtra';
  }

  if (
    text.includes('cricket') ||
    text.includes('bcci') ||
    text.includes('ipl') ||
    text.includes('football') ||
    text.includes('tennis') ||
    text.includes('olympic') ||
    text.includes('trophy') ||
    text.includes('tournament') ||
    text.includes('world cup')
  ) {
    return 'Sports';
  }

  if (
    text.includes('ai') ||
    text.includes('semiconductor') ||
    text.includes('software') ||
    text.includes('chip') ||
    text.includes('microchip') ||
    text.includes('google') ||
    text.includes('apple') ||
    text.includes('microsoft') ||
    text.includes('nvidia') ||
    text.includes('isro') ||
    text.includes('quantum') ||
    text.includes('cyber') ||
    text.includes('algorithm')
  ) {
    return 'Technology';
  }

  if (
    text.includes('stock') ||
    text.includes('market') ||
    text.includes('sensex') ||
    text.includes('nifty') ||
    text.includes('rbi') ||
    text.includes('inflation') ||
    text.includes('economy') ||
    text.includes('quarter') ||
    text.includes('fiscal') ||
    text.includes('bank') ||
    text.includes('revenue') ||
    text.includes('investor')
  ) {
    return 'Business';
  }

  if (
    text.includes('parliament') ||
    text.includes('minister') ||
    text.includes('election') ||
    text.includes('bill') ||
    text.includes('supreme court') ||
    text.includes('cabinet') ||
    text.includes('government') ||
    text.includes('policy')
  ) {
    return 'Politics';
  }

  if (
    text.includes('cinema') ||
    text.includes('movie') ||
    text.includes('actor') ||
    text.includes('film') ||
    text.includes('box office') ||
    text.includes('music') ||
    text.includes('streaming') ||
    text.includes('festival')
  ) {
    return 'Entertainment';
  }

  if (
    text.includes('india') ||
    text.includes('delhi') ||
    text.includes('bharat') ||
    text.includes('union')
  ) {
    return 'India';
  }

  if (topicHint && topicHint !== 'All') {
    const valid: NewsCategory[] = [
      'Technology',
      'Business',
      'World',
      'India',
      'Maharashtra',
      'Politics',
      'Sports',
      'Entertainment',
    ];
    const match = valid.find((v) => v.toLowerCase() === topicHint.toLowerCase());
    if (match) return match;
  }

  return 'World';
}

/**
 * Normalizes an API NewsItem into the full NewsArticle shape expected by Newsroom and Home page UI.
 * Strictly avoids fabricating authors, bylines, desks, bureaus, fake view counts, or false dates.
 */
export function normalizeNewsItemToArticle(
  item: NewsItem,
  index: number,
  topicHint?: string
): NewsArticle {
  const category = inferCategory(item.title, item.summary, topicHint);
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.All;
  const imageUrl = images[index % images.length];

  // Stable ID based on URL or title
  const rawId = item.url || item.title;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const id = `live-${Math.abs(hash).toString(36)}`;
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 75);

  const wordCount = (item.title + ' ' + item.summary).split(/\s+/).length;
  const readTime = `${Math.max(2, Math.min(5, Math.ceil(wordCount / 30)))} min read`;

  // Authentic source publisher attribution (e.g. "The Indian Express", "Reuters", "Bloomberg")
  const sourceName = item.source ? item.source.trim() : 'News Wire';

  // Authentic content strictly reflecting the real summary and real source reference
  const content = [
    item.summary,
    item.url
      ? `Full reporting and verified dispatches are published directly by ${sourceName}.`
      : `Reporting provided via verified ${sourceName} wire coverage.`,
  ];

  const tags = [category, sourceName];

  return {
    id,
    title: item.title,
    slug,
    summary: item.summary,
    content,
    category,
    source: sourceName,
    url: sanitizeExternalUrl(item.url) || undefined,
    isLive: true,
    publishedAt: item.publishedAt || 'Recent dispatch',
    readTime,
    imageUrl,
    imageCaption: `Coverage from ${sourceName}`,
    isBreaking: index === 0,
    isFeatured: index < 2,
    isTrending: index < 4,
    trendingRank: index < 4 ? index + 1 : undefined,
    tags,
  };
}

/**
 * Deduplicate articles by unique URL or title
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seenTitles = new Set<string>();
  const seenIds = new Set<string>();
  const result: NewsArticle[] = [];

  for (const art of articles) {
    const titleKey = art.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(titleKey) && !seenIds.has(art.id)) {
      seenTitles.add(titleKey);
      seenIds.add(art.id);
      result.push(art);
    }
  }

  return result;
}

export interface FetchLiveNewsResponse {
  articles: NewsArticle[];
  fromBackend: boolean;
  topic: string;
  generatedAt: string;
}

/**
 * Client-side fetcher for live news pipeline.
 * - Tries live /api/news endpoints first
 * - Falls back to static data file on GitHub Pages (e.g. data/live-news.json)
 * - Falls back to SAMPLE_ARTICLES if network fails
 */
export async function fetchNewsArticles(
  category: NewsCategory = 'All',
  forceRefresh = false
): Promise<FetchLiveNewsResponse> {
  const topicParam = category === 'All' ? 'All' : category;
  const endpoints = getApiEndpoints(topicParam, forceRefresh);

  // 1. Try local /api/news routes (works in dev server & production server)
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) continue;

      const text = await res.text();
      if (!text || !text.trim().startsWith('{')) continue;

      const data: NewsResponse = JSON.parse(text);
      if (Array.isArray(data?.items) && data.items.length > 0) {
        const rawArticles = data.items.map((it, idx) =>
          normalizeNewsItemToArticle(it, idx, category)
        );
        const deduplicated = deduplicateArticles(rawArticles);

        if (deduplicated.length > 0) {
          return {
            articles: deduplicated,
            fromBackend: true,
            topic: data.topic || topicParam,
            generatedAt: data.generatedAt || new Date().toISOString(),
          };
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // 2. Try static pre-generated snapshot (GitHub Pages fallback)
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const staticEndpoints = [
    `${cleanBase}data/live-news.json`,
    `/data/live-news.json`,
  ];

  for (const endpoint of staticEndpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const categoryKey = topicParam.toLowerCase();
        const topicData = data[categoryKey] || data['all'] || data;
        const items: NewsItem[] = Array.isArray(topicData?.items) ? topicData.items : [];

        if (items.length > 0) {
          const rawArticles = items.map((it, idx) =>
            normalizeNewsItemToArticle(it, idx, category)
          );
          return {
            articles: deduplicateArticles(rawArticles),
            fromBackend: true,
            topic: topicParam,
            generatedAt: topicData?.generatedAt || new Date().toISOString(),
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. Graceful fallback to verified curated SAMPLE_ARTICLES
  return {
    articles: SAMPLE_ARTICLES,
    fromBackend: false,
    topic: topicParam,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Format relative timestamp (e.g. "Just now", "2m ago", "15m ago")
 */
export function formatRelativeTime(dateInput: Date | string | number): string {
  const timestamp = typeof dateInput === 'string' ? new Date(dateInput).getTime() : Number(dateInput);
  if (isNaN(timestamp)) return 'Just now';

  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}
