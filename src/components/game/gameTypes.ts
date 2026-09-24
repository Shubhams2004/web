export type GameState = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';

export type PowerUpType = 'turbo' | 'shield' | 'star';

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number; // lane center x
  y: number; // vertical position in world
  lane: number;
  width: number;
  height: number;
  collected: boolean;
  pulsePhase: number;
}

export type TrafficCarStyle = 'sport' | 'taxi' | 'muscle' | 'racer' | 'van';

export interface TrafficCar {
  id: string;
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // relative to road
  style: TrafficCarStyle;
  primaryColor: string;
  accentColor: string;
  passed: boolean;
  nearMissed: boolean;
}

export interface PlayerCar {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // in MPH (e.g. 0 to 140)
  targetSpeed: number;
  lateralSpeed: number;
  hasShield: boolean;
  turboTimeRemaining: number; // seconds
  starTimeRemaining: number; // seconds
  invulnerableTime: number; // seconds after taking a hit or starting
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
  shape?: 'square' | 'circle' | 'spark';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  fontSize?: number;
}

export interface RoadsideSceneryItem {
  id: string;
  side: 'left' | 'right';
  y: number;
  type: 'lamp' | 'palm' | 'sign' | 'barrier';
}

export interface KeyControls {
  left: boolean;
  right: boolean;
  accelerate: boolean;
  brake: boolean;
}

export interface GameScoreSnapshot {
  score: number;
  highScore: number;
  speed: number;
  distance: number;
  nearMisses: number;
  carsOvertaken: number;
  powerUpsCollected: number;
}
