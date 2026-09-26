import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  ShadowHuntGameState,
  PlayerEntity,
  GuardEntity,
  WallRect,
  GameParticle,
  MissionStats,
  Point,
} from './types';
import { LEVEL_01, LevelData } from './levelData';
import { shadowAudio } from './audio';

interface ShadowHuntCanvasProps {
  gameState: ShadowHuntGameState;
  onGameStateChange: (state: ShadowHuntGameState) => void;
  onUpdateStats: (stats: MissionStats) => void;
  onRestart: () => void;
  isMuted: boolean;
}

// Ray-box intersection helper for vision cone wall occlusion
function getRayIntersection(
  rayOrigin: Point,
  rayAngle: number,
  maxDist: number,
  walls: WallRect[]
): { x: number; y: number; dist: number } {
  const dx = Math.cos(rayAngle);
  const dy = Math.sin(rayAngle);
  let closestDist = maxDist;
  let hitX = rayOrigin.x + dx * maxDist;
  let hitY = rayOrigin.y + dy * maxDist;

  for (const wall of walls) {
    if (wall.w <= 0 || wall.h <= 0) continue;

    // AABB ray test
    const minX = wall.x;
    const maxX = wall.x + wall.w;
    const minY = wall.y;
    const maxY = wall.y + wall.h;

    // Check four segment boundaries of the wall
    const segments: [number, number, number, number][] = [
      [minX, minY, maxX, minY], // top
      [maxX, minY, maxX, maxY], // right
      [maxX, maxY, minX, maxY], // bottom
      [minX, maxY, minX, minY], // left
    ];

    for (const [x1, y1, x2, y2] of segments) {
      const denom = (x1 - x2) * dy - (y1 - y2) * dx;
      if (Math.abs(denom) < 0.0001) continue;

      const t = ((x1 - rayOrigin.x) * (y1 - y2) - (y1 - rayOrigin.y) * (x1 - x2)) / denom;
      const u = -((x1 - rayOrigin.x) * dy - (y1 - rayOrigin.y) * dx) / denom;

      if (t > 0 && t < closestDist && u >= 0 && u <= 1) {
        closestDist = t;
        hitX = rayOrigin.x + dx * t;
        hitY = rayOrigin.y + dy * t;
      }
    }
  }

  return { x: hitX, y: hitY, dist: closestDist };
}

// Circle - Box collision resolution
function resolveCircleBoxCollision(circle: { x: number; y: number; radius: number }, box: WallRect) {
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.h));

  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  const distSq = distX * distX + distY * distY;

  if (distSq < circle.radius * circle.radius) {
    const dist = Math.sqrt(distSq);
    if (dist > 0.001) {
      const overlap = circle.radius - dist;
      circle.x += (distX / dist) * overlap;
      circle.y += (distY / dist) * overlap;
    } else {
      circle.y -= circle.radius;
    }
  }
}

export const ShadowHuntCanvas: React.FC<ShadowHuntCanvasProps> = ({
  gameState,
  onGameStateChange,
  onUpdateStats,
  onRestart,
  isMuted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport / Camera
  const cameraRef = useRef<{ x: number; y: number; zoom: number }>({
    x: LEVEL_01.playerSpawn.x,
    y: LEVEL_01.playerSpawn.y,
    zoom: 1.05,
  });

  // Level State
  const levelRef = useRef<LevelData>(JSON.parse(JSON.stringify(LEVEL_01)));

  // Player State
  const playerRef = useRef<PlayerEntity>({
    x: LEVEL_01.playerSpawn.x,
    y: LEVEL_01.playerSpawn.y,
    radius: 20,
    angle: -Math.PI / 2,
    speed: 4.8,
    targetX: LEVEL_01.playerSpawn.x,
    targetY: LEVEL_01.playerSpawn.y,
    isMoving: false,
    isAttacking: false,
    attackTargetId: null,
    attackTimer: 0,
    animFrame: 0,
    hp: 100,
    maxHp: 100,
    stealthBonus: true,
  });

  // Touch & Pointer Drag Tracking
  const touchActiveRef = useRef<boolean>(false);
  const touchWorldPosRef = useRef<Point>({ x: LEVEL_01.playerSpawn.x, y: LEVEL_01.playerSpawn.y });
  const keyboardMovementRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Particles & Visual Feedback
  const particlesRef = useRef<GameParticle[]>([]);

  // Telemetry & Stats
  const statsRef = useRef<MissionStats>({
    targetsTotal: 3,
    targetsEliminated: 0,
    intelCollected: 0,
    intelTotal: 2,
    alarmsTriggered: 0,
    timeSeconds: 0,
    stealthScore: 1000,
    rank: 'S',
  });

  // Nearest target in strike range indicator
  const [strikeCandidateId, setStrikeCandidateId] = useState<string | null>(null);
  const strikeCandidateRef = useRef<string | null>(null);
  strikeCandidateRef.current = strikeCandidateId;

  // Handle Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rAFId: number | null = null;
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(300, Math.floor(rect.height));

      const canvas = canvasRef.current;
      if (canvas) {
        const targetW = width * dpr;
        const targetH = height * dpr;
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }
      }

      // Responsive camera zoom adjustment
      if (width < 640) {
        cameraRef.current.zoom = 1.15; // Closer zoom for mobile readability
      } else {
        cameraRef.current.zoom = 1.0;
      }
    };

    handleResize();
    const observer = new ResizeObserver(() => {
      if (rAFId !== null) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(handleResize);
    });
    observer.observe(container);

    return () => {
      if (rAFId !== null) cancelAnimationFrame(rAFId);
      observer.disconnect();
    };
  }, []);

  // Keyboard controls listener (secondary dev / desktop support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keyboardMovementRef.current.up = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keyboardMovementRef.current.down = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keyboardMovementRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keyboardMovementRef.current.right = true;
          break;
        case 'Space':
          // Trigger attack on candidate if in range
          if (strikeCandidateRef.current) {
            initiateAttack(strikeCandidateRef.current);
          }
          break;
        case 'KeyR':
          onRestart();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keyboardMovementRef.current.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keyboardMovementRef.current.down = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keyboardMovementRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keyboardMovementRef.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onRestart]);

  // Convert screen coordinates to world coordinates based on camera transform
  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const cam = cameraRef.current;

    const worldX = (screenX - cw / 2) / cam.zoom + cam.x;
    const worldY = (screenY - ch / 2) / cam.zoom + cam.y;
    return { x: worldX, y: worldY };
  }, []);

  // Initiate an assassination attack on an enemy
  const initiateAttack = useCallback((guardId: string) => {
    const player = playerRef.current;
    const level = levelRef.current;
    const targetGuard = level.guards.find((g) => g.id === guardId && !g.isEliminated);
    if (!targetGuard) return;

    player.isAttacking = true;
    player.attackTargetId = guardId;
    player.attackTimer = 15; // frames

    // Shadow dash straight to target
    shadowAudio.playDash();

    // Spawn shadow teleport particle trail
    for (let i = 0; i < 14; i++) {
      particlesRef.current.push({
        x: player.x + (Math.random() - 0.5) * 20,
        y: player.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1.0,
        maxLife: 1.0,
        color: '#38bdf8',
        size: 3 + Math.random() * 4,
        type: 'shadow',
      });
    }
  }, []);

  // Touch and Pointer Handlers (Touch & Drag everywhere)
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;
    shadowAudio.userInteracted();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    touchActiveRef.current = true;
    touchWorldPosRef.current = worldPos;

    // Check if player tapped directly on an enemy within strike reach
    const level = levelRef.current;
    for (const guard of level.guards) {
      if (guard.isEliminated) continue;
      const dx = guard.x - worldPos.x;
      const dy = guard.y - worldPos.y;
      if (dx * dx + dy * dy < (guard.radius + 35) * (guard.radius + 35)) {
        // Tapped guard directly
        const pDx = guard.x - playerRef.current.x;
        const pDy = guard.y - playerRef.current.y;
        if (pDx * pDx + pDy * pDy < 95 * 95) {
          initiateAttack(guard.id);
          return;
        }
      }
    }

    // Otherwise, move toward target touch position
    playerRef.current.targetX = worldPos.x;
    playerRef.current.targetY = worldPos.y;
    playerRef.current.isMoving = true;
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchActiveRef.current || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    touchWorldPosRef.current = worldPos;
    playerRef.current.targetX = worldPos.x;
    playerRef.current.targetY = worldPos.y;
    playerRef.current.isMoving = true;
  };

  const handlePointerUp = () => {
    touchActiveRef.current = false;
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const player = playerRef.current;
      const level = levelRef.current;
      const cam = cameraRef.current;

      // Update simulation if game is currently playing
      if (gameState === 'playing') {
        // Track mission time
        statsRef.current.timeSeconds += dt;

        // 1. Process Player Movement (Keyboard & Touch)
        let moveX = 0;
        let moveY = 0;

        const kb = keyboardMovementRef.current;
        if (kb.up) moveY -= 1;
        if (kb.down) moveY += 1;
        if (kb.left) moveX -= 1;
        if (kb.right) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
          const len = Math.sqrt(moveX * moveX + moveY * moveY);
          moveX = (moveX / len) * player.speed;
          moveY = (moveY / len) * player.speed;
          player.x += moveX;
          player.y += moveY;
          player.angle = Math.atan2(moveY, moveX);
          player.isMoving = true;
          player.animFrame += dt * 9;
        } else if (player.isMoving && !player.isAttacking) {
          // Touch-drag movement
          const dx = player.targetX - player.x;
          const dy = player.targetY - player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 8) {
            const step = Math.min(player.speed, dist);
            player.x += (dx / dist) * step;
            player.y += (dy / dist) * step;
            player.angle = Math.atan2(dy, dx);
            player.animFrame += dt * 9;

            // Occasional footstep sound
            if (Math.floor(player.animFrame) % 4 === 0) {
              shadowAudio.playFootstep();
            }
          } else {
            player.isMoving = false;
          }
        }

        // 2. Process Player Attack / Assassination Strike
        if (player.isAttacking && player.attackTargetId) {
          const target = level.guards.find((g) => g.id === player.attackTargetId);
          if (target && !target.isEliminated) {
            // Rapid dash to target
            const dx = target.x - player.x;
            const dy = target.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            player.x += (dx / Math.max(1, dist)) * 24;
            player.y += (dy / Math.max(1, dist)) * 24;
            player.angle = Math.atan2(dy, dx);

            player.attackTimer--;

            if (dist < 28 || player.attackTimer <= 0) {
              // Execute lethal takedown!
              target.isEliminated = true;
              target.state = 'eliminated';
              player.isAttacking = false;
              player.attackTargetId = null;

              shadowAudio.playTakedown();

              // Spawn blade slash particles
              for (let i = 0; i < 22; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 6;
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1.0,
                  maxLife: 1.0,
                  color: i % 2 === 0 ? '#38bdf8' : '#ef4444',
                  size: 2.5 + Math.random() * 3,
                  type: 'slash',
                });
              }

              // Update statistics
              statsRef.current.targetsEliminated = level.guards.filter(
                (g) => g.isTarget && g.isEliminated
              ).length;
              statsRef.current.stealthScore += target.isTarget ? 350 : 150;

              // Check if all primary targets eliminated
              const remainingTargets = level.guards.filter((g) => g.isTarget && !g.isEliminated);
              if (remainingTargets.length === 0) {
                level.extraction.active = true;
                shadowAudio.playIntelPickup(); // chime activation
              }
            }
          } else {
            player.isAttacking = false;
            player.attackTargetId = null;
          }
        }

        // 3. Resolve Wall Collisions for Player
        for (const wall of level.walls) {
          resolveCircleBoxCollision(player, wall);
        }

        // 4. Update Strike Candidate (Check if in proximity to any guard for takedown prompt)
        let closestGuard: GuardEntity | null = null;
        let minStrikeDist = 88; // Strike reach radius

        for (const guard of level.guards) {
          if (guard.isEliminated) continue;
          const dx = guard.x - player.x;
          const dy = guard.y - player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minStrikeDist) {
            minStrikeDist = dist;
            closestGuard = guard;
          }
        }

        if (closestGuard && closestGuard.id !== strikeCandidateRef.current) {
          setStrikeCandidateId(closestGuard.id);
        } else if (!closestGuard && strikeCandidateRef.current !== null) {
          setStrikeCandidateId(null);
        }

        // Auto-attack if touching / dragging into strike range
        if (closestGuard && touchActiveRef.current) {
          const tdx = closestGuard.x - touchWorldPosRef.current.x;
          const tdy = closestGuard.y - touchWorldPosRef.current.y;
          if (tdx * tdx + tdy * tdy < 65 * 65 && !player.isAttacking) {
            initiateAttack(closestGuard.id);
          }
        }

        // 5. Update Intel Pickups
        for (const item of level.intel) {
          if (item.collected) continue;
          const idx = item.x - player.x;
          const idy = item.y - player.y;
          if (idx * idx + idy * idy < 35 * 35) {
            item.collected = true;
            statsRef.current.intelCollected++;
            statsRef.current.stealthScore += 250;
            shadowAudio.playIntelPickup();

            for (let i = 0; i < 16; i++) {
              particlesRef.current.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                maxLife: 1.0,
                color: '#34d399',
                size: 3 + Math.random() * 3,
                type: 'spark',
              });
            }
          }
        }

        // 6. Check Extraction Zone Reach
        if (level.extraction.active) {
          const ex = level.extraction;
          if (
            player.x >= ex.x &&
            player.x <= ex.x + ex.w &&
            player.y >= ex.y &&
            player.y <= ex.y + ex.h
          ) {
            // Victory! Mission Complete
            shadowAudio.playVictory();

            // Calculate final Rank
            const alarms = statsRef.current.alarmsTriggered;
            const intel = statsRef.current.intelCollected;
            let rank: 'S' | 'A' | 'B' | 'C' = 'B';
            if (alarms === 0 && intel === 2) rank = 'S';
            else if (alarms <= 1) rank = 'A';
            else if (alarms <= 3) rank = 'B';
            else rank = 'C';

            statsRef.current.rank = rank;
            onGameStateChange('victory');
            onUpdateStats({ ...statsRef.current });
            return;
          }
        }

        // 7. Update Guard AI, Patrol, Vision Cones & Detection
        for (const guard of level.guards) {
          if (guard.isEliminated) {
            guard.deathTimer += dt;
            continue;
          }

          // Guard Patrol & Movement
          if (guard.state === 'patrol') {
            const targetPoint = guard.patrolPoints[guard.currentWaypointIdx];
            const gdx = targetPoint.x - guard.x;
            const gdy = targetPoint.y - guard.y;
            const dist = Math.sqrt(gdx * gdx + gdy * gdy);

            if (dist > 6) {
              guard.x += (gdx / dist) * guard.speed;
              guard.y += (gdy / dist) * guard.speed;
              guard.targetAngle = Math.atan2(gdy, gdx);
              guard.animFrame += dt * 6;
            } else {
              // Advance to next patrol waypoint
              guard.currentWaypointIdx = (guard.currentWaypointIdx + 1) % guard.patrolPoints.length;
            }
          } else if (guard.state === 'investigate' && guard.investigatePos) {
            const gdx = guard.investigatePos.x - guard.x;
            const gdy = guard.investigatePos.y - guard.y;
            const dist = Math.sqrt(gdx * gdx + gdy * gdy);

            if (dist > 12) {
              guard.x += (gdx / dist) * (guard.speed * 1.2);
              guard.y += (gdy / dist) * (guard.speed * 1.2);
              guard.targetAngle = Math.atan2(gdy, gdx);
            } else {
              guard.investigateTimer -= dt;
              if (guard.investigateTimer <= 0) {
                guard.state = 'patrol';
                guard.detectionLevel = 0;
              }
            }
          } else if (guard.state === 'alert') {
            // Chase player aggressively!
            const gdx = player.x - guard.x;
            const gdy = player.y - guard.y;
            const dist = Math.sqrt(gdx * gdx + gdy * gdy);

            const chaseSpeed = guard.speed * (guard.type === 'hunter' ? 1.8 : 1.4);
            guard.x += (gdx / dist) * chaseSpeed;
            guard.y += (gdy / dist) * chaseSpeed;
            guard.targetAngle = Math.atan2(gdy, gdx);
            guard.animFrame += dt * 10;

            // Attack / Shoot if in close range
            guard.shootCooldown -= dt;
            if (dist < 42 || (dist < 180 && guard.shootCooldown <= 0)) {
              guard.shootCooldown = 1.2;
              player.hp -= guard.type === 'watcher' ? 50 : 35;

              shadowAudio.playFailure();

              // Spawn bullet impact sparks
              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: player.x,
                  y: player.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  life: 0.8,
                  maxLife: 0.8,
                  color: '#ef4444',
                  size: 3,
                  type: 'slash',
                });
              }

              if (player.hp <= 0) {
                onGameStateChange('failed');
                onUpdateStats({ ...statsRef.current });
                return;
              }
            }
          }

          // Smooth angle rotation
          let diffAngle = guard.targetAngle - guard.angle;
          while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
          while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
          guard.angle += diffAngle * 0.12;

          // Wall collision for guards
          for (const wall of level.walls) {
            resolveCircleBoxCollision(guard, wall);
          }

          // Line of Sight & Detection of Player
          const toPlayerX = player.x - guard.x;
          const toPlayerY = player.y - guard.y;
          const playerDist = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);

          if (playerDist < guard.visionDistance) {
            let angleToPlayer = Math.atan2(toPlayerY, toPlayerX) - guard.angle;
            while (angleToPlayer < -Math.PI) angleToPlayer += Math.PI * 2;
            while (angleToPlayer > Math.PI) angleToPlayer -= Math.PI * 2;

            if (Math.abs(angleToPlayer) <= guard.visionAngle / 2) {
              // Within angular vision cone -> check direct line of sight ray
              const ray = getRayIntersection(
                { x: guard.x, y: guard.y },
                Math.atan2(toPlayerY, toPlayerX),
                guard.visionDistance,
                level.walls
              );

              if (ray.dist >= playerDist - 5) {
                // Direct unblocked vision!
                const detectionRate = (1.0 - playerDist / guard.visionDistance) * 2.2 + 0.6;
                guard.detectionLevel = Math.min(1.0, guard.detectionLevel + dt * detectionRate);

                shadowAudio.playSuspicion();

                if (guard.detectionLevel >= 1.0 && guard.state !== 'alert') {
                  // Trigger full alert alarm!
                  guard.state = 'alert';
                  statsRef.current.alarmsTriggered++;
                  statsRef.current.stealthScore = Math.max(0, statsRef.current.stealthScore - 200);
                  shadowAudio.playAlarm();

                  // Alert nearby guards within radio range
                  for (const other of level.guards) {
                    if (other.isEliminated || other.id === guard.id) continue;
                    const odx = other.x - guard.x;
                    const ody = other.y - guard.y;
                    if (odx * odx + ody * ody < 350 * 350) {
                      other.state = 'investigate';
                      other.investigatePos = { x: player.x, y: player.y };
                      other.investigateTimer = 4.0;
                    }
                  }
                } else if (guard.state === 'patrol') {
                  // Investigate suspicion
                  guard.state = 'investigate';
                  guard.investigatePos = { x: player.x, y: player.y };
                  guard.investigateTimer = 3.5;
                }
              } else {
                // Occluded by wall
                guard.detectionLevel = Math.max(0, guard.detectionLevel - dt * 0.8);
              }
            } else {
              guard.detectionLevel = Math.max(0, guard.detectionLevel - dt * 0.8);
            }
          } else {
            guard.detectionLevel = Math.max(0, guard.detectionLevel - dt * 0.8);
          }
        }

        // 8. Update Particles
        const aliveParticles: GameParticle[] = [];
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt * 1.8;
          if (p.life > 0) aliveParticles.push(p);
        }
        particlesRef.current = aliveParticles;

        // 9. Camera Smoothing
        cam.x += (player.x - cam.x) * 0.12;
        cam.y += (player.y - cam.y) * 0.12;

        // Keep camera within map bounds
        cam.x = Math.max(width / 2 / cam.zoom, Math.min(level.width - width / 2 / cam.zoom, cam.x));
        cam.y = Math.max(height / 2 / cam.zoom, Math.min(level.height - height / 2 / cam.zoom, cam.y));
      }

      // Update HUD stats callback
      onUpdateStats({ ...statsRef.current });

      // ==========================================
      // RENDERING PIPELINE (High-res 2D Canvas)
      // ==========================================
      ctx.save();

      // Clear Screen with deep slate base
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Apply Camera Transform
      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      // Draw Floor Surface & Modern Tactical Floor Seams
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, level.width, level.height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      const tileSize = 60;
      ctx.beginPath();
      for (let x = 0; x <= level.width; x += tileSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, level.height);
      }
      for (let y = 0; y <= level.height; y += tileSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(level.width, y);
      }
      ctx.stroke();

      // Draw Extraction Zone
      const ex = level.extraction;
      const exPulse = (Math.sin(currentTime * 0.005) + 1) * 0.5;

      if (ex.active) {
        ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + exPulse * 0.15})`;
        ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);

        // Pulsing landing circle
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex.x + ex.w / 2, ex.y + ex.h / 2, 35 + exPulse * 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXTRACTION READY', ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXTRACTION LOCKED', ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);
      }

      // Draw Intel Collectibles
      for (const item of level.intel) {
        if (item.collected) continue;
        const bob = Math.sin(currentTime * 0.006 + item.x) * 4;

        // Glow ring
        ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.beginPath();
        ctx.arc(item.x, item.y + bob, 16, 0, Math.PI * 2);
        ctx.fill();

        // Intel Drive Icon
        ctx.fillStyle = '#10b981';
        ctx.fillRect(item.x - 7, item.y - 10 + bob, 14, 20);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(item.x - 5, item.y - 7 + bob, 10, 5);

        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INTEL', item.x, item.y + 18 + bob);
      }

      // Draw Guard Vision Cones with Raycasted Wall Occlusion
      for (const guard of level.guards) {
        if (guard.isEliminated) continue;

        const rayCount = 28;
        const halfVision = guard.visionAngle / 2;
        const stepAngle = guard.visionAngle / (rayCount - 1);
        const conePoints: Point[] = [];

        for (let r = 0; r < rayCount; r++) {
          const rayAngle = guard.angle - halfVision + r * stepAngle;
          const hit = getRayIntersection(
            { x: guard.x, y: guard.y },
            rayAngle,
            guard.visionDistance,
            level.walls
          );
          conePoints.push({ x: hit.x, y: hit.y });
        }

        // Draw vision cone polygon
        ctx.beginPath();
        ctx.moveTo(guard.x, guard.y);
        for (const pt of conePoints) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        // Color based on alert/detection state
        if (guard.state === 'alert') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.32)'; // Crimson Alert
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        } else if (guard.detectionLevel > 0) {
          const alpha = 0.2 + guard.detectionLevel * 0.25;
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`; // Amber Warning
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        } else {
          ctx.fillStyle =
            guard.type === 'watcher'
              ? 'rgba(168, 85, 247, 0.18)' // Violet Sniper cone
              : 'rgba(56, 189, 248, 0.14)'; // Cyan Neutral cone
          ctx.strokeStyle =
            guard.type === 'watcher' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(56, 189, 248, 0.4)';
        }
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Laser beam for Watcher
        if (guard.type === 'watcher') {
          const centerHit = getRayIntersection(
            { x: guard.x, y: guard.y },
            guard.angle,
            guard.visionDistance,
            level.walls
          );
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(guard.x, guard.y);
          ctx.lineTo(centerHit.x, centerHit.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw Walls, Crates & Server Obstacles with Depth Shadows
      for (const wall of level.walls) {
        // Base Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(wall.x + 4, wall.y + 4, wall.w, wall.h);

        if (wall.type === 'server') {
          // Server stack
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

          // Server LED lights
          ctx.fillStyle = '#38bdf8';
          for (let ly = wall.y + 8; ly < wall.y + wall.h - 8; ly += 16) {
            ctx.fillRect(wall.x + 4, ly, 3, 3);
          }
        } else if (wall.type === 'crate') {
          // Tactical Cargo Crate
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

          // Diagonal brace lines
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(wall.x, wall.y);
          ctx.lineTo(wall.x + wall.w, wall.y + wall.h);
          ctx.moveTo(wall.x + wall.w, wall.y);
          ctx.lineTo(wall.x, wall.y + wall.h);
          ctx.stroke();
        } else {
          // Solid Concrete Tactical Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);

          // Top highlight bevel
          ctx.fillStyle = '#334155';
          ctx.fillRect(wall.x, wall.y, wall.w, Math.min(4, wall.h));
        }
      }

      // Draw Guards (Clearly visible, full-body stylized tactical humans)
      for (const guard of level.guards) {
        if (guard.isEliminated) {
          // Draw eliminated guard silhouette on floor
          ctx.save();
          ctx.translate(guard.x, guard.y);
          ctx.rotate(guard.angle);
          ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        ctx.save();
        ctx.translate(guard.x, guard.y);
        ctx.rotate(guard.angle);

        // Drop shadow under guard
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs with animated walking cycle
        const stride = Math.sin(guard.animFrame) * 7;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -5 + stride, 7, 10);
        ctx.fillRect(3, -5 - stride, 7, 10);

        // Body / Torso (Tactical Armor Vest)
        ctx.fillStyle = guard.isTarget ? '#dc2626' : guard.type === 'watcher' ? '#7e22ce' : '#1e3a8a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders & Combat Rig
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-8, -2, 6, 0, Math.PI * 2);
        ctx.arc(8, -2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Head & Visor Helmet
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(0, -1, 7.5, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Visor Line
        ctx.strokeStyle = guard.state === 'alert' ? '#ef4444' : '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -1, 7.5, -0.6, 0.6);
        ctx.stroke();

        // Weapon (Assault Rifle barrel pointing forward)
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, -3, 14, 4);

        ctx.restore();

        // Status Indicator above Guard (? or !)
        if (guard.state === 'alert') {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 15px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', guard.x, guard.y - 24);
        } else if (guard.detectionLevel > 0) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('?', guard.x, guard.y - 24);

          // Detection buildup bar
          const barW = 28;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(guard.x - barW / 2, guard.y - 36, barW, 4);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(guard.x - barW / 2, guard.y - 36, barW * guard.detectionLevel, 4);
        }

        // VIP Target Badge
        if (guard.isTarget) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TARGET', guard.x, guard.y + 24);
        }

        // Takedown Lock-on Reticle if player in strike range
        if (strikeCandidateId === guard.id) {
          const reticlePulse = (Math.sin(currentTime * 0.01) + 1) * 0.5;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(guard.x, guard.y, guard.radius + 12 + reticlePulse * 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TAP TO STRIKE', guard.x, guard.y - 38);
        }
      }

      // Draw Player Character (Stylized modern assassin with coat, hood, combat boots)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);

      // Shadow under assassin
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking boots animation
      const playerStride = Math.sin(player.animFrame) * 8;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -6 + playerStride, 8, 12);
      ctx.fillRect(4, -6 - playerStride, 8, 12);

      // Stealth Coat / Silhouette
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tactical Harness & Torso
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, -1, 12, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Assassin Hood & Cowl
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, -1, 9, 0, Math.PI * 2);
      ctx.fill();

      // Blade / Tanto Knife in right hand with cyan glow
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = player.isAttacking ? 16 : 8;
      ctx.fillRect(8, -4, 12, 3);
      ctx.shadowBlur = 0; // reset

      ctx.restore();

      // Draw Game Particles (Slashes, sparks, shadows)
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore(); // Restore camera transform

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraRef, gameState, initiateAttack, onGameStateChange, onUpdateStats, screenToWorld, strikeCandidateId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] sm:min-h-[580px] md:min-h-[640px] bg-slate-950 rounded-2xl overflow-hidden select-none touch-none border border-slate-800 shadow-2xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        className="w-full h-full block cursor-crosshair focus:outline-hidden"
        tabIndex={0}
        aria-label="Shadow Hunt Stealth Action Canvas"
        role="region"
      />

      {/* Touch Interaction Feedback / Subtle Hint */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] text-slate-400/90 bg-slate-900/85 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-xs flex items-center gap-2 font-mono">
        <span>Touch & Drag: Move</span>
        <span>•</span>
        <span>Tap Target: Assassinate</span>
        <span>•</span>
        <span>Duck Behind Walls</span>
      </div>
    </div>
  );
};
