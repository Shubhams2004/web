import React, { useEffect, useState } from 'react';
import {
  X,
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
  Maximize2,
  Minimize2,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types';
import { updatePageSEO, SECTION_SEO_PRESETS } from '../utils/seo';
import { JsonFullScreenViewer } from './JsonFullScreenViewer';
import { ArchitectureDiagram } from './ArchitectureDiagram';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  initialTab?: 'case-study' | 'json';
  defaultFullScreen?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  initialTab = 'case-study',
  defaultFullScreen = false,
}) => {
  const [activeTab, setActiveTab] = useState<'case-study' | 'json'>(initialTab);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(defaultFullScreen);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setIsFullScreen(defaultFullScreen);
    setCopied(false);
  }, [project, initialTab, defaultFullScreen]);

  const handleOpenSeparatePage = () => {
    if (!project) return;
    onClose();
    window.location.hash = `#/case-study/${project.id}`;
  };

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
    a.download = 'ai-personal-assistant-task-automation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Dynamically update SEO meta tags & structured data for this specific case study
      const desc = project.fullOverview || project.briefDescription;
      const projectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}#project-${project.id}`
          : `https://shubhamsonale.com/#project-${project.id}`;

      updatePageSEO({
        title: project.title,
        description: desc,
        canonicalUrl: projectUrl,
        ogType: 'article',
        lang: 'en',
        locale: 'en_US',
        section: project.categoryTag,
        keywords: [
          project.categoryTag,
          'Case Study',
          'Research Paper',
          ...project.methodsUsed,
          'Shubham Sonale',
        ],
        alternates: [
          { lang: 'en', href: projectUrl },
          { lang: 'x-default', href: projectUrl },
        ],
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Article',
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
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      // Restore section SEO when modal closes
      if (project) {
        updatePageSEO(SECTION_SEO_PRESETS.portfolio);
      }
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      id="project-detail-modal-backdrop"
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        isFullScreen ? 'p-0' : 'p-0 sm:p-4 md:p-6'
      } bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150`}
      onClick={onClose}
    >
      <div
        id="project-detail-modal-card"
        className={`bg-white shadow-2xl border border-slate-200 relative flex flex-col transition-all duration-200 max-w-full overflow-x-hidden ${
          isFullScreen
            ? 'w-full h-full sm:w-screen sm:h-screen max-w-none max-h-none rounded-none'
            : 'rounded-none sm:rounded-xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[92vh] overflow-hidden'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation & Controls Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0 gap-2">
          {/* Left: View Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('case-study')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'case-study'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Case Study</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON Spec</span>
            </button>
          </div>

          {/* Right: Actions (Open Page, Copy, Download, Fullscreen, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Open in Separate Standalone Page */}
            <button
              type="button"
              onClick={handleOpenSeparatePage}
              className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open case study in separate standalone page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Separate Page</span>
            </button>

            {project.rawSpecification && (
              <>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
                  title="Copy full JSON specification"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden md:inline text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
                  title="Download specification JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Download</span>
                </button>
              </>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Toggle Full Screen"
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-0.5"
              aria-label="Close project modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Active Tab Render */}
        {activeTab === 'json' ? (
          <div className="flex-1 min-h-0 h-full overflow-hidden">
            <JsonFullScreenViewer
              data={project.rawSpecification}
              fileName={`${project.id}-spec.json`}
              onClose={onClose}
              isFullScreen={isFullScreen}
              onToggleFullScreen={() => setIsFullScreen((prev) => !prev)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-7 md:p-10 bg-slate-50/50 min-w-0 max-w-full">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 max-w-full">
              {/* Tag & Timeframe */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    {project.categoryTag}
                  </span>
                  {project.timeframe && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {project.timeframe}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight break-words">
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-600 mb-4 leading-relaxed break-words">
                    {project.subtitle}
                  </p>
                )}
              </div>

              {/* Quick Prompt to Open in Dedicated Page or Switch to Full JSON */}
              <div className="p-3 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Prefer Reading in a Dedicated Separate Page?
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Open this case study in a full separate page with shareable URL & maximum reading comfort.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenSeparatePage}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Open Separate Page &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    JSON View
                  </button>
                </div>
              </div>

              {/* Overview */}
              <div className="space-y-2 max-w-full">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Executive Architecture Overview
                </h4>
                <div className="text-slate-700 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line break-words">
                  {project.fullOverview || project.briefDescription}
                </div>
              </div>

              {/* Architecture Principle */}
              {project.architecturePrinciple && (
                <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200/80 max-w-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Core Architecture Triad
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-blue-950 font-medium leading-relaxed break-words">
                    {project.architecturePrinciple}
                  </p>
                </div>
              )}

              {/* Responsive Visual Architecture Diagram */}
              <div className="max-w-full overflow-hidden">
                <ArchitectureDiagram />
              </div>

              {/* Tech Stack Grid */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Low-Cost Infrastructure Stack
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 max-w-full">
                    {project.techStack.map((tech, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition-colors max-w-full min-w-0"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
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
                </div>
              )}

              {/* Agentic Workflows */}
              {project.workflows && project.workflows.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                    <GitBranch className="w-4 h-4 text-blue-600" />
                    Agentic Workflows & Execution Sequences
                  </div>
                  <div className="space-y-3.5 max-w-full">
                    {project.workflows.map((wf) => (
                      <div
                        key={wf.id}
                        className="p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200/70 max-w-full min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {wf.id}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                            {wf.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 bg-white p-2.5 rounded-md border border-slate-200/70 mb-2.5 font-mono break-all sm:break-words">
                          <span className="text-slate-400 font-sans">User Prompt: </span>"{wf.user_prompt}"
                        </div>
                        {wf.intent_resolution && (
                          <div className="text-xs text-emerald-900 bg-emerald-50/80 p-2.5 rounded-md border border-emerald-200/60 mb-2.5 flex items-center gap-2 sm:gap-3 flex-wrap font-mono break-words">
                            <span>Intent: <strong className="font-semibold text-emerald-800">{wf.intent_resolution.intent}</strong></span>
                            <span>•</span>
                            <span>Task: <strong className="font-semibold text-emerald-800">{wf.intent_resolution.task}</strong></span>
                            {wf.intent_resolution.scheduled_at && (
                              <>
                                <span>•</span>
                                <span>Schedule: <strong className="font-semibold text-emerald-800">{wf.intent_resolution.scheduled_at}</strong></span>
                              </>
                            )}
                          </div>
                        )}
                        {wf.execution && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2.5 break-words">
                            {wf.execution}
                          </p>
                        )}
                        {wf.agentic_execution_sequence && (
                          <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Execution Steps:
                            </span>
                            {wf.agentic_execution_sequence.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 bg-white p-2 rounded border border-slate-100 break-words"
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
                </div>
              )}

              {/* Strategic Engineering Roadmap */}
              {project.engineeringRoadmap && project.engineeringRoadmap.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                    <Milestone className="w-4 h-4 text-blue-600" />
                    Strategic Engineering Roadmap
                  </div>
                  <div className="space-y-3 max-w-full">
                    {project.engineeringRoadmap.map((item) => (
                      <div
                        key={item.phase}
                        className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 p-3 sm:p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 max-w-full min-w-0"
                      >
                        <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                          Phase {item.phase}
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                            {item.title}
                          </h5>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Tier Limits */}
              {project.freeTierLimits && project.freeTierLimits.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 max-w-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
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
                </div>
              )}

              {/* Methods Used */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs max-w-full">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Methods & Capabilities
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 max-w-full">
                  {project.methodsUsed.map((method, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 break-words min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Outcome / Impact */}
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 max-w-full">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Key Outcome & Impact
                </div>
                <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed break-words">
                  {project.keyOutcome}
                </p>
              </div>

              {/* Bottom prompt */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-full">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">
                    Machine-Readable Architecture Specification
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    View raw JSON schemas, task definitions, and edge parameters.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenSeparatePage}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Open Standalone Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Switch to JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-slate-200 shrink-0 gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Active: {project.title}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenSeparatePage}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Separate Page</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

