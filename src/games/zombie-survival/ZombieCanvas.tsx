import React, { useRef, useEffect, useCallback } from 'react';
import { zombieAudio } from './audio';
import type {
  ZombieGameState,
  KeyControls,
  Player,
  Zombie,
  ZombieType,
  Bullet,
  PowerUpItem,
  PowerUpType,
  Particle,
  BloodStain,
  FloatingText,
  ZombieGameStats,
} from './types';

interface ZombieCanvasProps {
  gameState: ZombieGameState;
  onGameStateChange: (state: ZombieGameState) => void;
  onStatsUpdate: (stats: ZombieGameStats) => void;
  externalControls: KeyControls;
  crtEnabled: boolean;
  onTriggerBomb?: (callback: () => void) => void;
}

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 580;
const ARENA_PADDING = 24;

export const ZombieCanvas: React.FC<ZombieCanvasProps> = ({
  gameState,
  onGameStateChange,
  onStatsUpdate,
  externalControls,
  crtEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Keyboard state
  const keysDownRef = useRef<{ [code: string]: boolean }>({});

  // Mouse / Pointer aim tracking
  const mousePosRef = useRef<{ x: number; y: number; isDown: boolean }>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    isDown: false,
  });

  // High score in local storage
  const highScoreRef = useRef<number>(0);

  // Score & stats
  const scoreRef = useRef<number>(0);
  const killsRef = useRef<number>(0);
  const waveRef = useRef<number>(1);
  const gameTimeRef = useRef<number>(0);

  // Spawning
  const spawnTimerRef = useRef<number>(0);
  const nextSpawnIntervalRef = useRef<number>(1.6);

  // Screen shake
  const screenShakeRef = useRef<number>(0);

  // Game entities
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 0,
    vy: 0,
    speed: 170,
    health: 100,
    maxHealth: 100,
    angle: 0,
    invulnerableTime: 0,
    weapon: 'pistol',
    weaponTimeRemaining: 0,
    shootCooldown: 0,
    walkFrame: 0,
    speedBoostTime: 0,
  });

  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bloodStainsRef = useRef<BloodStain[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zombie_survival_highscore');
      if (saved) {
        highScoreRef.current = parseInt(saved, 10) || 0;
      }
    } catch {}
  }, []);

  // Sync high score to storage
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScoreRef.current) {
      highScoreRef.current = newScore;
      try {
        localStorage.setItem('zombie_survival_highscore', newScore.toString());
      } catch {}
    }
  }, []);

  // Initialize or restart the game
  const initGame = useCallback(() => {
    scoreRef.current = 0;
    killsRef.current = 0;
    waveRef.current = 1;
    gameTimeRef.current = 0;
    spawnTimerRef.current = 0;
    nextSpawnIntervalRef.current = 1.6;
    screenShakeRef.current = 0;

    playerRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: 0,
      vy: 0,
      speed: 170,
      health: 100,
      maxHealth: 100,
      angle: -Math.PI / 2,
      invulnerableTime: 1.0,
      weapon: 'pistol',
      weaponTimeRemaining: 0,
      shootCooldown: 0,
      walkFrame: 0,
      speedBoostTime: 0,
    };

    zombiesRef.current = [];
    bulletsRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    bloodStainsRef.current = [];
    floatingTextsRef.current = [];

    zombieAudio.playWaveStart();

    // Spawn 3 initial walkers
    for (let i = 0; i < 3; i++) {
      spawnZombie('walker');
    }
  }, []);

  // Spawn a zombie with balanced types and difficulty scaling
  const spawnZombie = (forcedType?: ZombieType) => {
    if (zombiesRef.current.length >= 50) return; // limit active count for top performance

    let type: ZombieType = forcedType || 'walker';
    if (!forcedType) {
      const currentWave = waveRef.current;
      const roll = Math.random();

      if (currentWave >= 3 && roll < 0.2) {
        type = 'tank';
      } else if (currentWave >= 2 && roll < 0.45) {
        type = 'runner';
      } else if (currentWave >= 4 && roll < 0.6) {
        type = 'crawler';
      } else {
        type = 'walker';
      }
    }

    // Spawn around arena periphery
    let x = 0;
    let y = 0;
    const side = Math.floor(Math.random() * 4);
    const offset = 20;

    if (side === 0) {
      // Top
      x = ARENA_PADDING + Math.random() * (CANVAS_WIDTH - ARENA_PADDING * 2);
      y = ARENA_PADDING - offset;
    } else if (side === 1) {
      // Right
      x = CANVAS_WIDTH - ARENA_PADDING + offset;
      y = ARENA_PADDING + Math.random() * (CANVAS_HEIGHT - ARENA_PADDING * 2);
    } else if (side === 2) {
      // Bottom
      x = ARENA_PADDING + Math.random() * (CANVAS_WIDTH - ARENA_PADDING * 2);
      y = CANVAS_HEIGHT - ARENA_PADDING + offset;
    } else {
      // Left
      x = ARENA_PADDING - offset;
      y = ARENA_PADDING + Math.random() * (CANVAS_HEIGHT - ARENA_PADDING * 2);
    }

    let speed = 65;
    let health = 45;
    let radius = 13;
    let color = '#22c55e'; // emerald walker
    let damage = 12;
    let scoreValue = 100;

    // Difficulty multiplier based on wave
    const waveSpeedBonus = Math.min(25, (waveRef.current - 1) * 3);

    if (type === 'runner') {
      speed = 125 + waveSpeedBonus;
      health = 25;
      radius = 11;
      color = '#ef4444'; // crimson runner
      damage = 10;
      scoreValue = 150;
    } else if (type === 'tank') {
      speed = 42 + waveSpeedBonus * 0.5;
      health = 180;
      radius = 19;
      color = '#a855f7'; // purple brute
      damage = 25;
      scoreValue = 350;
    } else if (type === 'crawler') {
      speed = 88 + waveSpeedBonus;
      health = 35;
      radius = 10;
      color = '#eab308'; // yellowish crawler
      damage = 8;
      scoreValue = 120;
    } else {
      speed = 65 + waveSpeedBonus;
    }

    zombiesRef.current.push({
      id: `z_${Date.now()}_${Math.random()}`,
      x,
      y,
      vx: 0,
      vy: 0,
      speed,
      health,
      maxHealth: health,
      radius,
      type,
      color,
      walkFrame: Math.random() * 10,
      hitFlashTime: 0,
      damage,
      scoreValue,
    });
  };

  // Add floating combat text
  const addFloatingText = (text: string, x: number, y: number, color = '#fbbf24', scale = 1) => {
    floatingTextsRef.current.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      vy: -35,
      alpha: 1.0,
      color,
      scale,
    });
  };

  // Trigger Nuke (bomb)
  const triggerNuke = useCallback(() => {
    if (gameState !== 'playing') return;

    screenShakeRef.current = 18;
    zombieAudio.playNuke();

    const killCount = zombiesRef.current.length;
    let bonusScore = 0;

    zombiesRef.current.forEach((z) => {
      bonusScore += z.scoreValue;
      killsRef.current += 1;

      // Blood and particles for each zombie
      bloodStainsRef.current.push({
        x: z.x,
        y: z.y,
        radius: 14 + Math.random() * 10,
        color: '#881337',
        alpha: 0.8,
      });

      for (let p = 0; p < 8; p++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 120;
        particlesRef.current.push({
          x: z.x,
          y: z.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 3 + Math.random() * 3,
          color: '#e11d48',
          alpha: 1.0,
          life: 0,
          maxLife: 0.6,
          decay: 1.8,
        });
      }
    });

    zombiesRef.current = [];
    scoreRef.current += bonusScore;
    saveHighScore(scoreRef.current);

    addFloatingText(`TACTICAL NUKE! +${bonusScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, '#f59e0b', 1.4);
  }, [gameState, saveHighScore]);

  // Expose bomb trigger
  useEffect(() => {
    (window as unknown as { triggerZombieNuke?: () => void }).triggerZombieNuke = triggerNuke;
    return () => {
      delete (window as unknown as { triggerZombieNuke?: () => void }).triggerZombieNuke;
    };
  }, [triggerNuke]);

  // Weapon Firing
  const fireWeapon = () => {
    const player = playerRef.current;
    if (player.shootCooldown > 0) return;

    const angle = player.angle;
    const barrelDist = 18;
    const muzzleX = player.x + Math.cos(angle) * barrelDist;
    const muzzleY = player.y + Math.sin(angle) * barrelDist;

    if (player.weapon === 'shotgun') {
      // 5-pellet spread
      player.shootCooldown = 0.38;
      zombieAudio.playShotgun();
      screenShakeRef.current = 4;

      const spreadCount = 5;
      const baseSpread = 0.35; // radians spread

      for (let i = 0; i < spreadCount; i++) {
        const pelletAngle = angle - baseSpread / 2 + (baseSpread / (spreadCount - 1)) * i + (Math.random() - 0.5) * 0.08;
        const speed = 440 + Math.random() * 60;
        bulletsRef.current.push({
          id: `b_${Date.now()}_${Math.random()}`,
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(pelletAngle) * speed,
          vy: Math.sin(pelletAngle) * speed,
          damage: 26,
          life: 0.42,
          color: '#f97316',
          radius: 3,
        });
      }
    } else if (player.weapon === 'machinegun') {
      // Rapid fire
      player.shootCooldown = 0.095;
      zombieAudio.playMachineGun();
      screenShakeRef.current = 1.8;

      const jitter = (Math.random() - 0.5) * 0.12;
      const bulletAngle = angle + jitter;
      const speed = 520;

      bulletsRef.current.push({
        id: `b_${Date.now()}_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(bulletAngle) * speed,
        vy: Math.sin(bulletAngle) * speed,
        damage: 20,
        life: 0.65,
        color: '#38bdf8',
        radius: 2.5,
      });
    } else {
      // Standard Pistol
      player.shootCooldown = 0.22;
      zombieAudio.playPistol();
      screenShakeRef.current = 2.2;

      const speed = 480;
      bulletsRef.current.push({
        id: `b_${Date.now()}_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 28,
        life: 0.65,
        color: '#fbbf24',
        radius: 2.5,
      });
    }

    // Muzzle sparks
    for (let s = 0; s < 4; s++) {
      const sparkAngle = angle + (Math.random() - 0.5) * 0.8;
      const sparkSpd = 50 + Math.random() * 80;
      particlesRef.current.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(sparkAngle) * sparkSpd,
        vy: Math.sin(sparkAngle) * sparkSpd,
        size: 2,
        color: '#fef08a',
        alpha: 1.0,
        life: 0,
        maxLife: 0.12,
        decay: 8.0,
      });
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll on game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      zombieAudio.userInteracted();
      keysDownRef.current[e.code] = true;

      if (e.code === 'KeyP') {
        if (gameState === 'playing') onGameStateChange('paused');
        else if (gameState === 'paused') onGameStateChange('playing');
      }

      if (e.code === 'KeyR') {
        initGame();
        onGameStateChange('playing');
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        if (gameState === 'start' || gameState === 'gameover') {
          initGame();
          onGameStateChange('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, onGameStateChange, initGame]);

  // Pointer / Touch / Click Handlers on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    zombieAudio.userInteracted();

    if (gameState === 'start' || gameState === 'gameover') {
      initGame();
      onGameStateChange('playing');
      return;
    }

    if (gameState === 'paused') {
      onGameStateChange('playing');
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x, y, isDown: true };

    // Point player towards tap / click location
    playerRef.current.angle = Math.atan2(y - playerRef.current.y, x - playerRef.current.x);
    fireWeapon();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    mousePosRef.current.x = x;
    mousePosRef.current.y = y;

    // Desktop mouse tracking: aim towards mouse
    if (gameState === 'playing') {
      playerRef.current.angle = Math.atan2(y - playerRef.current.y, x - playerRef.current.x);
    }
  };

  const handlePointerUp = () => {
    mousePosRef.current.isDown = false;
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const rawDelta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent physics explosions on background tab
      const dt = Math.min(rawDelta, 0.05);

      // ==========================================
      // UPDATE SIMULATION (When Playing)
      // ==========================================
      if (gameState === 'playing') {
        gameTimeRef.current += dt;
        const player = playerRef.current;

        // Wave progression: wave advances every 30 seconds
        const calculatedWave = Math.floor(gameTimeRef.current / 28) + 1;
        if (calculatedWave > waveRef.current) {
          waveRef.current = calculatedWave;
          zombieAudio.playWaveStart();
          addFloatingText(`WAVE ${calculatedWave}!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, '#10b981', 1.6);
        }

        // --- 1. Player Input & Movement ---
        const keys = keysDownRef.current;
        let moveX = 0;
        let moveY = 0;

        if (keys['KeyW'] || keys['ArrowUp'] || externalControls.up) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown'] || externalControls.down) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft'] || externalControls.left) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight'] || externalControls.right) moveX += 1;

        // Diagonal normalization
        if (moveX !== 0 && moveY !== 0) {
          const invSqrt2 = 0.7071;
          moveX *= invSqrt2;
          moveY *= invSqrt2;
        }

        // Apply Speed Boost if active
        let currentSpeed = player.speed;
        if (player.speedBoostTime > 0) {
          player.speedBoostTime -= dt;
          currentSpeed *= 1.45;
        }

        player.vx = moveX * currentSpeed;
        player.vy = moveY * currentSpeed;

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Arena boundaries constraint
        const minX = ARENA_PADDING + 14;
        const maxX = CANVAS_WIDTH - ARENA_PADDING - 14;
        const minY = ARENA_PADDING + 14;
        const maxY = CANVAS_HEIGHT - ARENA_PADDING - 14;

        player.x = Math.max(minX, Math.min(maxX, player.x));
        player.y = Math.max(minY, Math.min(maxY, player.y));

        if (moveX !== 0 || moveY !== 0) {
          player.walkFrame += dt * 10;

          // If no mouse actively down, aim in move direction or towards closest zombie
          if (!mousePosRef.current.isDown && !externalControls.attack) {
            // Find closest zombie within sight for intelligent aim assist
            let closestZ: Zombie | null = null;
            let minDist = 220;

            for (const z of zombiesRef.current) {
              const d = Math.hypot(z.x - player.x, z.y - player.y);
              if (d < minDist) {
                minDist = d;
                closestZ = z;
              }
            }

            if (closestZ) {
              player.angle = Math.atan2(closestZ.y - player.y, closestZ.x - player.x);
            } else {
              player.angle = Math.atan2(moveY, moveX);
            }
          }
        }

        // Weapon timer decay (shotgun / machinegun)
        if (player.weaponTimeRemaining > 0) {
          player.weaponTimeRemaining -= dt;
          if (player.weaponTimeRemaining <= 0) {
            player.weapon = 'pistol';
            player.weaponTimeRemaining = 0;
            addFloatingText('Pistol Ready', player.x, player.y - 20, '#94a3b8');
          }
        }

        // Weapon cooldown
        if (player.shootCooldown > 0) {
          player.shootCooldown -= dt;
        }

        // Invulnerability after hit
        if (player.invulnerableTime > 0) {
          player.invulnerableTime -= dt;
        }

        // Firing check: Key Space / J / Mouse Down / Mobile Attack held
        const isShooting =
          keys['Space'] ||
          keys['KeyJ'] ||
          keys['KeyK'] ||
          mousePosRef.current.isDown ||
          externalControls.attack;

        if (isShooting) {
          // If using touch controls, ensure we aim at closest zombie or maintain facing angle
          if (externalControls.attack && zombiesRef.current.length > 0) {
            let closestZ: Zombie | null = null;
            let minDist = 300;
            for (const z of zombiesRef.current) {
              const d = Math.hypot(z.x - player.x, z.y - player.y);
              if (d < minDist) {
                minDist = d;
                closestZ = z;
              }
            }
            if (closestZ) {
              player.angle = Math.atan2(closestZ.y - player.y, closestZ.x - player.x);
            }
          }
          fireWeapon();
        }

        // --- 2. Zombie Spawning ---
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current >= nextSpawnIntervalRef.current) {
          spawnTimerRef.current = 0;
          spawnZombie();

          // Spawn rate increases dynamically with time
          const baseRate = 1.6;
          const minRate = 0.45;
          const rateDecay = Math.min(1.15, gameTimeRef.current * 0.012 + waveRef.current * 0.08);
          nextSpawnIntervalRef.current = Math.max(minRate, baseRate - rateDecay);

          // Eerie ambient groaning periodically
          if (Math.random() < 0.25) {
            zombieAudio.playZombieGroan();
          }
        }

        // --- 3. Update Zombies ---
        for (let i = zombiesRef.current.length - 1; i >= 0; i--) {
          const z = zombiesRef.current[i];

          // Flash decay
          if (z.hitFlashTime > 0) z.hitFlashTime -= dt;

          // Steer directly toward player
          const dx = player.x - z.x;
          const dy = player.y - z.y;
          const dist = Math.hypot(dx, dy) || 1;

          z.vx = (dx / dist) * z.speed;
          z.vy = (dy / dist) * z.speed;

          // Push apart from other zombies (separation/boids for crowd physics)
          for (let j = 0; j < zombiesRef.current.length; j++) {
            if (i === j) continue;
            const other = zombiesRef.current[j];
            const ox = z.x - other.x;
            const oy = z.y - other.y;
            const oDist = Math.hypot(ox, oy);
            const minDist = z.radius + other.radius;
            if (oDist < minDist && oDist > 0) {
              const push = (minDist - oDist) / minDist;
              z.x += (ox / oDist) * push * 15 * dt;
              z.y += (oy / oDist) * push * 15 * dt;
            }
          }

          z.x += z.vx * dt;
          z.y += z.vy * dt;
          z.walkFrame += dt * (z.speed / 15);

          // Collision with Player
          const playerDist = Math.hypot(player.x - z.x, player.y - z.y);
          if (playerDist < z.radius + 12) {
            if (player.invulnerableTime <= 0) {
              player.health -= z.damage;
              player.invulnerableTime = 0.8;
              screenShakeRef.current = 8;
              zombieAudio.playPlayerHurt();

              // Blood particles around player
              for (let p = 0; p < 6; p++) {
                const ang = Math.random() * Math.PI * 2;
                particlesRef.current.push({
                  x: player.x,
                  y: player.y,
                  vx: Math.cos(ang) * 90,
                  vy: Math.sin(ang) * 90,
                  size: 3,
                  color: '#dc2626',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.4,
                  decay: 2.5,
                });
              }

              // Check Game Over
              if (player.health <= 0) {
                player.health = 0;
                saveHighScore(scoreRef.current);
                zombieAudio.playGameOver();
                onGameStateChange('gameover');
                break;
              }
            }
          }
        }

        // --- 4. Update Bullets & Collisions with Zombies ---
        for (let bIdx = bulletsRef.current.length - 1; bIdx >= 0; bIdx--) {
          const b = bulletsRef.current[bIdx];
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dt;

          let bulletHit = false;

          // Boundary check
          if (
            b.x < ARENA_PADDING ||
            b.x > CANVAS_WIDTH - ARENA_PADDING ||
            b.y < ARENA_PADDING ||
            b.y > CANVAS_HEIGHT - ARENA_PADDING ||
            b.life <= 0
          ) {
            bulletsRef.current.splice(bIdx, 1);
            continue;
          }

          // Zombie hit check
          for (let zIdx = zombiesRef.current.length - 1; zIdx >= 0; zIdx--) {
            const z = zombiesRef.current[zIdx];
            const dist = Math.hypot(z.x - b.x, z.y - b.y);

            if (dist < z.radius + b.radius) {
              bulletHit = true;
              z.health -= b.damage;
              z.hitFlashTime = 0.08;

              // Knockback
              const hitAng = Math.atan2(b.vy, b.vx);
              z.x += Math.cos(hitAng) * 6;
              z.y += Math.sin(hitAng) * 6;

              // Blood splatter particles
              for (let p = 0; p < 4; p++) {
                const pAng = hitAng + (Math.random() - 0.5) * 1.2;
                const pSpd = 50 + Math.random() * 80;
                particlesRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: Math.cos(pAng) * pSpd,
                  vy: Math.sin(pAng) * pSpd,
                  size: 2.5,
                  color: '#b91c1c',
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.35,
                  decay: 3.0,
                });
              }

              if (z.health <= 0) {
                // Zombie killed!
                zombieAudio.playZombieDie();
                killsRef.current += 1;
                scoreRef.current += z.scoreValue;
                saveHighScore(scoreRef.current);

                // Blood puddle on arena floor (capped at 50)
                if (bloodStainsRef.current.length > 50) {
                  bloodStainsRef.current.shift();
                }
                bloodStainsRef.current.push({
                  x: z.x,
                  y: z.y,
                  radius: 12 + Math.random() * 8,
                  color: '#7f1d1d',
                  alpha: 0.65,
                });

                // Floating score text
                addFloatingText(`+${z.scoreValue}`, z.x, z.y - 12, '#fbbf24', 1.0);

                // Chance to drop power-up (15% drop rate)
                if (Math.random() < 0.16) {
                  const roll = Math.random();
                  let pType: PowerUpType = 'health';
                  if (roll < 0.32) pType = 'health';
                  else if (roll < 0.58) pType = 'shotgun';
                  else if (roll < 0.82) pType = 'machinegun';
                  else if (roll < 0.93) pType = 'speed';
                  else pType = 'nuke';

                  powerUpsRef.current.push({
                    id: `pu_${Date.now()}_${Math.random()}`,
                    x: z.x,
                    y: z.y,
                    type: pType,
                    radius: 11,
                    pulsePhase: 0,
                    lifeTime: 12.0, // remains on ground for 12s
                  });
                }

                // Remove zombie
                zombiesRef.current.splice(zIdx, 1);
              } else {
                zombieAudio.playZombieHurt();
              }

              break; // bullet absorbed
            }
          }

          if (bulletHit) {
            bulletsRef.current.splice(bIdx, 1);
          }
        }

        // --- 5. Update Power-ups ---
        for (let puIdx = powerUpsRef.current.length - 1; puIdx >= 0; puIdx--) {
          const pu = powerUpsRef.current[puIdx];
          pu.pulsePhase += dt * 4;
          pu.lifeTime -= dt;

          if (pu.lifeTime <= 0) {
            powerUpsRef.current.splice(puIdx, 1);
            continue;
          }

          // Player pickup collision
          const pDist = Math.hypot(player.x - pu.x, player.y - pu.y);
          if (pDist < pu.radius + 15) {
            zombieAudio.playPowerUp();

            if (pu.type === 'health') {
              player.health = Math.min(player.maxHealth, player.health + 35);
              addFloatingText('+35 HP', player.x, player.y - 25, '#10b981', 1.2);
            } else if (pu.type === 'shotgun') {
              player.weapon = 'shotgun';
              player.weaponTimeRemaining = 12.0;
              addFloatingText('SHOTGUN!', player.x, player.y - 25, '#f97316', 1.3);
            } else if (pu.type === 'machinegun') {
              player.weapon = 'machinegun';
              player.weaponTimeRemaining = 10.0;
              addFloatingText('MACHINE GUN!', player.x, player.y - 25, '#38bdf8', 1.3);
            } else if (pu.type === 'speed') {
              player.speedBoostTime = 8.0;
              addFloatingText('SPEED BOOST!', player.x, player.y - 25, '#eab308', 1.2);
            } else if (pu.type === 'nuke') {
              triggerNuke();
            }

            powerUpsRef.current.splice(puIdx, 1);
          }
        }

        // --- 6. Update Particles ---
        for (let pIdx = particlesRef.current.length - 1; pIdx >= 0; pIdx--) {
          const p = particlesRef.current[pIdx];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            particlesRef.current.splice(pIdx, 1);
          }
        }

        // --- 7. Update Floating Text ---
        for (let ftIdx = floatingTextsRef.current.length - 1; ftIdx >= 0; ftIdx--) {
          const ft = floatingTextsRef.current[ftIdx];
          ft.y += ft.vy * dt;
          ft.alpha -= dt * 1.1;
          if (ft.alpha <= 0) {
            floatingTextsRef.current.splice(ftIdx, 1);
          }
        }

        // Telemetry stats update
        onStatsUpdate({
          score: scoreRef.current,
          highScore: highScoreRef.current,
          wave: waveRef.current,
          kills: killsRef.current,
          timeSurvived: Math.floor(gameTimeRef.current),
          health: player.health,
          maxHealth: player.maxHealth,
          weapon: player.weapon,
          weaponTimeRemaining: Math.ceil(player.weaponTimeRemaining),
        });
      }

      // Screen shake decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShakeRef.current > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeOffsetY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // ==========================================
      // RENDER GAME CANVAS
      // ==========================================
      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // 1. Dark Base Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Arena Floor Tiles with Grimy Retro Pattern
      const tileSize = 32;
      const arenaW = CANVAS_WIDTH - ARENA_PADDING * 2;
      const arenaH = CANVAS_HEIGHT - ARENA_PADDING * 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(ARENA_PADDING, ARENA_PADDING, arenaW, arenaH);
      ctx.clip();

      // Checkerboard concrete floor
      for (let x = ARENA_PADDING; x < CANVAS_WIDTH - ARENA_PADDING; x += tileSize) {
        for (let y = ARENA_PADDING; y < CANVAS_HEIGHT - ARENA_PADDING; y += tileSize) {
          const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#131b2e' : '#0f172a';
          ctx.fillRect(x, y, tileSize, tileSize);

          // Tile borders
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }

      // Center hazard emblem / bunker ring
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Persistent Blood Puddles
      for (const blood of bloodStainsRef.current) {
        ctx.fillStyle = blood.color;
        ctx.globalAlpha = blood.alpha;
        ctx.beginPath();
        ctx.arc(blood.x, blood.y, blood.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 4. Power-ups on ground
      for (const pu of powerUpsRef.current) {
        const pulse = Math.sin(pu.pulsePhase) * 2.5;
        const r = pu.radius + pulse;

        // Aura
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, r + 4, 0, Math.PI * 2);
        if (pu.type === 'health') ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        else if (pu.type === 'shotgun') ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
        else if (pu.type === 'machinegun') ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        else if (pu.type === 'speed') ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        else ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
        ctx.fill();

        // Core crate box
        ctx.save();
        ctx.translate(pu.x, pu.y);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle =
          pu.type === 'health'
            ? '#10b981'
            : pu.type === 'shotgun'
            ? '#f97316'
            : pu.type === 'machinegun'
            ? '#38bdf8'
            : pu.type === 'speed'
            ? '#eab308'
            : '#f43f5e';
        ctx.lineWidth = 2;
        ctx.fillRect(-10, -10, 20, 20);
        ctx.strokeRect(-10, -10, 20, 20);

        // Icon inside crate
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = ctx.strokeStyle;
        const label =
          pu.type === 'health' ? '+' : pu.type === 'shotgun' ? 'SG' : pu.type === 'machinegun' ? 'MG' : pu.type === 'speed' ? '⚡' : '☢';
        ctx.fillText(label, 0, 1);
        ctx.restore();
      }

      // 5. Draw Zombies (Pixelated Art)
      for (const z of zombiesRef.current) {
        ctx.save();
        ctx.translate(z.x, z.y);

        const faceAngle = Math.atan2(z.vy, z.vx);
        ctx.rotate(faceAngle);

        const wobble = Math.sin(z.walkFrame) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 2, z.radius, z.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Zombie Body
        if (z.hitFlashTime > 0) {
          ctx.fillStyle = '#ffffff'; // white flash on hit
        } else {
          ctx.fillStyle = z.color;
        }

        // Main Torso
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shambling outstretched arms
        ctx.fillStyle = z.hitFlashTime > 0 ? '#ffffff' : z.color;
        ctx.fillRect(z.radius - 2, -6 + wobble, 10, 4);
        ctx.fillRect(z.radius - 2, 2 - wobble, 10, 4);

        // Eyes (Glowing red)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(4, -4, 2, 0, Math.PI * 2);
        ctx.arc(4, 4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tank mini health bar
        if (z.type === 'tank' && z.health < z.maxHealth) {
          ctx.rotate(-faceAngle);
          const barW = 28;
          const barH = 4;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-barW / 2, -z.radius - 8, barW, barH);
          ctx.fillStyle = '#a855f7';
          const hpPercent = Math.max(0, z.health / z.maxHealth);
          ctx.fillRect(-barW / 2, -z.radius - 8, barW * hpPercent, barH);
        }

        ctx.restore();
      }

      // 6. Draw Bullets
      for (const b of bulletsRef.current) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 7. Draw Player (Pixelated Hero)
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);

      // Invulnerability flicker
      if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 20) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Player shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs animation
      const legWobble = Math.sin(player.walkFrame) * 4;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -9 + legWobble, 7, 5);
      ctx.fillRect(-8, 4 - legWobble, 7, 5);

      // Player Torso (tactical dark blue jacket)
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tactical combat vest (khaki/slate)
      ctx.fillStyle = '#475569';
      ctx.fillRect(-5, -7, 10, 14);

      // Head / Helmet
      ctx.fillStyle = '#fde047'; // blond/helmet
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Weapon Gun Barrel pointing forward
      ctx.fillStyle = '#0f172a';
      if (player.weapon === 'shotgun') {
        ctx.fillRect(8, -3, 16, 6);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(20, -2, 5, 4); // orange muzzle
      } else if (player.weapon === 'machinegun') {
        ctx.fillRect(8, -2, 18, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(14, 2, 4, 6); // magazine
      } else {
        ctx.fillRect(8, -2, 12, 4);
      }

      ctx.restore();
      ctx.globalAlpha = 1.0;

      // 8. Draw Particles (Sparks & Blood)
      for (const p of particlesRef.current) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 9. Draw Floating Combat Text
      for (const ft of floatingTextsRef.current) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `bold ${Math.round(12 * ft.scale)}px monospace`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // remove clip

      // ==========================================
      // 10. ARENA BORDER WALLS & HAZARD STRIPES
      // ==========================================
      // Dark outer frame border
      ctx.fillStyle = '#020617';
      // Top wall
      ctx.fillRect(0, 0, CANVAS_WIDTH, ARENA_PADDING);
      // Bottom wall
      ctx.fillRect(0, CANVAS_HEIGHT - ARENA_PADDING, CANVAS_WIDTH, ARENA_PADDING);
      // Left wall
      ctx.fillRect(0, 0, ARENA_PADDING, CANVAS_HEIGHT);
      // Right wall
      ctx.fillRect(CANVAS_WIDTH - ARENA_PADDING, 0, ARENA_PADDING, CANVAS_HEIGHT);

      // Warning hazard stripes along border
      ctx.save();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        ARENA_PADDING - 1,
        ARENA_PADDING - 1,
        CANVAS_WIDTH - ARENA_PADDING * 2 + 2,
        CANVAS_HEIGHT - ARENA_PADDING * 2 + 2
      );

      // Corner industrial brackets
      const cornerSize = 14;
      ctx.fillStyle = '#475569';
      // TL
      ctx.fillRect(ARENA_PADDING - 2, ARENA_PADDING - 2, cornerSize, cornerSize);
      // TR
      ctx.fillRect(CANVAS_WIDTH - ARENA_PADDING - cornerSize + 2, ARENA_PADDING - 2, cornerSize, cornerSize);
      // BL
      ctx.fillRect(ARENA_PADDING - 2, CANVAS_HEIGHT - ARENA_PADDING - cornerSize + 2, cornerSize, cornerSize);
      // BR
      ctx.fillRect(CANVAS_WIDTH - ARENA_PADDING - cornerSize + 2, CANVAS_HEIGHT - ARENA_PADDING - cornerSize + 2, cornerSize, cornerSize);
      ctx.restore();

      // Low health pulsing red vignette
      if (player.health < 30 && gameState === 'playing') {
        const pulseAlpha = (Math.sin(currentTime / 180) + 1) * 0.18;
        const grad = ctx.createRadialGradient(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          100,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH / 1.5
        );
        grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        grad.addColorStop(1, `rgba(239, 68, 68, ${pulseAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // ==========================================
      // 11. IN-GAME MINIMAL ARCADE HUD OVERLAY
      // ==========================================
      if (gameState === 'playing' || gameState === 'paused') {
        // Top HUD Bar inside arena
        const hudY = ARENA_PADDING + 14;

        // Score (Left)
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('SCORE', ARENA_PADDING + 12, hudY);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`${scoreRef.current.toLocaleString()}`, ARENA_PADDING + 60, hudY);

        // Wave (Center)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`WAVE ${waveRef.current}`, CANVAS_WIDTH / 2, hudY);

        // High Score (Right)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`HI: ${highScoreRef.current.toLocaleString()}`, CANVAS_WIDTH - ARENA_PADDING - 12, hudY);

        // Player HP Bar (Bottom Left inside arena)
        const hpBarW = 100;
        const hpBarH = 8;
        const hpX = ARENA_PADDING + 12;
        const hpY = CANVAS_HEIGHT - ARENA_PADDING - 18;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(hpX - 2, hpY - 2, hpBarW + 4, hpBarH + 4);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(hpX - 2, hpY - 2, hpBarW + 4, hpBarH + 4);

        const hpRatio = Math.max(0, player.health / player.maxHealth);
        ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(hpX, hpY, hpBarW * hpRatio, hpBarH);

        ctx.font = '9px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.fillText(`HP ${Math.round(player.health)}%`, hpX, hpY - 4);

        // Active Weapon Indicator (Bottom Right inside arena)
        ctx.textAlign = 'right';
        ctx.font = '10px monospace';
        if (player.weapon === 'shotgun') {
          ctx.fillStyle = '#f97316';
          ctx.fillText(`SHOTGUN [${Math.ceil(player.weaponTimeRemaining)}s]`, CANVAS_WIDTH - ARENA_PADDING - 12, hpY + 6);
        } else if (player.weapon === 'machinegun') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`MACHINE GUN [${Math.ceil(player.weaponTimeRemaining)}s]`, CANVAS_WIDTH - ARENA_PADDING - 12, hpY + 6);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('PISTOL ∞', CANVAS_WIDTH - ARENA_PADDING - 12, hpY + 6);
        }
      }

      // ==========================================
      // 12. STATE OVERLAYS: START / PAUSED / GAME OVER
      // ==========================================
      if (gameState === 'start') {
        // Semi-dark scrim
        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // Flashing retro badge
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('• 1989 CO-OP SURVIVAL ARCADE •', CANVAS_WIDTH / 2, 140);

        // Big Retro Title
        ctx.font = '900 32px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 16;
        ctx.fillText('ZOMBIE SURVIVAL', CANVAS_WIDTH / 2, 190);
        ctx.shadowBlur = 0;

        ctx.font = '12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Survive the infinite undead horde in the quarantine arena', CANVAS_WIDTH / 2, 225);

        // High score highlight
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`ALL-TIME HIGH SCORE: ${highScoreRef.current.toLocaleString()}`, CANVAS_WIDTH / 2, 265);

        // Weapon Preview icons
        const wepY = 320;
        ctx.font = '11px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('PICKUPS:  [+] Medkit   [SG] Shotgun   [MG] Machine Gun   [☢] Tactical Nuke', CANVAS_WIDTH / 2, wepY);

        // Press start button prompt
        const blink = Math.floor(currentTime / 500) % 2 === 0;
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = blink ? '#22c55e' : '#86efac';
        ctx.fillText('► PRESS SPACE OR TAP TO SURVIVE ◄', CANVAS_WIDTH / 2, 390);

        // Quick Controls
        ctx.font = '11px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('WASD / Arrows to Move • Space / Click to Fire • Mouse / Touch to Aim', CANVAS_WIDTH / 2, 440);

        ctx.restore();
      } else if (gameState === 'paused') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '900 28px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.font = '13px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Press P or Tap to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        ctx.restore();
      } else if (gameState === 'gameover') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // Red skull badge
        ctx.font = '900 34px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#b91c1c';
        ctx.shadowBlur = 14;
        ctx.fillText('SURVIVOR DOWN', CANVAS_WIDTH / 2, 160);
        ctx.shadowBlur = 0;

        // Stats card box
        const cardW = 320;
        const cardH = 145;
        const cardX = (CANVAS_WIDTH - cardW) / 2;
        const cardY = 195;

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';

        ctx.fillText('FINAL SCORE:', cardX + 24, cardY + 32);
        ctx.fillText('ZOMBIES ELIMINATED:', cardX + 24, cardY + 60);
        ctx.fillText('TIME SURVIVED:', cardX + 24, cardY + 88);
        ctx.fillText('ARENA RECORD:', cardX + 24, cardY + 116);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(scoreRef.current.toLocaleString(), cardX + cardW - 24, cardY + 32);
        ctx.fillText(`${killsRef.current} Kills`, cardX + cardW - 24, cardY + 60);
        ctx.fillText(`${Math.floor(gameTimeRef.current)} seconds`, cardX + cardW - 24, cardY + 88);

        const isNewRecord = scoreRef.current >= highScoreRef.current && scoreRef.current > 0;
        ctx.fillStyle = isNewRecord ? '#fbbf24' : '#e2e8f0';
        ctx.fillText(`${highScoreRef.current.toLocaleString()} ${isNewRecord ? '★ NEW!' : ''}`, cardX + cardW - 24, cardY + 116);

        // Restart prompt
        const blink = Math.floor(currentTime / 500) % 2 === 0;
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = blink ? '#22c55e' : '#86efac';
        ctx.fillText('► PRESS R OR TAP TO PLAY AGAIN ◄', CANVAS_WIDTH / 2, 390);

        ctx.restore();
      }

      ctx.restore(); // remove shake transform

      // ==========================================
      // 13. CRT SCANLINE EFFECT OVERLAY
      // ==========================================
      if (crtEnabled) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
          ctx.fillRect(0, y, CANVAS_WIDTH, 1);
        }

        // Vignette darkness in corners
        const crtGrad = ctx.createRadialGradient(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH / 3,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH / 1.3
        );
        crtGrad.addColorStop(0, 'rgba(0,0,0,0)');
        crtGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = crtGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [gameState, crtEnabled, externalControls, onGameStateChange, onStatsUpdate, saveHighScore]);

  return (
    <div
      className="relative w-full aspect-[640/580] max-w-[640px] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800 touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full object-contain cursor-crosshair"
        style={{
          imageRendering: 'pixelated',
          touchAction: 'none',
        }}
      />
    </div>
  );
};
