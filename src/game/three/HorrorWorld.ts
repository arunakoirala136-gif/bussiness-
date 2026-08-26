/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { globalAudio } from '../../audio/HorrorAudioEngine';
import { GameLocationTheme, GameSettings, InteractableObject } from '../../types';
import { gameState } from '../gameState';
import { BuiltHouse, HouseBuilder } from './HouseBuilder';

export interface RaycastHit {
  interactable: InteractableObject | null;
  distance: number;
}

export class HorrorWorld {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public settings: GameSettings;

  private builtHouse: BuiltHouse | null = null;
  public flashlight: THREE.SpotLight;
  public flashlightTarget: THREE.Object3D;
  private ambientLight: THREE.AmbientLight;
  private lightningLight: THREE.DirectionalLight;

  // Player state & movement
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 1.6, 0);
  public playerRot: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private isSprinting = false;
  private walkTime = 0;
  private footstepTimer = 0;

  // Touch controls
  public touchMoveVector = { x: 0, y: 0 };
  public touchLookVector = { x: 0, y: 0 };

  // Shadow Entity (The Wraith)
  private wraithGroup: THREE.Group;
  private wraithEyes: THREE.Mesh;
  private wraithPos: THREE.Vector3 = new THREE.Vector3(10, 1.6, -21);
  private wraithActive = false;
  private wraithCooldown = 0;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  public currentHit: InteractableObject | null = null;

  // Particles
  private dustParticles: THREE.Points | null = null;
  private rainParticles: THREE.Points | null = null;

  // Lightning cycle
  private nextLightningTime = 8.0;
  private lightningDuration = 0;

  private isRunning = true;
  private animFrameId: number | null = null;
  private lastTime = performance.now();

  // Callbacks
  public onInteractPromptChange: ((hit: InteractableObject | null) => void) | null = null;
  public onRoomChange: ((roomName: string) => void) | null = null;
  public onSanityChange: ((sanity: number) => void) | null = null;
  public onBatteryChange: ((battery: number) => void) | null = null;

  constructor(container: HTMLElement, settings: GameSettings, theme: GameLocationTheme = 'whispering_house') {
    this.container = container;
    this.settings = settings;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06080a, 0.08);

    this.camera = new THREE.PerspectiveCamera(
      settings.fov || 75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(0, 1.6, 0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = Math.max(0.6, settings.brightness);
    container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.ambientLight = new THREE.AmbientLight(0x0a0c10, 0.3);
    this.scene.add(this.ambientLight);

    // Lightning light from outside
    this.lightningLight = new THREE.DirectionalLight(0xaaccff, 0.0);
    this.lightningLight.position.set(5, 10, 5);
    this.scene.add(this.lightningLight);

    // Flashlight
    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);

    this.flashlight = new THREE.SpotLight(0xfff6e0, 2.8, 18, Math.PI / 6, 0.35, 1.2);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.bias = -0.001;
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // 4. Build House Level
    this.builtHouse = HouseBuilder.buildHouse(theme);
    this.scene.add(this.builtHouse.group);

    // 5. Shadow Entity (The Whispering Wraith)
    this.wraithGroup = this.createShadowWraith();
    this.scene.add(this.wraithGroup);
    this.wraithGroup.position.set(10, 1.6, -21);

    // 6. Particles
    this.createDustParticles();
    this.createRainParticles();

    // 7. Event Listeners
    this.setupInputs();
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // Start Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  private createShadowWraith(): THREE.Group {
    const group = new THREE.Group();

    // Dark smoke silhouette
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.1, 2.0, 12);
    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.85,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.8;
    group.add(head);

    // Glowing Spectral Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.08, 1.82, 0.22);
    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.08, 1.82, 0.22);
    group.add(eyeLeft);
    group.add(eyeRight);
    this.wraithEyes = eyeLeft;

    return group;
  }

  private createDustParticles() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = Math.random() * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 35;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
    });
    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  private createRainParticles() {
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 12;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x6688aa,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    this.rainParticles = new THREE.Points(geo, mat);
    this.scene.add(this.rainParticles);
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (gameState.gameOver) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
        case 'KeyF':
          this.toggleFlashlight();
          break;
        case 'KeyR':
          this.reloadBattery();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    });

    // Mouse movement when pointer locked
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.container || document.pointerLockElement === this.renderer.domElement) {
        const sens = (this.settings.mouseSensitivity || 1.0) * 0.0022;
        this.playerRot.y -= e.movementX * sens;
        this.playerRot.x -= e.movementY * sens;
        this.playerRot.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.playerRot.x));
      }
    });
  }

  public toggleFlashlight() {
    gameState.flashlightOn = !gameState.flashlightOn;
    globalAudio.playFlashlightClick(gameState.flashlightOn);
  }

  public reloadBattery() {
    const success = gameState.reloadBattery();
    if (success) {
      globalAudio.playItemPickup();
      if (this.onBatteryChange) this.onBatteryChange(gameState.batteryLevel);
    }
  }

  public updateClockHands(hour: number, minute: number) {
    if (!this.builtHouse) return;
    const hourAngle = -((hour % 12) + minute / 60) * (Math.PI / 6);
    const minAngle = -(minute / 60) * (Math.PI * 2);
    this.builtHouse.clockHands.hour.rotation.z = hourAngle;
    this.builtHouse.clockHands.minute.rotation.z = minAngle;
  }

  public openSecretBookcase() {
    if (!this.builtHouse) return;
    // Animate bookcase swinging open
    this.builtHouse.bookcaseMesh.position.x = -13.5;
    this.builtHouse.bookcaseMesh.rotation.y = Math.PI / 3;
    globalAudio.playDoorSqueak(true);
  }

  public removeInteractableMesh(id: string) {
    if (!this.builtHouse) return;
    const item = this.builtHouse.interactables.get(id);
    if (item) {
      item.mesh.visible = false;
      this.builtHouse.interactables.delete(id);
    }
  }

  private animate() {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!gameState.gameOver) {
      this.updatePlayerMovement(delta);
      this.updateFlashlightAndLighting(delta);
      this.updateRaycasting();
      this.updateShadowWraith(delta);
      this.updateParticles(delta);
      this.updateSanityAndRoom(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private updatePlayerMovement(delta: number) {
    // Mobile Touch Look
    if (this.touchLookVector.x !== 0 || this.touchLookVector.y !== 0) {
      const touchSens = (this.settings.mouseSensitivity || 1.0) * 1.8;
      this.playerRot.y -= this.touchLookVector.x * touchSens * delta;
      this.playerRot.x -= this.touchLookVector.y * touchSens * delta;
      this.playerRot.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.playerRot.x));
    }

    // Direction vector
    const moveDir = new THREE.Vector3();
    if (this.moveForward) moveDir.z -= 1;
    if (this.moveBackward) moveDir.z += 1;
    if (this.moveLeft) moveDir.x -= 1;
    if (this.moveRight) moveDir.x += 1;

    // Add mobile touch move vector
    if (this.touchMoveVector.x !== 0 || this.touchMoveVector.y !== 0) {
      moveDir.x += this.touchMoveVector.x;
      moveDir.z -= this.touchMoveVector.y;
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();

      // Rotate by player horizontal rotation (playerRot.y)
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRot.y);

      const speed = this.isSprinting ? 4.2 : 2.4;
      const targetPos = this.playerPos.clone().addScaledVector(moveDir, speed * delta);

      // Collision detection against walls
      const playerRadius = 0.4;
      let collides = false;
      if (this.builtHouse) {
        for (const box of this.builtHouse.collisionBoxes) {
          const playerBox = new THREE.Box3(
            new THREE.Vector3(targetPos.x - playerRadius, 0.2, targetPos.z - playerRadius),
            new THREE.Vector3(targetPos.x + playerRadius, 2.0, targetPos.z + playerRadius)
          );
          if (box.intersectsBox(playerBox)) {
            collides = true;
            break;
          }
        }
      }

      if (!collides) {
        this.playerPos.x = targetPos.x;
        this.playerPos.z = targetPos.z;
      }

      // Head bobbing & footsteps
      this.walkTime += delta * (this.isSprinting ? 12 : 8);
      this.footstepTimer += delta;
      const stepInterval = this.isSprinting ? 0.35 : 0.55;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        const surface = this.playerPos.z < -10 ? 'stone' : 'wood';
        globalAudio.playFootstep(surface);
      }
    } else {
      this.walkTime = 0;
    }

    // Camera height with subtle head-bob
    const headBob = Math.sin(this.walkTime) * 0.05;
    this.camera.position.set(this.playerPos.x, 1.6 + headBob, this.playerPos.z);
    this.camera.rotation.copy(this.playerRot);
  }

  private updateFlashlightAndLighting(delta: number) {
    // Battery discharge
    if (gameState.flashlightOn && gameState.batteryLevel > 0) {
      gameState.batteryLevel = Math.max(0, gameState.batteryLevel - delta * 0.45);
      if (this.onBatteryChange) this.onBatteryChange(gameState.batteryLevel);
      if (gameState.batteryLevel <= 0) {
        gameState.flashlightOn = false;
        globalAudio.playFlashlightClick(false);
      }
    }

    // Flashlight flicker when near wraith or low battery
    const distToWraith = this.playerPos.distanceTo(this.wraithGroup.position);
    let flicker = 1.0;
    if (gameState.batteryLevel < 20 || distToWraith < 6.0) {
      if (Math.random() < 0.15) {
        flicker = Math.random() * 0.4;
      }
    }

    const intensity = gameState.flashlightOn ? 2.8 * flicker * (gameState.batteryLevel / 100) : 0;
    this.flashlight.intensity = intensity;

    // Align flashlight position & beam target with camera
    this.flashlight.position.copy(this.camera.position);
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
    this.flashlightTarget.position.copy(this.camera.position).add(forward.multiplyScalar(10));

    // Lightning flashes & Thunder
    this.nextLightningTime -= delta;
    if (this.nextLightningTime <= 0) {
      this.nextLightningTime = Math.random() * 12 + 6;
      this.lightningDuration = 0.25;
      globalAudio.playThunder(Math.random() < 0.3);
    }

    if (this.lightningDuration > 0) {
      this.lightningDuration -= delta;
      this.lightningLight.intensity = Math.random() * 3.5 + 1.0;
    } else {
      this.lightningLight.intensity = 0;
    }

    // Flicker candle lights
    if (this.builtHouse) {
      for (const candle of this.builtHouse.candles) {
        candle.intensity = 0.8 + Math.sin(nowMs() * 0.01 + candle.id) * 0.2;
      }
    }
  }

  private updateRaycasting() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    let closestHit: InteractableObject | null = null;
    let closestDist = 2.8; // 2.8 meters max reach

    if (this.builtHouse) {
      const meshes: THREE.Object3D[] = [];
      const meshToData = new Map<THREE.Object3D, InteractableObject>();

      this.builtHouse.interactables.forEach((val) => {
        if (val.mesh.visible) {
          meshes.push(val.mesh);
          meshToData.set(val.mesh, val.data);
        }
      });

      const intersects = this.raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        const first = intersects[0];
        if (first.distance <= closestDist) {
          // Find root object in interactables
          let cur: THREE.Object3D | null = first.object;
          while (cur && !meshToData.has(cur)) {
            cur = cur.parent;
          }
          if (cur && meshToData.has(cur)) {
            closestHit = meshToData.get(cur)!;
          }
        }
      }
    }

    if (this.currentHit?.id !== closestHit?.id) {
      this.currentHit = closestHit;
      if (this.onInteractPromptChange) {
        this.onInteractPromptChange(this.currentHit);
      }
    }
  }

  private updateShadowWraith(delta: number) {
    const dist = this.playerPos.distanceTo(this.wraithGroup.position);

    // Wraith looks at player
    this.wraithGroup.lookAt(this.playerPos.x, this.wraithGroup.position.y, this.playerPos.z);

    // Wraith floats subtly
    this.wraithGroup.position.y = 0.2 + Math.sin(nowMs() * 0.003) * 0.15;

    // If player is in deep darkness or low sanity, wraith creeps closer!
    if (!gameState.flashlightOn || gameState.sanityLevel < 40) {
      const stalkDir = this.playerPos.clone().sub(this.wraithGroup.position).normalize();
      this.wraithGroup.position.addScaledVector(stalkDir, 0.6 * delta);

      // Stereo pan whisper based on wraith relative angle
      if (dist < 8.0 && Math.random() < 0.05) {
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
        const toWraith = this.wraithGroup.position.clone().sub(this.playerPos).normalize();
        const cross = forward.cross(toWraith);
        globalAudio.playCreepyWhisper(Math.max(-1, Math.min(1, cross.y * 1.5)));
      }
    }

    // Jumpscare collision if wraith touches player
    if (dist < 1.4 && !gameState.activeJumpscares.has('wraith_touch')) {
      gameState.activeJumpscares.add('wraith_touch');
      globalAudio.playJumpscareStinger();
      gameState.sanityLevel = Math.max(0, gameState.sanityLevel - 35);
      // Teleport wraith away
      this.wraithGroup.position.set(10, 0.2, -21);
      setTimeout(() => gameState.activeJumpscares.delete('wraith_touch'), 8000);
    }
  }

  private updateParticles(delta: number) {
    if (this.dustParticles) {
      const pos = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(nowMs() * 0.001 + i) * 0.002;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.rainParticles) {
      const pos = this.rainParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 18 * delta;
        if (pos[i] < 0) pos[i] = 12;
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateSanityAndRoom(delta: number) {
    gameState.timeElapsedSec += delta;

    // Sanity drains if in pitch dark (flashlight off or battery dead)
    if (!gameState.flashlightOn || gameState.batteryLevel <= 0) {
      gameState.sanityLevel = Math.max(0, gameState.sanityLevel - delta * 1.8);
    } else {
      // Slow recovery up to 80 when light is on
      gameState.sanityLevel = Math.min(80, gameState.sanityLevel + delta * 0.3);
    }

    // Near wraith drain
    const distToWraith = this.playerPos.distanceTo(this.wraithGroup.position);
    if (distToWraith < 4.0) {
      gameState.sanityLevel = Math.max(0, gameState.sanityLevel - delta * 4.0);
    }

    globalAudio.setSanity(gameState.sanityLevel);
    if (this.onSanityChange) this.onSanityChange(gameState.sanityLevel);

    // If sanity hits 0 -> Consumed ending!
    if (gameState.sanityLevel <= 0 && !gameState.gameOver) {
      globalAudio.playJumpscareStinger();
      gameState.triggerEnding('consumed');
    }

    // Determine current room
    let room = 'Grand Foyer';
    const px = this.playerPos.x;
    const pz = this.playerPos.z;

    if (pz < -10) {
      if (px > 2) room = 'Occult Sanctum';
      else if (px < -2) room = 'Cellar Maintenance';
      else room = 'Stone Cellar Passage';
    } else {
      if (px > 4) room = 'The Parlor';
      else if (px < -4) room = 'The Library & Study';
      else room = 'Grand Foyer';
    }

    if (gameState.currentRoomName !== room) {
      gameState.currentRoomName = room;
      if (this.onRoomChange) this.onRoomChange(room);
    }
  }

  public setCameraFOV(fov: number) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  public setExposure(brightness: number) {
    this.renderer.toneMappingExposure = Math.max(0.4, brightness);
  }

  private onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

function nowMs(): number {
  return performance.now();
}
