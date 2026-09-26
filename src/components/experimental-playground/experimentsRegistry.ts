import { ExperimentDefinition } from './types';

export const EXPERIMENTS_REGISTRY: ExperimentDefinition[] = [
  {
    id: 'gravity-sandbox',
    name: '🧲 Physics Lab: Gravity Sandbox',
    shortName: '🧲 Physics Lab',
    category: 'physics',
    status: 'STABLE',
    tagline: 'Interactive N-body celestial mechanics, customizable mass, orbital trails & drag manipulation.',
    description:
      'A real-time 60 FPS gravitational physics laboratory. Spawn celestial bodies, adjust the gravitational constant, fling objects with touch/pointer velocity, create supermassive attractors, and test multi-body orbital dynamics.',
    features: [
      'N-body dynamic gravity calculations',
      'Pointer & touch drag-and-fling mechanics',
      'Adjustable gravity constant & mass scaling',
      'Event-horizon attractors & anti-gravity repellers',
      'Presets: Solar System, Binary Chaos, Galaxy Core',
    ],
    instructions:
      'Click or tap on the canvas to spawn objects. Click and drag an object to fling it with velocity. Switch spawn modes in the laboratory panel to place supermassive attractors.',
    icon: '🧲',
  },
  {
    id: 'ai-lab',
    name: '🤖 AI Lab: Semantic Vector Swarm',
    shortName: '🤖 AI Lab',
    category: 'ai',
    status: 'PROTOTYPE',
    tagline: 'Latent space token attraction, semantic clusters & real-time vector alignment.',
    description:
      'Simulating embedding vector coordinates in dynamic 2D Euclidean space. Tokens cluster based on cosine similarity weights, reacting dynamically to probe concepts and user-injected semantic anchors.',
    features: [
      'Interactive token vector cloud',
      'Dynamic semantic cluster forces',
      'Probe word injection & gravitational drift',
      'Real-time cosine distance visualization',
    ],
    instructions:
      'Type or click probe concepts to see semantic tokens gravitate toward contextual clusters.',
    icon: '🤖',
  },
  {
    id: 'visual-lab',
    name: '🌌 Visual Lab: Chromatic Waveform & Optics',
    shortName: '🌌 Visual Lab',
    category: 'visual',
    status: 'PROTOTYPE',
    tagline: 'Interactive chromatic aberration, prism refraction & mathematical wave interference.',
    description:
      'Experimental optical shaders and procedural wave synthesis. Modulate frequency harmonics, refractive index, and chromatic shift using interactive coordinate probes.',
    features: [
      'Wave interference synthesis',
      'Prism color dispersion simulation',
      'Mouse coordinate optical deflection',
      'Harmonic frequency modulation',
    ],
    instructions:
      'Move your pointer across the canvas to bend refractive light waves and adjust harmonic dampening.',
    icon: '🌌',
  },
  {
    id: 'game-mechanics-lab',
    name: '🎮 Game Mechanics Lab: Verlet Physics & Ropes',
    shortName: '🎮 Game Mechanics Lab',
    category: 'game',
    status: 'STABLE',
    tagline: 'Constraint-based particle chains, cloth simulation & kinetic ragdoll dynamics.',
    description:
      'Tactile game mechanics playground testing Verlet integration. Drag tension nodes, cut elastic constraints with a pointer slash, and observe structural integrity under stress.',
    features: [
      'Verlet integration rope & cloth mesh',
      'Tearable elastic constraints',
      'Tension impulse feedback',
      'Interactive pointer cutter knife',
    ],
    instructions:
      'Drag any node with your mouse/touch. Hold Shift or click "Slash" to sever links and test structural failure.',
    icon: '🎮',
  },
  {
    id: 'weird-web',
    name: '🧠 Weird Web: Zero-G DOM & Cursor Warp',
    shortName: '🧠 Weird Web',
    category: 'weird',
    status: 'UNSTABLE',
    tagline: 'Defying normal browser physics: kinetic buttons, gravitational cursor wells & layout rebellion.',
    description:
      'Exploring the playful boundaries of browser interfaces. Buttons that escape your cursor, elements that tumble under simulated room gravity, and interactive canvas glitches.',
    features: [
      'Zero-G UI component physics',
      'Repulsive button evasive maneuvers',
      'Magnetic cursor warp fields',
      'Chaotic DOM particle explosion',
    ],
    instructions:
      'Try clicking the elusive buttons or turn on "Page Gravity" to watch the lab interface tumble into chaos.',
    icon: '🧠',
  },
];
