import type { Plugin } from 'vite';
import {
  fetchLiveNews,
  startDailyNewsScheduler,
  getDailyNewsStatus,
  generateNewsSnapshotJson,
} from './src/server/newsService';
import { getClientFallback } from './src/data/newsFallback';
import {
  getAllCaseStudies,
  fetchBusinessRssStories,
  generateCaseStudyWithGroq,
  generateCaseStudiesSnapshotJson,
} from './src/server/caseStudyService';
import { INITIAL_TRENDING_CASE_STUDIES, INITIAL_BUSINESS_RSS_STORIES } from './src/data/trendingCaseStudies';
import * as fs from 'node:fs';
import * as path from 'node:path';

// In-memory rate limiting map for dev server
const devRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkDevRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = devRateLimits.get(key);
  if (!bucket || now > bucket.resetAt) {
    devRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) {
    return false;
  }
  bucket.count++;
  return true;
}

/**
 * Dev-server middleware exposing:
 * - GET /api/business-case-studies: returns all trending business case studies
 * - GET /api/business-rss: returns recent business stories discovered from the RSS wire
 * - POST /api/business-case-studies/generate: uses Groq API to research & synthesize a new case study
 * - GET /api/news: existing general news API
 *
 * Runs in the Vite Node process so the Groq API key stays strictly server-side.
 */
export function newsApiPlugin(apiKey: string): Plugin {
  return {
    name: 'live-news-and-case-studies-api',
    configureServer(server) {
      // Start daily news scheduler in dev mode
      try {
        startDailyNewsScheduler(() => apiKey || process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '');
      } catch (err) {
        console.warn('[vite-news-plugin] Could not start daily scheduler:', err);
      }

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        // Direct /game path support for Vite dev server base
        if (pathname === '/game' || pathname === '/game/') {
          res.statusCode = 302;
          res.setHeader('Location', '/web/game');
          res.end();
          return;
        }

        // 1. Check if this is an API route we handle
        const isCaseStudies = pathname.endsWith('/api/business-case-studies') || pathname.includes('/api/business-case-studies');
        const isGenerateCaseStudy = pathname.endsWith('/api/business-case-studies/generate') || pathname.includes('/api/business-case-studies/generate');
        const isBusinessRss = pathname.endsWith('/api/business-rss') || pathname.includes('/api/business-rss');
        const isNewsStatus = pathname.endsWith('/api/news/daily-status') || pathname.includes('/api/news/daily-status');
        const isNews = !isNewsStatus && (pathname.endsWith('/api/news') || pathname.includes('/api/news'));

        if (!isCaseStudies && !isGenerateCaseStudy && !isBusinessRss && !isNews && !isNewsStatus) {
          return next();
        }

        // Always ensure application/json content-type and security/cache headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        const effectiveKey = apiKey || process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '';

        // --- Route: GET /api/news/daily-status ---
        if (isNewsStatus) {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = 405;
            res.setHeader('Allow', 'GET, HEAD');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          try {
            const status = await getDailyNewsStatus();
            res.statusCode = 200;
            res.end(JSON.stringify(status));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to retrieve daily status' }));
          }
          return;
        }

        // --- Route: POST /api/business-case-studies/generate ---
        if (isGenerateCaseStudy) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Allow', 'POST');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          // Rate limit: max 5 generation requests per 15 minutes
          if (!checkDevRateLimit('dev:generate', 5, 15 * 60 * 1000)) {
            res.statusCode = 429;
            res.end(JSON.stringify({ error: 'Generation quota exceeded. Please wait 15 minutes.' }));
            return;
          }

          let body = '';
          let bodySize = 0;
          const MAX_BODY_SIZE = 32 * 1024; // 32 KB limit

          req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > MAX_BODY_SIZE) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Payload too large (max 32KB)' }));
              req.destroy();
              return;
            }
            body += chunk;
          });

          req.on('end', async () => {
            if (bodySize > MAX_BODY_SIZE) return;

            try {
              let parsed: Record<string, unknown> = {};
              try {
                parsed = body ? JSON.parse(body) : {};
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
                return;
              }

              const headline = typeof parsed.headline === 'string' ? parsed.headline.trim() : '';
              const source = typeof parsed.source === 'string' ? parsed.source.trim() : 'Financial Media';
              const url = typeof parsed.url === 'string' ? parsed.url.trim() : 'https://news.google.com';
              const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';

              // Strict input constraints
              if (!headline || headline.length < 5 || headline.length > 200) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Headline must be between 5 and 200 characters' }));
                return;
              }
              if (source.length > 100) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Source exceeds 100 characters limit' }));
                return;
              }
              if (summary.length > 1000) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Summary exceeds 1000 characters limit' }));
                return;
              }
              if (url && !/^https:\/\//i.test(url)) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'URL must use safe HTTPS protocol' }));
                return;
              }

              const newCaseStudy = await generateCaseStudyWithGroq(
                { headline, source, url, summary },
                effectiveKey
              );

              res.statusCode = 200;
              res.end(JSON.stringify(newCaseStudy));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Case study generation unavailable' }));
            }
          });
          return;
        }

        // --- Route: GET /api/business-rss ---
        if (isBusinessRss) {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = 405;
            res.setHeader('Allow', 'GET, HEAD');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          try {
            // Public callers cannot force cache bypass
            const stories = await fetchBusinessRssStories(false);
            res.statusCode = 200;
            res.end(JSON.stringify({ stories, count: stories.length, source: 'Business RSS Feed' }));
          } catch {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                stories: INITIAL_BUSINESS_RSS_STORIES,
                count: INITIAL_BUSINESS_RSS_STORIES.length,
                fallback: true,
              })
            );
          }
          return;
        }

        // --- Route: GET /api/business-case-studies ---
        if (isCaseStudies) {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = 405;
            res.setHeader('Allow', 'GET, HEAD');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          try {
            const caseStudies = await getAllCaseStudies(false);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                caseStudies,
                count: caseStudies.length,
                groqConnected: Boolean(effectiveKey),
              })
            );
          } catch {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                caseStudies: INITIAL_TRENDING_CASE_STUDIES,
                count: INITIAL_TRENDING_CASE_STUDIES.length,
                fallback: true,
              })
            );
          }
          return;
        }

        // --- Route: GET /api/news (Legacy or General News Wire) ---
        if (isNews) {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = 405;
            res.setHeader('Allow', 'GET, HEAD');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let topic = 'Top World';
          try {
            const parsedUrl = new URL(rawUrl, 'http://localhost');
            topic = (parsedUrl.searchParams.get('topic') || 'Top World').slice(0, 100);
          } catch {
            const match = rawUrl.match(/[?&]topic=([^&]+)/);
            if (match) {
              try {
                topic = decodeURIComponent(match[1]).slice(0, 100);
              } catch {
                topic = match[1].slice(0, 100);
              }
            }
          }

          try {
            // Public callers cannot force cache bypass
            const data = await fetchLiveNews(topic, effectiveKey, false);

            if (data && Array.isArray(data.items) && data.items.length > 0) {
              res.statusCode = 200;
              res.end(JSON.stringify(data));
              return;
            }

            const fallback = getClientFallback(topic);
            res.statusCode = 200;
            res.end(JSON.stringify(fallback));
          } catch {
            try {
              const fallback = getClientFallback(topic);
              res.statusCode = 200;
              res.end(JSON.stringify(fallback));
            } catch {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  items: [
                    {
                      title: `Latest Market & Intelligence Overview for ${topic}`,
                      summary: 'Verified reporting and analytical insights are being compiled across active market feeds.',
                      source: 'Research Desk',
                      publishedAt: 'Just now',
                      url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
                    },
                  ],
                  sources: [{ title: 'Google News', uri: 'https://news.google.com' }],
                  topic,
                  generatedAt: new Date().toISOString(),
                  cached: true,
                })
              );
            }
          }
        }
      });
    },
    async generateBundle() {
      try {
        const effectiveKey = apiKey || process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '';
        const snapshot = await generateNewsSnapshotJson(effectiveKey);
        this.emitFile({
          type: 'asset',
          fileName: 'data/live-news.json',
          source: JSON.stringify(snapshot, null, 2),
        });

        // Also emit business case studies & RSS snapshots for GitHub Pages
        const caseStudySnapshot = await generateCaseStudiesSnapshotJson();
        this.emitFile({
          type: 'asset',
          fileName: 'data/business-case-studies.json',
          source: JSON.stringify({
            caseStudies: caseStudySnapshot.caseStudies,
            count: caseStudySnapshot.caseStudies.length,
            groqConnected: Boolean(effectiveKey),
            generatedAt: caseStudySnapshot.generatedAt,
          }, null, 2),
        });

        this.emitFile({
          type: 'asset',
          fileName: 'data/business-rss.json',
          source: JSON.stringify({
            stories: caseStudySnapshot.stories,
            count: caseStudySnapshot.stories.length,
            source: 'Business RSS Feed',
            generatedAt: caseStudySnapshot.generatedAt,
          }, null, 2),
        });

        // Also write to public/data if public folder exists for dev
        try {
          const publicDataDir = path.resolve(process.cwd(), 'public', 'data');
          if (!fs.existsSync(publicDataDir)) {
            fs.mkdirSync(publicDataDir, { recursive: true });
          }
          fs.writeFileSync(
            path.join(publicDataDir, 'business-case-studies.json'),
            JSON.stringify({
              caseStudies: caseStudySnapshot.caseStudies,
              count: caseStudySnapshot.caseStudies.length,
              groqConnected: Boolean(effectiveKey),
              generatedAt: caseStudySnapshot.generatedAt,
            }, null, 2)
          );
          fs.writeFileSync(
            path.join(publicDataDir, 'business-rss.json'),
            JSON.stringify({
              stories: caseStudySnapshot.stories,
              count: caseStudySnapshot.stories.length,
              source: 'Business RSS Feed',
              generatedAt: caseStudySnapshot.generatedAt,
            }, null, 2)
          );
        } catch {
          // Non-fatal
        }
      } catch (err) {
        console.warn('[vite-news-plugin] Could not generate snapshots:', err);
      }
    },
  };
}
