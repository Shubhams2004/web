import React from 'react';
import { ArrowRight, Play, CheckCircle2, FlaskConical } from 'lucide-react';
import { ExperimentDefinition, ExperimentStatus } from './types';

interface ExperimentCardProps {
  experiment: ExperimentDefinition;
  isActive: boolean;
  onSelect: (experiment: ExperimentDefinition) => void;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  isActive,
  onSelect,
}) => {
  const getStatusStyle = (status: ExperimentStatus) => {
    switch (status) {
      case 'STABLE':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'PROTOTYPE':
        return 'text-sky-400 bg-sky-950/60 border-sky-500/30';
      case 'UNSTABLE':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
      case 'UNKNOWN':
      default:
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(experiment)}
      className={`group rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
        isActive
          ? 'bg-slate-900/90 border-blue-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50'
          : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Header: Short Name & Status Badge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" role="img" aria-label={experiment.shortName}>
              {experiment.icon}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {experiment.shortName}
            </h3>
          </div>

          <span
            className={`font-mono text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-md border ${getStatusStyle(
              experiment.status
            )}`}
          >
            {experiment.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {experiment.tagline}
        </p>

        {/* Feature bullet summary */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          {experiment.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-slate-500">
          {isActive ? 'Active in Stage' : 'Select to inspect'}
        </span>

        <span
          className={`inline-flex items-center gap-1 font-semibold transition-colors ${
            isActive ? 'text-blue-400 font-bold' : 'text-slate-400 group-hover:text-white'
          }`}
        >
          <span>{isActive ? 'Running' : 'Launch'}</span>
          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-1'}`} />
        </span>
      </div>
    </div>
  );
};
