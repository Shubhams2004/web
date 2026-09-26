export type ExperimentStatus = 'STABLE' | 'PROTOTYPE' | 'UNSTABLE' | 'UNKNOWN';

export type ExperimentCategory = 'all' | 'physics' | 'ai' | 'visual' | 'game' | 'weird';

export type ExperimentId =
  | 'gravity-sandbox'
  | 'ai-lab'
  | 'visual-lab'
  | 'game-mechanics-lab'
  | 'weird-web';

export interface ExperimentDefinition {
  id: ExperimentId;
  name: string;
  shortName: string;
  category: ExperimentCategory;
  status: ExperimentStatus;
  tagline: string;
  description: string;
  features: string[];
  instructions: string;
  icon: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  isAttractor?: boolean;
  isRepeller?: boolean;
  isFixed?: boolean;
  trail: Array<{ x: number; y: number }>;
}

export type BoundaryMode = 'bounce' | 'wrap' | 'void';
export type SpawnType = 'particle' | 'massive' | 'attractor' | 'repeller';

export interface GravitySettings {
  gravityConstant: number;
  collisionDamping: number;
  boundaryMode: BoundaryMode;
  enableTrails: boolean;
  trailLength: number;
  defaultSpawnMass: number;
  spawnType: SpawnType;
  timeScale: number;
  showVelocityVectors: boolean;
  soundEnabled: boolean;
}

export interface SimulationTelemetry {
  particleCount: number;
  fps: number;
  kineticEnergy: number;
  attractorCount: number;
}
