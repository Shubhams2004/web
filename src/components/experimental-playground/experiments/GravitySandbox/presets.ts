import { Particle } from '../../types';

export interface SandboxPreset {
  id: string;
  name: string;
  description: string;
  gravityConstant: number;
  particles: (width: number, height: number) => Particle[];
}

export const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'solar-system',
    name: 'Solar System',
    description: 'Central star with multi-tier orbital planets and a high-speed comet.',
    gravityConstant: 0.8,
    particles: (width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      return [
        // Central Star (Sol)
        {
          id: 'sun',
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          mass: 1200,
          radius: 18,
          color: '#fbbf24',
          isAttractor: true,
          isFixed: true,
          trail: [],
        },
        // Planet 1 (Inner rocky)
        {
          id: 'planet-1',
          x: cx,
          y: cy - 70,
          vx: 3.8,
          vy: 0,
          mass: 15,
          radius: 6,
          color: '#38bdf8',
          trail: [],
        },
        // Planet 2 (Terra)
        {
          id: 'planet-2',
          x: cx,
          y: cy - 130,
          vx: 2.8,
          vy: 0,
          mass: 25,
          radius: 8,
          color: '#34d399',
          trail: [],
        },
        // Planet 3 (Gas Giant)
        {
          id: 'planet-3',
          x: cx,
          y: cy + 200,
          vx: -2.3,
          vy: 0,
          mass: 80,
          radius: 13,
          color: '#f472b6',
          trail: [],
        },
        // Eccentric Comet
        {
          id: 'comet',
          x: cx - 220,
          y: cy - 160,
          vx: 1.2,
          vy: -1.6,
          mass: 4,
          radius: 3.5,
          color: '#c084fc',
          trail: [],
        },
      ];
    },
  },
  {
    id: 'binary-stars',
    name: 'Binary Chaos',
    description: 'Two massive stars orbiting mutual barycenter with interweaving asteroid stream.',
    gravityConstant: 1.0,
    particles: (width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      const d = 90;
      const v = 2.1;

      const particles: Particle[] = [
        {
          id: 'star-a',
          x: cx - d,
          y: cy,
          vx: 0,
          vy: v,
          mass: 750,
          radius: 15,
          color: '#60a5fa',
          isAttractor: true,
          trail: [],
        },
        {
          id: 'star-b',
          x: cx + d,
          y: cy,
          vx: 0,
          vy: -v,
          mass: 750,
          radius: 15,
          color: '#f87171',
          isAttractor: true,
          trail: [],
        },
      ];

      // Swarm of surrounding debris
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 180 + (i % 3) * 35;
        const speed = 2.0;
        particles.push({
          id: `debris-${i}`,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: -Math.sin(angle) * speed,
          vy: Math.cos(angle) * speed,
          mass: 5,
          radius: 3,
          color: i % 2 === 0 ? '#cbd5e1' : '#fde047',
          trail: [],
        });
      }

      return particles;
    },
  },
  {
    id: 'galaxy-core',
    name: 'Galaxy Core',
    description: 'Supermassive gravitational singularity with 35 rotating stardust particles.',
    gravityConstant: 1.2,
    particles: (width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      const particles: Particle[] = [
        {
          id: 'singularity',
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          mass: 2200,
          radius: 20,
          color: '#1e1b4b',
          isAttractor: true,
          isFixed: true,
          trail: [],
        },
      ];

      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const dist = 50 + (i * 5.5);
        // Orbital velocity approximation: v = sqrt(G*M/r)
        const v = Math.sqrt((1.2 * 2200) / dist) * 0.85;
        const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#fde047'];

        particles.push({
          id: `star-${i}`,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: -Math.sin(angle) * v,
          vy: Math.cos(angle) * v,
          mass: 4 + Math.random() * 8,
          radius: 3 + Math.random() * 3,
          color: colors[i % colors.length],
          trail: [],
        });
      }

      return particles;
    },
  },
  {
    id: 'zero-g-nebula',
    name: 'Zero-G Floating Nebula',
    description: 'Drifting interstellar cloud without central mass, interacting via mutual weak attraction.',
    gravityConstant: 0.25,
    particles: (width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      const particles: Particle[] = [];
      const colors = ['#22d3ee', '#818cf8', '#e879f9', '#4ade80', '#fbbf24'];

      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.min(width, height) * 0.35;
        particles.push({
          id: `nebula-${i}`,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          mass: 12 + Math.random() * 20,
          radius: 5 + Math.random() * 4,
          color: colors[i % colors.length],
          trail: [],
        });
      }

      return particles;
    },
  },
];
