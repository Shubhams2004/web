export type ZombieGameState = 'start' | 'playing' | 'paused' | 'gameover';

export type ZombieType = 'walker' | 'runner' | 'tank' | 'crawler';

export type WeaponType = 'pistol' | 'shotgun' | 'machinegun';

export type PowerUpType = 'health' | 'shotgun' | 'machinegun' | 'nuke' | 'speed';

export interface KeyControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  health: number;
  maxHealth: number;
  angle: number; // in radians
  invulnerableTime: number; // seconds
  weapon: WeaponType;
  weaponTimeRemaining: number;
  shootCooldown: number;
  walkFrame: number;
  speedBoostTime: number;
}

export interface Zombie {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  health: number;
  maxHealth: number;
  radius: number;
  type: ZombieType;
  color: string;
  walkFrame: number;
  hitFlashTime: number;
  damage: number;
  scoreValue: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  life: number;
  color: string;
  radius: number;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  pulsePhase: number;
  lifeTime: number; // disappears if not picked up
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

export interface BloodStain {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
}

export interface ZombieGameStats {
  score: number;
  highScore: number;
  wave: number;
  kills: number;
  timeSurvived: number;
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  weaponTimeRemaining: number;
}
