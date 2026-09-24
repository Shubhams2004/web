import React from 'react';

/**
 * Shared game registry definition for multi-game scalability
 */
export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  genre: 'Arcade' | 'Puzzle' | 'Action' | 'Racing' | 'Strategy' | 'RPG';
  releaseYear: string;
  thumbnailUrl?: string;
  badge?: string;
  route: string;
  component: React.ComponentType<{ onBack: () => void; onSwitchGame?: (gameId: string) => void }>;
}

export type GameId = 'retro-racer' | 'zombie-survival' | 'pixel-dungeon';
