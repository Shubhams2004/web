import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  Cpu,
  GitBranch,
  Milestone,
  Zap,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  FileText,
  Home,
} from 'lucide-react';
import { Project } from '../types';
import { updatePageSEO, SECTION_SEO_PRESETS } from '../utils/seo';
import { JsonFullScreenViewer } from './JsonFullScreenViewer';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface CaseStudyPageProps {
  project: Project;
  onBack: () => void;
  initialTab?: 'case-study' | 'json';
}

export const CaseStudyPage: React.FC<CaseStudyPageProps> = ({
  project,
  onBack,
  initialTab = 'case-study',
}) => {
  const [activeTab, setActiveTab] = useState<'case-study' | 'json'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const desc = project.fullOverview || project.briefDescription;
    const projectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}#/case-study/${project.id}`
        : `https://shubhamsonale.com/#/case-study/${project.id}`;

    updatePageSEO({
      title: `${project.title} | Case Study`,
      description: desc.slice(0, 160),
      canonicalUrl: projectUrl,
      keywords: [
        project.categoryTag,
        'Case Study',
        ...project.methodsUsed,
        'Shubham Sonale',
      ],
      alternates: [
        { lang: 'en', href: projectUrl },
        { lang: 'x-default', href: projectUrl },
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: project.title,
        description: desc,
        mainEntityOfPage: projectUrl,
        author: {
          '@type': 'Person',
          name: 'Shubham Sonale',
        },
        genre: project.categoryTag,
        keywords: project.methodsUsed.join(', '),
      },
    });

    return () => {
      updatePageSEO(SECTION_SEO_PRESETS.portfolio);
    };
  }, [project]);

  const handleCopyJson = () => {
    if (!project?.rawSpecification) return;
    navigator.clipboard.writeText(JSON.stringify(project.rawSpecification, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!project?.rawSpecification) return;
    const jsonStr = JSON.stringify(project.rawSpecification, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.id}-spec.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.briefDescription,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Back & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
              title="Return to portfolio homepage"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
              <span className="hidden md:inline hover:text-slate-200 cursor-pointer" onClick={onBack}>
                Portfolio
              </span>
              <span className="hidden md:inline text-slate-600">/</span>
              <span className="truncate font-medium text-slate-200 text-xs sm:text-sm">
                {project.title}
              </span>
            </div>
          </div>

          {/* Center/Right: Tab Switchers & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tabs */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('case-study')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'case-study'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Case Study</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Spec</span>
              </button>
            </div>

            {/* Actions */}
            {project.rawSpecification && (
              <>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy JSON to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden md:inline text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden md:inline font-medium">Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download JSON specification file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline font-medium">Download</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share or copy case study link"
            >
              {shared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline text-emerald-400 font-medium">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline font-medium">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'json' ? (
        <div className="flex-1 w-full h-[calc(100vh-57px)] min-h-[500px]">
          <JsonFullScreenViewer
            data={project.rawSpecification}
            fileName={`${project.id}-spec.json`}
            onClose={() => setActiveTab('case-study')}
            isFullScreen={true}
          />
        </div>
      ) : (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-x-hidden min-w-0">
          {/* Article Header */}
          <article className="space-y-8 max-w-full">
            <header className="border-b border-slate-200/80 pb-6 sm:pb-8">
              {/* Category & Timeframe */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  {project.categoryTag}
                </span>
                {project.timeframe && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {project.timeframe}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3 break-words">
                {project.title}
              </h1>
              {project.subtitle && (
                <p className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 leading-relaxed break-words">
                  {project.subtitle}
                </p>
              )}
            </header>

            {/* Quick Switch Banner to JSON Spec */}
            {project.rawSpecification && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-full">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Inspect Raw JSON Architecture Specification
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed block">
                      Explore the full machine-readable specification, schemas, intent structures, and cloud parameters.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  View JSON Spec &rarr;
                </button>
              </div>
            )}

            {/* Executive Overview */}
            <section className="space-y-4 max-w-full">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Executive Architecture Overview
              </h2>
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed break-words whitespace-pre-line">
                {project.fullOverview || project.briefDescription}
              </div>
            </section>

            {/* Core Architecture Triad Highlight */}
            {project.architecturePrinciple && (
              <section className="p-4 sm:p-6 rounded-xl bg-blue-50/70 border border-blue-200/80 max-w-full">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Core Architecture Triad
                </div>
                <p className="text-sm sm:text-base text-blue-950 font-medium leading-relaxed break-words">
                  {project.architecturePrinciple}
                </p>
              </section>
            )}

            {/* Visual Architecture Diagram (Constrained & Responsive) */}
            <section className="max-w-full overflow-hidden">
              <ArchitectureDiagram />
            </section>

            {/* Tech Stack Grid */}
            {project.techStack && project.techStack.length > 0 && (
              <section className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Low-Cost Infrastructure Stack
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-full">
                  {project.techStack.map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition-colors max-w-full min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {tech.category}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/50">
                          {tech.recommended_tool}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed break-words">
                        {tech.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Agentic Workflows & Execution Sequences */}
            {project.workflows && project.workflows.length > 0 && (
              <section className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  Agentic Workflows & Execution Sequences
                </div>
                <div className="space-y-4 max-w-full">
                  {project.workflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 max-w-full min-w-0"
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {wf.id}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 break-words">
                          {wf.title}
                        </h3>
                      </div>

                      {/* Prompt */}
                      <div className="text-xs text-slate-700 bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200/70 mb-2.5 font-mono break-all sm:break-words">
                        <span className="text-slate-400 font-sans">User Prompt: </span>"{wf.user_prompt}"
                      </div>

                      {/* Intent Resolution Badges */}
                      {wf.intent_resolution && (
                        <div className="text-xs text-emerald-950 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60 mb-2.5 flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
                          <span>Intent: <strong className="text-emerald-800">{wf.intent_resolution.intent}</strong></span>
                          <span>•</span>
                          <span>Task: <strong className="text-emerald-800">{wf.intent_resolution.task}</strong></span>
                          {wf.intent_resolution.scheduled_at && (
                            <>
                              <span>•</span>
                              <span>Scheduled: <strong className="text-emerald-800">{wf.intent_resolution.scheduled_at}</strong></span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Execution description */}
                      {wf.execution && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3 break-words">
                          {wf.execution}
                        </p>
                      )}

                      {/* Multi-step execution list */}
                      {wf.agentic_execution_sequence && (
                        <div className="space-y-1.5 pt-3 border-t border-slate-200/60">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Execution Steps:
                          </span>
                          {wf.agentic_execution_sequence.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 break-words"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Strategic Engineering Roadmap */}
            {project.engineeringRoadmap && project.engineeringRoadmap.length > 0 && (
              <section className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                  <Milestone className="w-4 h-4 text-blue-600" />
                  Strategic Engineering Roadmap
                </div>
                <div className="space-y-3 max-w-full">
                  {project.engineeringRoadmap.map((item) => (
                    <div
                      key={item.phase}
                      className="flex flex-col sm:flex-row items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 max-w-full min-w-0"
                    >
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                        Phase {item.phase}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 break-words">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed break-words">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Free Tier Limits */}
            {project.freeTierLimits && project.freeTierLimits.length > 0 && (
              <section className="p-4 sm:p-6 rounded-xl bg-amber-50/60 border border-amber-200/80 max-w-full">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 mb-3">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Zero-Cost / Free Tier Thresholds
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full">
                  {project.freeTierLimits.map((limit, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-3 rounded-lg bg-white/90 border border-amber-200/70 min-w-0"
                    >
                      <span className="text-xs font-bold text-slate-900 block mb-1">
                        {limit.service}
                      </span>
                      <p className="text-xs text-slate-600 leading-normal break-words">
                        {limit.quota}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Methods Used */}
            <section className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                Methods & Capabilities
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-full">
                {project.methodsUsed.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-100 break-words"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{method}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Outcome & Impact */}
            <section className="p-4 sm:p-6 rounded-xl bg-emerald-50/80 border border-emerald-200/80 max-w-full">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 mb-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Key Outcome & Impact
              </div>
              <p className="text-sm sm:text-base text-emerald-950 font-medium leading-relaxed break-words">
                {project.keyOutcome}
              </p>
            </section>

            {/* Footer action */}
            <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Portfolio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#contact';
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Discuss This Architecture</span>
                <span>&rarr;</span>
              </button>
            </footer>
          </article>
        </main>
      )}
    </div>
  );
};
