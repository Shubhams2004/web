import * as THREE from 'three';
import { RunnerAction } from './types';

/**
 * Procedural stylized 3D human runner.
 * Articulated human anatomy with clothing, backpack, limbs, joints, and skeletal kinematics.
 */
export class RunnerCharacter {
  public group: THREE.Group;
  
  // Articulation pivots for kinematics
  private root: THREE.Group;
  private torsoGroup: THREE.Group;
  private chestGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private leftForearmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private rightForearmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private leftShinGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private rightShinGroup: THREE.Group;
  
  // Materials for visual styling
  private skinMaterial: THREE.MeshStandardMaterial;
  private hairMaterial: THREE.MeshStandardMaterial;
  private bandanaMaterial: THREE.MeshStandardMaterial;
  private jacketMaterial: THREE.MeshStandardMaterial;
  private shirtMaterial: THREE.MeshStandardMaterial;
  private pantsMaterial: THREE.MeshStandardMaterial;
  private bootsMaterial: THREE.MeshStandardMaterial;
  private gearMaterial: THREE.MeshStandardMaterial;
  private goldMaterial: THREE.MeshStandardMaterial;

  // Running cycle internal phase
  private runCyclePhase: number = 0;
  private lastFootstepPhase: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Initialize stylized materials
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0a97a,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x241711,
      roughness: 0.85,
    });

    this.bandanaMaterial = new THREE.MeshStandardMaterial({
      color: 0xd92d20, // Crimson adventurer bandana
      roughness: 0.5,
    });

    this.jacketMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d4b3b, // Tactical olive explorer vest/jacket
      roughness: 0.7,
      metalness: 0.1,
    });

    this.shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x222a35, // Dark charcoal performance undershirt
      roughness: 0.8,
    });

    this.pantsMaterial = new THREE.MeshStandardMaterial({
      color: 0xb58e58, // Khaki explorer cargo runner pants
      roughness: 0.75,
    });

    this.bootsMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1e24, // Rugged trail runner boots
      roughness: 0.6,
      metalness: 0.2,
    });

    this.gearMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728, // Leather straps & trail pack
      roughness: 0.6,
    });

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Build Articulated Skeleton Hierarchy
    this.torsoGroup = new THREE.Group();
    this.chestGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.leftForearmGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.rightForearmGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();
    this.leftShinGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();
    this.rightShinGroup = new THREE.Group();

    this.buildCharacterMesh();
  }

  private buildCharacterMesh() {
    // Human proportion base: Total height ~ 1.85m
    // Root sits at character feet (y = 0)
    
    // HIPS / LOWER TORSO (Pivot at y = 0.95)
    this.torsoGroup.position.set(0, 0.95, 0);
    this.root.add(this.torsoGroup);

    // Pelvis mesh
    const pelvisGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.22, 10);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.pantsMaterial);
    pelvisMesh.position.set(0, 0, 0);
    pelvisMesh.castShadow = true;
    this.torsoGroup.add(pelvisMesh);

    // Belt with golden buckle
    const beltGeo = new THREE.CylinderGeometry(0.208, 0.208, 0.05, 12);
    const beltMesh = new THREE.Mesh(beltGeo, this.gearMaterial);
    beltMesh.position.set(0, 0.07, 0);
    this.torsoGroup.add(beltMesh);

    const buckleGeo = new THREE.BoxGeometry(0.08, 0.06, 0.03);
    const buckleMesh = new THREE.Mesh(buckleGeo, this.goldMaterial);
    buckleMesh.position.set(0, 0.07, 0.2);
    this.torsoGroup.add(buckleMesh);

    // CHEST / UPPER TORSO (Pivot at y = 0.16 above pelvis)
    this.chestGroup.position.set(0, 0.16, 0);
    this.torsoGroup.add(this.chestGroup);

    // Athletic chest/vest (trapezoidal tapered shape)
    const chestGeo = new THREE.CylinderGeometry(0.26, 0.2, 0.36, 12);
    const chestMesh = new THREE.Mesh(chestGeo, this.jacketMaterial);
    chestMesh.position.set(0, 0.18, 0);
    chestMesh.castShadow = true;
    this.chestGroup.add(chestMesh);

    // Shirt center zipper/panel
    const shirtPanelGeo = new THREE.BoxGeometry(0.12, 0.34, 0.05);
    const shirtPanel = new THREE.Mesh(shirtPanelGeo, this.shirtMaterial);
    shirtPanel.position.set(0, 0.18, 0.18);
    this.chestGroup.add(shirtPanel);

    // Expedition Trail Backpack on back
    const packGeo = new THREE.BoxGeometry(0.28, 0.36, 0.16);
    const packMesh = new THREE.Mesh(packGeo, this.gearMaterial);
    packMesh.position.set(0, 0.2, -0.16);
    packMesh.castShadow = true;
    this.chestGroup.add(packMesh);

    // Bedroll rolled on top of pack
    const bedrollGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.32, 10);
    bedrollGeo.rotateZ(Math.PI / 2);
    const bedrollMesh = new THREE.Mesh(bedrollGeo, this.bandanaMaterial);
    bedrollMesh.position.set(0, 0.4, -0.16);
    this.chestGroup.add(bedrollMesh);

    // HEAD GROUP (Pivot at top of chest y = 0.38)
    this.headGroup.position.set(0, 0.38, 0);
    this.chestGroup.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.1, 8);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.set(0, 0.05, 0);
    this.headGroup.add(neckMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.16, 16, 14);
    headGeo.scale(0.9, 1.1, 0.95);
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.position.set(0, 0.22, 0.02);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Stylized Adventurer Hair
    const hairGeo = new THREE.SphereGeometry(0.17, 14, 12);
    hairGeo.scale(0.94, 0.9, 1.0);
    const hairMesh = new THREE.Mesh(hairGeo, this.hairMaterial);
    hairMesh.position.set(0, 0.26, -0.02);
    this.headGroup.add(hairMesh);

    // Adventurer Crimson Bandana
    const bandanaGeo = new THREE.TorusGeometry(0.162, 0.035, 8, 20);
    bandanaGeo.rotateX(Math.PI / 2);
    const bandanaMesh = new THREE.Mesh(bandanaGeo, this.bandanaMaterial);
    bandanaMesh.position.set(0, 0.25, 0.02);
    this.headGroup.add(bandanaMesh);

    // Bandana trailing knot ties at back
    const knotGeo = new THREE.BoxGeometry(0.06, 0.12, 0.03);
    knotGeo.rotateZ(0.3);
    const knotMesh = new THREE.Mesh(knotGeo, this.bandanaMaterial);
    knotMesh.position.set(-0.06, 0.19, -0.15);
    this.headGroup.add(knotMesh);

    // LEGS: LEFT & RIGHT (Pivot at hips y = -0.05)
    const legSpacing = 0.12;

    // LEFT LEG
    this.leftLegGroup.position.set(-legSpacing, -0.05, 0);
    this.torsoGroup.add(this.leftLegGroup);

    const thighGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.42, 10);
    const leftThigh = new THREE.Mesh(thighGeo, this.pantsMaterial);
    leftThigh.position.set(0, -0.21, 0);
    leftThigh.castShadow = true;
    this.leftLegGroup.add(leftThigh);

    // Left knee / shin group
    this.leftShinGroup.position.set(0, -0.42, 0);
    this.leftLegGroup.add(this.leftShinGroup);

    const shinGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.4, 10);
    const leftShin = new THREE.Mesh(shinGeo, this.pantsMaterial);
    leftShin.position.set(0, -0.2, 0);
    leftShin.castShadow = true;
    this.leftShinGroup.add(leftShin);

    // Left Boot
    const bootGeo = new THREE.BoxGeometry(0.12, 0.12, 0.24);
    const leftBoot = new THREE.Mesh(bootGeo, this.bootsMaterial);
    leftBoot.position.set(0, -0.4, 0.05);
    leftBoot.castShadow = true;
    this.leftShinGroup.add(leftBoot);

    // RIGHT LEG
    this.rightLegGroup.position.set(legSpacing, -0.05, 0);
    this.torsoGroup.add(this.rightLegGroup);

    const rightThigh = new THREE.Mesh(thighGeo, this.pantsMaterial);
    rightThigh.position.set(0, -0.21, 0);
    rightThigh.castShadow = true;
    this.rightLegGroup.add(rightThigh);

    // Right knee / shin group
    this.rightShinGroup.position.set(0, -0.42, 0);
    this.rightLegGroup.add(this.rightShinGroup);

    const rightShin = new THREE.Mesh(shinGeo, this.pantsMaterial);
    rightShin.position.set(0, -0.2, 0);
    rightShin.castShadow = true;
    this.rightShinGroup.add(rightShin);

    // Right Boot
    const rightBoot = new THREE.Mesh(bootGeo, this.bootsMaterial);
    rightBoot.position.set(0, -0.4, 0.05);
    rightBoot.castShadow = true;
    this.rightShinGroup.add(rightBoot);

    // ARMS: LEFT & RIGHT (Pivot at shoulders y = 0.32 in chestGroup)
    const armSpacing = 0.28;

    // LEFT ARM
    this.leftArmGroup.position.set(-armSpacing, 0.32, 0);
    this.chestGroup.add(this.leftArmGroup);

    const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.32, 8);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, this.skinMaterial);
    leftUpperArm.position.set(0, -0.16, 0);
    leftUpperArm.castShadow = true;
    this.leftArmGroup.add(leftUpperArm);

    // Vest sleeve cuff
    const sleeveGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.12, 8);
    const leftSleeve = new THREE.Mesh(sleeveGeo, this.jacketMaterial);
    leftSleeve.position.set(0, -0.06, 0);
    this.leftArmGroup.add(leftSleeve);

    // Left forearm group
    this.leftForearmGroup.position.set(0, -0.32, 0);
    this.leftArmGroup.add(this.leftForearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.28, 8);
    const leftForearm = new THREE.Mesh(forearmGeo, this.skinMaterial);
    leftForearm.position.set(0, -0.14, 0);
    leftForearm.castShadow = true;
    this.leftForearmGroup.add(leftForearm);

    // Left Fist/Glove
    const gloveGeo = new THREE.BoxGeometry(0.08, 0.08, 0.09);
    const leftGlove = new THREE.Mesh(gloveGeo, this.gearMaterial);
    leftGlove.position.set(0, -0.28, 0.02);
    this.leftForearmGroup.add(leftGlove);

    // RIGHT ARM
    this.rightArmGroup.position.set(armSpacing, 0.32, 0);
    this.chestGroup.add(this.rightArmGroup);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, this.skinMaterial);
    rightUpperArm.position.set(0, -0.16, 0);
    rightUpperArm.castShadow = true;
    this.rightArmGroup.add(rightUpperArm);

    const rightSleeve = new THREE.Mesh(sleeveGeo, this.jacketMaterial);
    rightSleeve.position.set(0, -0.06, 0);
    this.rightArmGroup.add(rightSleeve);

    // Right forearm group
    this.rightForearmGroup.position.set(0, -0.32, 0);
    this.rightArmGroup.add(this.rightForearmGroup);

    const rightForearm = new THREE.Mesh(forearmGeo, this.skinMaterial);
    rightForearm.position.set(0, -0.14, 0);
    rightForearm.castShadow = true;
    this.rightForearmGroup.add(rightForearm);

    // Right Fist/Glove
    const rightGlove = new THREE.Mesh(gloveGeo, this.gearMaterial);
    rightGlove.position.set(0, -0.28, 0.02);
    this.rightForearmGroup.add(rightGlove);
  }

  /**
   * Updates procedural animation based on runner state.
   * Returns true if a footstep sound should be triggered.
   */
  public updateAnimation(
    delta: number,
    action: RunnerAction,
    speed: number,
    isSprinting: boolean,
    laneOffset: number,
    onFootstep?: (isLeft: boolean) => void
  ) {
    // Base cadence frequency increases with running speed
    const cadence = isSprinting ? 14 : 11;
    this.runCyclePhase += delta * cadence;

    // Trigger rhythmic footsteps when running and feet hit ground
    const currentPhaseMod = this.runCyclePhase % (Math.PI * 2);
    if (action === 'run') {
      if (this.lastFootstepPhase < Math.PI && currentPhaseMod >= Math.PI) {
        if (onFootstep) onFootstep(false);
      } else if (this.lastFootstepPhase > Math.PI && currentPhaseMod < Math.PI) {
        if (onFootstep) onFootstep(true);
      }
    }
    this.lastFootstepPhase = currentPhaseMod;

    // Banking into lane changes (lean body into direction of travel)
    const targetBank = -laneOffset * 0.18;
    this.root.rotation.z = THREE.MathUtils.lerp(this.root.rotation.z, targetBank, delta * 12);
    this.root.rotation.y = THREE.MathUtils.lerp(this.root.rotation.y, laneOffset * 0.25, delta * 10);

    // Handle different action states
    switch (action) {
      case 'jump':
        this.applyJumpAnimation(delta);
        break;
      case 'slide':
        this.applySlideAnimation(delta);
        break;
      case 'stumble':
        this.applyStumbleAnimation(delta);
        break;
      case 'run':
      default:
        this.applyRunCycleAnimation(delta, isSprinting);
        break;
    }
  }

  /**
   * Dynamic human running gait cycle
   */
  private applyRunCycleAnimation(delta: number, isSprinting: boolean) {
    const p = this.runCyclePhase;
    const sprintFactor = isSprinting ? 1.3 : 1.0;

    // Vertical bobbing of hips
    const bob = Math.abs(Math.sin(p)) * 0.08 * sprintFactor;
    this.torsoGroup.position.y = THREE.MathUtils.lerp(this.torsoGroup.position.y, 0.95 + bob, delta * 20);

    // Torso forward lean
    const forwardPitch = (isSprinting ? 0.32 : 0.18) + Math.sin(p * 2) * 0.03;
    this.chestGroup.rotation.x = THREE.MathUtils.lerp(this.chestGroup.rotation.x, forwardPitch, delta * 15);
    this.chestGroup.rotation.y = Math.sin(p) * 0.08; // Counter torso twist
    this.chestGroup.rotation.z = Math.cos(p) * 0.04;

    // Head stabilization
    this.headGroup.rotation.x = -forwardPitch * 0.8;
    this.headGroup.rotation.y = -Math.sin(p) * 0.05;

    // Leg swings (legs swing in opposition)
    const legAmplitude = (isSprinting ? 1.05 : 0.85);
    const leftThighAngle = Math.sin(p) * legAmplitude;
    const rightThighAngle = -Math.sin(p) * legAmplitude;

    this.leftLegGroup.rotation.x = leftThighAngle;
    this.rightLegGroup.rotation.x = rightThighAngle;

    // Shin/Knee flexing: Knees bend backwards during backswing, straighten during forward contact
    // Left knee flexes when leg is behind (sin(p) < 0)
    const leftShinFlex = Math.sin(p) < 0 ? Math.abs(Math.sin(p)) * 1.3 : 0.15;
    const rightShinFlex = Math.sin(p) > 0 ? Math.abs(Math.sin(p)) * 1.3 : 0.15;

    this.leftShinGroup.rotation.x = leftShinFlex;
    this.rightShinGroup.rotation.x = rightShinFlex;

    // Arm swings: Arms move opposite to legs (Left arm forward when right leg forward)
    const armAmplitude = (isSprinting ? 1.1 : 0.8);
    const leftArmAngle = -Math.sin(p) * armAmplitude;
    const rightArmAngle = Math.sin(p) * armAmplitude;

    this.leftArmGroup.rotation.x = leftArmAngle;
    this.rightArmGroup.rotation.x = rightArmAngle;

    // Elbows maintain an active runner bend (~60-90 degrees)
    this.leftForearmGroup.rotation.x = -0.9 - Math.max(0, -Math.sin(p)) * 0.4;
    this.rightForearmGroup.rotation.x = -0.9 - Math.max(0, Math.sin(p)) * 0.4;

    // Slight outward shoulder flare
    this.leftArmGroup.rotation.z = -0.15;
    this.rightArmGroup.rotation.z = 0.15;
  }

  /**
   * Jump pose: Character ascends with arms up for balance and knees bent
   */
  private applyJumpAnimation(delta: number) {
    // Torso tilts slightly back and up
    this.torsoGroup.position.y = THREE.MathUtils.lerp(this.torsoGroup.position.y, 0.95, delta * 15);
    this.chestGroup.rotation.x = THREE.MathUtils.lerp(this.chestGroup.rotation.x, -0.1, delta * 15);
    this.chestGroup.rotation.y = 0;
    this.chestGroup.rotation.z = 0;

    // Arms raise back and out for athletic balance
    this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, -0.9, delta * 15);
    this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, -0.9, delta * 15);
    this.leftArmGroup.rotation.z = -0.4;
    this.rightArmGroup.rotation.z = 0.4;
    this.leftForearmGroup.rotation.x = -0.5;
    this.rightForearmGroup.rotation.x = -0.5;

    // Legs tuck up toward chest
    this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, 0.75, delta * 15);
    this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, 0.5, delta * 15);
    this.leftShinGroup.rotation.x = THREE.MathUtils.lerp(this.leftShinGroup.rotation.x, 1.2, delta * 15);
    this.rightShinGroup.rotation.x = THREE.MathUtils.lerp(this.rightShinGroup.rotation.x, 1.3, delta * 15);
  }

  /**
   * Slide pose: Character drops low, one leg extends forward, torso leans back
   */
  private applySlideAnimation(delta: number) {
    // Hips drop down close to ground
    this.torsoGroup.position.y = THREE.MathUtils.lerp(this.torsoGroup.position.y, 0.35, delta * 20);

    // Torso leans back
    this.chestGroup.rotation.x = THREE.MathUtils.lerp(this.chestGroup.rotation.x, -0.65, delta * 18);
    this.headGroup.rotation.x = 0.5; // Look forward through slide

    // Right leg extends straight forward in slide
    this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, 1.4, delta * 20);
    this.rightShinGroup.rotation.x = THREE.MathUtils.lerp(this.rightShinGroup.rotation.x, 0.1, delta * 20);

    // Left leg folds under
    this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, -0.4, delta * 20);
    this.leftShinGroup.rotation.x = THREE.MathUtils.lerp(this.leftShinGroup.rotation.x, 1.8, delta * 20);

    // Arms brace back low to surface
    this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0.6, delta * 18);
    this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0.6, delta * 18);
    this.leftForearmGroup.rotation.x = -0.2;
    this.rightForearmGroup.rotation.x = -0.2;
  }

  /**
   * Stumble/collision failure pose
   */
  private applyStumbleAnimation(delta: number) {
    this.chestGroup.rotation.x = THREE.MathUtils.lerp(this.chestGroup.rotation.x, -0.8, delta * 12);
    this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 1.2, delta * 12);
    this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 1.4, delta * 12);
    this.root.rotation.z = THREE.MathUtils.lerp(this.root.rotation.z, 0.6, delta * 10);
    this.torsoGroup.position.y = THREE.MathUtils.lerp(this.torsoGroup.position.y, 0.25, delta * 12);
  }

  public dispose() {
    this.skinMaterial.dispose();
    this.hairMaterial.dispose();
    this.bandanaMaterial.dispose();
    this.jacketMaterial.dispose();
    this.shirtMaterial.dispose();
    this.pantsMaterial.dispose();
    this.bootsMaterial.dispose();
    this.gearMaterial.dispose();
    this.goldMaterial.dispose();
  }
}
