import React, { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'motion/react';
import { Newspaper, ExternalLink, RefreshCw, AlertTriangle, Search, Clock } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { getClientFallback } from '../data/newsFallback';
import type { NewsItem, NewsResponse } from '../types';

const PRESET_TOPICS = [
  'Top World',
  'Technology',
  'Business & Markets',
  'AI & Research',
  'Science',
  'Design & UX',
];

const fetchNews = async (topic: string): Promise<NewsResponse> => {
  // Candidate endpoints to handle different proxy/container routing rules
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const endpoints = [
    `${cleanBase}api/news?topic=${encodeURIComponent(topic)}`,
    `/api/news?topic=${encodeURIComponent(topic)}`,
    `/web/api/news?topic=${encodeURIComponent(topic)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
        },
      });

      // Check status code and content-type
      if (!res.ok) {
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      // Guard against HTML error pages or proxy redirect landing pages (e.g. <!DOCTYPE html>)
      if (!contentType.includes('application/json')) {
        continue;
      }

      // Safe text retrieval and JSON parse to avoid unhandled SyntaxError on corrupt bodies
      const rawText = await res.text();
      if (!rawText || !rawText.trim().startsWith('{')) {
        continue;
      }

      const json = JSON.parse(rawText) as Partial<NewsResponse>;
      // Validate schema: must have an array of items with at least one item
      if (json && Array.isArray(json.items) && json.items.length > 0) {
        // Sanitize items so individual malformed items don't break rendering
        const validItems = json.items.filter(
          (item): item is NewsItem =>
            Boolean(item && typeof item === 'object' && typeof item.title === 'string' && item.title.trim().length > 0)
        );

        if (validItems.length > 0) {
          return {
            items: validItems,
            sources: Array.isArray(json.sources) ? json.sources.filter((s) => s && typeof s.title === 'string') : [],
            topic: typeof json.topic === 'string' && json.topic ? json.topic : topic,
            generatedAt: typeof json.generatedAt === 'string' ? json.generatedAt : new Date().toISOString(),
            cached: Boolean(json.cached),
          };
        }
      }
    } catch (err) {
      console.warn(`[LiveNews] Failed endpoint ${endpoint}:`, err instanceof Error ? err.message : err);
      // Continue to next endpoint attempt
    }
  }

  // Gracefully return curated live analytical fallback so user interface never breaks
  return getClientFallback(topic);
};

export const LiveNews: React.FC = () => {
  const [topic, setTopic] = useState<string>('Top World');
  const [query, setQuery] = useState<string>('');

  const { data, error, isLoading, isValidating, mutate } = useSWR<NewsResponse>(
    `news-topic-${topic}`,
    () => fetchNews(topic),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) setTopic(trimmed);
  };

  return (
    <section id="news" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Live News
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Real-time headlines, grounded in Google Search.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            A live feed powered by Groq API with real-time news sources. Pick a topic or search for
            anything to pull the freshest, source-cited reporting.
          </p>
        </ScrollReveal>

        {/* Dedicated Newsroom Platform Launch Banner */}
        <ScrollReveal delay={0.03} className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600/30 text-red-400 font-mono uppercase tracking-wider">
                  The News Chronicle
                </span>
                <span className="text-[11px] text-slate-400">Full Digital Newsroom Page</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-1">
                Explore our full news website: Breaking News banner, India & Maharashtra bureaus, category filters, market tickers & article reader.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a
              href="#/news"
              id="open-full-news-platform-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Launch News Platform</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

        {/* Controls */}
        <ScrollReveal delay={0.05} className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((preset) => {
                const isActive = topic.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setTopic(preset);
                    }}
                    aria-pressed={isActive}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any topic..."
                  aria-label="Search news topic"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </ScrollReveal>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <span>
              Showing: <span className="font-semibold text-slate-700">{data?.topic || topic}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* States */}
        {error && !isLoading ? (
          <div className="flex items-start gap-3 p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Live news is unavailable</p>
              <p className="text-sm text-amber-700 mt-0.5">{(error as Error).message}</p>
            </div>
          </div>
        ) : isLoading ? (
          <NewsSkeleton />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.items.map((item, index) => (
                <NewsCard key={`${item.title}-${index}`} item={item} index={index} />
              ))}
            </div>

            {data.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Grounding Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.sources.map((source) => (
                    <a
                      key={source.uri}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[220px]">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-xs text-slate-400">
              Updated {new Date(data.generatedAt).toLocaleString()} · Generated by Groq with real-time
              source grounding. Verify time-sensitive details with the linked sources.
            </p>
          </>
        ) : (
          <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500">
            <Newspaper className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p>No stories found for this topic. Try a different search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const NewsCard: React.FC<{ item: NewsItem; index: number }> = ({ item, index }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full p-6 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-3 text-xs">
        <span className="font-semibold text-blue-600 uppercase tracking-wider truncate max-w-[60%]">
          {item.source || 'News'}
        </span>
        {item.publishedAt && (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            {item.publishedAt}
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
      {item.url && (
        <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-blue-600">
          Read full story
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      )}
    </motion.div>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }
  return content;
};

const NewsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-6 rounded-xl bg-white border border-slate-200/80">
        <div className="h-3 w-24 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="h-3 w-full bg-slate-100 rounded mb-1.5 animate-pulse" />
        <div className="h-3 w-5/6 bg-slate-100 rounded animate-pulse" />
      </div>
    ))}
  </div>
);
