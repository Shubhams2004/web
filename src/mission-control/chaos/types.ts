export type ChaosEventType =
  | 'emoji_rain'
  | 'ui_glitch'
  | 'screen_wobble'
  | 'retro_arcade'
  | 'falling_debris'
  | 'particle_burst'
  | 'alien_signal'
  | 'instability_sequence'
  | 'golden_singularity'; // Rare event (approx 3% chance)

export interface ChaosEventConfig {
  id: ChaosEventType;
  title: string;
  subtitle: string;
  badge: string;
  durationMs: number;
  isRare?: boolean;
}
