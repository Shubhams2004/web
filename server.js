import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllCaseStudies, fetchBusinessRssStories, generateCaseStudyWithGroq } from './src/server/caseStudyService.js';
import { fetchLiveNews } from './src/server/newsService.js';
import { INITIAL_TRENDING_CASE_STUDIES, INITIAL_BUSINESS_RSS_STORIES } from './src/data/trendingCaseStudies.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '';

// API: GET /api/business-case-studies
app.get(['/api/business-case-studies', '/web/api/business-case-studies'], async (req, res) => {
  try {
    const caseStudies = await getAllCaseStudies();
    res.json({
      caseStudies,
      count: caseStudies.length,
      groqConnected: Boolean(apiKey),
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
app.get(['/api/business-rss', '/web/api/business-rss'], async (req, res) => {
  try {
    const stories = await fetchBusinessRssStories();
    res.json({ stories, count: stories.length });
  } catch (err) {
    res.json({ stories: INITIAL_BUSINESS_RSS_STORIES, count: INITIAL_BUSINESS_RSS_STORIES.length, fallback: true });
  }
});

// API: POST /api/business-case-studies/generate
app.post(['/api/business-case-studies/generate', '/web/api/business-case-studies/generate'], async (req, res) => {
  try {
    const { headline, source, url, summary } = req.body || {};
    if (!headline) {
      return res.status(400).json({ error: 'Headline is required' });
    }
    const newCaseStudy = await generateCaseStudyWithGroq({ headline, source, url, summary }, apiKey);
    res.json(newCaseStudy);
  } catch (err) {
    res.status(500).json({ error: 'Generation failed', message: err instanceof Error ? err.message : String(err) });
  }
});

// Serve frontend static files
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
  console.log(`Server listening on port ${PORT}`);
});
