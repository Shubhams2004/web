export interface SectorMission {
  id: string;
  codeName: string;
  sectorCode: string;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  status: 'ONLINE' | 'STANDBY' | 'ENGAGED';
  clearanceLevel: 'LEVEL 1' | 'LEVEL 2' | 'MAX SEC';
  threatLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  route: string;
  gameId: string;
  highScoreKey: string;
  iconName: string;
  statsLabel: string;
}

export interface MissionLogEntry {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'SECTOR' | 'LAB' | 'CLEARANCE';
  message: string;
  status: 'info' | 'success' | 'warning' | 'alert';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'EXPLORATION' | 'COMBAT' | 'LAB' | 'MASTERY';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
}

export interface SystemTelemetry {
  status: 'OPTIMAL' | 'DEGRADED' | 'TEST_MODE';
  activeSectors: number;
  experimentsActive: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  browserEngine: string;
  viewportRes: string;
  devicePixelRatio: number;
  hardwareThreads: number;
  onlineStatus: boolean;
  audioState: string;
}
