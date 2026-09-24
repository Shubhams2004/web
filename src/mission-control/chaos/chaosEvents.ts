import type { ChaosEventConfig, ChaosEventType } from './types';
import { missionAudio } from '../audio';

export const CHAOS_EVENTS: ChaosEventConfig[] = [
  {
    id: 'emoji_rain',
    title: 'RETRO PIXEL / EMOJI SHOWER',
    subtitle: 'High-density arcade sprites descending through atmosphere',
    badge: '👾 PIXEL RAIN',
    durationMs: 4000,
  },
  {
    id: 'ui_glitch',
    title: 'CHROMATIC CYBER GLITCH',
    subtitle: 'RGB buffer split and digital static burst',
    badge: '⚡ SIGNAL GLITCH',
    durationMs: 3600,
  },
  {
    id: 'screen_wobble',
    title: 'TECTONIC SCREEN OSCILLATION',
    subtitle: 'Gravitational wave anomaly passing through viewport',
    badge: '🌊 WOBBLE WAVE',
    durationMs: 3200,
  },
  {
    id: 'retro_arcade',
    title: '1984 PHOSPHOR COIN-OP OVERRIDE',
    subtitle: 'Cathode-ray tube green scanlines & arcade bezel simulation',
    badge: '🕹️ RETRO CGA',
    durationMs: 4200,
  },
  {
    id: 'falling_debris',
    title: 'GRAVITATIONAL ANOMALY DEBRIS',
    subtitle: 'Temporary UI components detaching and tumbling with simulated physics',
    badge: '☄️ TUMBLING DEBRIS',
    durationMs: 3800,
  },
  {
    id: 'particle_burst',
    title: 'SUPERNOVA PARTICLE DETONATION',
    subtitle: '360-degree quantum plasma burst radiating across the display',
    badge: '💥 PLASMA BURST',
    durationMs: 3500,
  },
  {
    id: 'alien_signal',
    title: 'EXTRATERRESTRIAL SIGNAL INTERCEPT',
    subtitle: 'Decrypted alien radar telemetry and orbital beacon frequencies',
    badge: '👽 ALIEN BEACON',
    durationMs: 4500,
  },
  {
    id: 'instability_sequence',
    title: 'MOCK HEURISTIC SUBROUTINE PANIC',
    subtitle: 'Simulated heuristic failure followed by automated recovery',
    badge: '⚠️ CORE INSTABILITY',
    durationMs: 4200,
  },
  // Rare Event (~3.5% chance)
  {
    id: 'golden_singularity',
    title: '✨ MYTHIC GOLDEN MATRIX SINGULARITY ✨',
    subtitle: 'Ultra-rare cosmic alignment! 1-in-30 probability achieved!',
    badge: '🌟 GOD MODE ANOMALY',
    durationMs: 5000,
    isRare: true,
  },
];

/**
 * Randomly picks a chaos event.
 * Has a 3.5% chance to roll the rare 'golden_singularity',
 * otherwise picks uniformly from the 8 core events.
 */
export function selectRandomChaosEvent(): ChaosEventConfig {
  const isRareRoll = Math.random() < 0.035;
  if (isRareRoll) {
    const rare = CHAOS_EVENTS.find((e) => e.isRare);
    if (rare) return rare;
  }

  const commonEvents = CHAOS_EVENTS.filter((e) => !e.isRare);
  const randomIndex = Math.floor(Math.random() * commonEvents.length);
  return commonEvents[randomIndex];
}

/**
 * Plays the corresponding synthesized sound effect for the active event.
 */
export function playChaosSound(event: ChaosEventConfig) {
  switch (event.id) {
    case 'emoji_rain':
      missionAudio.playLabSound('chime');
      break;
    case 'ui_glitch':
      missionAudio.playLabSound('glitch');
      break;
    case 'screen_wobble':
      missionAudio.playScreenWobble();
      break;
    case 'retro_arcade':
      missionAudio.playLabSound('warp');
      break;
    case 'falling_debris':
      missionAudio.playLabSound('subbass');
      break;
    case 'particle_burst':
      missionAudio.playParticleExplosion();
      break;
    case 'alien_signal':
      missionAudio.playAlienSignal();
      break;
    case 'instability_sequence':
      missionAudio.playChaosAlarm();
      break;
    case 'golden_singularity':
      missionAudio.playGoldenAscension();
      break;
  }
}
