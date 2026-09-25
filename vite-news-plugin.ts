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
} from './src/server/caseStudyService';
import { INITIAL_TRENDING_CASE_STUDIES, INITIAL_BUSINESS_RSS_STORIES } from './src/data/trendingCaseStudies';

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

        const effectiveKey = apiKey || process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '';

        // --- Route: GET /api/news/daily-status ---
        if (isNewsStatus) {
          try {
            const status = await getDailyNewsStatus();
            res.statusCode = 200;
            res.end(JSON.stringify(status));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to retrieve daily status', message: String(err) }));
          }
          return;
        }

        // --- Route: POST /api/business-case-studies/generate ---
        if (isGenerateCaseStudy && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const headline = parsed.headline || parsed.title || '';
              const source = parsed.source || 'Financial Media';
              const url = parsed.url || 'https://news.google.com';
              const summary = parsed.summary || '';

              if (!headline) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Headline is required' }));
                return;
              }

              const newCaseStudy = await generateCaseStudyWithGroq(
                { headline, source, url, summary },
                effectiveKey
              );

              res.statusCode = 200;
              res.end(JSON.stringify(newCaseStudy));
            } catch (err) {
              console.warn('[case-study-api] Generate error:', err);
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error: 'Failed to generate case study',
                  message: err instanceof Error ? err.message : String(err),
                })
              );
            }
          });
          return;
        }

        // --- Route: GET /api/business-rss ---
        if (isBusinessRss) {
          try {
            const stories = await fetchBusinessRssStories();
            res.statusCode = 200;
            res.end(JSON.stringify({ stories, count: stories.length, source: 'Business RSS Feed' }));
          } catch (err) {
            console.warn('[case-study-api] RSS fetch error:', err);
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
          try {
            const caseStudies = await getAllCaseStudies();
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                caseStudies,
                count: caseStudies.length,
                groqConnected: Boolean(effectiveKey),
              })
            );
          } catch (err) {
            console.warn('[case-study-api] Get all error:', err);
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
          let topic = 'Top World';
          let force = false;
          try {
            const parsedUrl = new URL(rawUrl, 'http://localhost');
            topic = parsedUrl.searchParams.get('topic') || 'Top World';
            force = parsedUrl.searchParams.get('force') === 'true';
          } catch {
            const match = rawUrl.match(/[?&]topic=([^&]+)/);
            if (match) {
              try {
                topic = decodeURIComponent(match[1]);
              } catch {
                topic = match[1];
              }
            }
            if (rawUrl.includes('force=true')) {
              force = true;
            }
          }

          try {
            const data = await fetchLiveNews(topic, effectiveKey, force);

            if (data && Array.isArray(data.items) && data.items.length > 0) {
              res.statusCode = 200;
              res.end(JSON.stringify(data));
              return;
            }

            const fallback = getClientFallback(topic);
            res.statusCode = 200;
            res.end(JSON.stringify(fallback));
          } catch (error) {
            console.warn('[live-news-api] error in handler:', error instanceof Error ? error.message : error);
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
      } catch (err) {
        console.warn('[vite-news-plugin] Could not generate live-news.json asset:', err);
      }
    },
  };
}
