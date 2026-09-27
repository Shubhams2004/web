export type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover';

export type RunnerLane = -1 | 0 | 1; // Left, Center, Right

export type RunnerAction = 'run' | 'jump' | 'slide' | 'stumble';

export interface RunnerState {
  lane: RunnerLane;
  targetX: number;
  currentX: number;
  y: number; // Vertical height for jumping
  velocityY: number;
  isGrounded: boolean;
  action: RunnerAction;
  actionTimer: number; // Duration in current action (e.g., slide length)
  distance: number;
  speed: number;
  baseSpeed: number;
  maxSpeed: number;
  isSprinting: boolean;
  sprintEnergy: number; // 0 to 100
  coins: number;
  score: number;
  invulnerableTime: number;
}

export type ObstacleType =
  | 'low_log'          // Low fallen trunk / barrier -> Jump over
  | 'high_arch'        // High spiked stone archway -> Slide under
  | 'stone_pillar'     // Ancient totem / carved obelisk -> Lane change
  | 'chasm_gap'        // Broken stone bridge / pit -> Jump over
  | 'swinging_blade'   // Swinging pendulum trap -> Timing / lane switch
  | 'crumbling_tile'   // Shaking ground plate -> Jump or avoid
  | 'ramp_viaduct';    // Raised stone ramp leading to upper bridge

export interface ObstacleInstance {
  id: string;
  type: ObstacleType;
  lane: RunnerLane;
  z: number;
  width: number;
  height: number;
  depth: number;
  yOffset: number;
  requiresAction?: 'jump' | 'slide' | 'avoid';
  cleared?: boolean;
  active: boolean;
  modelMesh?: any;
}

export interface CollectibleInstance {
  id: string;
  type: 'coin' | 'sprint_gem' | 'magnet';
  lane: RunnerLane;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  active: boolean;
  modelMesh?: any;
}

export interface CourseSegment {
  id: string;
  zStart: number;
  length: number;
  hasGap?: boolean;
  gapStart?: number;
  gapLength?: number;
  isElevated?: boolean;
  groupMesh?: any;
  obstacles: ObstacleInstance[];
  collectibles: CollectibleInstance[];
}

export interface GameScoreSnapshot {
  score: number;
  distance: number;
  coins: number;
  highScore: number;
  bestDistance: number;
  sprintEnergy: number;
  speedKmh: number;
  multiplier: number;
}

export interface MilestoneEvent {
  distance: number;
  message: string;
}
