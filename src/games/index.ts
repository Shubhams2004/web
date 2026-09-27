import { SprintRunPage } from './sprint-run';
import { RetroGamePage } from './retro-racer';
import { ZombieGamePage } from './zombie-survival';
import { PixelDungeonPage } from './pixel-dungeon';
import { ShadowHuntPage } from './shadow-hunt';
import type { GameDefinition } from './types';

export * from './types';
export { SprintRunPage } from './sprint-run';
export { RetroGamePage } from './retro-racer';
export { ZombieGamePage } from './zombie-survival';
export { PixelDungeonPage } from './pixel-dungeon';
export { ShadowHuntPage } from './shadow-hunt';

/**
 * Registry of playable arcade games on the website.
 * Makes adding future games as simple as registering an entry here.
 */
export const AVAILABLE_GAMES: GameDefinition[] = [
  {
    id: 'sprint-run',
    title: 'Sprint Run',
    subtitle: '3D Jungle Temple Endless Runner',
    description: 'High-speed modern 3D runner: swipe to leap across chasms, slide under spiked stone arches, dodge ancient ruin pillars, and trigger supersonic sprint boosts.',
    genre: 'Action',
    releaseYear: '2026 3D Edition',
    badge: '3D Endless Runner',
    route: '/game/sprint-run',
    thumbnailUrl: '/src/assets/images/sprint_run_card_preview_1790417905607.jpg',
    component: SprintRunPage,
  },
  {
    id: 'shadow-hunt',
    title: 'Shadow Hunt',
    subtitle: 'Tactical Stealth Assassin',
    description: 'Touch-first stealth infiltration: bypass vision cones, eliminate high-value security officers, and exfiltrate cleanly.',
    genre: 'Action',
    releaseYear: '2026 Edition',
    badge: 'Stealth Infiltration',
    route: '/game/shadow-hunt',
    component: ShadowHuntPage,
  },
  {
    id: 'pixel-dungeon',
    title: 'Pixel Dungeon',
    subtitle: 'Procedural Roguelike Crypt Crawler',
    description: 'Turn-based pixel dungeon crawler: explore rooms, slay goblins, bats and skeletons, find keys, and descend deeper.',
    genre: 'RPG',
    releaseYear: '1991 Edition',
    badge: 'Pixel Roguelike',
    route: '/game/pixel-dungeon',
    component: PixelDungeonPage,
  },
  {
    id: 'zombie-survival',
    title: 'Zombie Survival',
    subtitle: 'Quarantine Arena 1989',
    description: 'Top-down retro zombie survival: fend off escalating waves with power-up weapons, shotguns, and tactical nukes.',
    genre: 'Action',
    releaseYear: '1989 Edition',
    badge: 'Arcade Survival',
    route: '/game/zombie-survival',
    component: ZombieGamePage,
  },
  {
    id: 'retro-racer',
    title: 'Retro Racer',
    subtitle: '80s Arcade Highway Pursuit',
    description: 'High-speed top-down arcade racing with turbo boosts, near-miss bonuses, and chiptune audio.',
    genre: 'Racing',
    releaseYear: '1986 Edition',
    badge: 'Retro Arcade',
    route: '/game/retro-racer',
    component: RetroGamePage,
  },
];

export const getGameById = (id: string): GameDefinition | undefined => {
  return AVAILABLE_GAMES.find((g) => g.id === id);
};
