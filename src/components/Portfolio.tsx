import React, { useState } from 'react';
import { ArrowUpRight, PlusCircle, CheckCircle, Tag, Layers, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { portfolioData } from '../data/portfolioData';
import { Project } from '../types';
import { ProjectModal } from './ProjectModal';
import { ScrollReveal } from './ScrollReveal';

export const Portfolio: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Extract unique categories for filter tabs if wanted
  const categories = ['All', 'Research', 'Analysis', 'Usability'];

  const filteredProjects = portfolioData.projects.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Research') return p.categoryTag.toLowerCase().includes('research');
    if (activeFilter === 'Analysis') return p.categoryTag.toLowerCase().includes('analysis');
    if (activeFilter === 'Usability') return p.categoryTag.toLowerCase().includes('usability');
    return true;
  });

  return (
    <section id="portfolio" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Featured Work & Case Studies
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Selected Research & Analysis Highlights
            </h2>
            <p className="text-base text-slate-600 mt-3">
              A sample of mixed-methods research studies, survey inquiries, and usability audits.
              Easily update or replace these in your content file anytime.
            </p>
          </div>

          {/* Quick Filter Pill Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Project Cards Grid (3-4 Project highlights) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              id={`portfolio-card-${project.id}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all duration-200 group relative"
            >
              <div>
                {/* Header Tag and Counter */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    <Tag className="w-3 h-3 text-blue-500" />
                    {project.categoryTag}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    0{index + 1}
                  </span>
                </div>

                {/* Project Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                  {project.title}
                </h3>

                {/* Brief Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  {project.briefDescription}
                </p>

                {/* Methods Bullets */}
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {project.methodsUsed.slice(0, 3).map((method, mIdx) => (
                    <span
                      key={mIdx}
                      className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                    >
                      {method}
                    </span>
                  ))}
                  {project.methodsUsed.length > 3 && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                      +{project.methodsUsed.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Key Outcome & View Details Button */}
              <div className="pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-start gap-2 mb-4 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{project.keyOutcome}</span>
                </div>

                <button
                  type="button"
                  id={`view-details-${project.id}`}
                  onClick={() => setSelectedProject(project)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <span>View Project Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Easy update note for the user */}
        <ScrollReveal
          delay={0.15}
          className="p-4 sm:p-5 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Ready to plug in your own case studies?
              </p>
              <p className="text-xs text-slate-500">
                Update the <code className="text-blue-600 font-mono">projects</code> array inside <code className="text-blue-600 font-mono">/src/data/portfolioData.ts</code> with your actual projects.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 inline-flex items-center gap-1"
          >
            Have a project in mind? Let's talk &rarr;
          </a>
        </ScrollReveal>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
