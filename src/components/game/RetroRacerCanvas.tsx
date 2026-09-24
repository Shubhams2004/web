import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audio } from './audio';
import type {
  GameState,
  KeyControls,
  PlayerCar,
  TrafficCar,
  TrafficCarStyle,
  PowerUpItem,
  PowerUpType,
  Particle,
  FloatingText,
  RoadsideSceneryItem,
  GameScoreSnapshot,
} from './gameTypes';

interface RetroRacerCanvasProps {
  gameState: GameState;
  onGameStateChange: (state: GameState) => void;
  onScoreUpdate: (stats: GameScoreSnapshot) => void;
  externalControls: KeyControls;
  crtEnabled: boolean;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;
const ROAD_LEFT = 70;
const ROAD_RIGHT = 410;
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
const LANE_COUNT = 4;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const CURB_WIDTH = 12;

const CAR_WIDTH = 38;
const CAR_HEIGHT = 68;

const TRAFFIC_STYLES: { style: TrafficCarStyle; primary: string; accent: string }[] = [
  { style: 'sport', primary: '#0284c7', accent: '#38bdf8' },
  { style: 'taxi', primary: '#eab308', accent: '#1e293b' },
  { style: 'muscle', primary: '#9333ea', accent: '#e879f9' },
  { style: 'racer', primary: '#16a34a', accent: '#86efac' },
  { style: 'van', primary: '#ea580c', accent: '#fed7aa' },
];

export const RetroRacerCanvas: React.FC<RetroRacerCanvasProps> = ({
  gameState,
  onGameStateChange,
  onScoreUpdate,
  externalControls,
  crtEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High score from local storage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('retro_racer_high_score');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Mutable game state held in refs for 60fps canvas loop
  const stateRef = useRef({
    gameState: gameState,
    score: 0,
    highScore: highScore,
    distance: 0,
    speedMph: 0,
    nearMisses: 0,
    carsOvertaken: 0,
    powerUpsCollected: 0,
    roadScrollY: 0,
    screenShake: 0,
    countdownTimer: 3.5, // 3, 2, 1, GO
    lastFrameTime: 0,
    trafficSpawnTimer: 0,
    powerUpSpawnTimer: 0,
    scenerySpawnTimer: 0,
    nextId: 1,
    gameOverHandled: false,
  });

  // Sync gameState prop to ref
  useEffect(() => {
    stateRef.current.gameState = gameState;
    if (gameState === 'start') {
      audio.stopEngine();
    } else if (gameState === 'playing') {
      audio.startEngine();
    } else if (gameState === 'paused' || gameState === 'gameover') {
      audio.stopEngine();
    }
  }, [gameState]);

  // Combined Keys state (active inputs consumed by physics engine)
  const keysRef = useRef<KeyControls>({
    left: false,
    right: false,
    accelerate: false,
    brake: false,
  });

  // Independent keyboard state
  const keyboardKeysRef = useRef<KeyControls>({
    left: false,
    right: false,
    accelerate: false,
    brake: false,
  });

  // Independent touch/mobile state
  const touchKeysRef = useRef<KeyControls>({
    left: false,
    right: false,
    accelerate: false,
    brake: false,
  });

  // Helper to recompute combined input states
  const syncCombinedKeys = useCallback(() => {
    keysRef.current = {
      left: keyboardKeysRef.current.left || touchKeysRef.current.left,
      right: keyboardKeysRef.current.right || touchKeysRef.current.right,
      accelerate: keyboardKeysRef.current.accelerate || touchKeysRef.current.accelerate,
      brake: keyboardKeysRef.current.brake || touchKeysRef.current.brake,
    };
  }, []);

  // Sync external mobile controls
  useEffect(() => {
    touchKeysRef.current = {
      left: !!externalControls.left,
      right: !!externalControls.right,
      accelerate: !!externalControls.accelerate,
      brake: !!externalControls.brake,
    };
    syncCombinedKeys();
  }, [externalControls, syncCombinedKeys]);

  // Player state
  const playerRef = useRef<PlayerCar>({
    x: ROAD_LEFT + LANE_WIDTH * 1.5,
    y: CANVAS_HEIGHT - 130,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    speed: 0,
    targetSpeed: 0,
    lateralSpeed: 0,
    hasShield: false,
    turboTimeRemaining: 0,
    starTimeRemaining: 0,
    invulnerableTime: 0,
  });

  // Entities
  const trafficRef = useRef<TrafficCar[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const sceneryRef = useRef<RoadsideSceneryItem[]>([]);

  // Helper to spawn a particle
  const spawnParticle = (p: Partial<Particle> & { x: number; y: number }) => {
    particlesRef.current.push({
      x: p.x,
      y: p.y,
      vx: p.vx ?? (Math.random() - 0.5) * 2,
      vy: p.vy ?? (Math.random() - 0.5) * 2,
      size: p.size ?? 3,
      color: p.color ?? '#f59e0b',
      alpha: p.alpha ?? 1,
      life: p.life ?? 0,
      maxLife: p.maxLife ?? 0.4,
      decay: p.decay ?? 2.2,
      shape: p.shape ?? 'square',
    });
  };

  // Helper to add floating text popup
  const addFloatingText = (text: string, x: number, y: number, color = '#facc15', fontSize = 12) => {
    floatingTextsRef.current.push({
      id: `txt-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0,
      maxLife: 1.1,
      fontSize,
    });
  };

  // Reset / start new run
  const startNewGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.distance = 0;
    s.speedMph = 50;
    s.nearMisses = 0;
    s.carsOvertaken = 0;
    s.powerUpsCollected = 0;
    s.countdownTimer = 3.2;
    s.screenShake = 0;
    s.trafficSpawnTimer = 0.5;
    s.powerUpSpawnTimer = 4.0;
    s.scenerySpawnTimer = 0;
    s.gameOverHandled = false;

    playerRef.current = {
      x: ROAD_LEFT + LANE_WIDTH * 1.5,
      y: CANVAS_HEIGHT - 130,
      width: CAR_WIDTH,
      height: CAR_HEIGHT,
      speed: 50,
      targetSpeed: 75,
      lateralSpeed: 0,
      hasShield: false,
      turboTimeRemaining: 0,
      starTimeRemaining: 0,
      invulnerableTime: 1.0,
    };

    trafficRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Pre-populate some roadside scenery
    sceneryRef.current = [
      { id: 'sc-1', side: 'left', y: 100, type: 'lamp' },
      { id: 'sc-2', side: 'right', y: 220, type: 'palm' },
      { id: 'sc-3', side: 'left', y: 380, type: 'sign' },
      { id: 'sc-4', side: 'right', y: 520, type: 'lamp' },
      { id: 'sc-5', side: 'left', y: 660, type: 'palm' },
    ];

    onGameStateChange('countdown');
  }, [onGameStateChange]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.userInteracted();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keyboardKeysRef.current.left = true;
        syncCombinedKeys();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keyboardKeysRef.current.right = true;
        syncCombinedKeys();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keyboardKeysRef.current.accelerate = true;
        syncCombinedKeys();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        keyboardKeysRef.current.brake = true;
        syncCombinedKeys();
      } else if (e.code === 'Space') {
        e.preventDefault();
        const current = stateRef.current.gameState;
        if (current === 'playing') {
          onGameStateChange('paused');
        } else if (current === 'paused') {
          onGameStateChange('playing');
        } else if (current === 'start' || current === 'gameover') {
          startNewGame();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        startNewGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keyboardKeysRef.current.left = false;
        syncCombinedKeys();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keyboardKeysRef.current.right = false;
        syncCombinedKeys();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keyboardKeysRef.current.accelerate = false;
        syncCombinedKeys();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        keyboardKeysRef.current.brake = false;
        syncCombinedKeys();
      }
    };

    // Prevent stuck keys when user switches tabs or window loses focus
    const handleResetKeys = () => {
      keyboardKeysRef.current = {
        left: false,
        right: false,
        accelerate: false,
        brake: false,
      };
      syncCombinedKeys();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleResetKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleResetKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleResetKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onGameStateChange, startNewGame, syncCombinedKeys]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s.lastFrameTime) s.lastFrameTime = timestamp;
      const dt = Math.min((timestamp - s.lastFrameTime) / 1000, 0.05); // cap delta time
      s.lastFrameTime = timestamp;

      // 1. UPDATE STATE
      if (s.gameState === 'countdown') {
        const prevTimer = s.countdownTimer;
        s.countdownTimer -= dt;

        // Play beeps on threshold crossings
        if (prevTimer > 3 && s.countdownTimer <= 3) audio.playCountdownBeep(false);
        if (prevTimer > 2 && s.countdownTimer <= 2) audio.playCountdownBeep(false);
        if (prevTimer > 1 && s.countdownTimer <= 1) audio.playCountdownBeep(false);
        if (prevTimer > 0 && s.countdownTimer <= 0) {
          audio.playCountdownBeep(true);
          s.gameState = 'playing';
          onGameStateChange('playing');
        }

        // Idle road scrolling in countdown
        s.roadScrollY = (s.roadScrollY + 120 * dt) % 40;
      } else if (s.gameState === 'playing') {
        const player = playerRef.current;
        const keys = keysRef.current;

        // Active timers
        if (player.turboTimeRemaining > 0) {
          player.turboTimeRemaining -= dt;
        }
        if (player.starTimeRemaining > 0) {
          player.starTimeRemaining -= dt;
        }
        if (player.invulnerableTime > 0) {
          player.invulnerableTime -= dt;
        }

        // Speed calculation
        const isTurbo = player.turboTimeRemaining > 0;
        const minSpeed = 35;
        const maxNormalSpeed = 120;
        const turboSpeed = 160;

        let target = 70;
        if (keys.accelerate) {
          target = isTurbo ? turboSpeed : maxNormalSpeed;
        } else if (keys.brake) {
          target = minSpeed;
        } else {
          target = isTurbo ? turboSpeed : 75;
        }

        // Accel / deceleration physics
        const accelRate = isTurbo ? 140 : keys.accelerate ? 70 : keys.brake ? 120 : 35;
        if (player.speed < target) {
          player.speed = Math.min(target, player.speed + accelRate * dt);
        } else if (player.speed > target) {
          player.speed = Math.max(target, player.speed - accelRate * dt);
        }

        s.speedMph = Math.round(player.speed);
        audio.updateEngine(player.speed / maxNormalSpeed);

        // Lateral steering
        const steerSpeed = 240 + (player.speed / maxNormalSpeed) * 80;
        if (keys.left) {
          player.lateralSpeed = -steerSpeed;
          player.x -= steerSpeed * dt;
        } else if (keys.right) {
          player.lateralSpeed = steerSpeed;
          player.x += steerSpeed * dt;
        } else {
          player.lateralSpeed = 0;
        }

        // Road boundaries clamp (keep player on road or slightly on curbs)
        const minX = ROAD_LEFT - 4;
        const maxX = ROAD_RIGHT - player.width + 4;
        if (player.x < minX) {
          player.x = minX;
          spawnParticle({
            x: player.x,
            y: player.y + player.height - 10,
            vx: Math.random() * 2 + 1,
            vy: -Math.random() * 2,
            color: '#f87171',
            size: 2.5,
          });
        } else if (player.x > maxX) {
          player.x = maxX;
          spawnParticle({
            x: player.x + player.width,
            y: player.y + player.height - 10,
            vx: -(Math.random() * 2 + 1),
            vy: -Math.random() * 2,
            color: '#f87171',
            size: 2.5,
          });
        }

        // Road scroll
        const scrollSpeed = player.speed * 8.5; // pixels per sec
        s.roadScrollY = (s.roadScrollY + scrollSpeed * dt) % 60;

        // Distance and Score progression
        const distanceDelta = (player.speed * dt) * 0.04;
        s.distance += distanceDelta;

        const scoreMultiplier = player.starTimeRemaining > 0 ? 2 : 1;
        const speedBonus = player.speed > 100 ? 15 * dt : 5 * dt;
        s.score += Math.round((distanceDelta * 30 + speedBonus) * scoreMultiplier);

        // Update high score
        if (s.score > s.highScore) {
          s.highScore = s.score;
          try {
            localStorage.setItem('retro_racer_high_score', s.highScore.toString());
          } catch {}
        }

        // Spawn particles (tire smoke / exhaust flame)
        if (Math.random() < (isTurbo ? 0.9 : keys.accelerate ? 0.45 : 0.2)) {
          spawnParticle({
            x: player.x + (Math.random() < 0.5 ? 8 : player.width - 8),
            y: player.y + player.height - 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + (isTurbo ? 4 : 2),
            size: isTurbo ? 4 : 2.5,
            color: isTurbo ? (Math.random() < 0.5 ? '#38bdf8' : '#60a5fa') : '#94a3b8',
            maxLife: isTurbo ? 0.3 : 0.4,
          });
        }

        // --- TRAFFIC SPAWNING ---
        s.trafficSpawnTimer -= dt;
        // Frequency increases smoothly with distance
        const difficultyProgress = Math.min(s.distance / 1200, 1.0);
        const spawnInterval = Math.max(0.75, 1.9 - difficultyProgress * 0.9);

        if (s.trafficSpawnTimer <= 0 && trafficRef.current.length < 5) {
          s.trafficSpawnTimer = spawnInterval + Math.random() * 0.4;

          // Pick lane (ensure not all occupied)
          const occupiedLanes = new Set(
            trafficRef.current.filter((c) => c.y < 220).map((c) => c.lane)
          );
          const availableLanes = [0, 1, 2, 3].filter((l) => !occupiedLanes.has(l));

          if (availableLanes.length > 0) {
            const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
            const styleObj = TRAFFIC_STYLES[Math.floor(Math.random() * TRAFFIC_STYLES.length)];

            // Traffic speeds vary: right lanes slightly slower, left lanes faster
            const baseTrafficSpeed = 40 + lane * 7 + difficultyProgress * 15;
            const speedJitter = (Math.random() - 0.5) * 10;

            trafficRef.current.push({
              id: `tc-${s.nextId++}`,
              lane,
              x: ROAD_LEFT + lane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2,
              y: -CAR_HEIGHT - 20,
              width: CAR_WIDTH,
              height: CAR_HEIGHT,
              speed: Math.max(30, baseTrafficSpeed + speedJitter),
              style: styleObj.style,
              primaryColor: styleObj.primary,
              accentColor: styleObj.accent,
              passed: false,
              nearMissed: false,
            });
          }
        }

        // --- POWER-UP SPAWNING ---
        s.powerUpSpawnTimer -= dt;
        if (s.powerUpSpawnTimer <= 0 && powerUpsRef.current.length < 2) {
          s.powerUpSpawnTimer = 11 + Math.random() * 8;
          const types: PowerUpType[] = ['turbo', 'shield', 'star'];
          const chosenType = types[Math.floor(Math.random() * types.length)];
          const lane = Math.floor(Math.random() * LANE_COUNT);

          powerUpsRef.current.push({
            id: `pw-${s.nextId++}`,
            type: chosenType,
            lane,
            x: ROAD_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2,
            y: -40,
            width: 32,
            height: 32,
            collected: false,
            pulsePhase: 0,
          });
        }

        // --- ROADSIDE SCENERY UPDATE ---
        s.scenerySpawnTimer -= dt;
        if (s.scenerySpawnTimer <= 0) {
          s.scenerySpawnTimer = 0.6 + Math.random() * 0.4;
          const types: ('lamp' | 'palm' | 'sign')[] = ['lamp', 'palm', 'sign'];
          sceneryRef.current.push({
            id: `sc-${s.nextId++}`,
            side: Math.random() < 0.5 ? 'left' : 'right',
            y: -40,
            type: types[Math.floor(Math.random() * types.length)],
          });
        }

        sceneryRef.current.forEach((item) => {
          item.y += (player.speed * 8.5) * dt;
        });
        sceneryRef.current = sceneryRef.current.filter((item) => item.y < CANVAS_HEIGHT + 60);

        // --- UPDATE POWER-UPS ---
        powerUpsRef.current.forEach((pw) => {
          pw.y += (player.speed * 8.5 * 0.7) * dt;
          pw.pulsePhase += dt * 5;

          // Pickup collision check (circle distance)
          const pCenterX = player.x + player.width / 2;
          const pCenterY = player.y + player.height / 2;
          const dist = Math.hypot(pw.x - pCenterX, pw.y - pCenterY);

          if (!pw.collected && dist < 36) {
            pw.collected = true;
            s.powerUpsCollected += 1;

            if (pw.type === 'turbo') {
              player.turboTimeRemaining = 5.0;
              audio.playTurbo();
              addFloatingText('TURBO BOOST!', pw.x, pw.y, '#38bdf8', 14);
              s.score += 250 * scoreMultiplier;
            } else if (pw.type === 'shield') {
              player.hasShield = true;
              audio.playShield();
              addFloatingText('SHIELD ACTIVE!', pw.x, pw.y, '#22d3ee', 14);
              s.score += 200 * scoreMultiplier;
            } else if (pw.type === 'star') {
              player.starTimeRemaining = 8.0;
              audio.playStar();
              addFloatingText('2X SCORE MULTIPLIER!', pw.x, pw.y, '#f472b6', 14);
              s.score += 300 * scoreMultiplier;
            }

            // Burst particles
            for (let i = 0; i < 16; i++) {
              const angle = (i / 16) * Math.PI * 2;
              spawnParticle({
                x: pw.x,
                y: pw.y,
                vx: Math.cos(angle) * (Math.random() * 4 + 2),
                vy: Math.sin(angle) * (Math.random() * 4 + 2),
                color: pw.type === 'turbo' ? '#38bdf8' : pw.type === 'shield' ? '#22d3ee' : '#f472b6',
                size: 3.5,
                maxLife: 0.6,
              });
            }
          }
        });
        powerUpsRef.current = powerUpsRef.current.filter((pw) => !pw.collected && pw.y < CANVAS_HEIGHT + 60);

        // --- UPDATE TRAFFIC CARS ---
        trafficRef.current.forEach((car) => {
          // Relative movement: traffic moves down if player is faster, or slower if player brakes
          const relativeSpeedMph = player.speed - car.speed;
          const speedPxPerSec = relativeSpeedMph * 8.5;
          car.y += speedPxPerSec * dt;

          // Check if overtook
          if (!car.passed && car.y > player.y + player.height) {
            car.passed = true;
            s.carsOvertaken += 1;
            s.score += 50 * scoreMultiplier;
          }

          // Near-miss check (tight pass lateral distance between 42px and 62px with overlapping Y)
          if (!car.nearMissed && !car.passed) {
            const yOverlap = Math.abs(car.y - player.y) < player.height * 0.8;
            const xDist = Math.abs((car.x + car.width / 2) - (player.x + player.width / 2));
            if (yOverlap && xDist >= CAR_WIDTH && xDist <= CAR_WIDTH + 24) {
              car.nearMissed = true;
              s.nearMisses += 1;
              s.score += 150 * scoreMultiplier;
              audio.playNearMiss();
              addFloatingText('NEAR MISS! +150', player.x + player.width / 2, player.y - 10, '#facc15', 13);
            }
          }

          // --- COLLISION DETECTION ---
          if (player.invulnerableTime <= 0) {
            // AABB with 4px inner padding for forgiving arcade feel
            const pBox = {
              left: player.x + 4,
              right: player.x + player.width - 4,
              top: player.y + 4,
              bottom: player.y + player.height - 4,
            };
            const cBox = {
              left: car.x + 4,
              right: car.x + car.width - 4,
              top: car.y + 4,
              bottom: car.y + car.height - 4,
            };

            const isColliding =
              pBox.left < cBox.right &&
              pBox.right > cBox.left &&
              pBox.top < cBox.bottom &&
              pBox.bottom > cBox.top;

            if (isColliding) {
              if (player.hasShield) {
                // Shield absorbs collision!
                player.hasShield = false;
                player.invulnerableTime = 1.8; // grace period
                s.screenShake = 0.25;
                audio.playShieldBreak();
                addFloatingText('SHIELD BROKEN!', player.x, player.y - 15, '#38bdf8', 14);

                // Push car away
                car.y -= 100;
                for (let i = 0; i < 20; i++) {
                  spawnParticle({
                    x: (player.x + car.x) / 2 + 15,
                    y: (player.y + car.y) / 2 + 15,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    color: '#22d3ee',
                    size: 3.5,
                  });
                }
              } else if (isTurbo) {
                // In turbo, smash traffic car out of the way!
                s.screenShake = 0.2;
                s.score += 200 * scoreMultiplier;
                addFloatingText('SMASH! +200', car.x, car.y, '#f59e0b', 14);
                audio.playCrash();
                car.y = CANVAS_HEIGHT + 200; // eliminate smashed car

                for (let i = 0; i < 24; i++) {
                  spawnParticle({
                    x: car.x + car.width / 2,
                    y: car.y + car.height / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    color: car.primaryColor,
                    size: 4,
                    maxLife: 0.6,
                  });
                }
              } else {
                // Fatal Collision -> Game Over
                s.gameState = 'gameover';
                s.screenShake = 0.55;
                audio.playCrash();
                audio.playGameOver();
                audio.stopEngine();

                // Huge explosion particles
                for (let i = 0; i < 40; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const spd = Math.random() * 8 + 2;
                  spawnParticle({
                    x: player.x + player.width / 2,
                    y: player.y + player.height / 2,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    color: i % 3 === 0 ? '#ef4444' : i % 2 === 0 ? '#f59e0b' : '#ffffff',
                    size: Math.random() * 5 + 3,
                    maxLife: 0.8,
                  });
                }

                onGameStateChange('gameover');
              }
            }
          }
        });

        // Filter out cars that scrolled way off screen
        trafficRef.current = trafficRef.current.filter(
          (car) => car.y > -150 && car.y < CANVAS_HEIGHT + 150
        );

        // Update score snapshot to parent component
        onScoreUpdate({
          score: Math.round(s.score),
          highScore: s.highScore,
          speed: s.speedMph,
          distance: Math.round(s.distance),
          nearMisses: s.nearMisses,
          carsOvertaken: s.carsOvertaken,
          powerUpsCollected: s.powerUpsCollected,
        });
      }

      // Update particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.life += dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // Update floating texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y -= 35 * dt;
        ft.life += dt;
        ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life < ft.maxLife);

      // Screen shake decay
      if (s.screenShake > 0) {
        s.screenShake = Math.max(0, s.screenShake - dt);
      }

      // 2. RENDER STAGE
      ctx.save();

      // Camera shake offset
      if (s.screenShake > 0) {
        const shakeMag = s.screenShake * 12;
        ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
      }

      // Background terrain (dark retro cyber asphalt)
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Roadside Grass/Shoulder patterns
      drawRoadShoulders(ctx, s.roadScrollY);

      // Asphalt Road Surface
      ctx.fillStyle = '#161925';
      ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

      // Rumble strip curbs (alternating red and white blocks)
      drawRumbleStrips(ctx, s.roadScrollY);

      // Lane Markings (neon dashed lines)
      drawLaneMarkings(ctx, s.roadScrollY);

      // Roadside scenery (lamps, palms, signs)
      drawScenery(ctx);

      // Speed lines effect when driving fast
      if (s.gameState === 'playing' && s.speedMph > 85) {
        drawSpeedLines(ctx, s.speedMph);
      }

      // Power-ups
      powerUpsRef.current.forEach((pw) => {
        drawPowerUp(ctx, pw);
      });

      // Traffic Cars
      trafficRef.current.forEach((car) => {
        drawTrafficCar(ctx, car);
      });

      // Player Car (if not dead or blinking while invulnerable)
      const player = playerRef.current;
      const isVisible =
        s.gameState !== 'gameover' &&
        (player.invulnerableTime <= 0 || Math.floor(player.invulnerableTime * 12) % 2 === 0);

      if (isVisible) {
        drawPlayerCar(ctx, player);
      }

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // Floating popup texts
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${ft.fontSize || 12}px 'Press Start 2P', monospace`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // HUD Overlay (Score, Speedometer, Distance, Multiplier)
      drawHUD(ctx, s, player);

      // State Overlays (Start, Countdown, Paused, GameOver)
      if (s.gameState === 'start') {
        drawStartScreen(ctx, s.highScore);
      } else if (s.gameState === 'countdown') {
        drawCountdownScreen(ctx, s.countdownTimer);
      } else if (s.gameState === 'paused') {
        drawPausedScreen(ctx);
      } else if (s.gameState === 'gameover') {
        drawGameOverScreen(ctx, s);
      }

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      audio.stopEngine();
    };
  }, [onGameStateChange, onScoreUpdate]);

  // --- DRAWING HELPERS ---

  const drawRoadShoulders = (ctx: CanvasRenderingContext2D, scrollY: number) => {
    // Left shoulder (terrain with subtle retro grid lines)
    ctx.fillStyle = '#09101d';
    ctx.fillRect(0, 0, ROAD_LEFT - CURB_WIDTH, CANVAS_HEIGHT);
    // Right shoulder
    ctx.fillRect(ROAD_RIGHT + CURB_WIDTH, 0, CANVAS_WIDTH - (ROAD_RIGHT + CURB_WIDTH), CANVAS_HEIGHT);

    // Grid lines scrolling
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const step = 30;
    const offset = scrollY % step;
    for (let y = -step + offset; y < CANVAS_HEIGHT; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ROAD_LEFT - CURB_WIDTH, y);
      ctx.moveTo(ROAD_RIGHT + CURB_WIDTH, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };

  const drawRumbleStrips = (ctx: CanvasRenderingContext2D, scrollY: number) => {
    const blockHeight = 24;
    const totalBlocks = Math.ceil(CANVAS_HEIGHT / blockHeight) + 2;
    const offset = scrollY % (blockHeight * 2);

    for (let i = -2; i < totalBlocks; i++) {
      const y = i * blockHeight + offset;
      const isRed = i % 2 === 0;

      // Left curb
      ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';
      ctx.fillRect(ROAD_LEFT - CURB_WIDTH, y, CURB_WIDTH, blockHeight);

      // Right curb
      ctx.fillRect(ROAD_RIGHT, y, CURB_WIDTH, blockHeight);
    }
  };

  const drawLaneMarkings = (ctx: CanvasRenderingContext2D, scrollY: number) => {
    const dashHeight = 36;
    const gapHeight = 28;
    const cycle = dashHeight + gapHeight;
    const offset = scrollY % cycle;

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;

    for (let lane = 1; lane < LANE_COUNT; lane++) {
      const x = ROAD_LEFT + lane * LANE_WIDTH - 2;
      for (let y = -cycle + offset; y < CANVAS_HEIGHT + cycle; y += cycle) {
        ctx.fillRect(x, y, 4, dashHeight);
      }
    }
    ctx.shadowBlur = 0;
  };

  const drawScenery = (ctx: CanvasRenderingContext2D) => {
    sceneryRef.current.forEach((item) => {
      const x = item.side === 'left' ? 24 : CANVAS_WIDTH - 36;
      ctx.save();
      if (item.type === 'lamp') {
        // Neon streetlight
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 5, item.y, 4, 30);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x + 7, item.y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'palm') {
        // Pixel palm tree
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 5, item.y + 10, 4, 25);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x + 7, item.y + 8, 11, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Roadside neon sign
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 6, item.y + 10, 3, 20);
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, item.y, 15, 10);
      }
      ctx.restore();
    });
  };

  const drawSpeedLines = (ctx: CanvasRenderingContext2D, speed: number) => {
    const count = Math.floor((speed - 85) / 6);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < count; i++) {
      const x = Math.random() < 0.5 ? Math.random() * (ROAD_LEFT - 15) : ROAD_RIGHT + 15 + Math.random() * 50;
      const y = Math.random() * CANVAS_HEIGHT;
      const length = Math.random() * 60 + 40;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + length);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawPowerUp = (ctx: CanvasRenderingContext2D, pw: PowerUpItem) => {
    ctx.save();
    ctx.translate(pw.x, pw.y);

    const pulse = Math.sin(pw.pulsePhase) * 3;
    const radius = 14 + pulse;

    // Glowing aura
    let glowColor = '#facc15';
    if (pw.type === 'turbo') glowColor = '#38bdf8';
    if (pw.type === 'shield') glowColor = '#22d3ee';
    if (pw.type === 'star') glowColor = '#f472b6';

    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Icon in center
    ctx.fillStyle = '#0f172a';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (pw.type === 'turbo') ctx.fillText('⚡', 0, 1);
    else if (pw.type === 'shield') ctx.fillText('🛡', 0, 1);
    else if (pw.type === 'star') ctx.fillText('★', 0, 1);

    ctx.restore();
  };

  const drawPlayerCar = (ctx: CanvasRenderingContext2D, p: PlayerCar) => {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Car shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(-2, 4, p.width + 4, p.height, 8);
    ctx.fill();

    // Main Red Chassis (Retro sports car)
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.roundRect(0, 0, p.width, p.height, 7);
    ctx.fill();

    // Body contour highlights
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(4, 8, p.width - 8, p.height - 18);

    // Front Bumper & Headlights
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(2, 0, p.width - 4, 6);

    // Headlight bulbs (glowing forward beam)
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 10;
    ctx.fillRect(4, 1, 7, 4);
    ctx.fillRect(p.width - 11, 1, 7, 4);
    ctx.shadowBlur = 0;

    // Windshield (tinted dark blue-grey)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(5, 14, p.width - 10, 16, 3);
    ctx.fill();

    // Specular windshield reflection
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 26);
    ctx.lineTo(16, 17);
    ctx.stroke();

    // Roof & Rear window
    ctx.fillStyle = '#be123c';
    ctx.fillRect(7, 30, p.width - 14, 10);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 41, p.width - 12, 10);

    // Rear Spoiler / Fin
    ctx.fillStyle = '#881337';
    ctx.fillRect(2, p.height - 8, p.width - 4, 5);

    // Taillights (Neon glowing red)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(3, p.height - 4, 8, 3);
    ctx.fillRect(p.width - 11, p.height - 4, 8, 3);
    ctx.shadowBlur = 0;

    // Wheels (4 corner rubber tires)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 10, 3, 13);
    ctx.fillRect(p.width, 10, 3, 13);
    ctx.fillRect(-3, p.height - 24, 3, 13);
    ctx.fillRect(p.width, p.height - 24, 3, 13);

    // Turbo Flames
    if (p.turboTimeRemaining > 0) {
      const flameLen = 14 + Math.random() * 12;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(7, p.height);
      ctx.lineTo(11, p.height + flameLen);
      ctx.lineTo(15, p.height);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(p.width - 15, p.height);
      ctx.lineTo(p.width - 11, p.height + flameLen);
      ctx.lineTo(p.width - 7, p.height);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Forcefield Shield Aura
    if (p.hasShield) {
      const time = Date.now() * 0.005;
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.width / 2, p.height / 2, p.height * 0.65 + Math.sin(time) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Star score boost glow
    if (p.starTimeRemaining > 0) {
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.strokeRect(-4, -4, p.width + 8, p.height + 8);
    }

    ctx.restore();
  };

  const drawTrafficCar = (ctx: CanvasRenderingContext2D, c: TrafficCar) => {
    ctx.save();
    ctx.translate(c.x, c.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-2, 4, c.width + 4, c.height, 6);
    ctx.fill();

    // Main Body
    ctx.fillStyle = c.primaryColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, c.width, c.height, 6);
    ctx.fill();

    // Roof / Cabin
    ctx.fillStyle = c.accentColor;
    ctx.fillRect(4, 16, c.width - 8, c.height - 30);

    // Windshields
    ctx.fillStyle = '#090d16';
    ctx.fillRect(6, 12, c.width - 12, 10);
    ctx.fillRect(6, c.height - 20, c.width - 12, 8);

    // Taxi checker pattern if taxi
    if (c.style === 'taxi') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.width / 2 - 8, c.height / 2 - 4, 16, 8);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 6px monospace';
      ctx.fillText('TAXI', c.width / 2 - 7, c.height / 2 + 2);
    }

    // Headlights (facing forward toward bottom of screen)
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 6;
    ctx.fillRect(3, c.height - 4, 6, 3);
    ctx.fillRect(c.width - 9, c.height - 4, 6, 3);

    // Taillights (top of opponent car)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 4;
    ctx.fillRect(3, 1, 6, 3);
    ctx.fillRect(c.width - 9, 1, 6, 3);
    ctx.shadowBlur = 0;

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, 10, 3, 12);
    ctx.fillRect(c.width, 10, 3, 12);
    ctx.fillRect(-3, c.height - 22, 3, 12);
    ctx.fillRect(c.width, c.height - 22, 3, 12);

    ctx.restore();
  };

  const drawHUD = (
    ctx: CanvasRenderingContext2D,
    s: typeof stateRef.current,
    p: PlayerCar
  ) => {
    // Top Bar HUD banner
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 48);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 48, CANVAS_WIDTH, 1);

    // Score & High Score
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SCORE', 16, 18);
    ctx.fillStyle = '#f8fafc';
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText(s.score.toString().padStart(6, '0'), 16, 36);

    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('HI-SCORE', 140, 18);
    ctx.fillStyle = '#fde68a';
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText(s.highScore.toString().padStart(6, '0'), 140, 36);

    // Distance
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DISTANCE', 260, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText(`${Math.round(s.distance)}M`, 260, 36);

    // Speedometer
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SPEED', 380, 18);
    const speedColor = p.turboTimeRemaining > 0 ? '#38bdf8' : s.speedMph > 100 ? '#ef4444' : '#22c55e';
    ctx.fillStyle = speedColor;
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText(`${s.speedMph}`, 380, 36);

    // Status Badges (Shield, Turbo, 2x Multiplier)
    let badgeX = 16;
    const badgeY = 62;

    if (p.hasShield) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 82, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = "7px 'Press Start 2P', monospace";
      ctx.fillText('🛡 SHIELD', badgeX + 6, badgeY + 12);
      badgeX += 90;
    }

    if (p.turboTimeRemaining > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 88, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = "7px 'Press Start 2P', monospace";
      ctx.fillText(`⚡ ${p.turboTimeRemaining.toFixed(1)}s`, badgeX + 6, badgeY + 12);
      badgeX += 96;
    }

    if (p.starTimeRemaining > 0) {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 88, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f472b6';
      ctx.font = "7px 'Press Start 2P', monospace";
      ctx.fillText(`★ 2X ${p.starTimeRemaining.toFixed(1)}s`, badgeX + 6, badgeY + 12);
    }

    ctx.restore();
  };

  const drawStartScreen = (ctx: CanvasRenderingContext2D, hiScore: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.textAlign = 'center';
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#f43f5e';
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.fillText('RETRO RACER', CANVAS_WIDTH / 2, 230);

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#38bdf8';
    ctx.font = "11px 'Press Start 2P', monospace";
    ctx.fillText('HIGH SPEED ARCADE PURSUIT', CANVAS_WIDTH / 2, 265);
    ctx.shadowBlur = 0;

    // Blinking Press Start
    const blink = Math.floor(Date.now() / 450) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#facc15';
      ctx.font = "14px 'Press Start 2P', monospace";
      ctx.fillText('INSERT COIN / PRESS START', CANVAS_WIDTH / 2, 350);
    }

    // High Score Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH / 2 - 130, 390, 260, 52, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText('ALL TIME HIGH SCORE', CANVAS_WIDTH / 2, 412);
    ctx.fillStyle = '#fde68a';
    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.fillText(hiScore.toString().padStart(6, '0'), CANVAS_WIDTH / 2, 432);

    // Controls overview
    ctx.fillStyle = '#cbd5e1';
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText('CONTROLS:', CANVAS_WIDTH / 2, 485);
    ctx.fillStyle = '#94a3b8';
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.fillText('← / A : STEER LEFT    → / D : STEER RIGHT', CANVAS_WIDTH / 2, 510);
    ctx.fillText('↑ / W : ACCELERATE    ↓ / S : BRAKE', CANVAS_WIDTH / 2, 528);
    ctx.fillText('SPACE : PAUSE         R : RESTART', CANVAS_WIDTH / 2, 546);

    ctx.fillStyle = '#64748b';
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.fillText('COLLECT: ⚡TURBO  🛡SHIELD  ★2X SCORE', CANVAS_WIDTH / 2, 590);

    ctx.restore();
  };

  const drawCountdownScreen = (ctx: CanvasRenderingContext2D, timer: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let text = '3';
    let color = '#ef4444';
    if (timer > 2) {
      text = '3';
      color = '#ef4444';
    } else if (timer > 1) {
      text = '2';
      color = '#f59e0b';
    } else if (timer > 0) {
      text = '1';
      color = '#eab308';
    } else {
      text = 'GO!';
      color = '#22c55e';
    }

    ctx.textAlign = 'center';
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.font = "48px 'Press Start 2P', monospace";
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.restore();
  };

  const drawPausedScreen = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#38bdf8';
    ctx.font = "24px 'Press Start 2P', monospace";
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f8fafc';
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText('PRESS SPACE OR TAP TO RESUME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText('PRESS R TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

    ctx.restore();
  };

  const drawGameOverScreen = (
    ctx: CanvasRenderingContext2D,
    s: typeof stateRef.current
  ) => {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ef4444';
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 190);
    ctx.shadowBlur = 0;

    const isNewRecord = s.score >= s.highScore && s.score > 0;
    if (isNewRecord) {
      ctx.fillStyle = '#facc15';
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 230);
      ctx.shadowBlur = 0;
    }

    // Stats Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH / 2 - 140, 260, 280, 180, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    const leftCol = CANVAS_WIDTH / 2 - 115;
    const rightCol = CANVAS_WIDTH / 2 + 115;

    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillStyle = '#94a3b8';

    // Final Score
    ctx.fillText('FINAL SCORE:', leftCol, 295);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(s.score.toString(), rightCol, 295);

    // High Score
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('HIGH SCORE:', leftCol, 325);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(s.highScore.toString(), rightCol, 325);

    // Distance
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DISTANCE:', leftCol, 355);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${Math.round(s.distance)} M`, rightCol, 355);

    // Near Misses
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NEAR MISSES:', leftCol, 385);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(s.nearMisses.toString(), rightCol, 385);

    // Cars Passed
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OVERTAKES:', leftCol, 415);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(s.carsOvertaken.toString(), rightCol, 415);

    // Restart CTA
    ctx.textAlign = 'center';
    const blink = Math.floor(Date.now() / 450) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = "12px 'Press Start 2P', monospace";
      ctx.fillText('PRESS R TO RESTART', CANVAS_WIDTH / 2, 490);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText('OR TAP ANYWHERE ON SCREEN', CANVAS_WIDTH / 2, 520);

    ctx.restore();
  };

  const handleCanvasClick = () => {
    audio.userInteracted();
    const s = stateRef.current;
    if (s.gameState === 'start' || s.gameState === 'gameover') {
      startNewGame();
    } else if (s.gameState === 'paused') {
      onGameStateChange('playing');
    }
  };

  return (
    <div className="relative w-full max-w-[480px] mx-auto aspect-[2/3] select-none touch-none overflow-hidden rounded-2xl shadow-2xl border-4 border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer"
      />

      {/* CRT Scanline & Screen Glow Effect */}
      {crtEnabled && (
        <div
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
          style={{
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 4px, 6px 100%',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.85), inset 0 0 10px rgba(56, 189, 248, 0.2)',
          }}
        />
      )}
    </div>
  );
};
