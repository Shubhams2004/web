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

        if (!pathname.endsWith('/api/news')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');

        if (!apiKey) {
          res.statusCode = 503;
          res.end(
            JSON.stringify({
              error:
                'GEMINI_API_KEY is not configured. Add it in Project Settings to enable live news.',
            }),
          );
          return;
        }

        try {
          const params = new URL(rawUrl, 'http://localhost').searchParams;
          const topic = params.get('topic') || 'top world';
          const data = await fetchLiveNews(topic, apiKey);
          res.statusCode = 200;
          res.end(JSON.stringify(data));
        } catch (error) {
          console.log('[v0] live-news-api error:', error instanceof Error ? error.message : error);
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to fetch live news.',
            }),
          );
        }
      });
    },
  };
}
