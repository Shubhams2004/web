import * as THREE from 'three';
import {
  ObstacleInstance,
  ObstacleType,
  CollectibleInstance,
  CourseSegment,
  RunnerLane,
} from './types';

export const LANE_WIDTH = 2.6;
export const LANE_X: Record<RunnerLane, number> = {
  [-1]: -LANE_WIDTH,
  0: 0,
  1: LANE_WIDTH,
};

export const SEGMENT_LENGTH = 50;

/**
 * Procedural track segment and obstacle generator for ancient jungle ruins.
 */
export class CourseGenerator {
  public scene: THREE.Scene;
  public segments: CourseSegment[] = [];
  private nextZ: number = 0;
  private segmentCounter: number = 0;

  // Shared reusable materials
  private stoneRoadMaterial: THREE.MeshStandardMaterial;
  private stoneEdgeMaterial: THREE.MeshStandardMaterial;
  private mossStoneMaterial: THREE.MeshStandardMaterial;
  private woodLogMaterial: THREE.MeshStandardMaterial;
  private ruinPillarMaterial: THREE.MeshStandardMaterial;
  private goldCoinMaterial: THREE.MeshStandardMaterial;
  private gemMaterial: THREE.MeshStandardMaterial;
  private foliageMaterial: THREE.MeshStandardMaterial;
  private barkMaterial: THREE.MeshStandardMaterial;
  private chasmWaterMaterial: THREE.MeshStandardMaterial;

  // Geometries for instancing/reuse
  private coinGeometry: THREE.CylinderGeometry;
  private gemGeometry: THREE.OctahedronGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Materials
    this.stoneRoadMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a564c, // Weathered ancient temple flagstones
      roughness: 0.85,
      metalness: 0.1,
    });

    this.stoneEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d3931,
      roughness: 0.9,
    });

    this.mossStoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x48583d, // Moss-covered ancient ruin stone
      roughness: 0.8,
    });

    this.woodLogMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      roughness: 0.9,
    });

    this.ruinPillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x6e6859,
      roughness: 0.75,
    });

    this.goldCoinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xb45309,
      emissiveIntensity: 0.2,
    });

    this.gemMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald sprint energy
      metalness: 0.3,
      roughness: 0.1,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
    });

    this.foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b4332, // Deep tropical jungle canopy
      roughness: 0.7,
      flatShading: true,
    });

    this.barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b1d14,
      roughness: 0.9,
    });

    this.chasmWaterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d3b42,
      roughness: 0.2,
      metalness: 0.7,
    });

    // Reusable collectible geometries
    this.coinGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 14);
    this.coinGeometry.rotateX(Math.PI / 2);

    this.gemGeometry = new THREE.OctahedronGeometry(0.4, 0);
  }

  /**
   * Initializes course by spawning initial track segments ahead of player
   */
  public initTrack(initialSegments: number = 7) {
    this.clearAll();
    this.nextZ = -10; // Start slightly behind player

    for (let i = 0; i < initialSegments; i++) {
      // First 2 segments are safe without deadly obstacles
      const isStartSafe = i < 2;
      this.spawnSegment(isStartSafe);
    }
  }

  /**
   * Spawns a new segment at the leading edge of the track
   */
  public spawnSegment(isSafe: boolean = false): CourseSegment {
    const id = `seg_${this.segmentCounter++}`;
    const zStart = this.nextZ;
    const length = SEGMENT_LENGTH;
    const segmentZCenter = zStart - length / 2;

    const group = new THREE.Group();
    group.position.set(0, 0, segmentZCenter);

    const obstacles: ObstacleInstance[] = [];
    const collectibles: CollectibleInstance[] = [];

    // Decide if this segment features a gap or elevated viaduct
    const isGapSegment = !isSafe && Math.random() < 0.2 && this.segmentCounter > 3;
    const isElevated = !isSafe && Math.random() < 0.15 && !isGapSegment;

    // Build Road Platform Geometry
    if (isGapSegment) {
      // Split into two sub-platforms with a chasm gap in between
      const halfLen = (length - 12) / 2;

      // First road portion
      const road1Geo = new THREE.BoxGeometry(8.6, 1.2, halfLen);
      const road1 = new THREE.Mesh(road1Geo, this.stoneRoadMaterial);
      road1.position.set(0, -0.6, length / 2 - halfLen / 2);
      road1.receiveShadow = true;
      group.add(road1);

      // Second road portion
      const road2Geo = new THREE.BoxGeometry(8.6, 1.2, halfLen);
      const road2 = new THREE.Mesh(road2Geo, this.stoneRoadMaterial);
      road2.position.set(0, -0.6, -length / 2 + halfLen / 2);
      road2.receiveShadow = true;
      group.add(road2);

      // Chasm water/pit far below
      const pitGeo = new THREE.BoxGeometry(30, 1, 14);
      const pitMesh = new THREE.Mesh(pitGeo, this.chasmWaterMaterial);
      pitMesh.position.set(0, -12, 0);
      group.add(pitMesh);

      // Register Chasm Obstacle across all lanes at center
      obstacles.push({
        id: `${id}_gap`,
        type: 'chasm_gap',
        lane: 0,
        z: segmentZCenter,
        width: 8.6,
        height: 4,
        depth: 10,
        yOffset: -2,
        requiresAction: 'jump',
        active: true,
      });

      // Jump coin arc over the chasm gap
      for (let c = -4; c <= 4; c += 1.8) {
        const coinMesh = new THREE.Mesh(this.coinGeometry, this.goldCoinMaterial);
        const arcY = 1.0 + (1 - (c * c) / 25) * 2.2;
        coinMesh.position.set(0, arcY, c);
        group.add(coinMesh);

        collectibles.push({
          id: `${id}_chasm_coin_${c}`,
          type: 'coin',
          lane: 0,
          x: 0,
          y: arcY,
          z: segmentZCenter + c,
          collected: false,
          active: true,
          modelMesh: coinMesh,
        });
      }
    } else {
      // Solid Stone Roadway
      const roadGeo = new THREE.BoxGeometry(8.6, 1.2, length);
      const road = new THREE.Mesh(roadGeo, this.stoneRoadMaterial);
      road.position.set(0, -0.6, 0);
      road.receiveShadow = true;
      group.add(road);

      // Stone curbs / mossy borders
      const curbGeo = new THREE.BoxGeometry(0.8, 1.6, length);
      const leftCurb = new THREE.Mesh(curbGeo, this.stoneEdgeMaterial);
      leftCurb.position.set(-4.5, -0.4, 0);
      group.add(leftCurb);

      const rightCurb = new THREE.Mesh(curbGeo, this.stoneEdgeMaterial);
      rightCurb.position.set(4.5, -0.4, 0);
      group.add(rightCurb);

      // Occasional ancient stone paving dividers/runes
      for (let tz = -length / 2 + 10; tz < length / 2; tz += 12) {
        const seamGeo = new THREE.BoxGeometry(8.4, 0.05, 0.4);
        const seamMesh = new THREE.Mesh(seamGeo, this.mossStoneMaterial);
        seamMesh.position.set(0, 0.01, tz);
        group.add(seamMesh);
      }
    }

    // Add Jungle Surroundings (Trees, ancient pillars, hanging vines)
    this.addJungleScenery(group, length);

    // Spawn gameplay obstacles and collectibles if not a safe segment
    if (!isSafe && !isGapSegment) {
      this.populateObstaclesAndPickups(id, segmentZCenter, length, group, obstacles, collectibles);
    } else if (isSafe) {
      // Spawn welcoming coin line in center lane
      for (let cz = -15; cz <= 15; cz += 3) {
        const coinMesh = new THREE.Mesh(this.coinGeometry, this.goldCoinMaterial);
        coinMesh.position.set(0, 1.0, cz);
        group.add(coinMesh);

        collectibles.push({
          id: `${id}_coin_${cz}`,
          type: 'coin',
          lane: 0,
          x: 0,
          y: 1.0,
          z: segmentZCenter + cz,
          collected: false,
          active: true,
          modelMesh: coinMesh,
        });
      }
    }

    this.scene.add(group);

    const segment: CourseSegment = {
      id,
      zStart,
      length,
      hasGap: isGapSegment,
      isElevated,
      groupMesh: group,
      obstacles,
      collectibles,
    };

    this.segments.push(segment);
    this.nextZ -= length;
    return segment;
  }

  /**
   * Decorates segment perimeter with lush jungle trees, giant stone carved pillars, and ruins
   */
  private addJungleScenery(group: THREE.Group, length: number) {
    const spacing = 14;
    for (let z = -length / 2 + 5; z <= length / 2 - 5; z += spacing) {
      const leftX = -7.5 - Math.random() * 3;
      const rightX = 7.5 + Math.random() * 3;

      // Left side: Giant Jungle Tree or Ancient Pillar
      if (Math.random() < 0.6) {
        this.createJungleTree(group, leftX, z);
      } else {
        this.createAncientPillar(group, leftX, z);
      }

      // Right side
      if (Math.random() < 0.6) {
        this.createJungleTree(group, rightX, z);
      } else {
        this.createAncientPillar(group, rightX, z);
      }
    }
  }

  private createJungleTree(group: THREE.Group, x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Giant Trunk
    const trunkHeight = 10 + Math.random() * 4;
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.3, trunkHeight, 7);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMaterial);
    trunk.position.set(0, trunkHeight / 2 - 1, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Sprawling Canopy Foliage (tiered clustered spheres)
    const foliageTiers = 3;
    for (let i = 0; i < foliageTiers; i++) {
      const radius = 3.5 - i * 0.7;
      const folGeo = new THREE.DodecahedronGeometry(radius, 1);
      const folMesh = new THREE.Mesh(folGeo, this.foliageMaterial);
      folMesh.position.set(
        (Math.random() - 0.5) * 1.5,
        trunkHeight + i * 2.2 - 1,
        (Math.random() - 0.5) * 1.5
      );
      folMesh.castShadow = true;
      treeGroup.add(folMesh);
    }

    group.add(treeGroup);
  }

  private createAncientPillar(group: THREE.Group, x: number, z: number) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, 0, z);

    const pillarHeight = 7 + Math.random() * 3;
    const pillarGeo = new THREE.CylinderGeometry(0.9, 1.1, pillarHeight, 8);
    const pillar = new THREE.Mesh(pillarGeo, this.ruinPillarMaterial);
    pillar.position.set(0, pillarHeight / 2 - 0.5, 0);
    pillar.castShadow = true;
    pillarGroup.add(pillar);

    // Carved capital cap
    const capGeo = new THREE.BoxGeometry(2.4, 0.6, 2.4);
    const cap = new THREE.Mesh(capGeo, this.mossStoneMaterial);
    cap.position.set(0, pillarHeight - 0.3, 0);
    pillarGroup.add(cap);

    group.add(pillarGroup);
  }

  /**
   * Populates a segment with obstacles, coins, and sprint gems
   */
  private populateObstaclesAndPickups(
    segId: string,
    segZCenter: number,
    length: number,
    group: THREE.Group,
    obstacles: ObstacleInstance[],
    collectibles: CollectibleInstance[]
  ) {
    // Generate 2 obstacle clusters per 50m segment
    const clusterPositions = [-length / 4, length / 4];
    const lanes: RunnerLane[] = [-1, 0, 1];

    clusterPositions.forEach((relZ, idx) => {
      const obstacleZ = segZCenter + relZ;
      const choice = Math.random();

      if (choice < 0.32) {
        // LOW BARRIER (Fallen tree trunk / stone bar) -> Requires Jump
        // Blocks 1 or 2 lanes
        const blockedLane = lanes[Math.floor(Math.random() * lanes.length)];
        const logGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.4, 8);
        logGeo.rotateZ(Math.PI / 2);
        const logMesh = new THREE.Mesh(logGeo, this.woodLogMaterial);
        logMesh.position.set(LANE_X[blockedLane], 0.35, relZ);
        logMesh.castShadow = true;
        group.add(logMesh);

        obstacles.push({
          id: `${segId}_log_${idx}`,
          type: 'low_log',
          lane: blockedLane,
          z: obstacleZ,
          width: 2.4,
          height: 0.7,
          depth: 0.8,
          yOffset: 0.35,
          requiresAction: 'jump',
          active: true,
          modelMesh: logMesh,
        });

        // Coins in jump arc over the barrier
        for (let c = -2; c <= 2; c += 1) {
          const coinMesh = new THREE.Mesh(this.coinGeometry, this.goldCoinMaterial);
          const arcY = 1.0 + (1 - (c * c) / 5) * 1.2;
          coinMesh.position.set(LANE_X[blockedLane], arcY, relZ + c);
          group.add(coinMesh);

          collectibles.push({
            id: `${segId}_arc_${idx}_${c}`,
            type: 'coin',
            lane: blockedLane,
            x: LANE_X[blockedLane],
            y: arcY,
            z: obstacleZ + c,
            collected: false,
            active: true,
            modelMesh: coinMesh,
          });
        }
      } else if (choice < 0.6) {
        // HIGH STONE ARCH / TRAP -> Requires Slide
        const blockedLane = lanes[Math.floor(Math.random() * lanes.length)];
        const archGroup = new THREE.Group();
        archGroup.position.set(LANE_X[blockedLane], 0, relZ);

        // Side posts
        const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 8);
        const leftPost = new THREE.Mesh(postGeo, this.stoneEdgeMaterial);
        leftPost.position.set(-1.1, 1.4, 0);
        archGroup.add(leftPost);

        const rightPost = new THREE.Mesh(postGeo, this.stoneEdgeMaterial);
        rightPost.position.set(1.1, 1.4, 0);
        archGroup.add(rightPost);

        // Spiked top beam that player slides under
        const beamGeo = new THREE.BoxGeometry(2.5, 0.8, 0.6);
        const beamMesh = new THREE.Mesh(beamGeo, this.mossStoneMaterial);
        beamMesh.position.set(0, 2.0, 0);
        beamMesh.castShadow = true;
        archGroup.add(beamMesh);

        // Spikes dangling down from beam
        for (let s = -0.8; s <= 0.8; s += 0.4) {
          const spikeGeo = new THREE.ConeGeometry(0.08, 0.4, 6);
          spikeGeo.rotateX(Math.PI);
          const spikeMesh = new THREE.Mesh(spikeGeo, this.stoneEdgeMaterial);
          spikeMesh.position.set(s, 1.4, 0);
          archGroup.add(spikeMesh);
        }

        group.add(archGroup);

        obstacles.push({
          id: `${segId}_arch_${idx}`,
          type: 'high_arch',
          lane: blockedLane,
          z: obstacleZ,
          width: 2.4,
          height: 1.4,
          depth: 0.6,
          yOffset: 1.8, // Sits high above ground
          requiresAction: 'slide',
          active: true,
          modelMesh: archGroup,
        });

        // Low coins underneath the arch for sliding through
        for (let c = -2; c <= 2; c += 1.2) {
          const coinMesh = new THREE.Mesh(this.coinGeometry, this.goldCoinMaterial);
          coinMesh.position.set(LANE_X[blockedLane], 0.35, relZ + c);
          group.add(coinMesh);

          collectibles.push({
            id: `${segId}_slide_coin_${idx}_${c}`,
            type: 'coin',
            lane: blockedLane,
            x: LANE_X[blockedLane],
            y: 0.35,
            z: obstacleZ + c,
            collected: false,
            active: true,
            modelMesh: coinMesh,
          });
        }
      } else if (choice < 0.82) {
        // ANCIENT TOTEM OBELISK -> Lane switch required
        // Blocks 1 or 2 lanes, leaving at least 1 open
        const openLane = lanes[Math.floor(Math.random() * lanes.length)];
        const blockedLanes = lanes.filter((l) => l !== openLane);

        // Pick one of the blocked lanes (or both on higher difficulty)
        const laneToBlock = blockedLanes[0];
        const pillarGeo = new THREE.BoxGeometry(1.6, 3.8, 1.2);
        const pillar = new THREE.Mesh(pillarGeo, this.ruinPillarMaterial);
        pillar.position.set(LANE_X[laneToBlock], 1.9, relZ);
        pillar.castShadow = true;
        group.add(pillar);

        // Carved rune symbol on pillar
        const runeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.1);
        const rune = new THREE.Mesh(runeGeo, this.gemMaterial);
        rune.position.set(LANE_X[laneToBlock], 2.2, relZ + 0.61);
        group.add(rune);

        obstacles.push({
          id: `${segId}_pillar_${idx}`,
          type: 'stone_pillar',
          lane: laneToBlock,
          z: obstacleZ,
          width: 1.6,
          height: 3.8,
          depth: 1.2,
          yOffset: 1.9,
          requiresAction: 'avoid',
          active: true,
          modelMesh: pillar,
        });

        // Reward the open lane with coins or a Sprint Energy Gem!
        if (Math.random() < 0.4) {
          // Sprint Gem pickup
          const gemMesh = new THREE.Mesh(this.gemGeometry, this.gemMaterial);
          gemMesh.position.set(LANE_X[openLane], 1.2, relZ);
          group.add(gemMesh);

          collectibles.push({
            id: `${segId}_gem_${idx}`,
            type: 'sprint_gem',
            lane: openLane,
            x: LANE_X[openLane],
            y: 1.2,
            z: obstacleZ,
            collected: false,
            active: true,
            modelMesh: gemMesh,
          });
        } else {
          // Coin trail in the open lane
          for (let c = -3; c <= 3; c += 1.5) {
            const coinMesh = new THREE.Mesh(this.coinGeometry, this.goldCoinMaterial);
            coinMesh.position.set(LANE_X[openLane], 1.0, relZ + c);
            group.add(coinMesh);

            collectibles.push({
              id: `${segId}_open_coin_${idx}_${c}`,
              type: 'coin',
              lane: openLane,
              x: LANE_X[openLane],
              y: 1.0,
              z: obstacleZ + c,
              collected: false,
              active: true,
              modelMesh: coinMesh,
            });
          }
        }
      } else {
        // SWINGING PENDULUM BLADE TRAP -> Timing & lane switch
        const trapLane = lanes[Math.floor(Math.random() * lanes.length)];
        const pendulumGroup = new THREE.Group();
        pendulumGroup.position.set(LANE_X[trapLane], 4.2, relZ);

        // Suspension arm
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
        const arm = new THREE.Mesh(armGeo, this.stoneEdgeMaterial);
        arm.position.set(0, -1.6, 0);
        pendulumGroup.add(arm);

        // Crescent stone blade at bottom
        const bladeGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 10);
        bladeGeo.scale(1, 0.3, 1);
        const blade = new THREE.Mesh(bladeGeo, this.ruinPillarMaterial);
        blade.position.set(0, -3.1, 0);
        blade.castShadow = true;
        pendulumGroup.add(blade);

        group.add(pendulumGroup);

        obstacles.push({
          id: `${segId}_blade_${idx}`,
          type: 'swinging_blade',
          lane: trapLane,
          z: obstacleZ,
          width: 1.8,
          height: 1.8,
          depth: 0.8,
          yOffset: 1.2,
          requiresAction: 'avoid',
          active: true,
          modelMesh: pendulumGroup,
        });
      }
    });
  }

  /**
   * Recycles segments that have fallen behind the runner and spawns new ones ahead
   */
  public update(runnerZ: number, delta: number) {
    // Keep at least 6 segments ahead of player
    const leadDistance = 300;
    while (this.nextZ > runnerZ - leadDistance) {
      this.spawnSegment();
    }

    // Remove old segments that are more than 60m behind the player
    while (this.segments.length > 0 && this.segments[0].zStart < runnerZ + 60) {
      const old = this.segments.shift()!;
      if (old.groupMesh) {
        this.scene.remove(old.groupMesh);
        // Clean up geometries and meshes
        old.groupMesh.traverse((child: any) => {
          if (child.isMesh) {
            // Keep shared materials, dispose local geometries if needed
            if (child.geometry !== this.coinGeometry && child.geometry !== this.gemGeometry) {
              child.geometry.dispose();
            }
          }
        });
      }
    }

    // Animate collectibles (spin coins & float gems)
    const spin = delta * 4;
    for (const seg of this.segments) {
      for (const col of seg.collectibles) {
        if (col.active && !col.collected && col.modelMesh) {
          col.modelMesh.rotation.y += spin;
          if (col.type === 'sprint_gem') {
            col.modelMesh.rotation.x += delta * 2;
          }
        }
      }

      // Animate swinging pendulums
      for (const obs of seg.obstacles) {
        if (obs.type === 'swinging_blade' && obs.modelMesh) {
          const time = performance.now() * 0.003;
          obs.modelMesh.rotation.z = Math.sin(time + Number(obs.z)) * 0.8;
        }
      }
    }
  }

  public clearAll() {
    for (const seg of this.segments) {
      if (seg.groupMesh) {
        this.scene.remove(seg.groupMesh);
      }
    }
    this.segments = [];
    this.segmentCounter = 0;
    this.nextZ = 0;
  }

  public dispose() {
    this.clearAll();
    this.stoneRoadMaterial.dispose();
    this.stoneEdgeMaterial.dispose();
    this.mossStoneMaterial.dispose();
    this.woodLogMaterial.dispose();
    this.ruinPillarMaterial.dispose();
    this.goldCoinMaterial.dispose();
    this.gemMaterial.dispose();
    this.foliageMaterial.dispose();
    this.barkMaterial.dispose();
    this.chasmWaterMaterial.dispose();
    this.coinGeometry.dispose();
    this.gemGeometry.dispose();
  }
}
