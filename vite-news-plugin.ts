import type { Plugin } from 'vite';
import { fetchLiveNews } from './src/server/newsService';
import { getClientFallback } from './src/data/newsFallback';

/**
 * Dev-server middleware exposing GET /api/news?topic=... (and with base paths like /web/api/news).
 * Runs in the Vite Node process so the Gemini API key stays server-side.
 * Guarantees a valid JSON NewsResponse object even in case of timeouts, exceptions, or bad input.
 */
export function newsApiPlugin(apiKey: string): Plugin {
  return {
    name: 'live-news-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        // Match /api/news, /web/api/news, or any subpath prefix
        if (!pathname.endsWith('/api/news') && !pathname.includes('/api/news')) {
          return next();
        }

        // Always ensure application/json content-type and security/cache headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        let topic = 'Top World';
        try {
          const parsedUrl = new URL(rawUrl, 'http://localhost');
          topic = parsedUrl.searchParams.get('topic') || 'Top World';
        } catch {
          // If URL parsing fails, extract topic manually or use default
          const match = rawUrl.match(/[?&]topic=([^&]+)/);
          if (match) {
            try {
              topic = decodeURIComponent(match[1]);
            } catch {
              topic = match[1];
            }
          }
        }

        try {
          const data = await fetchLiveNews(topic, apiKey || process.env.GEMINI_API_KEY || '');
          
          // Verify returned data structure has valid items array
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify(data));
            return;
          }

          // If items is empty or invalid, provide reliable curated fallback
          const fallback = getClientFallback(topic);
          res.statusCode = 200;
          res.end(JSON.stringify(fallback));
        } catch (error) {
          console.warn('[live-news-api] error in handler:', error instanceof Error ? error.message : error);
          
          // Guaranteed safe valid NewsResponse structure with non-empty items
          // ensuring the UI never breaks, hangs, or renders undefined errors
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
              }),
            );
          }
        }
      });
    },
  };
}
