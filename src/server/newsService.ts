import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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

export interface NewsResult {
  items: NewsItem[];
  sources: NewsSource[];
  topic: string;
  generatedAt: string;
  cached?: boolean;
}

const MODEL = 'gemini-flash-latest';
const MAX_ITEMS = 6;

// Only call Gemini once per day per topic. Everything else is served from cache.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_FILE = path.join(os.tmpdir(), 'v0-live-news-cache.json');

interface CacheEntry {
  data: NewsResult;
  fetchedAt: number;
}
type CacheStore = Record<string, CacheEntry>;

let memoryCache: CacheStore | null = null;
const inFlight = new Map<string, Promise<NewsResult>>();

/**
 * Public entry point. Returns cached news when it is less than a day old and
 * only calls Gemini when the cache is missing or stale. On a failed refresh
 * (e.g. rate limiting) it falls back to the last cached result so the site
 * keeps working instead of surfacing an error.
 */
export async function fetchLiveNews(topicInput: string, apiKey: string): Promise<NewsResult> {
  const topic = normalizeTopic(topicInput);
  const key = topic.toLowerCase();

  const store = await loadCache();
  const entry = store[key];
  const now = Date.now();

  if (entry && now - entry.fetchedAt < ONE_DAY_MS) {
    return { ...entry.data, cached: true };
  }

  // Dedupe concurrent requests for the same topic into a single Gemini call.
  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = generateFromGemini(topic, apiKey)
    .then(async (fresh) => {
      store[key] = { data: fresh, fetchedAt: Date.now() };
      memoryCache = store;
      await saveCache(store);
      return fresh;
    })
    .catch((error) => {
      // Serve stale data rather than breaking the page when the refresh fails.
      if (entry) return { ...entry.data, cached: true };
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

function normalizeTopic(topicInput: string): string {
  return (topicInput || 'top world').trim().slice(0, 120) || 'top world';
}

async function loadCache(): Promise<CacheStore> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CacheStore;
    memoryCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

async function saveCache(store: CacheStore): Promise<void> {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(store), 'utf8');
  } catch {
    // A failed disk write is non-fatal; the in-memory cache still applies.
  }
}

/**
 * Fetches genuinely live news by grounding Gemini with Google Search.
 * Grounding cannot be combined with a JSON response schema, so we ask the
 * model for a strict JSON array in plain text and parse it defensively.
 */
async function generateFromGemini(topic: string, apiKey: string): Promise<NewsResult> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = [
    `You are a live news desk. Using Google Search, find the ${MAX_ITEMS} most important and most recent news stories about: "${topic}".`,
    'Only include stories published within roughly the last 48 hours when possible, prioritizing the freshest reporting.',
    'Respond with ONLY a raw JSON array (no markdown, no code fences, no commentary).',
    'Each element must be an object with exactly these keys:',
    '- "title": concise headline (string)',
    '- "summary": 1-2 sentence neutral summary (string)',
    '- "source": the publication or outlet name (string)',
    '- "publishedAt": human-readable recency such as "2 hours ago" or a date; empty string if unknown',
    '- "url": direct link to the article if available; empty string otherwise',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    },
  });

  const text = response.text ?? '';
  const items = parseNewsItems(text);

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = dedupeSources(
    chunks
      .filter((chunk) => chunk.web?.uri)
      .map((chunk) => ({
        title: chunk.web?.title || chunk.web?.uri || 'Source',
        uri: chunk.web!.uri as string,
      })),
  );

  return {
    items,
    sources,
    topic,
    generatedAt: new Date().toISOString(),
    cached: false,
  };
}

function parseNewsItems(text: string): NewsItem[] {
  const jsonText = extractJsonArray(text);
  if (!jsonText) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      title: asString(entry.title),
      summary: asString(entry.summary),
      source: asString(entry.source),
      publishedAt: asString(entry.publishedAt) || undefined,
      url: asString(entry.url) || undefined,
    }))
    .filter((item) => item.title.length > 0)
    .slice(0, MAX_ITEMS);
}

function extractJsonArray(text: string): string | null {
  const withoutFences = text.replace(/```(?:json)?/gi, '').trim();
  const start = withoutFences.indexOf('[');
  const end = withoutFences.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  return withoutFences.slice(start, end + 1);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function dedupeSources(sources: NewsSource[]): NewsSource[] {
  const seen = new Set<string>();
  const result: NewsSource[] = [];
  for (const source of sources) {
    if (seen.has(source.uri)) continue;
    seen.add(source.uri);
    result.push(source);
  }
  return result.slice(0, 8);
}
