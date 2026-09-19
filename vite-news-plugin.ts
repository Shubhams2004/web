import type { Plugin } from 'vite';
import { fetchLiveNews } from './src/server/newsService';

/**
 * Dev-server middleware exposing GET /api/news?topic=... .
 * Runs in the Vite Node process so the Gemini API key stays server-side.
 */
export function newsApiPlugin(apiKey: string): Plugin {
  return {
    name: 'live-news-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        if (!pathname.includes('/api/news')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');

        try {
          const params = new URL(rawUrl, 'http://localhost').searchParams;
          const topic = params.get('topic') || 'Top World';
          const data = await fetchLiveNews(topic, apiKey || process.env.GEMINI_API_KEY || '');
          res.statusCode = 200;
          res.end(JSON.stringify(data));
        } catch (error) {
          console.warn('[live-news-api] error:', error instanceof Error ? error.message : error);
          // Fall back gracefully with safe structured response so the UI stays functional
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              items: [],
              sources: [],
              topic: 'Live News',
              generatedAt: new Date().toISOString(),
              error: 'Temporarily updating news feeds. Please check back shortly.',
            }),
          );
        }
      });
    },
  };
}
