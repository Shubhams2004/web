import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Copy,
  Check,
  Share2,
  FileText,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { BusinessCaseStudy } from '../types';

interface CaseStudyDetailModalProps {
  caseStudy: BusinessCaseStudy | null;
  onClose: () => void;
}

export const CaseStudyDetailModal: React.FC<CaseStudyDetailModalProps> = ({
  caseStudy,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!caseStudy) return null;

  const handleCopySummary = async () => {
    const text = `BUSINESS CASE STUDY: ${caseStudy.company}
Title: ${caseStudy.title}
Industry: ${caseStudy.industry}
Date: ${caseStudy.date}

WHAT HAPPENED:
${caseStudy.whatHappened}

BUSINESS PROBLEM OR OPPORTUNITY:
${caseStudy.businessProblemOrOpportunity}

MARKET CONTEXT:
${caseStudy.marketContext}

STRATEGY / ACTION TAKEN:
${caseStudy.strategyActionTaken}

KEY RESULTS:
${caseStudy.importantDataOrResults.summary}
${caseStudy.importantDataOrResults.metrics.map((m) => `• ${m.label}: ${m.value} (${m.change || ''})`).join('\n')}

KEY STRATEGIC LESSONS:
${caseStudy.keyLessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}

SOURCES:
${caseStudy.sources.map((s) => `• ${s.title} (${s.publisher || 'Source'}): ${s.url}`).join('\n')}
`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${caseStudy.title}
**Company:** ${caseStudy.company} ${caseStudy.ticker ? `(${caseStudy.ticker})` : ''}  
**Industry:** ${caseStudy.industry}  
**Date:** ${caseStudy.date} | **Status:** ${caseStudy.status}  

---

## 1. What Happened
${caseStudy.whatHappened}

## 2. Business Problem or Opportunity
${caseStudy.businessProblemOrOpportunity}

## 3. Market Context
${caseStudy.marketContext}

## 4. Strategy / Action Taken
${caseStudy.strategyActionTaken}

## 5. Important Data & Results
${caseStudy.importantDataOrResults.summary}

| Metric | Value | Change / Context |
|---|---|---|
${caseStudy.importantDataOrResults.metrics.map((m) => `| ${m.label} | ${m.value} | ${m.change || '-'} |`).join('\n')}

## 6. Key Lessons
${caseStudy.keyLessons.map((l) => `- ${l}`).join('\n')}

## 7. Sources
${caseStudy.sources.map((s) => `- [${s.title}](${s.url}) — *${s.publisher || 'Publisher'}*`).join('\n')}

---
*Synthesized and researched by Shubham Sonale — Research Analyst*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseStudy.id}-case-study.md`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('Markdown exported successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div
      id="case-study-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="case-study-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 z-10 shrink-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>{caseStudy.company}</span>
                {caseStudy.ticker && <span className="opacity-75 font-mono">({caseStudy.ticker})</span>}
              </span>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {caseStudy.industry}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>{caseStudy.status}</span>
              </span>

              {caseStudy.generatedByGroq && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>Groq AI Researched</span>
                </span>
              )}
            </div>

            <h2
              id="case-study-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug"
            >
              {caseStudy.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{caseStudy.date}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{caseStudy.readTime}</span>
              </span>
              {caseStudy.rssHeadlineReference && (
                <>
                  <span>·</span>
                  <span className="text-slate-400 truncate max-w-xs hidden sm:inline" title={caseStudy.rssHeadlineReference}>
                    Catalyst: {caseStudy.rssHeadlineReference}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            id="close-case-study-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close case study"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-slate-800 text-sm sm:text-base leading-relaxed">
          {exportNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{exportNotice}</span>
            </div>
          )}

          {/* 1. What Happened */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3>1. What Happened (The Catalyst)</h3>
            </div>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
              {caseStudy.whatHappened}
            </p>
          </section>

          {/* 2. Business Problem or Opportunity */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3>2. Business Problem or Opportunity</h3>
            </div>
            <p className="text-slate-700">
              {caseStudy.businessProblemOrOpportunity}
            </p>
          </section>

          {/* 3. Market Context */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h3>3. Market Context & Competitive Forces</h3>
            </div>
            <p className="text-slate-700">
              {caseStudy.marketContext}
            </p>
          </section>

          {/* 4. Strategy / Action Taken */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <h3>4. Strategy & Action Taken</h3>
            </div>
            <p className="text-slate-700 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 text-slate-800">
              {caseStudy.strategyActionTaken}
            </p>
          </section>

          {/* 5. Important Data or Results */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3>5. Important Data & Quantitative Results</h3>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {caseStudy.importantDataOrResults.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div className="mt-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {metric.value}
                    </span>
                    {metric.change && (
                      <span
                        className={`block text-xs font-semibold mt-0.5 ${
                          metric.isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {metric.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 bg-slate-100/70 p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-800 font-semibold">Results Summary: </strong>
              {caseStudy.importantDataOrResults.summary}
            </p>
          </section>

          {/* 6. Key Lessons */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <h3>6. Key Lessons & Strategic Takeaways</h3>
            </div>
            <ul className="space-y-2.5">
              {caseStudy.keyLessons.map((lesson, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-slate-800 text-xs sm:text-sm"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. Sources with links */}
          <section className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <h3>7. Verified Sources & Attributions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {caseStudy.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      {source.publisher || 'News Source'}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {source.title}
                    </p>
                    {source.date && (
                      <span className="text-[10px] text-slate-400 block">{source.date}</span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Synthesis</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Markdown</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
