import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { RunnerCharacter } from './character';
import { CourseGenerator, LANE_WIDTH, LANE_X } from './courseGenerator';
import { sprintAudio } from './audio';
import {
  GameState,
  RunnerState,
  RunnerLane,
  RunnerAction,
  GameScoreSnapshot,
  MilestoneEvent,
} from './types';

interface SprintRunCanvasProps {
  gameState: GameState;
  onGameOver: (stats: GameScoreSnapshot) => void;
  onScoreUpdate: (stats: GameScoreSnapshot) => void;
  onMilestone: (event: MilestoneEvent) => void;
  isMuted: boolean;
  onRequestSprintToggle?: boolean;
}

export const SprintRunCanvas: React.FC<SprintRunCanvasProps> = ({
  gameState,
  onGameOver,
  onScoreUpdate,
  onMilestone,
  isMuted,
  onRequestSprintToggle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const runnerCharRef = useRef<RunnerCharacter | null>(null);
  const courseGenRef = useRef<CourseGenerator | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Speed lines / particles for sprint boost
  const speedLinesRef = useRef<THREE.Points | null>(null);
  const dustParticlesRef = useRef<THREE.Points | null>(null);

  // Runner state mutable ref
  const runnerRef = useRef<RunnerState>({
    lane: 0,
    targetX: 0,
    currentX: 0,
    y: 0,
    velocityY: 0,
    isGrounded: true,
    action: 'run',
    actionTimer: 0,
    distance: 0,
    speed: 18,
    baseSpeed: 18,
    maxSpeed: 38,
    isSprinting: false,
    sprintEnergy: 60,
    coins: 0,
    score: 0,
    invulnerableTime: 0,
  });

  const lastMilestoneDistance = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const cameraShakeRef = useRef<number>(0);

  // Touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Input triggers
  const handleLaneChange = useCallback((dir: 'left' | 'right') => {
    const r = runnerRef.current;
    if (r.action === 'stumble') return;

    if (dir === 'left' && r.lane > -1) {
      r.lane = (r.lane - 1) as RunnerLane;
      r.targetX = LANE_X[r.lane];
      sprintAudio.playLaneChange('left');
    } else if (dir === 'right' && r.lane < 1) {
      r.lane = (r.lane + 1) as RunnerLane;
      r.targetX = LANE_X[r.lane];
      sprintAudio.playLaneChange('right');
    }
  }, []);

  const handleJump = useCallback(() => {
    const r = runnerRef.current;
    if (r.action === 'stumble') return;
    if (r.isGrounded) {
      r.isGrounded = false;
      r.velocityY = 13.5;
      r.action = 'jump';
      r.actionTimer = 0;
      sprintAudio.playJump();
    }
  }, []);

  const handleSlide = useCallback(() => {
    const r = runnerRef.current;
    if (r.action === 'stumble') return;
    if (r.isGrounded) {
      r.action = 'slide';
      r.actionTimer = 0.7; // Slide lasts 0.7 seconds
      sprintAudio.playSlide();
    } else {
      // Fast fall if sliding mid-air
      r.velocityY = -18;
    }
  }, []);

  const handleToggleSprint = useCallback(() => {
    const r = runnerRef.current;
    if (r.action === 'stumble') return;
    if (r.sprintEnergy > 15) {
      r.isSprinting = !r.isSprinting;
      if (r.isSprinting) {
        sprintAudio.playSprintIgnition();
      }
    }
  }, []);

  // React to sprint toggle requested from parent HUD button
  useEffect(() => {
    if (onRequestSprintToggle) {
      handleToggleSprint();
    }
  }, [onRequestSprintToggle, handleToggleSprint]);

  // Touch & Swipe Event Handlers (Mobile-First)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      sprintAudio.userInteracted();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const now = Date.now();

        // Check for double-tap to activate Sprint
        if (now - lastTapTimeRef.current < 280) {
          handleToggleSprint();
          lastTapTimeRef.current = 0;
        } else {
          lastTapTimeRef.current = now;
        }

        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: now,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const minSwipeDistance = 28;

      if (dt < 450 && (absX > minSwipeDistance || absY > minSwipeDistance)) {
        if (absX > absY) {
          // Horizontal swipe
          if (dx > 0) {
            handleLaneChange('right');
          } else {
            handleLaneChange('left');
          }
        } else {
          // Vertical swipe
          if (dy < 0) {
            handleJump();
          } else {
            handleSlide();
          }
        }
      }

      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleLaneChange, handleJump, handleSlide, handleToggleSprint]);

  // Desktop Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      sprintAudio.userInteracted();

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleLaneChange('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleLaneChange('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          handleJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleSlide();
          break;
        case 'Shift':
        case 'e':
        case 'E':
          e.preventDefault();
          handleToggleSprint();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleLaneChange, handleJump, handleSlide, handleToggleSprint]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e241b); // Atmospheric deep jungle emerald
    scene.fog = new THREE.FogExp2(0x0e241b, 0.0075);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);
    camera.position.set(0, 3.2, 5.8);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    // Ambient / Hemisphere light for rich jungle canopy fill
    const hemiLight = new THREE.HemisphereLight(0xdfe9d8, 0x1a2e22, 0.85);
    scene.add(hemiLight);

    // Directional Golden Jungle Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffae5, 1.4);
    sunLight.position.set(20, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 100;
    const shadowD = 18;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    // Subtle Cyan Fill Rim Light
    const rimLight = new THREE.DirectionalLight(0x6ee7b7, 0.35);
    rimLight.position.set(-15, 15, -20);
    scene.add(rimLight);

    // BUILD RUNNER CHARACTER
    const runnerChar = new RunnerCharacter();
    scene.add(runnerChar.group);
    runnerCharRef.current = runnerChar;

    // BUILD COURSE GENERATOR
    const courseGen = new CourseGenerator(scene);
    courseGen.initTrack();
    courseGenRef.current = courseGen;

    // SPEED LINES PARTICLE SYSTEM (for Sprint boost visual effect)
    const speedLineCount = 150;
    const speedLineGeo = new THREE.BufferGeometry();
    const speedLinePos = new Float32Array(speedLineCount * 3);
    for (let i = 0; i < speedLineCount; i++) {
      speedLinePos[i * 3] = (Math.random() - 0.5) * 12;
      speedLinePos[i * 3 + 1] = Math.random() * 5;
      speedLinePos[i * 3 + 2] = -Math.random() * 40;
    }
    speedLineGeo.setAttribute('position', new THREE.BufferAttribute(speedLinePos, 3));
    const speedLineMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.15,
      transparent: true,
      opacity: 0.0,
    });
    const speedLines = new THREE.Points(speedLineGeo, speedLineMat);
    scene.add(speedLines);
    speedLinesRef.current = speedLines;

    // DUST PARTICLES
    const dustCount = 40;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 1.5;
      dustPos[i * 3 + 1] = Math.random() * 0.4;
      dustPos[i * 3 + 2] = Math.random() * 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x857967,
      size: 0.18,
      transparent: true,
      opacity: 0.4,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);
    dustParticlesRef.current = dustParticles;

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      runnerChar.dispose();
      courseGen.dispose();
      speedLineGeo.dispose();
      speedLineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Reset Game on State Change to 'playing'
  useEffect(() => {
    if (gameState === 'playing') {
      const r = runnerRef.current;
      r.lane = 0;
      r.targetX = 0;
      r.currentX = 0;
      r.y = 0;
      r.velocityY = 0;
      r.isGrounded = true;
      r.action = 'run';
      r.actionTimer = 0;
      r.distance = 0;
      r.speed = r.baseSpeed;
      r.isSprinting = false;
      r.sprintEnergy = 60;
      r.coins = 0;
      r.score = 0;
      r.invulnerableTime = 0;
      lastMilestoneDistance.current = 0;

      if (courseGenRef.current) {
        courseGenRef.current.initTrack();
      }
    }
  }, [gameState]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      animationFrameRef.current = requestAnimationFrame(loop);

      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const runnerChar = runnerCharRef.current;
      const courseGen = courseGenRef.current;
      const r = runnerRef.current;

      if (!renderer || !scene || !camera || !runnerChar || !courseGen) return;

      if (gameState === 'playing') {
        // --- 1. RUNNER SPRINT ENERGY & SPEED LOGIC ---
        if (r.isSprinting) {
          r.sprintEnergy = Math.max(0, r.sprintEnergy - delta * 24);
          if (r.sprintEnergy <= 0) {
            r.isSprinting = false;
          }
        } else {
          // Slow passive recharge over time
          r.sprintEnergy = Math.min(100, r.sprintEnergy + delta * 2.5);
        }

        // Increase base speed with distance (difficulty progression)
        const progressiveBase = Math.min(r.maxSpeed, r.baseSpeed + (r.distance / 1000) * 4);
        const targetSpeed = r.isSprinting ? progressiveBase * 1.65 : progressiveBase;
        r.speed = THREE.MathUtils.lerp(r.speed, targetSpeed, delta * 3.5);

        // Distance and score
        const frameDistance = r.speed * delta;
        r.distance += frameDistance;
        const multiplier = r.isSprinting ? 2.0 : 1.0;
        r.score += Math.round(frameDistance * 2 * multiplier);

        // --- 2. MILESTONE CHECK ---
        const milestoneInterval = 250;
        if (r.distance - lastMilestoneDistance.current >= milestoneInterval) {
          lastMilestoneDistance.current = Math.floor(r.distance / milestoneInterval) * milestoneInterval;
          sprintAudio.playMilestone();
          cameraShakeRef.current = 0.35;
          onMilestone({
            distance: lastMilestoneDistance.current,
            message: `🌟 MILESTONE REACHED: ${lastMilestoneDistance.current} METERS!`,
          });
        }

        // --- 3. RUNNER PHYSICS: LANE SMOOTHING & JUMP/SLIDE ---
        // Smooth horizontal lane transition
        r.currentX = THREE.MathUtils.lerp(r.currentX, r.targetX, delta * 14);

        // Vertical Gravity & Jump
        if (!r.isGrounded) {
          r.velocityY -= 36 * delta; // Gravity
          r.y += r.velocityY * delta;

          if (r.y <= 0) {
            r.y = 0;
            r.velocityY = 0;
            r.isGrounded = true;
            if (r.action === 'jump') {
              r.action = 'run';
            }
          }
        }

        // Slide Timer
        if (r.action === 'slide') {
          r.actionTimer -= delta;
          if (r.actionTimer <= 0) {
            r.action = 'run';
          }
        }

        // Runner position in 3D world: Runner sits at Z = 0, course scrolls backwards by -distance
        runnerChar.group.position.set(r.currentX, r.y, 0);

        // Animate articulated character model
        const laneOffset = r.targetX - r.currentX;
        runnerChar.updateAnimation(
          delta,
          r.action,
          r.speed,
          r.isSprinting,
          laneOffset,
          (isLeft) => {
            sprintAudio.playFootstep(isLeft);
          }
        );

        // --- 4. COURSE UPDATE & SEGMENT STREAMING ---
        // Track moves past runner: Runner is at Z = -r.distance
        const runnerWorldZ = -r.distance;
        courseGen.update(runnerWorldZ, delta);

        // --- 5. COLLISION DETECTION: OBSTACLES & COLLECTIBLES ---
        for (const seg of courseGen.segments) {
          // Check Collectibles
          for (const col of seg.collectibles) {
            if (col.active && !col.collected) {
              const dz = Math.abs(col.z - runnerWorldZ);
              const dx = Math.abs(col.x - r.currentX);
              const dy = Math.abs(col.y - (r.y + 0.9));

              if (dz < 1.6 && dx < 1.2 && dy < 1.4) {
                col.collected = true;
                if (col.modelMesh) {
                  col.modelMesh.visible = false;
                }

                if (col.type === 'coin') {
                  r.coins += 1;
                  r.score += 50;
                  sprintAudio.playCoin();
                } else if (col.type === 'sprint_gem') {
                  r.sprintEnergy = Math.min(100, r.sprintEnergy + 40);
                  r.score += 150;
                  sprintAudio.playSprintGem();
                }
              }
            }
          }

          // Check Obstacles
          for (const obs of seg.obstacles) {
            if (obs.active && !obs.cleared) {
              const dz = Math.abs(obs.z - runnerWorldZ);
              const obsLaneX = LANE_X[obs.lane];
              const dx = obs.type === 'chasm_gap' ? 0 : Math.abs(obsLaneX - r.currentX);

              // If within longitudinal collision range
              const halfDepth = obs.depth / 2 + 0.4;
              if (dz < halfDepth && dx < (obs.width / 2 + 0.35)) {
                let collision = false;

                if (obs.type === 'low_log') {
                  // Low obstacle requires jumping: If player height is low -> hit!
                  if (r.y < 0.65) {
                    collision = true;
                  } else {
                    obs.cleared = true;
                  }
                } else if (obs.type === 'high_arch') {
                  // High arch requires sliding: If player action is NOT slide and height > 0.7 -> hit!
                  if (r.action !== 'slide' && r.y < 2.0) {
                    collision = true;
                  } else {
                    obs.cleared = true;
                  }
                } else if (obs.type === 'chasm_gap') {
                  // Falling into chasm if player is grounded on empty air!
                  if (r.y <= 0) {
                    collision = true;
                  }
                } else {
                  // Solid obelisk / totem pillar / swinging blade
                  collision = true;
                }

                if (collision) {
                  // If sprinting at maximum boost, smash through minor obstacles!
                  if (r.isSprinting && (obs.type === 'low_log' || obs.type === 'stone_pillar')) {
                    obs.active = false;
                    if (obs.modelMesh) obs.modelMesh.visible = false;
                    cameraShakeRef.current = 0.45;
                    sprintAudio.playCrash();
                    r.score += 250;
                  } else {
                    // FATAL HIT -> Trigger Game Over
                    r.action = 'stumble';
                    sprintAudio.playCrash();
                    cameraShakeRef.current = 0.6;

                    // Report Game Over
                    setTimeout(() => {
                      onGameOver({
                        score: r.score,
                        distance: Math.floor(r.distance),
                        coins: r.coins,
                        highScore: 0,
                        bestDistance: 0,
                        sprintEnergy: Math.floor(r.sprintEnergy),
                        speedKmh: Math.round(r.speed * 3.6),
                        multiplier: r.isSprinting ? 2.0 : 1.0,
                      });
                    }, 800);
                    break;
                  }
                }
              }
            }
          }
        }

        // --- 6. SPEED LINES & DUST EFFECT ---
        if (speedLinesRef.current) {
          const mat = speedLinesRef.current.material as THREE.PointsMaterial;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, r.isSprinting ? 0.8 : 0.0, delta * 8);

          // Stream speed lines toward player
          const positions = speedLinesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 2] += (r.speed * 1.5) * delta;
            if (positions[i * 3 + 2] > 5) {
              positions[i * 3 + 2] = -40;
            }
          }
          speedLinesRef.current.geometry.attributes.position.needsUpdate = true;
          speedLinesRef.current.position.set(r.currentX, r.y, 0);
        }

        // Dust under feet
        if (dustParticlesRef.current) {
          dustParticlesRef.current.position.set(r.currentX, 0, 0.4);
        }

        // --- 7. DYNAMIC CHASE CAMERA CHOREOGRAPHY ---
        // Base chase camera sits at Z = 5.8, Y = 3.2
        const targetCamZ = r.isSprinting ? 7.2 : 5.8;
        const targetCamY = 3.2 + (r.y * 0.5) - (r.action === 'slide' ? 0.5 : 0);
        const targetCamX = r.currentX * 0.45; // Camera subtly banks with runner

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, delta * 10);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, delta * 8);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, delta * 6);

        // Dynamic FOV widening during sprint
        const targetFov = r.isSprinting ? 72 : 60;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 6);
        camera.updateProjectionMatrix();

        // Apply subtle camera shake if active
        if (cameraShakeRef.current > 0) {
          camera.position.x += (Math.random() - 0.5) * cameraShakeRef.current * 0.6;
          camera.position.y += (Math.random() - 0.5) * cameraShakeRef.current * 0.6;
          cameraShakeRef.current = Math.max(0, cameraShakeRef.current - delta * 2.5);
        }

        // Camera looks forward along track ahead of player
        camera.lookAt(r.currentX * 0.2, r.y * 0.4 + 1.4, -14);

        // --- 8. EMIT LIVE STATS TO HUD ---
        onScoreUpdate({
          score: r.score,
          distance: Math.floor(r.distance),
          coins: r.coins,
          highScore: 0,
          bestDistance: 0,
          sprintEnergy: Math.floor(r.sprintEnergy),
          speedKmh: Math.round(r.speed * 3.6),
          multiplier: r.isSprinting ? 2.0 : 1.0,
        });
      }

      // Render Three.js frame
      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, onGameOver, onScoreUpdate, onMilestone]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950"
    />
  );
};
