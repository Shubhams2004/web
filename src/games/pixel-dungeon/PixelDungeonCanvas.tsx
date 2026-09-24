import React, { useRef, useEffect, useCallback } from 'react';
import type {
  DungeonGameState,
  DungeonKeyControls,
  PlayerStats,
  Position,
  Enemy,
  DungeonItem,
  FloatingText,
  Particle,
  TileType,
} from './types';
import { generateDungeonLevel, DUNGEON_COLS, DUNGEON_ROWS } from './dungeonGenerator';
import { dungeonAudio } from './audio';

const CANVAS_WIDTH = 624;
const CANVAS_HEIGHT = 480;
const TILE_SIZE = 24; // 26 * 24 = 624, 20 * 24 = 480
const TORCH_RADIUS = 5.2;

interface PixelDungeonCanvasProps {
  gameState: DungeonGameState;
  onGameStateChange: (state: DungeonGameState) => void;
  onStatsUpdate: (stats: PlayerStats) => void;
  externalControls: DungeonKeyControls;
  stepTrigger: number; // Increment to trigger a step from mobile button
  lastStepDir: 'up' | 'down' | 'left' | 'right' | 'wait' | 'action' | null;
  crtEnabled: boolean;
}

export const PixelDungeonCanvas: React.FC<PixelDungeonCanvasProps> = ({
  gameState,
  onGameStateChange,
  onStatsUpdate,
  externalControls,
  stepTrigger,
  lastStepDir,
  crtEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High score from local storage
  const highScoreRef = useRef<number>((() => {
    try {
      return parseInt(localStorage.getItem('pixel_dungeon_highscore') || '0', 10);
    } catch {
      return 0;
    }
  })());

  // Mutable Game State in ref for 60fps loop & turn handling
  const stateRef = useRef<{
    floor: number;
    player: {
      x: number;
      y: number;
      facing: 'left' | 'right';
      animOffset: number;
      hurtTimer: number;
      attackAnimTimer: number;
      targetX?: number;
      targetY?: number;
    };
    stats: PlayerStats;
    tiles: TileType[][];
    explored: boolean[][]; // Memory fog of war
    enemies: Enemy[];
    items: DungeonItem[];
    floatingTexts: FloatingText[];
    particles: Particle[];
    shakeDuration: number;
    shakeIntensity: number;
    torchFlicker: number;
    turnCount: number;
    floorTransitionTimer: number;
    keysHeld: DungeonKeyControls;
    lastExternalStep: number;
  }>({
    floor: 1,
    player: {
      x: 3,
      y: 3,
      facing: 'right',
      animOffset: 0,
      hurtTimer: 0,
      attackAnimTimer: 0,
    },
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 8,
      defense: 2,
      keys: 0,
      coins: 0,
      score: 0,
      highScore: 0,
      floor: 1,
      weaponName: 'Rusty Dagger',
      weaponTier: 1,
      armorName: 'Tattered Tunic',
      armorTier: 1,
      enemiesDefeated: 0,
    },
    tiles: [],
    explored: [],
    enemies: [],
    items: [],
    floatingTexts: [],
    particles: [],
    shakeDuration: 0,
    shakeIntensity: 0,
    torchFlicker: 0,
    turnCount: 0,
    floorTransitionTimer: 0,
    keysHeld: {
      up: false,
      down: false,
      left: false,
      right: false,
      wait: false,
      action: false,
    },
    lastExternalStep: 0,
  });

  // Spawn floating combat text
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    stateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x: x * TILE_SIZE + TILE_SIZE / 2,
      y: y * TILE_SIZE,
      color,
      life: 40,
      maxLife: 40,
      vy: -0.8,
    });
  };

  // Spawn visual particles
  const addParticles = (x: number, y: number, color: string, count: number = 6) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      stateRef.current.particles.push({
        id: Math.random().toString(),
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2.5,
        life: 25,
        maxLife: 25,
      });
    }
  };

  // Screen shake
  const triggerShake = (intensity: number, frames: number) => {
    stateRef.current.shakeIntensity = intensity;
    stateRef.current.shakeDuration = frames;
  };

  // Check tile transparency for Line of Sight
  const isOpaque = (x: number, y: number, tiles: TileType[][]): boolean => {
    if (x < 0 || x >= DUNGEON_COLS || y < 0 || y >= DUNGEON_ROWS) return true;
    const tile = tiles[y][x];
    return tile === 'wall' || tile === 'door-closed' || tile === 'door-locked';
  };

  // Simple Bresenham line check for LOS
  const hasLineOfSight = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    tiles: TileType[][]
  ): boolean => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (cx !== x1 || cy !== y1) {
      if ((cx !== x0 || cy !== y0) && isOpaque(cx, cy, tiles)) {
        return false;
      }
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
    return true;
  };

  // Start new run or next floor
  const initFloor = useCallback((floorNum: number, keepStats: boolean = false) => {
    const level = generateDungeonLevel(floorNum);
    const prevStats = stateRef.current.stats;

    // Reset or carry over stats
    const hs = Math.max(highScoreRef.current, prevStats.score);
    const newStats: PlayerStats = keepStats
      ? {
          ...prevStats,
          floor: floorNum,
          highScore: hs,
        }
      : {
          hp: 100,
          maxHp: 100,
          attack: 8,
          defense: 2,
          keys: 0,
          coins: 0,
          score: 0,
          highScore: hs,
          floor: 1,
          weaponName: 'Rusty Dagger',
          weaponTier: 1,
          armorName: 'Tattered Tunic',
          armorTier: 1,
          enemiesDefeated: 0,
        };

    const explored: boolean[][] = Array.from({ length: DUNGEON_ROWS }, () =>
      Array.from({ length: DUNGEON_COLS }, () => false)
    );

    stateRef.current.floor = floorNum;
    stateRef.current.tiles = level.tiles;
    stateRef.current.player = {
      x: level.playerStart.x,
      y: level.playerStart.y,
      facing: 'right',
      animOffset: 0,
      hurtTimer: 0,
      attackAnimTimer: 0,
    };
    stateRef.current.enemies = level.enemies;
    stateRef.current.items = level.items;
    stateRef.current.explored = explored;
    stateRef.current.stats = newStats;
    stateRef.current.floatingTexts = [];
    stateRef.current.particles = [];
    stateRef.current.turnCount = 0;
    stateRef.current.floorTransitionTimer = 0;

    // Reveal player start area
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const nx = level.playerStart.x + dx;
        const ny = level.playerStart.y + dy;
        if (nx >= 0 && nx < DUNGEON_COLS && ny >= 0 && ny < DUNGEON_ROWS) {
          explored[ny][nx] = true;
        }
      }
    }

    onStatsUpdate(newStats);
  }, [onStatsUpdate]);

  // Execute turn action (Player moves or attacks, then enemies react)
  const executeTurn = useCallback(
    (actionType: 'up' | 'down' | 'left' | 'right' | 'wait' | 'action') => {
      const state = stateRef.current;
      if (gameState !== 'playing') return;

      dungeonAudio.userInteracted();

      let dx = 0;
      let dy = 0;

      if (actionType === 'up') dy = -1;
      else if (actionType === 'down') dy = 1;
      else if (actionType === 'left') {
        dx = -1;
        state.player.facing = 'left';
      } else if (actionType === 'right') {
        dx = 1;
        state.player.facing = 'right';
      } else if (actionType === 'action') {
        // Strike towards facing direction
        dx = state.player.facing === 'left' ? -1 : 1;
      }

      const targetX = state.player.x + dx;
      const targetY = state.player.y + dy;

      let playerTookAction = false;

      // 1. Wait Turn
      if (actionType === 'wait') {
        playerTookAction = true;
        addFloatingText('REST', state.player.x, state.player.y, '#94a3b8');
        dungeonAudio.playStep();
      }
      // 2. Check if attacking enemy in target cell
      else if (dx !== 0 || dy !== 0) {
        const enemyAtTarget = state.enemies.find(
          (e) => e.x === targetX && e.y === targetY && e.hp > 0
        );

        if (enemyAtTarget) {
          // Attack enemy!
          playerTookAction = true;
          state.player.attackAnimTimer = 8;
          dungeonAudio.playAttack();

          // Calculate damage
          const baseAtk = state.stats.attack;
          const variance = Math.floor(Math.random() * 3) - 1;
          const isCrit = Math.random() < 0.18;
          let damage = Math.max(1, baseAtk + variance - enemyAtTarget.defense);
          if (isCrit) {
            damage = Math.floor(damage * 1.6);
          }

          enemyAtTarget.hp -= damage;
          enemyAtTarget.flashTimer = 10;
          enemyAtTarget.isAggro = true;

          dungeonAudio.playEnemyHit();
          triggerShake(3, 4);
          addParticles(targetX, targetY, isCrit ? '#f59e0b' : '#ef4444', 8);

          addFloatingText(
            isCrit ? `CRIT! -${damage}` : `-${damage}`,
            targetX,
            targetY,
            isCrit ? '#fbbf24' : '#f87171'
          );

          // Enemy Death Check
          if (enemyAtTarget.hp <= 0) {
            dungeonAudio.playEnemyDeath();
            state.stats.enemiesDefeated += 1;
            const expScore =
              enemyAtTarget.type === 'skeleton' ? 60 : enemyAtTarget.type === 'goblin' ? 35 : 20;
            state.stats.score += expScore;
            addFloatingText(`+${expScore} PTS`, targetX, targetY, '#10b981');
            addParticles(targetX, targetY, '#e2e8f0', 12);

            // Chance to drop coins or small potion on death
            if (Math.random() < 0.35) {
              state.items.push({
                id: `drop-${Date.now()}`,
                type: Math.random() < 0.25 ? 'potion' : 'coin',
                x: targetX,
                y: targetY,
                name: 'Loot Drop',
                value: 15,
                description: 'Loot dropped from fallen enemy.',
              });
            }
          }
        }
        // 3. Check doors and tiles
        else if (
          targetX >= 0 &&
          targetX < DUNGEON_COLS &&
          targetY >= 0 &&
          targetY < DUNGEON_ROWS
        ) {
          const targetTile = state.tiles[targetY][targetX];

          // Locked Door
          if (targetTile === 'door-locked') {
            playerTookAction = true;
            if (state.stats.keys > 0) {
              state.stats.keys -= 1;
              state.tiles[targetY][targetX] = 'door-open';
              dungeonAudio.playDoorUnlock();
              addFloatingText('UNLOCKED! 🗝️', targetX, targetY, '#fbbf24');
              addParticles(targetX, targetY, '#f59e0b', 8);
            } else {
              dungeonAudio.playDoorLocked();
              addFloatingText('LOCKED! FIND 🗝️', targetX, targetY, '#f43f5e');
              triggerShake(2, 3);
            }
          }
          // Closed Door
          else if (targetTile === 'door-closed') {
            playerTookAction = true;
            state.tiles[targetY][targetX] = 'door-open';
            dungeonAudio.playStep();
            addFloatingText('DOOR OPENED', targetX, targetY, '#e2e8f0');
          }
          // Walkable tile (Floor, Open Door, Stairs)
          else if (targetTile === 'floor' || targetTile === 'door-open' || targetTile === 'stairs-down') {
            playerTookAction = true;
            state.player.x = targetX;
            state.player.y = targetY;
            state.player.animOffset = 4;
            dungeonAudio.playStep();

            // Item Pickup check
            const itemIdx = state.items.findIndex(
              (it) => it.x === targetX && it.y === targetY && !it.collected
            );
            if (itemIdx !== -1) {
              const item = state.items[itemIdx];
              item.collected = true;

              if (item.type === 'potion') {
                dungeonAudio.playItemPickup();
                const healAmt = item.value || 28;
                state.stats.hp = Math.min(state.stats.maxHp, state.stats.hp + healAmt);
                addFloatingText(`+${healAmt} HP ❤️`, targetX, targetY, '#10b981');
                addParticles(targetX, targetY, '#ef4444', 8);
              } else if (item.type === 'weapon') {
                dungeonAudio.playItemPickup();
                state.stats.weaponTier += 1;
                state.stats.attack += item.value || 3;
                state.stats.weaponName = item.name;
                addFloatingText(`⚔️ ${item.name}!`, targetX, targetY, '#38bdf8');
                addParticles(targetX, targetY, '#38bdf8', 10);
              } else if (item.type === 'armor') {
                dungeonAudio.playItemPickup();
                state.stats.armorTier += 1;
                state.stats.defense += item.value || 2;
                state.stats.armorName = item.name;
                addFloatingText(`🛡️ ${item.name}!`, targetX, targetY, '#818cf8');
                addParticles(targetX, targetY, '#818cf8', 10);
              } else if (item.type === 'key') {
                dungeonAudio.playDoorUnlock();
                state.stats.keys += 1;
                state.stats.score += 50;
                addFloatingText('+1 KEY 🗝️', targetX, targetY, '#fbbf24');
                addParticles(targetX, targetY, '#fbbf24', 8);
              } else if (item.type === 'coin') {
                dungeonAudio.playCoinPickup();
                const coins = item.value || 20;
                state.stats.coins += coins;
                state.stats.score += coins;
                addFloatingText(`+${coins} GOLD 💰`, targetX, targetY, '#fbbf24');
                addParticles(targetX, targetY, '#f59e0b', 6);
              }

              // Filter out collected items
              state.items = state.items.filter((it) => !it.collected);
            }

            // Stairs Down check
            if (targetTile === 'stairs-down') {
              dungeonAudio.playStairsDown();
              const floorBonus = state.floor * 150;
              state.stats.score += floorBonus;
              addFloatingText(`DEPTH CLEARED! +${floorBonus} PTS`, targetX, targetY, '#38bdf8');
              state.floorTransitionTimer = 75; // frames of transition
              onGameStateChange('floor-transition');
            }
          }
        }
      }

      // If player successfully took a turn, update fog of war and let enemies react!
      if (playerTookAction) {
        state.turnCount += 1;

        // Reveal tiles in torch radius
        for (let r = -6; r <= 6; r++) {
          for (let c = -6; c <= 6; c++) {
            const tx = state.player.x + c;
            const ty = state.player.y + r;
            if (tx >= 0 && tx < DUNGEON_COLS && ty >= 0 && ty < DUNGEON_ROWS) {
              const dist = Math.hypot(c, r);
              if (dist <= TORCH_RADIUS && hasLineOfSight(state.player.x, state.player.y, tx, ty, state.tiles)) {
                state.explored[ty][tx] = true;
              }
            }
          }
        }

        // Enemies react!
        const aliveEnemies = state.enemies.filter((e) => e.hp > 0);

        for (const enemy of aliveEnemies) {
          const distToPlayer = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);

          // Check if enemy sees player
          if (
            distToPlayer <= 7 &&
            hasLineOfSight(enemy.x, enemy.y, state.player.x, state.player.y, state.tiles)
          ) {
            enemy.isAggro = true;
          }

          if (!enemy.isAggro) continue;

          // Bat movement speed: moves every turn, and has a 30% chance to take a double step!
          // Skeletons: heavier, move 2 out of 3 turns
          if (enemy.type === 'skeleton' && state.turnCount % 3 === 0) {
            continue; // Skip turn for slow skeleton
          }

          const stepsToTake = enemy.type === 'bat' && Math.random() < 0.35 ? 2 : 1;

          for (let step = 0; step < stepsToTake; step++) {
            const currentDist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);

            // If adjacent to player (dist <= 1.5), attack player!
            if (currentDist <= 1.5) {
              // Enemy attacks player!
              dungeonAudio.playPlayerHurt();
              state.player.hurtTimer = 12;
              triggerShake(4, 5);

              const rawDmg = enemy.attack;
              const dmg = Math.max(1, rawDmg - state.stats.defense);
              state.stats.hp -= dmg;

              addFloatingText(`-${dmg} HP`, state.player.x, state.player.y, '#ef4444');
              addParticles(state.player.x, state.player.y, '#dc2626', 8);

              // Check if player died
              if (state.stats.hp <= 0) {
                state.stats.hp = 0;
                dungeonAudio.playGameOver();
                triggerShake(8, 20);

                // Update high score
                if (state.stats.score > highScoreRef.current) {
                  highScoreRef.current = state.stats.score;
                  try {
                    localStorage.setItem('pixel_dungeon_highscore', state.stats.score.toString());
                  } catch {}
                }

                onGameStateChange('game-over');
                break;
              }
              break; // Don't move after attacking
            }

            // Move towards player
            const dxToPlayer = state.player.x - enemy.x;
            const dyToPlayer = state.player.y - enemy.y;

            let stepX = 0;
            let stepY = 0;

            // Pick primary axis
            if (Math.abs(dxToPlayer) > Math.abs(dyToPlayer)) {
              stepX = dxToPlayer > 0 ? 1 : -1;
            } else {
              stepY = dyToPlayer > 0 ? 1 : -1;
            }

            const canMoveTo = (nx: number, ny: number): boolean => {
              if (nx < 0 || nx >= DUNGEON_COLS || ny < 0 || ny >= DUNGEON_ROWS) return false;
              const t = state.tiles[ny][nx];
              if (t === 'wall' || t === 'door-closed' || t === 'door-locked') return false;
              if (nx === state.player.x && ny === state.player.y) return false;
              // Check other enemy
              return !aliveEnemies.some((other) => other.id !== enemy.id && other.x === nx && other.y === ny);
            };

            let nextX = enemy.x + stepX;
            let nextY = enemy.y + stepY;

            if (canMoveTo(nextX, nextY)) {
              enemy.x = nextX;
              enemy.y = nextY;
              enemy.facing = stepX < 0 ? 'left' : 'right';
            } else {
              // Try alternate axis
              let altX = 0;
              let altY = 0;
              if (stepX !== 0) {
                altY = dyToPlayer >= 0 ? 1 : -1;
              } else {
                altX = dxToPlayer >= 0 ? 1 : -1;
              }

              if (canMoveTo(enemy.x + altX, enemy.y + altY)) {
                enemy.x += altX;
                enemy.y += altY;
                if (altX !== 0) enemy.facing = altX < 0 ? 'left' : 'right';
              }
            }
          }
        }

        // Push stats update
        onStatsUpdate({ ...state.stats });
      }
    },
    [gameState, onGameStateChange, onStatsUpdate]
  );

  // Handle external mobile controls or triggers
  useEffect(() => {
    if (stepTrigger > 0 && lastStepDir) {
      executeTurn(lastStepDir);
    }
  }, [stepTrigger, lastStepDir, executeTurn]);

  // Handle keyboard events on window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll on arrow keys or space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (gameState === 'start') {
        if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
          initFloor(1, false);
          onGameStateChange('playing');
        }
        return;
      }

      if (gameState === 'game-over') {
        if (['Space', 'Enter', 'KeyR'].includes(e.code)) {
          initFloor(1, false);
          onGameStateChange('playing');
        }
        return;
      }

      if (gameState !== 'playing') return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          executeTurn('up');
          break;
        case 'ArrowDown':
        case 'KeyS':
          executeTurn('down');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          executeTurn('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          executeTurn('right');
          break;
        case 'Space':
        case 'KeyE':
          executeTurn('action');
          break;
        case 'KeyZ':
        case 'Period':
          executeTurn('wait');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, executeTurn, initFloor, onGameStateChange]);

  // Initial Floor Generation on mount
  useEffect(() => {
    initFloor(1, false);
  }, [initFloor]);

  // Main 60FPS Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = stateRef.current;
      ctx.imageSmoothingEnabled = false;

      // Update screen shake
      let offsetX = 0;
      let offsetY = 0;
      if (state.shakeDuration > 0) {
        offsetX = (Math.random() - 0.5) * state.shakeIntensity * 2;
        offsetY = (Math.random() - 0.5) * state.shakeIntensity * 2;
        state.shakeDuration--;
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Background Clear (Pitch Black Dungeon Ambience)
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Floor transition handling
      if (state.floorTransitionTimer > 0) {
        state.floorTransitionTimer--;
        if (state.floorTransitionTimer === 0) {
          initFloor(state.floor + 1, true);
          onGameStateChange('playing');
        }
      }

      // Decrement timers
      if (state.player.hurtTimer > 0) state.player.hurtTimer--;
      if (state.player.attackAnimTimer > 0) state.player.attackAnimTimer--;
      if (state.player.animOffset > 0) state.player.animOffset -= 0.5;

      // Torch flicker offset
      state.torchFlicker += 0.05;
      const dynamicTorchRadius =
        TORCH_RADIUS + Math.sin(state.torchFlicker) * 0.15 + Math.cos(state.torchFlicker * 2.3) * 0.1;

      // Draw Tiles
      for (let y = 0; y < DUNGEON_ROWS; y++) {
        for (let x = 0; x < DUNGEON_COLS; x++) {
          const isExplored = state.explored[y]?.[x];
          if (!isExplored) continue; // Hidden in fog of war

          const distToPlayer = Math.hypot(x - state.player.x, y - state.player.y);
          const inSight =
            distToPlayer <= dynamicTorchRadius &&
            hasLineOfSight(state.player.x, state.player.y, x, y, state.tiles);

          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;
          const tile = state.tiles[y][x];

          // 1. Wall Tile
          if (tile === 'wall') {
            ctx.fillStyle = inSight ? '#1e293b' : '#0f172a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Brick details
            ctx.fillStyle = inSight ? '#334155' : '#1e293b';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 8);
            ctx.fillRect(px + 4, py + 12, TILE_SIZE - 8, 8);

            // Top rim highlight
            ctx.fillStyle = inSight ? '#475569' : '#1e293b';
            ctx.fillRect(px, py, TILE_SIZE, 2);
          }
          // 2. Floor Tile
          else if (tile === 'floor') {
            ctx.fillStyle = inSight ? '#1e2330' : '#0c1017';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Flagstone seams
            ctx.strokeStyle = inSight ? '#131822' : '#070a0f';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

            // Ambient stone flecks
            if ((x * 7 + y * 13) % 5 === 0) {
              ctx.fillStyle = inSight ? '#334155' : '#131a24';
              ctx.fillRect(px + 6, py + 8, 2, 2);
            }
          }
          // 3. Closed Door
          else if (tile === 'door-closed') {
            ctx.fillStyle = inSight ? '#78350f' : '#451a03';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Iron bands
            ctx.fillStyle = inSight ? '#475569' : '#1e293b';
            ctx.fillRect(px + 2, py + 6, TILE_SIZE - 4, 2);
            ctx.fillRect(px + 2, py + 16, TILE_SIZE - 4, 2);
            // Golden lock
            ctx.fillStyle = inSight ? '#fbbf24' : '#b45309';
            ctx.fillRect(px + 10, py + 11, 4, 4);
          }
          // 4. Open Door
          else if (tile === 'door-open') {
            ctx.fillStyle = inSight ? '#1e2330' : '#0c1017';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Door swung against wall
            ctx.fillStyle = inSight ? '#78350f' : '#3d1604';
            ctx.fillRect(px + 1, py + 2, 4, TILE_SIZE - 4);
            ctx.fillRect(px + TILE_SIZE - 5, py + 2, 4, TILE_SIZE - 4);
          }
          // 5. Locked Door (Reinforced Gold Padlock)
          else if (tile === 'door-locked') {
            ctx.fillStyle = inSight ? '#581c87' : '#2e1065';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Gold studs
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(px + 4, py + 4, 3, 3);
            ctx.fillRect(px + TILE_SIZE - 7, py + 4, 3, 3);
            ctx.fillRect(px + 4, py + TILE_SIZE - 7, 3, 3);
            ctx.fillRect(px + TILE_SIZE - 7, py + TILE_SIZE - 7, 3, 3);
            // Large keyhole padlock
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(px + 9, py + 9, 6, 7);
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(px + 11, py + 12, 2, 3);
          }
          // 6. Stairs Down (Descending portal)
          else if (tile === 'stairs-down') {
            ctx.fillStyle = inSight ? '#0f172a' : '#050810';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Stepped gradient
            const stairSteps = 4;
            for (let s = 0; s < stairSteps; s++) {
              ctx.fillStyle = inSight
                ? s % 2 === 0
                  ? '#38bdf8'
                  : '#0284c7'
                : '#075985';
              ctx.fillRect(
                px + s * 2,
                py + s * 3,
                TILE_SIZE - s * 4,
                3
              );
            }
            // Glow icon
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px monospace';
            ctx.fillText('▼', px + 7, py + 17);
          }

          // Shading if explored but outside current torchlight
          if (!inSight) {
            ctx.fillStyle = 'rgba(6, 9, 14, 0.72)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // Draw Items (Only if within torch sight)
      for (const item of state.items) {
        if (item.collected) continue;
        const dist = Math.hypot(item.x - state.player.x, item.y - state.player.y);
        const inSight =
          dist <= dynamicTorchRadius &&
          hasLineOfSight(state.player.x, state.player.y, item.x, item.y, state.tiles);

        if (!inSight) continue;

        const ix = item.x * TILE_SIZE;
        const iy = item.y * TILE_SIZE;

        // Subtle item pedestal glow
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        ctx.arc(ix + TILE_SIZE / 2, iy + TILE_SIZE / 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // 1. Health Potion
        if (item.type === 'potion') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ix + 12, iy + 14, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f87171';
          ctx.fillRect(ix + 11, iy + 7, 2, 4);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(ix + 10, iy + 5, 4, 2);
        }
        // 2. Weapon Upgrade
        else if (item.type === 'weapon') {
          // Sharp silver sword
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(ix + 11, iy + 4, 3, 11);
          // Gold hilt
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(ix + 7, iy + 14, 10, 2);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(ix + 11, iy + 16, 2, 4);
        }
        // 3. Armor Upgrade
        else if (item.type === 'armor') {
          // Shield
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(ix + 6, iy + 6);
          ctx.lineTo(ix + 18, iy + 6);
          ctx.lineTo(ix + 18, iy + 14);
          ctx.lineTo(ix + 12, iy + 19);
          ctx.lineTo(ix + 6, iy + 14);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(ix + 11, iy + 8, 2, 7);
        }
        // 4. Key
        else if (item.type === 'key') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(ix + 12, iy + 8, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(ix + 11, iy + 11, 2, 8);
          ctx.fillRect(ix + 13, iy + 15, 3, 2);
          ctx.fillRect(ix + 13, iy + 18, 2, 2);
        }
        // 5. Coin Pouch
        else if (item.type === 'coin') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(ix + 12, iy + 13, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix + 10, iy + 7, 4, 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(ix + 11, iy + 11, 2, 4);
        }
      }

      // Draw Enemies (Only if in torch sight)
      for (const enemy of state.enemies) {
        if (enemy.hp <= 0) continue;

        const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
        const inSight =
          dist <= dynamicTorchRadius &&
          hasLineOfSight(state.player.x, state.player.y, enemy.x, enemy.y, state.tiles);

        if (!inSight) continue;

        const ex = enemy.x * TILE_SIZE;
        const ey = enemy.y * TILE_SIZE;

        if (enemy.flashTimer && enemy.flashTimer > 0) {
          enemy.flashTimer--;
        }

        const isHurt = enemy.flashTimer && enemy.flashTimer > 0;

        // 1. Bat (Wing flapping animation)
        if (enemy.type === 'bat') {
          const wingSpread = Math.sin(state.torchFlicker * 8) > 0 ? 8 : 4;
          ctx.fillStyle = isHurt ? '#ffffff' : enemy.color;
          // Body
          ctx.beginPath();
          ctx.arc(ex + 12, ey + 12, 4, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.beginPath();
          ctx.moveTo(ex + 12, ey + 12);
          ctx.lineTo(ex + 12 - wingSpread, ey + 8);
          ctx.lineTo(ex + 12 - wingSpread / 2, ey + 15);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(ex + 12, ey + 12);
          ctx.lineTo(ex + 12 + wingSpread, ey + 8);
          ctx.lineTo(ex + 12 + wingSpread / 2, ey + 15);
          ctx.closePath();
          ctx.fill();

          // Red glowing eyes
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ex + 10, ey + 11, 1, 1);
          ctx.fillRect(ex + 13, ey + 11, 1, 1);
        }
        // 2. Goblin
        else if (enemy.type === 'goblin') {
          ctx.fillStyle = isHurt ? '#ffffff' : enemy.color;
          // Head with pointy ears
          ctx.fillRect(ex + 8, ey + 6, 8, 8);
          // Left ear
          ctx.fillRect(ex + 5, ey + 6, 3, 2);
          // Right ear
          ctx.fillRect(ex + 16, ey + 6, 3, 2);
          // Body / tunic
          ctx.fillStyle = isHurt ? '#ffffff' : '#854d0e';
          ctx.fillRect(ex + 8, ey + 14, 8, 7);
          // Red eyes
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ex + 10, ey + 8, 2, 2);
          ctx.fillRect(ex + 13, ey + 8, 2, 2);
          // Dagger
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(enemy.facing === 'left' ? ex + 5 : ex + 17, ey + 13, 3, 5);
        }
        // 3. Skeleton
        else if (enemy.type === 'skeleton') {
          ctx.fillStyle = isHurt ? '#ffffff' : enemy.color;
          // Skull
          ctx.fillRect(ex + 8, ey + 5, 8, 7);
          // Hollow black eyes
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ex + 9, ey + 7, 2, 2);
          ctx.fillRect(ex + 13, ey + 7, 2, 2);
          // Rib cage
          ctx.fillStyle = isHurt ? '#ffffff' : '#cbd5e1';
          ctx.fillRect(ex + 9, ey + 13, 6, 2);
          ctx.fillRect(ex + 10, ey + 16, 4, 2);
          ctx.fillRect(ex + 11, ey + 18, 2, 3);
          // Bone scythe / rusty blade
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(enemy.facing === 'left' ? ex + 4 : ex + 18, ey + 9, 2, 11);
          ctx.fillRect(enemy.facing === 'left' ? ex + 2 : ex + 18, ey + 8, 5, 2);
        }

        // Enemy Health Bar (if damaged)
        if (enemy.hp < enemy.maxHp) {
          const barW = 16;
          const barH = 2.5;
          const pct = Math.max(0, enemy.hp / enemy.maxHp);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ex + 4, ey + 1, barW, barH);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(ex + 4, ey + 1, barW * pct, barH);
        }
      }

      // Draw Player Hero (Knight)
      const px = state.player.x * TILE_SIZE;
      const py = state.player.y * TILE_SIZE;
      const isPlayerHurt = state.player.hurtTimer > 0;
      const facing = state.player.facing;

      // Hero Sprite
      // Helmet (Steel)
      ctx.fillStyle = isPlayerHurt ? '#ef4444' : '#94a3b8';
      ctx.fillRect(px + 8, py + 5, 8, 7);
      // Gold plume / crest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 10, py + 3, 4, 3);
      // Visor slit
      ctx.fillStyle = '#090d16';
      ctx.fillRect(facing === 'left' ? px + 8 : px + 11, py + 8, 5, 2);
      // Blue armor plate / tabard
      ctx.fillStyle = isPlayerHurt ? '#dc2626' : '#2563eb';
      ctx.fillRect(px + 7, py + 12, 10, 7);
      // Golden belt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 7, py + 17, 10, 2);
      // Boots
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + 8, py + 19, 3, 4);
      ctx.fillRect(px + 13, py + 19, 3, 4);

      // Hero Sword & Shield
      if (facing === 'right') {
        // Shield on left
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px + 5, py + 12, 3, 6);
        // Sword on right
        const slashOffset = state.player.attackAnimTimer > 0 ? 3 : 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(px + 17 + slashOffset, py + 9, 2, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 16 + slashOffset, py + 15, 4, 2);
      } else {
        // Shield on right
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px + 16, py + 12, 3, 6);
        // Sword on left
        const slashOffset = state.player.attackAnimTimer > 0 ? -3 : 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(px + 5 + slashOffset, py + 9, 2, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 4 + slashOffset, py + 15, 4, 2);
      }

      // Warm Torch Light Radial Vignette
      const torchGrad = ctx.createRadialGradient(
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        TILE_SIZE * 1.5,
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        TILE_SIZE * dynamicTorchRadius
      );
      torchGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
      torchGrad.addColorStop(0.65, 'rgba(180, 83, 9, 0.04)');
      torchGrad.addColorStop(1, 'rgba(6, 9, 14, 0.88)');

      ctx.fillStyle = torchGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Render Floating Text
      ctx.font = 'bold 11px monospace';
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      // HUD Overlay on Canvas: Bottom Strip (Subtle Retro Bar)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, CANVAS_HEIGHT - 22, CANVAS_WIDTH, 22);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`DEPTH B${state.floor}`, 10, CANVAS_HEIGHT - 8);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ATK: ${state.stats.attack}`, 90, CANVAS_HEIGHT - 8);

      ctx.fillStyle = '#818cf8';
      ctx.fillText(`DEF: ${state.stats.defense}`, 160, CANVAS_HEIGHT - 8);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`KEYS: ${state.stats.keys} 🗝️`, 230, CANVAS_HEIGHT - 8);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`SCORE: ${state.stats.score.toLocaleString()}`, 320, CANVAS_HEIGHT - 8);

      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'right';
      ctx.fillText(
        `HP: ${state.stats.hp}/${state.stats.maxHp}`,
        CANVAS_WIDTH - 12,
        CANVAS_HEIGHT - 8
      );

      // Floor Transition Overlay
      if (gameState === 'floor-transition') {
        ctx.fillStyle = 'rgba(6, 9, 14, 0.78)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`DEPTH B${state.floor} CLEARED!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px monospace';
        ctx.fillText(
          `Descending deeper into the catacombs...`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 16
        );
      }

      // Start Screen Overlay
      if (gameState === 'start') {
        ctx.fillStyle = 'rgba(6, 9, 14, 0.88)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'black 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PIXEL DUNGEON', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '13px monospace';
        ctx.fillText('DESCEND INTO THE SHADOW CRYPTS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 18);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(
          'Explore rooms · Slay monsters · Find keys & treasure · Survive depths',
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 16
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(
          'PRESS SPACE OR TAP STRIKE TO ENTER',
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 60
        );
      }

      // Game Over Screen Overlay
      if (gameState === 'game-over') {
        ctx.fillStyle = 'rgba(15, 7, 10, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SLAIN IN THE DUNGEON', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 55);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px monospace';
        ctx.fillText(
          `Final Depth: B${state.floor}  |  Enemies Slain: ${state.stats.enemiesDefeated}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 - 18
        );

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(
          `SCORE: ${state.stats.score.toLocaleString()}  |  HIGH: ${highScoreRef.current.toLocaleString()}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 14
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(
          'PRESS SPACE / RESTART TO PLAY AGAIN',
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 58
        );
      }

      // CRT Scanline Overlay
      if (crtEnabled) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
          ctx.fillRect(0, y, CANVAS_WIDTH, 1);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, crtEnabled, initFloor, onGameStateChange]);

  return (
    <div className="relative w-full aspect-[4/3] max-w-[624px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-[0_0_35px_rgba(0,0,0,0.8)] select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain block image-rendering-pixelated cursor-pointer"
        onClick={() => {
          if (gameState === 'start' || gameState === 'game-over') {
            initFloor(1, false);
            onGameStateChange('playing');
          }
        }}
      />
    </div>
  );
};
