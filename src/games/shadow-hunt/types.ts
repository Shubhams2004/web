export type ShadowHuntGameState = 'briefing' | 'playing' | 'paused' | 'failed' | 'victory';

export type GuardType = 'standard' | 'watcher' | 'hunter';
export type GuardState = 'patrol' | 'investigate' | 'alert' | 'eliminated';

export interface Point {
  x: number;
  y: number;
}

export interface WallRect {
  x: number;
  y: number;
  w: number;
  h: number;
  isObstacle?: boolean;
  type?: 'concrete' | 'server' | 'crate' | 'glass';
}

export interface PlayerEntity {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  isAttacking: boolean;
  attackTargetId: string | null;
  attackTimer: number;
  animFrame: number;
  hp: number;
  maxHp: number;
  stealthBonus: boolean;
}

export interface GuardEntity {
  id: string;
  name: string;
  type: GuardType;
  x: number;
  y: number;
  radius: number;
  angle: number;
  targetAngle: number;
  patrolPoints: Point[];
  currentWaypointIdx: number;
  state: GuardState;
  speed: number;
  visionAngle: number; // in radians (e.g. 70 deg)
  visionDistance: number;
  detectionLevel: number; // 0 to 1
  investigatePos: Point | null;
  investigateTimer: number;
  shootCooldown: number;
  isTarget: boolean; // primary elimination target
  animFrame: number;
  isEliminated: boolean;
  deathTimer: number;
}

export interface IntelItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  title: string;
}

export interface ExtractionZone {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

export interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'slash' | 'smoke' | 'shadow' | 'blood';
}

export interface MissionStats {
  targetsTotal: number;
  targetsEliminated: number;
  intelCollected: number;
  intelTotal: number;
  alarmsTriggered: number;
  timeSeconds: number;
  stealthScore: number;
  rank: 'S' | 'A' | 'B' | 'C';
}
