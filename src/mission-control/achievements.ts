import type { Achievement } from './types';
import { missionAudio } from './audio';

const STORAGE_KEY = 'mission_control_achievements';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_contact',
    title: 'First Contact',
    description: 'Breached the perimeter and established link with Mission Control HQ.',
    category: 'EXPLORATION',
    icon: 'Radio',
    unlocked: false,
    xpValue: 100,
  },
  {
    id: 'recon_master',
    title: 'Reconnaissance Protocol',
    description: 'Surveyed telemetry logs for all three active operational sectors.',
    category: 'EXPLORATION',
    icon: 'Compass',
    unlocked: false,
    xpValue: 150,
  },
  {
    id: 'audio_technician',
    title: 'Sonic Synthesist',
    description: 'Synthesized experimental waveforms in the Audio Frequency Lab.',
    category: 'LAB',
    icon: 'Activity',
    unlocked: false,
    xpValue: 200,
  },
  {
    id: 'cartographer',
    title: 'Dungeon Cartographer',
    description: 'Compiled a real-time procedural dungeon seed in the Experimental Matrix.',
    category: 'LAB',
    icon: 'Layers',
    unlocked: false,
    xpValue: 200,
  },
  {
    id: 'dungeon_crawler',
    title: 'Crypt Veteran',
    description: 'Logged an active exploration record in Sector 01 (Pixel Dungeon).',
    category: 'MASTERY',
    icon: 'Shield',
    unlocked: false,
    xpValue: 250,
  },
  {
    id: 'zombie_slayer',
    title: 'Biohazard Sentinel',
    description: 'Logged combat telemetry in Sector 02 (Zombie Survival).',
    category: 'COMBAT',
    icon: 'Skull',
    unlocked: false,
    xpValue: 250,
  },
  {
    id: 'speed_demon',
    title: 'Overdrive Ace',
    description: 'Logged supersonic velocity in Sector 03 (Retro Racer).',
    category: 'MASTERY',
    icon: 'Gauge',
    unlocked: false,
    xpValue: 250,
  },
  {
    id: 'system_analyst',
    title: 'Chief Systems Analyst',
    description: 'Executed complete 5-stage telemetry diagnostics across the command center.',
    category: 'MASTERY',
    icon: 'Cpu',
    unlocked: false,
    xpValue: 300,
  },
  {
    id: 'entropy_unleashed',
    title: 'Entropy Unleashed',
    description: 'Discharged the experimental Quantum Chaos Button in Mission Control.',
    category: 'LAB',
    icon: 'Flame',
    unlocked: false,
    xpValue: 200,
  },
  {
    id: 'cosmic_singularity',
    title: 'Cosmic Singularity',
    description: 'Triggered the ultra-rare 1-in-30 Golden Singularity anomaly.',
    category: 'MASTERY',
    icon: 'Sparkles',
    unlocked: false,
    xpValue: 500,
  },
];

export function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const parsed: Record<string, { unlocked: boolean; unlockedAt?: string }> = JSON.parse(raw);

    // Also auto-check game scores in localStorage!
    const pixelScore = parseInt(localStorage.getItem('pixel_dungeon_highscore') || '0', 10);
    const zombieScore = parseInt(localStorage.getItem('zombie_survival_highscore') || '0', 10);
    const racerScore = parseInt(localStorage.getItem('retro_racer_highscore') || '0', 10);

    return INITIAL_ACHIEVEMENTS.map((ach) => {
      const saved = parsed[ach.id];
      let isUnlocked = saved ? saved.unlocked : false;
      let date = saved?.unlockedAt;

      // Dynamic check for game achievements based on recorded scores
      if (!isUnlocked) {
        if (ach.id === 'dungeon_crawler' && pixelScore > 0) {
          isUnlocked = true;
          date = new Date().toLocaleDateString();
        } else if (ach.id === 'zombie_slayer' && zombieScore > 0) {
          isUnlocked = true;
          date = new Date().toLocaleDateString();
        } else if (ach.id === 'speed_demon' && racerScore > 0) {
          isUnlocked = true;
          date = new Date().toLocaleDateString();
        }
      }

      return {
        ...ach,
        unlocked: isUnlocked,
        unlockedAt: date,
      };
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function unlockAchievement(id: string): boolean {
  try {
    const list = getStoredAchievements();
    const target = list.find((a) => a.id === id);
    if (!target || target.unlocked) return false;

    target.unlocked = true;
    target.unlockedAt = new Date().toLocaleDateString();

    const saveObj: Record<string, { unlocked: boolean; unlockedAt: string }> = {};
    for (const a of list) {
      if (a.unlocked) {
        saveObj[a.id] = { unlocked: true, unlockedAt: a.unlockedAt || new Date().toLocaleDateString() };
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
    missionAudio.playAchievementFanfare();
    return true;
  } catch {
    return false;
  }
}
