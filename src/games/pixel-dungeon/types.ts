export type DungeonGameState = 'start' | 'playing' | 'floor-transition' | 'game-over';

export type TileType =
  | 'wall'
  | 'floor'
  | 'door-closed'
  | 'door-open'
  | 'door-locked'
  | 'stairs-down';

export type EnemyType = 'goblin' | 'bat' | 'skeleton';

export type ItemType = 'potion' | 'weapon' | 'armor' | 'key' | 'coin';

export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  name: string;
  color: string;
  isAggro: boolean;
  facing: 'left' | 'right';
  flashTimer?: number;
}

export interface DungeonItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  name: string;
  value: number; // e.g. heal amount, stat bonus, or coin amount
  description: string;
  collected?: boolean;
}

export interface DungeonRoom {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  keys: number;
  coins: number;
  score: number;
  highScore: number;
  floor: number;
  weaponName: string;
  weaponTier: number;
  armorName: string;
  armorTier: number;
  enemiesDefeated: number;
}

export interface DungeonKeyControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  wait: boolean;
  action: boolean;
}
