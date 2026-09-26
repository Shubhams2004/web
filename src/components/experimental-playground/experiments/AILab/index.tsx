import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Send, BrainCircuit } from 'lucide-react';

interface TokenNode {
  id: string;
  text: string;
  category: 'ml' | 'strategy' | 'code' | 'design' | 'user';
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

const DEFAULT_TOKENS: Array<{ text: string; category: TokenNode['category'] }> = [
  { text: 'Transformer', category: 'ml' },
  { text: 'Attention', category: 'ml' },
  { text: 'Latent Space', category: 'ml' },
  { text: 'Gradient Descent', category: 'ml' },
  { text: 'Cross-Entropy', category: 'ml' },
  { text: 'Market Moat', category: 'strategy' },
  { text: 'Unit Economics', category: 'strategy' },
  { text: 'Switching Cost', category: 'strategy' },
  { text: 'Capital Efficiency', category: 'strategy' },
  { text: 'TypeScript', category: 'code' },
  { text: 'Concurrency', category: 'code' },
  { text: 'WebSockets', category: 'code' },
  { text: 'AST Parser', category: 'code' },
  { text: 'Affordance', category: 'design' },
  { text: 'Gestalt Law', category: 'design' },
  { text: 'Cognitive Load', category: 'design' },
  { text: 'Fitts Principle', category: 'design' },
];

export const AILabExperiment: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [probeWord, setProbeWord] = useState('');
  const [tokens, setTokens] = useState<TokenNode[]>([]);
  const [clusterStrength, setClusterStrength] = useState(0.04);
  const [activeToken, setActiveToken] = useState<TokenNode | null>(null);

  // Initialize tokens on mount
  useEffect(() => {
    const width = 800;
    const height = 450;
    const initial: TokenNode[] = DEFAULT_TOKENS.map((item, idx) => {
      const angle = (idx / DEFAULT_TOKENS.length) * Math.PI * 2;
      const radius = 120 + Math.random() * 80;
      return {
        id: `tok-${idx}`,
        text: item.text,
        category: item.category,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        targetX: width / 2,
        targetY: height / 2,
      };
    });
    setTokens(initial);
  }, []);

  // Update target clusters based on category centers
  useEffect(() => {
    const categoryCenters: Record<string, { x: number; y: number }> = {
      ml: { x: 220, y: 140 },
      strategy: { x: 580, y: 140 },
      code: { x: 220, y: 320 },
      design: { x: 580, y: 320 },
      user: { x: 400, y: 220 },
    };

    setTokens((prev) =>
      prev.map((t) => {
        const center = categoryCenters[t.category] || { x: 400, y: 220 };
        return {
          ...t,
          targetX: center.x + (Math.random() - 0.5) * 60,
          targetY: center.y + (Math.random() - 0.5) * 60,
        };
      })
    );
  }, [probeWord]);

  // Canvas render loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw cluster bounds
      const clusters = [
        { label: 'Deep Learning & ML', x: 220, y: 140, color: 'rgba(56, 189, 248, 0.12)' },
        { label: 'Commercial Strategy', x: 580, y: 140, color: 'rgba(52, 211, 153, 0.12)' },
        { label: 'Systems & Code', x: 220, y: 320, color: 'rgba(192, 132, 252, 0.12)' },
        { label: 'Cognitive UX', x: 580, y: 320, color: 'rgba(251, 191, 36, 0.12)' },
      ];

      for (const cl of clusters) {
        ctx.fillStyle = cl.color;
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cl.label, cl.x, cl.y - 75);
      }

      // Physics step
      setTokens((prev) =>
        prev.map((t) => {
          const dx = t.targetX - t.x;
          const dy = t.targetY - t.y;
          const vx = (t.vx + dx * clusterStrength) * 0.88;
          const vy = (t.vy + dy * clusterStrength) * 0.88;
          return {
            ...t,
            x: t.x + vx,
            y: t.y + vy,
            vx,
            vy,
          };
        })
      );

      // Draw connecting lines between nearby tokens
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[i].category === tokens[j].category) {
            const dx = tokens[j].x - tokens[i].x;
            const dy = tokens[j].y - tokens[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(tokens[i].x, tokens[i].y);
              ctx.lineTo(tokens[j].x, tokens[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw token nodes
      for (const t of tokens) {
        const isHovered = activeToken?.id === t.id;
        const color =
          t.category === 'ml'
            ? '#38bdf8'
            : t.category === 'strategy'
            ? '#34d399'
            : t.category === 'code'
            ? '#c084fc'
            : t.category === 'user'
            ? '#f43f5e'
            : '#fbbf24';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, isHovered ? 7 : 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
        ctx.font = isHovered ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y + 16);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [clusterStrength, tokens, activeToken]);

  const handleAddProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probeWord.trim()) return;

    const newTok: TokenNode = {
      id: `user-${Date.now()}`,
      text: probeWord.trim(),
      category: 'user',
      x: 400 + (Math.random() - 0.5) * 80,
      y: 220 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      targetX: 400,
      targetY: 220,
    };

    setTokens((prev) => [...prev, newTok]);
    setProbeWord('');
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={460}
          className="w-full h-full block cursor-pointer"
        />

        <div className="absolute top-3 left-3 pointer-events-none text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
          <span className="text-cyan-400 font-bold">● LATENT EMBEDDING SWARM</span> · {tokens.length} Tokens
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleAddProbe} className="flex items-center gap-2 w-full sm:max-w-md">
          <input
            type="text"
            value={probeWord}
            onChange={(e) => setProbeWord(e.target.value)}
            placeholder="Inject probe concept (e.g. 'Heuristics', 'RLHF')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Inject</span>
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Attraction Force:</span>
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.005"
            value={clusterStrength}
            onChange={(e) => setClusterStrength(parseFloat(e.target.value))}
            className="w-28 sm:w-36 accent-blue-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
