import type { SectorMission } from './types';

/**
 * Registry of playable game sectors in Mission Control.
 * Future games can be registered here in seconds.
 */
export const SECTOR_MISSIONS: SectorMission[] = [
  {
    id: 'pixel-dungeon',
    sectorCode: 'SEC-01',
    codeName: 'OPERATION CRYPTWALKER',
    title: 'Pixel Dungeon',
    subtitle: 'Procedural Catacombs & Roguelike Exploration',
    description:
      'Turn-based tactical dungeon crawler. Navigate procedurally generated subterranean chambers, breach locked vaults, engage goblins and skeletons, and descend into unknown depths.',
    genre: 'Turn-Based RPG',
    status: 'ONLINE',
    clearanceLevel: 'LEVEL 1',
    threatLevel: 'CRITICAL',
    route: '#/game/pixel-dungeon',
    gameId: 'pixel-dungeon',
    highScoreKey: 'pixel_dungeon_highscore',
    iconName: 'Shield',
    statsLabel: 'Max Depth & Gold Score',
  },
  {
    id: 'zombie-survival',
    sectorCode: 'SEC-02',
    codeName: 'OPERATION QUARANTINE',
    title: 'Zombie Survival',
    subtitle: 'Top-Down Biohazard Containment Arena',
    description:
      'High-intensity 360-degree tactical survival. Neutralize escalating waves of infected mutants with rapid-fire weapons, scattershot munitions, and tactical ordnance.',
    genre: 'Arena Action',
    status: 'ONLINE',
    clearanceLevel: 'LEVEL 2',
    threatLevel: 'ELEVATED',
    route: '#/game/zombie-survival',
    gameId: 'zombie-survival',
    highScoreKey: 'zombie_survival_highscore',
    iconName: 'Skull',
    statsLabel: 'Wave Kills & Combat Score',
  },
  {
    id: 'retro-racer',
    sectorCode: 'SEC-03',
    codeName: 'OPERATION OVERDRIVE',
    title: 'Retro Racer',
    subtitle: 'High-Speed Neon Highway Pursuit',
    description:
      'Turbine-powered velocity gauntlet. Maneuver heavy civilian traffic at hypersonic speeds, draft slipstreams for nitro boosts, and execute split-second near-miss maneuvers.',
    genre: 'Arcade Racing',
    status: 'ONLINE',
    clearanceLevel: 'LEVEL 1',
    threatLevel: 'NOMINAL',
    route: '#/game/retro-racer',
    gameId: 'retro-racer',
    highScoreKey: 'retro_racer_highscore',
    iconName: 'Car',
    statsLabel: 'Highway Distance & Near Misses',
  },
];
