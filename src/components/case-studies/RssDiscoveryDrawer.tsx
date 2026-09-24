import React, { useState } from 'react';
import {
  Rss,
  Sparkles,
  ExternalLink,
  Clock,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { BusinessRssStory, BusinessCaseStudy } from '../../types';

interface RssDiscoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: BusinessRssStory[];
  isLoadingStories: boolean;
  onRefreshStories: () => void;
  onGenerateCaseStudy: (story: {
    headline: string;
    source?: string;
    url?: string;
    summary?: string;
  }) => Promise<BusinessCaseStudy>;
  onCaseStudyGenerated: (newStudy: BusinessCaseStudy) => void;
  groqConnected: boolean;
}

export const RssDiscoveryDrawer: React.FC<RssDiscoveryDrawerProps> = ({
  isOpen,
  onClose,
  stories,
  isLoadingStories,
  onRefreshStories,
  onGenerateCaseStudy,
  onCaseStudyGenerated,
  groqConnected,
}) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [customHeadline, setCustomHeadline] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('');
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (
    storyId: string,
    headline: string,
    source?: string,
    url?: string,
    summary?: string
  ) => {
    try {
      setGeneratingId(storyId);
      setErrorMsg(null);
      setGenerationStep('Connecting to secure Groq research backend...');

      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Researching company filings, competitors & market context...');
      }, 900);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Synthesizing strategic decisions, data metrics & key lessons...');
      }, 2400);

      const newStudy = await onGenerateCaseStudy({
        headline,
        source: source || 'Business Wire',
        url: url || 'https://news.google.com',
        summary,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setGenerationStep('Complete! Opening generated case study...');
      setTimeout(() => {
        setGeneratingId(null);
        setGenerationStep('');
        onCaseStudyGenerated(newStudy);
        onClose();
      }, 400);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      setGeneratingId(null);
      setGenerationStep('');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;
    handleGenerate(
      'custom-input',
      customHeadline.trim(),
      customSource.trim() || 'Custom Inquiry',
      'https://news.google.com'
    );
  };

  return (
    <div
      id="rss-discovery-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="rss-discovery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rss-modal-title"
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Business RSS Feed</span>
              </span>
              {groqConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Groq AI Ready</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <span>Server-Side Synthesis Ready</span>
                </span>
              )}
            </div>

            <h2 id="rss-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Discover Recent Business Stories
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Select any live business story discovered from our RSS feeds. The secure Groq backend will research publicly available information and synthesize an original business case study.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Generation Banner */}
          {generatingId && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md border border-blue-700/50 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-300 animate-spin" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white">Synthesizing Business Case Study</h4>
                <p className="text-xs text-blue-200 mt-0.5">{generationStep}</p>
              </div>
            </div>
          )}

          {/* Custom Story Input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Or Research Any Custom Business Catalyst</span>
              </h3>
            </div>
            <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g. Apple unveils M4 Max chips and AI server deployment strategy"
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                disabled={Boolean(generatingId)}
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!customHeadline.trim() || Boolean(generatingId)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Case Study</span>
              </button>
            </form>
          </div>

          {/* Stories List Controls */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Wire Dispatches ({stories.length})
            </h3>
            <button
              type="button"
              onClick={onRefreshStories}
              disabled={isLoadingStories || Boolean(generatingId)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStories ? 'animate-spin' : ''}`} />
              <span>Refresh RSS</span>
            </button>
          </div>

          {/* Stories Grid */}
          <div className="space-y-3">
            {stories.map((story) => {
              const isThisGenerating = generatingId === story.id;
              return (
                <div
                  key={story.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {story.source}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.publishedAt}</span>
                      </span>
                      {story.suggestedCompany && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {story.suggestedCompany}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {story.title}
                    </h4>

                    {story.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {story.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="View original news source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      disabled={Boolean(generatingId)}
                      onClick={() =>
                        handleGenerate(
                          story.id,
                          story.title,
                          story.source,
                          story.url,
                          story.summary
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      {isThisGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                          <span>Research Story</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Security Notice: Groq API key is evaluated server-side and never exposed to client browsers.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
