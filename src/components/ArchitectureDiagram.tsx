import React from 'react';
import { Brain, Database, Zap, Send, Bell, ArrowRight, ArrowDown } from 'lucide-react';

interface ArchitectureDiagramProps {
  className?: string;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ className = '' }) => {
  return (
    <div
      id="architecture-diagram-container"
      className={`w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs ${className}`}
    >
      <div className="mb-4 text-center sm:text-left">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
          Visual System Architecture
        </span>
        <h5 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
          Zero-Cost Serverless & Agentic Execution Triad
        </h5>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Designed for maximum throughput and zero idle costs by pairing client-side edge triggers with LLM function calling and persistent state machines.
        </p>
      </div>

      {/* Main Flow Diagram */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 sm:gap-4 my-2">
        {/* Step 1: Client / User Interface */}
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">1. Client / Input</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              User voice/text input dispatched via Web Dashboard or Telegram Bot webhook.
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>React / Next.js</span>
            <span className="text-blue-600 font-semibold">Free Tier</span>
          </div>
        </div>

        {/* Transition indicator */}
        <div className="flex items-center justify-center py-1 lg:py-0 text-slate-400">
          <ArrowDown className="w-4 h-4 lg:hidden" />
          <ArrowRight className="w-4 h-4 hidden lg:block" />
        </div>

        {/* Step 2: Reasoning Brain (Groq) */}
        <div className="flex-1 min-w-0 bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-950">2. Reasoning Brain</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed mb-2">
              Groq API extracts intents, entities, schedules, and issues structured function calls with ultra-low latency.
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] font-mono text-blue-800">
            <span>Groq Llama 3.3</span>
            <span className="font-semibold text-emerald-700">Ultra-Fast LPU</span>
          </div>
        </div>

        {/* Transition indicator */}
        <div className="flex items-center justify-center py-1 lg:py-0 text-slate-400">
          <ArrowDown className="w-4 h-4 lg:hidden" />
          <ArrowRight className="w-4 h-4 hidden lg:block" />
        </div>

        {/* Step 3: State & Execution Engine */}
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">3. Persistent State</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Supabase PostgreSQL stores tasks, states, user configs, and authentication tokens.
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Supabase DB</span>
            <span className="text-emerald-600 font-semibold">500MB Free</span>
          </div>
        </div>

        {/* Transition indicator */}
        <div className="flex items-center justify-center py-1 lg:py-0 text-slate-400">
          <ArrowDown className="w-4 h-4 lg:hidden" />
          <ArrowRight className="w-4 h-4 hidden lg:block" />
        </div>

        {/* Step 4: Edge Worker / Cron Trigger */}
        <div className="flex-1 min-w-0 bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-950">4. Edge Execution</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed mb-2">
              Cloudflare Workers Cron triggers background jobs, calls Gmail API, and alerts Telegram.
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-mono text-amber-800">
            <span>CF Workers Cron</span>
            <span className="font-semibold text-amber-700">100K Req/Day</span>
          </div>
        </div>
      </div>

      {/* Auxiliary notification dispatch bar */}
      <div className="mt-3 p-2.5 sm:p-3 rounded-lg bg-slate-900 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <strong>Real-time Dispatch Channel:</strong> Alerts delivered via Telegram Bot API, Web Push, and Gmail
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] text-emerald-400 font-mono bg-slate-800 px-2 py-0.5 rounded shrink-0">
          Cost: $0.00 / month
        </span>
      </div>
    </div>
  );
};
