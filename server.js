import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllCaseStudies, fetchBusinessRssStories, generateCaseStudyWithGroq } from './src/server/caseStudyService.js';
import { fetchLiveNews, startDailyNewsScheduler, getDailyNewsStatus } from './src/server/newsService.js';
import { INITIAL_TRENDING_CASE_STUDIES, INITIAL_BUSINESS_RSS_STORIES } from './src/data/trendingCaseStudies.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Strict body size limit: 32 KB prevents memory exhaustion and oversized payloads
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

// HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https://images.unsplash.com https://news.google.com data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'self' https://*.google.com https://*.run.app;"
  );
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Explicit CORS Policy
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedHost = req.headers.host;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.host === allowedHost || parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1') {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } catch {
      // Ignore invalid origin header
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Lightweight In-Memory Sliding-Window Rate Limiter
const rateLimits = new Map();

function checkRateLimit(ip, maxRequests, windowMs) {
  const now = Date.now();
  const bucket = rateLimits.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) {
    return false;
  }
  bucket.count++;
  return true;
}

// Cleanup expired buckets every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits.entries()) {
    if (now > val.resetAt) rateLimits.delete(key);
  }
}, 10 * 60 * 1000);

const getGroqApiKey = () => process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '';

// Method enforcement helper
function enforceGet(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  next();
}

// API: GET /api/business-case-studies
app.all(['/api/business-case-studies', '/web/api/business-case-studies'], enforceGet, async (req, res) => {
  const ip = req.ip || '127.0.0.1';
  if (!checkRateLimit(`case-studies:${ip}`, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
  }

  try {
    // Public callers cannot force cache bypass
    const caseStudies = await getAllCaseStudies(false);
    res.json({
      caseStudies,
      count: caseStudies.length,
      groqConnected: Boolean(getGroqApiKey()),
    });
  } catch (err) {
    res.json({
      caseStudies: INITIAL_TRENDING_CASE_STUDIES,
      count: INITIAL_TRENDING_CASE_STUDIES.length,
      fallback: true,
    });
  }
});

// API: GET /api/business-rss
app.all(['/api/business-rss', '/web/api/business-rss'], enforceGet, async (req, res) => {
  const ip = req.ip || '127.0.0.1';
  if (!checkRateLimit(`business-rss:${ip}`, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
  }

  try {
    const stories = await fetchBusinessRssStories(false);
    res.json({ stories, count: stories.length });
  } catch (err) {
    res.json({ stories: INITIAL_BUSINESS_RSS_STORIES, count: INITIAL_BUSINESS_RSS_STORIES.length, fallback: true });
  }
});

// API: GET /api/news (Live News Wire)
app.all(['/api/news', '/web/api/news'], enforceGet, async (req, res) => {
  const ip = req.ip || '127.0.0.1';
  if (!checkRateLimit(`news:${ip}`, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
  }

  try {
    const topicRaw = typeof req.query.topic === 'string' ? req.query.topic.slice(0, 100) : 'All';
    // Public requests cannot arbitrarily force cache refresh
    const data = await fetchLiveNews(topicRaw, getGroqApiKey(), false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live news' });
  }
});

// API: GET /api/news/daily-status
app.all(['/api/news/daily-status', '/web/api/news/daily-status'], enforceGet, async (req, res) => {
  try {
    const status = await getDailyNewsStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get daily news status' });
  }
});

// API: POST /api/business-case-studies/generate
// Protected against AI/API abuse: strictly authenticated in production, rate-limited in dev, payload validated
app.all(['/api/business-case-studies/generate', '/web/api/business-case-studies/generate'], async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminSecret = process.env.ADMIN_API_KEY || process.env.AI_GENERATION_SECRET;
  const authHeader = req.headers.authorization || req.headers['x-admin-key'];

  // In production or when an admin secret is configured, require authentication
  if (IS_PROD || adminSecret) {
    const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
    if (!adminSecret || token !== adminSecret) {
      return res.status(403).json({ error: 'Access denied: Case study generation is restricted' });
    }
  }

  // Strict rate limit: max 5 generations per 15 minutes per IP
  const ip = req.ip || '127.0.0.1';
  if (!checkRateLimit(`generate:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Generation quota exceeded. Please wait 15 minutes.' });
  }

  try {
    const body = req.body || {};
    const headline = typeof body.headline === 'string' ? body.headline.trim() : '';
    const source = typeof body.source === 'string' ? body.source.trim() : 'Financial Media';
    const url = typeof body.url === 'string' ? body.url.trim() : 'https://news.google.com';
    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';

    // Field-level length and format constraints
    if (!headline || headline.length < 5 || headline.length > 200) {
      return res.status(400).json({ error: 'Headline must be between 5 and 200 characters' });
    }
    if (source.length > 100) {
      return res.status(400).json({ error: 'Source name exceeds maximum length of 100 characters' });
    }
    if (summary.length > 1000) {
      return res.status(400).json({ error: 'Summary exceeds maximum length of 1000 characters' });
    }
    if (url && !/^https:\/\//i.test(url)) {
      return res.status(400).json({ error: 'URL must use safe HTTPS protocol' });
    }

    const newCaseStudy = await generateCaseStudyWithGroq({ headline, source, url, summary }, getGroqApiKey());
    res.json(newCaseStudy);
  } catch (err) {
    // Never expose internal provider errors or stack traces to clients
    res.status(500).json({ error: 'Case study generation unavailable' });
  }
});

// Serve frontend static files from built dist output
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use('/web', express.static(publicPath));
app.use(express.static(distPath));
app.use('/web', express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Server listening on port ${PORT}`);
  try {
    startDailyNewsScheduler(getGroqApiKey);
    console.log('[server] Daily news background scheduler activated.');
  } catch (err) {
    console.warn('[server] Could not initialize daily scheduler:', err);
  }
});
