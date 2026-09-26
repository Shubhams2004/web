import { WallRect, GuardEntity, IntelItem, ExtractionZone, Point } from './types';

export interface LevelData {
  id: string;
  name: string;
  codeName: string;
  briefing: string;
  width: number;
  height: number;
  playerSpawn: Point;
  walls: WallRect[];
  guards: GuardEntity[];
  intel: IntelItem[];
  extraction: ExtractionZone;
}

export const LEVEL_01: LevelData = {
  id: 'mission-01',
  name: 'Obsidian Vault Infiltration',
  codeName: 'OPERATION SHADOW VEIL',
  briefing:
    'Infiltrate the subterranean Obsidian Data Vault. Eliminate 3 high-value security officers without raising the facility alarm. Secure classified intel drives if possible, then reach the extraction lift at Sector North-East.',
  width: 1600,
  height: 1200,
  playerSpawn: { x: 140, y: 1060 },
  walls: [
    // Outer boundary walls
    { x: 0, y: 0, w: 1600, h: 30, type: 'concrete' }, // Top
    { x: 0, y: 1170, w: 1600, h: 30, type: 'concrete' }, // Bottom
    { x: 0, y: 0, w: 30, h: 1200, type: 'concrete' }, // Left
    { x: 1570, y: 0, w: 30, h: 1200, type: 'concrete' }, // Right

    // South Wing (Foyer / Screening)
    { x: 30, y: 940, w: 450, h: 25, type: 'concrete' }, // Foyer top wall
    { x: 570, y: 940, w: 450, h: 25, type: 'concrete' },
    { x: 480, y: 940, w: 90, h: 0, type: 'concrete' }, // Doorway opening

    // Foyer pillars / cover
    { x: 280, y: 1020, w: 50, h: 50, isObstacle: true, type: 'concrete' },
    { x: 740, y: 1020, w: 50, h: 50, isObstacle: true, type: 'concrete' },

    // West Warehouse / Cargo Bay
    { x: 480, y: 520, w: 25, h: 420, type: 'concrete' }, // West dividing wall
    { x: 140, y: 640, w: 100, h: 70, isObstacle: true, type: 'crate' },
    { x: 300, y: 760, w: 90, h: 90, isObstacle: true, type: 'crate' },
    { x: 160, y: 800, w: 70, h: 70, isObstacle: true, type: 'crate' },

    // Central Atrium / Lobby
    { x: 620, y: 450, w: 360, h: 25, type: 'concrete' }, // Central upper wall
    { x: 620, y: 450, w: 25, h: 260, type: 'concrete' }, // Central left wall
    { x: 955, y: 450, w: 25, h: 260, type: 'concrete' }, // Central right wall
    { x: 740, y: 620, w: 120, h: 40, isObstacle: true, type: 'server' }, // Center desk/pillar

    // East Server Farm
    { x: 1080, y: 380, w: 25, h: 580, type: 'concrete' }, // East wing wall
    // Server Racks
    { x: 1180, y: 460, w: 40, h: 220, isObstacle: true, type: 'server' },
    { x: 1300, y: 460, w: 40, h: 220, isObstacle: true, type: 'server' },
    { x: 1420, y: 460, w: 40, h: 220, isObstacle: true, type: 'server' },

    { x: 1180, y: 780, w: 120, h: 40, isObstacle: true, type: 'server' },
    { x: 1360, y: 780, w: 120, h: 40, isObstacle: true, type: 'server' },

    // North Executive Sector & Vault
    { x: 30, y: 340, w: 720, h: 25, type: 'concrete' }, // North divider west
    { x: 860, y: 340, w: 450, h: 25, type: 'concrete' }, // North divider east
    { x: 750, y: 150, w: 25, h: 190, type: 'concrete' }, // North inner room divider

    // North Vault Security Pillars
    { x: 320, y: 160, w: 60, h: 60, isObstacle: true, type: 'concrete' },
    { x: 540, y: 160, w: 60, h: 60, isObstacle: true, type: 'concrete' },
    { x: 980, y: 180, w: 80, h: 50, isObstacle: true, type: 'crate' },

    // Extraction Area Perimeter (Top Right)
    { x: 1310, y: 30, w: 25, h: 250, type: 'concrete' },
    { x: 1310, y: 280, w: 260, h: 25, type: 'concrete' },
  ],
  guards: [
    // Guard 1: Patrols South Corridor (Target 1)
    {
      id: 'guard-1',
      name: 'Enforcer Vane',
      type: 'standard',
      x: 700,
      y: 860,
      radius: 18,
      angle: 0,
      targetAngle: 0,
      patrolPoints: [
        { x: 540, y: 860 },
        { x: 880, y: 860 },
      ],
      currentWaypointIdx: 0,
      state: 'patrol',
      speed: 1.4,
      visionAngle: (70 * Math.PI) / 180,
      visionDistance: 210,
      detectionLevel: 0,
      investigatePos: null,
      investigateTimer: 0,
      shootCooldown: 0,
      isTarget: true,
      animFrame: 0,
      isEliminated: false,
      deathTimer: 0,
    },
    // Guard 2: Patrols West Cargo Warehouse
    {
      id: 'guard-2',
      name: 'Patrol Guard Ramos',
      type: 'standard',
      x: 240,
      y: 580,
      radius: 18,
      angle: Math.PI / 2,
      targetAngle: Math.PI / 2,
      patrolPoints: [
        { x: 140, y: 560 },
        { x: 420, y: 560 },
        { x: 420, y: 840 },
        { x: 140, y: 840 },
      ],
      currentWaypointIdx: 0,
      state: 'patrol',
      speed: 1.5,
      visionAngle: (65 * Math.PI) / 180,
      visionDistance: 200,
      detectionLevel: 0,
      investigatePos: null,
      investigateTimer: 0,
      shootCooldown: 0,
      isTarget: false,
      animFrame: 0,
      isEliminated: false,
      deathTimer: 0,
    },
    // Guard 3: Central Lobby Hunter (Target 2) - Fast & alert
    {
      id: 'guard-3',
      name: 'Hunter Stryker',
      type: 'hunter',
      x: 800,
      y: 530,
      radius: 19,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      patrolPoints: [
        { x: 800, y: 530 },
        { x: 800, y: 780 },
        { x: 670, y: 780 },
        { x: 920, y: 780 },
      ],
      currentWaypointIdx: 0,
      state: 'patrol',
      speed: 2.1,
      visionAngle: (80 * Math.PI) / 180,
      visionDistance: 230,
      detectionLevel: 0,
      investigatePos: null,
      investigateTimer: 0,
      shootCooldown: 0,
      isTarget: true,
      animFrame: 0,
      isEliminated: false,
      deathTimer: 0,
    },
    // Guard 4: Long-Range Watcher scanning East Server Hall
    {
      id: 'guard-4',
      name: 'Watcher Kross',
      type: 'watcher',
      x: 1260,
      y: 350,
      radius: 18,
      angle: Math.PI / 2,
      targetAngle: Math.PI / 2,
      patrolPoints: [
        { x: 1200, y: 350 },
        { x: 1460, y: 350 },
      ],
      currentWaypointIdx: 0,
      state: 'patrol',
      speed: 1.1,
      visionAngle: (45 * Math.PI) / 180,
      visionDistance: 320, // Long sniper sight
      detectionLevel: 0,
      investigatePos: null,
      investigateTimer: 0,
      shootCooldown: 0,
      isTarget: false,
      animFrame: 0,
      isEliminated: false,
      deathTimer: 0,
    },
    // Guard 5: North Executive Vault Commander (Target 3)
    {
      id: 'guard-5',
      name: 'Commander Thorne',
      type: 'hunter',
      x: 430,
      y: 190,
      radius: 20,
      angle: 0,
      targetAngle: 0,
      patrolPoints: [
        { x: 220, y: 190 },
        { x: 660, y: 190 },
      ],
      currentWaypointIdx: 0,
      state: 'patrol',
      speed: 1.7,
      visionAngle: (75 * Math.PI) / 180,
      visionDistance: 240,
      detectionLevel: 0,
      investigatePos: null,
      investigateTimer: 0,
      shootCooldown: 0,
      isTarget: true,
      animFrame: 0,
      isEliminated: false,
      deathTimer: 0,
    },
  ],
  intel: [
    {
      id: 'intel-1',
      x: 110,
      y: 720,
      collected: false,
      title: 'Obsidian Access Keycard',
    },
    {
      id: 'intel-2',
      x: 1470,
      y: 650,
      collected: false,
      title: 'Encrypted Syndicate Ledger',
    },
  ],
  extraction: {
    x: 1390,
    y: 80,
    w: 130,
    h: 130,
    active: false,
  },
};
