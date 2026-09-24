import { RetroGamePage } from './retro-racer';
import type { GameDefinition } from './types';

export * from './types';
export * from './retro-racer';

/**
 * Registry of playable arcade games on the website.
 * Makes adding future games as simple as registering an entry here.
 */
export const AVAILABLE_GAMES: GameDefinition[] = [
  {
    id: 'retro-racer',
    title: 'Retro Racer',
    subtitle: '80s Arcade Highway Pursuit',
    description: 'High-speed top-down arcade racing with turbo boosts, near-miss bonuses, and chiptune audio.',
    genre: 'Racing',
    releaseYear: '1986 Edition',
    badge: 'Retro Arcade',
    route: '/game',
    component: RetroGamePage,
  },
];

export const getGameById = (id: string): GameDefinition | undefined => {
  return AVAILABLE_GAMES.find((g) => g.id === id);
};
