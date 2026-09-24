import React from 'react';
import {
  Users,
  ClipboardCheck,
  CheckCircle2,
  BarChart3,
  Search,
  FileSpreadsheet,
  LineChart,
  Check,
  Layers,
  FileText,
  BookOpen,
  PenTool,
} from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { ScrollReveal } from '../common/ScrollReveal';
import { useInViewAnimation } from '../../hooks/useInViewAnimation';
import { BrandLogo } from '../common/BrandLogo';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Users,
  ClipboardCheck,
  CheckCircle2,
  BarChart3,
  Search,
  FileSpreadsheet,
  LineChart,
  FileText,
  BookOpen,
  PenTool,
};

export const About: React.FC = () => {
  const { ref, animationClasses } = useInViewAnimation<HTMLElement>({
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px',
  });

  return (
    <section
      id="about"
      ref={ref}
      className={`py-20 sm:py-24 bg-white border-b border-slate-200/70 ${animationClasses}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-3">
            <BrandLogo size="md" className="w-10 h-10 drop-shadow-xs" />
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              About Me & Strategic Research
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">
            Bridging empirical research with publication-grade clarity.
          </h2>

          {/* Short Bio (2-3 sentences) */}
          <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            {portfolioData.about.bioParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </ScrollReveal>

        {/* Services / What I Offer */}
        <div className="mb-20">
          <ScrollReveal className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Services & Offerings</h3>
              <p className="text-sm text-slate-500 mt-1">
                Flexible engagement models tailored to product discovery and evaluation.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioData.about.services.map((service, index) => {
              const IconComponent = iconMap[service.iconName] || Users;
              return (
                <ScrollReveal
                  key={service.id}
                  id={`service-card-${service.id}`}
                  delay={index * 0.05}
                  className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-white transition-all duration-200 shadow-2xs group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                        {service.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="space-y-1.5 pt-3 border-t border-slate-200/70">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Key Deliverables:
                        </span>
                        {service.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Key Skills & Tools Matrix */}
        <ScrollReveal
          delay={0.1}
          className="p-8 rounded-xl bg-slate-50 border border-slate-200/80"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Technical Skills & Methodologies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolioData.about.skills.map((category, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                  {category.title}
                </h4>
                <ul className="space-y-2">
                  {category.skills.map((skill, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
