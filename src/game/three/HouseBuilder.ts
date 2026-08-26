/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GameLocationTheme, InteractableObject } from '../../types';
import { TextureGenerator } from './TextureGenerator';

export interface BuiltHouse {
  group: THREE.Group;
  interactables: Map<string, { mesh: THREE.Object3D; data: InteractableObject }>;
  collisionBoxes: THREE.Box3[];
  doors: Map<string, THREE.Mesh>;
  candles: THREE.PointLight[];
  clockHands: { hour: THREE.Mesh; minute: THREE.Mesh };
  bookcaseMesh: THREE.Group;
  safeMesh: THREE.Group;
  fuseBoxMesh: THREE.Group;
  altarPedestals: THREE.Mesh[];
  windows: THREE.Mesh[];
}

export class HouseBuilder {
  public static buildHouse(theme: GameLocationTheme = 'whispering_house'): BuiltHouse {
    const group = new THREE.Group();
    const interactables = new Map<string, { mesh: THREE.Object3D; data: InteractableObject }>();
    const collisionBoxes: THREE.Box3[] = [];
    const doors = new Map<string, THREE.Mesh>();
    const candles: THREE.PointLight[] = [];
    const windows: THREE.Mesh[] = [];
    const altarPedestals: THREE.Mesh[] = [];

    // Textures
    const woodTex = TextureGenerator.getWoodPlanks();
    woodTex.repeat.set(4, 4);
    const stoneTex = TextureGenerator.getStoneFloor();
    stoneTex.repeat.set(6, 6);
    const wallTex = TextureGenerator.getWallpaper(theme === 'haunted_hospital' ? 'hospital' : 'victorian');
    wallTex.repeat.set(2, 2);
    const bookshelfTex = TextureGenerator.getBookshelfTexture();
    const altarTex = TextureGenerator.getOccultAltarTexture();
    const clockFaceTex = TextureGenerator.getClockFaceTexture();

    // Shared Materials
    const floorWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.8,
      metalness: 0.1,
      color: 0x887766,
    });

    const floorStoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.9,
      metalness: 0.2,
      color: 0x777777,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.85,
      color: 0x998888,
      side: THREE.DoubleSide,
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1614,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });

    const woodTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1f140d,
      roughness: 0.6,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc8a14b,
      metalness: 0.8,
      roughness: 0.3,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.85,
      roughness: 0.4,
    });

    // Helper: Add wall box with collision
    const addWall = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material = wallMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      collisionBoxes.push(box);
      return mesh;
    };

    // Helper: Add floor
    const addFloor = (x: number, z: number, w: number, d: number, mat: THREE.Material = floorWoodMat) => {
      const geo = new THREE.PlaneGeometry(w, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0, z);
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    // Helper: Add ceiling
    const addCeiling = (x: number, z: number, w: number, d: number, h: number = 3.6) => {
      const geo = new THREE.PlaneGeometry(w, d);
      const mesh = new THREE.Mesh(geo, ceilingMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(x, h, z);
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    // Helper: Add Window with glass & rain reflection
    const addWindow = (x: number, y: number, z: number, w: number, h: number, rotY: number = 0) => {
      const frameGeo = new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.1);
      const frame = new THREE.Mesh(frameGeo, woodTrimMat);
      frame.position.set(x, y, z);
      frame.rotation.y = rotY;
      group.add(frame);

      const glassGeo = new THREE.PlaneGeometry(w, h);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x112233,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(x, y, z + 0.02);
      glass.rotation.y = rotY;
      group.add(glass);
      windows.push(glass);
    };

    // ---------------------------------------------------------------------
    // 1. GRAND FOYER (0, 0, 0) to (0, 0, -10)
    // ---------------------------------------------------------------------
    addFloor(0, -4, 10, 12, floorWoodMat);
    addCeiling(0, -4, 10, 12, 3.8);

    // Front Wall (North) with Main Locked Iron Exit Gate
    addWall(-3.2, 0, 2, 3.6, 3.8, 0.3);
    addWall(3.2, 0, 2, 3.6, 3.8, 0.3);
    addWall(0, 2.8, 2, 2.8, 1.0, 0.3);

    // Main Exit Iron Gate (Interactable)
    const gateGroup = new THREE.Group();
    const gateGeo = new THREE.BoxGeometry(2.6, 2.7, 0.1);
    const gateMesh = new THREE.Mesh(gateGeo, ironMat);
    gateMesh.position.set(0, 1.35, 2);
    group.add(gateMesh);

    // Add padlock onto gate
    const lockGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    const lockMesh = new THREE.Mesh(lockGeo, brassMat);
    lockMesh.rotation.x = Math.PI / 2;
    lockMesh.position.set(0.4, 1.35, 2.08);
    group.add(lockMesh);

    interactables.set('main_gate', {
      mesh: gateMesh,
      data: {
        id: 'main_gate',
        type: 'door',
        name: 'Heavy Iron Estate Gate',
        actionText: 'Unlock and Escape Estate',
        position: [0, 1.35, 2],
        locked: true,
        requiresItem: 'key_main_gate',
      },
    });

    // Foyer Side Walls
    addWall(-5, 0, -4, 0.3, 3.8, 12); // West Wall
    addWall(5, 0, -4, 0.3, 3.8, 12);  // East Wall

    // Foyer Window on West Wall
    addWindow(-4.9, 2.0, -1, 1.6, 2.0, Math.PI / 2);

    // Table in Foyer with Flashlight & Note
    const tableGroup = new THREE.Group();
    const tableTopGeo = new THREE.BoxGeometry(1.6, 0.1, 0.8);
    const tableTop = new THREE.Mesh(tableTopGeo, woodTrimMat);
    tableTop.position.set(-3.8, 0.85, -2);
    tableGroup.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
    [-0.7, 0.7].forEach((lx) => {
      [-0.3, 0.3].forEach((lz) => {
        const leg = new THREE.Mesh(legGeo, woodTrimMat);
        leg.position.set(-3.8 + lx, 0.42, -2 + lz);
        tableGroup.add(leg);
      });
    });
    group.add(tableGroup);
    collisionBoxes.push(new THREE.Box3().setFromObject(tableGroup));

    // Flashlight Item on Table
    const flGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12);
    const flMesh = new THREE.Mesh(flGeo, brassMat);
    flMesh.rotation.z = Math.PI / 2;
    flMesh.position.set(-3.8, 0.95, -2);
    group.add(flMesh);

    interactables.set('item_flashlight', {
      mesh: flMesh,
      data: {
        id: 'item_flashlight',
        type: 'item',
        name: 'Heavy Brass Flashlight',
        actionText: 'Pick up Flashlight',
        position: [-3.8, 0.95, -2],
      },
    });

    // Note 1 on Table
    const note1Geo = new THREE.PlaneGeometry(0.25, 0.35);
    const note1Mat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.9 });
    const note1Mesh = new THREE.Mesh(note1Geo, note1Mat);
    note1Mesh.rotation.x = -Math.PI / 2;
    note1Mesh.position.set(-3.4, 0.92, -2);
    group.add(note1Mesh);

    interactables.set('note_foyer', {
      mesh: note1Mesh,
      data: {
        id: 'note_foyer',
        type: 'note',
        name: 'Lord Eldermere\'s Journal',
        actionText: 'Read Waterlogged Note',
        position: [-3.4, 0.92, -2],
      },
    });

    // Spare Battery on table
    const batGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
    const batMat = new THREE.MeshStandardMaterial({ color: 0x228833, metalness: 0.5 });
    const batMesh = new THREE.Mesh(batGeo, batMat);
    batMesh.position.set(-4.1, 0.93, -1.9);
    group.add(batMesh);

    interactables.set('bat_foyer', {
      mesh: batMesh,
      data: {
        id: 'bat_foyer',
        type: 'battery',
        name: 'Zinc D-Cell Battery',
        actionText: 'Pick up Battery (+50% Charge)',
        position: [-4.1, 0.93, -1.9],
      },
    });

    // ---------------------------------------------------------------------
    // 2. GRANDFATHER CLOCK (Foyer Corner)
    // ---------------------------------------------------------------------
    const clockGroup = new THREE.Group();
    const clockBodyGeo = new THREE.BoxGeometry(0.9, 2.7, 0.6);
    const clockBody = new THREE.Mesh(clockBodyGeo, woodTrimMat);
    clockBody.position.set(4.2, 1.35, -2);
    clockGroup.add(clockBody);

    const faceGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const faceMat = new THREE.MeshStandardMaterial({ map: clockFaceTex, roughness: 0.5 });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(4.2, 2.0, -1.69);
    clockGroup.add(faceMesh);

    // Hands
    const hourHandGeo = new THREE.BoxGeometry(0.02, 0.16, 0.01);
    const handMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const hourHand = new THREE.Mesh(hourHandGeo, handMat);
    hourHand.position.set(4.2, 2.0, -1.68);
    clockGroup.add(hourHand);

    const minHandGeo = new THREE.BoxGeometry(0.015, 0.22, 0.01);
    const minHand = new THREE.Mesh(minHandGeo, handMat);
    minHand.position.set(4.2, 2.0, -1.67);
    clockGroup.add(minHand);

    group.add(clockGroup);
    collisionBoxes.push(new THREE.Box3().setFromObject(clockGroup));

    interactables.set('puzzle_clock', {
      mesh: clockBody,
      data: {
        id: 'puzzle_clock',
        type: 'puzzle',
        name: 'Ancient Grandfather Clock',
        actionText: 'Examine Clock Dial & Hands',
        position: [4.2, 1.35, -2],
      },
    });

    // ---------------------------------------------------------------------
    // 3. THE PARLOR (East Wing: x: 5 to 17, z: -10 to 2)
    // ---------------------------------------------------------------------
    addFloor(11, -4, 12, 12, floorWoodMat);
    addCeiling(11, -4, 12, 12, 3.8);

    // Doorway from Foyer to Parlor
    const parlorDoorGeo = new THREE.BoxGeometry(0.1, 2.4, 1.4);
    const parlorDoor = new THREE.Mesh(parlorDoorGeo, woodTrimMat);
    parlorDoor.position.set(5.0, 1.2, -6);
    group.add(parlorDoor);
    doors.set('door_foyer_parlor', parlorDoor);

    interactables.set('door_foyer_parlor', {
      mesh: parlorDoor,
      data: {
        id: 'door_foyer_parlor',
        type: 'door',
        name: 'Parlor Oak Door',
        actionText: 'Open Parlor Door',
        position: [5.0, 1.2, -6],
        locked: false,
        opened: false,
      },
    });

    // Parlor Walls
    addWall(17, 0, -4, 0.3, 3.8, 12); // Far East Wall
    addWall(11, 0, 2, 12, 3.8, 0.3);  // South Wall
    addWall(11, 0, -10, 12, 3.8, 0.3); // North Wall

    // Parlor Fireplace
    const fireplaceGeo = new THREE.BoxGeometry(2.4, 2.2, 0.8);
    const fpMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 });
    const fireplace = new THREE.Mesh(fireplaceGeo, fpMat);
    fireplace.position.set(16.5, 1.1, -4);
    group.add(fireplace);
    collisionBoxes.push(new THREE.Box3().setFromObject(fireplace));

    // Fireplace Hearth Glow
    const hearthLight = new THREE.PointLight(0xff4411, 1.2, 8);
    hearthLight.position.set(16.0, 0.6, -4);
    group.add(hearthLight);
    candles.push(hearthLight);

    // Mantle Note in Parlor
    const parlorNoteMesh = new THREE.Mesh(note1Geo, note1Mat);
    parlorNoteMesh.position.set(15.5, 2.1, -4);
    parlorNoteMesh.rotation.y = -Math.PI / 2;
    group.add(parlorNoteMesh);

    interactables.set('note_parlor', {
      mesh: parlorNoteMesh,
      data: {
        id: 'note_parlor',
        type: 'note',
        name: 'Mantle Poem Note',
        actionText: 'Read Eleanor\'s Poem',
        position: [15.5, 2.1, -4],
      },
    });

    // Creepy Portrait of Eleanor in Parlor
    const portraitEleanorTex = TextureGenerator.getPortraitPainting('creepy');
    const portraitEleanorGeo = new THREE.PlaneGeometry(1.2, 1.8);
    const portraitEleanorMat = new THREE.MeshStandardMaterial({ map: portraitEleanorTex });
    const portraitEleanor = new THREE.Mesh(portraitEleanorGeo, portraitEleanorMat);
    portraitEleanor.position.set(11, 2.2, -9.8);
    group.add(portraitEleanor);

    // ---------------------------------------------------------------------
    // 4. THE LIBRARY & MASTER STUDY (West Wing: x: -5 to -17, z: -10 to 2)
    // ---------------------------------------------------------------------
    addFloor(-11, -4, 12, 12, floorWoodMat);
    addCeiling(-11, -4, 12, 12, 3.8);

    // Study Door from Foyer (Locked by Study Key or Clock Puzzle)
    const studyDoorGeo = new THREE.BoxGeometry(0.1, 2.4, 1.4);
    const studyDoor = new THREE.Mesh(studyDoorGeo, woodTrimMat);
    studyDoor.position.set(-5.0, 1.2, -6);
    group.add(studyDoor);
    doors.set('door_foyer_study', studyDoor);

    interactables.set('door_foyer_study', {
      mesh: studyDoor,
      data: {
        id: 'door_foyer_study',
        type: 'door',
        name: 'Study Heavy Brass Door',
        actionText: 'Unlock Study Door',
        position: [-5.0, 1.2, -6],
        locked: true,
        requiresItem: 'key_study',
      },
    });

    // Library Walls
    addWall(-17, 0, -4, 0.3, 3.8, 12); // Far West Wall
    addWall(-11, 0, 2, 12, 3.8, 0.3);  // South Wall
    addWall(-11, 0, -10, 12, 3.8, 0.3); // North Wall

    // Large Bookshelves in Library
    const shelfGroup = new THREE.Group();
    const shelfGeo = new THREE.BoxGeometry(3.6, 3.2, 0.8);
    const shelfMat = new THREE.MeshStandardMaterial({ map: bookshelfTex, roughness: 0.8 });
    const shelf1 = new THREE.Mesh(shelfGeo, shelfMat);
    shelf1.position.set(-16.4, 1.6, -2);
    shelf1.rotation.y = Math.PI / 2;
    shelfGroup.add(shelf1);

    // Secret Bookcase on North wall of Library
    const secretBookcase = new THREE.Group();
    const secretShelfMesh = new THREE.Mesh(shelfGeo, shelfMat);
    secretShelfMesh.position.set(0, 1.6, 0);
    secretBookcase.position.set(-11, 0, -9.5);
    secretBookcase.add(secretShelfMesh);
    group.add(secretBookcase);
    collisionBoxes.push(new THREE.Box3().setFromObject(secretBookcase));

    interactables.set('secret_bookshelf', {
      mesh: secretShelfMesh,
      data: {
        id: 'secret_bookshelf',
        type: 'puzzle',
        name: 'Peculiar Ornate Bookshelf',
        actionText: 'Pull "Shadows of Eldermere" Tome',
        position: [-11, 1.6, -9.5],
      },
    });

    group.add(shelfGroup);
    collisionBoxes.push(new THREE.Box3().setFromObject(shelfGroup));

    // Study Desk in Library
    const deskGroup = new THREE.Group();
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.2), woodTrimMat);
    deskTop.position.set(-10, 0.85, -4);
    deskGroup.add(deskTop);

    // Banker's Lamp with eerie green light
    const lampGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.2, 12);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x117733, roughness: 0.3 });
    const lampMesh = new THREE.Mesh(lampGeo, lampMat);
    lampMesh.position.set(-10.6, 1.05, -4);
    deskGroup.add(lampMesh);

    const greenLampLight = new THREE.PointLight(0x22ff66, 0.8, 5);
    greenLampLight.position.set(-10.6, 1.15, -4);
    group.add(greenLampLight);
    candles.push(greenLampLight);

    // Note 3 in Library (Treatise)
    const libNote = new THREE.Mesh(note1Geo, note1Mat);
    libNote.rotation.x = -Math.PI / 2;
    libNote.position.set(-9.8, 0.92, -4);
    deskGroup.add(libNote);

    interactables.set('note_library', {
      mesh: libNote,
      data: {
        id: 'note_library',
        type: 'note',
        name: 'Occult Treatise Note',
        actionText: 'Read "Shadows of Eldermere"',
        position: [-9.8, 0.92, -4],
      },
    });

    // Wall Safe behind portrait in Library
    const safeGroup = new THREE.Group();
    const safeBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.4), ironMat);
    safeBody.position.set(-14, 1.8, 1.7);
    safeGroup.add(safeBody);

    const dialMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), brassMat);
    dialMesh.rotation.x = Math.PI / 2;
    dialMesh.position.set(-14, 1.8, 1.5);
    safeGroup.add(dialMesh);
    group.add(safeGroup);

    interactables.set('puzzle_safe', {
      mesh: safeBody,
      data: {
        id: 'puzzle_safe',
        type: 'puzzle',
        name: 'Master Wall Safe',
        actionText: 'Enter 4-Digit Combination (7-4-1-9)',
        position: [-14, 1.8, 1.7],
      },
    });

    // ---------------------------------------------------------------------
    // 5. SECRET PASSAGE & BASEMENT / CELLAR (z: -10 to -24)
    // ---------------------------------------------------------------------
    // Corridor leading deep down to cellar
    addFloor(0, -16, 8, 12, floorStoneMat);
    addCeiling(0, -16, 8, 12, 3.2);

    addWall(-4, 0, -16, 0.3, 3.2, 12);
    addWall(4, 0, -16, 0.3, 3.2, 12);
    addWall(0, 0, -10, 8, 3.2, 0.3); // North wall of foyer with archway

    // Cellar Maintenance & Fuse Box Room (x: -4 to -14, z: -16 to -26)
    addFloor(-9, -21, 10, 10, floorStoneMat);
    addCeiling(-9, -21, 10, 10, 3.0);
    addWall(-14, 0, -21, 0.3, 3.0, 10);
    addWall(-9, 0, -26, 10, 3.0, 0.3);

    // Fuse Box on Wall
    const fuseGroup = new THREE.Group();
    const fuseBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.3), ironMat);
    fuseBoxMesh.position.set(-13.8, 1.5, -21);
    fuseGroup.add(fuseBoxMesh);

    // 5 switches indicators
    for (let s = 0; s < 5; s++) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.08), brassMat);
      sw.position.set(-13.6, 1.7 - s * 0.12, -21);
      fuseGroup.add(sw);
    }
    group.add(fuseGroup);

    interactables.set('puzzle_fusebox', {
      mesh: fuseBoxMesh,
      data: {
        id: 'puzzle_fusebox',
        type: 'puzzle',
        name: 'Cellar Circuit Breaker Box',
        actionText: 'Configure Electrical Switches',
        position: [-13.8, 1.5, -21],
      },
    });

    // Cellar Diagram Note
    const cellarNote = new THREE.Mesh(note1Geo, note1Mat);
    cellarNote.position.set(-13.7, 0.9, -21);
    group.add(cellarNote);

    interactables.set('note_cellar', {
      mesh: cellarNote,
      data: {
        id: 'note_cellar',
        type: 'note',
        name: 'Electrician\'s Diagram',
        actionText: 'Read Circuit Diagram',
        position: [-13.7, 0.9, -21],
      },
    });

    // ---------------------------------------------------------------------
    // 6. OCCULT SANCTUM & RITUAL ALTAR (x: 4 to 16, z: -16 to -26)
    // ---------------------------------------------------------------------
    addFloor(10, -21, 12, 10, floorStoneMat);
    addCeiling(10, -21, 12, 10, 3.4);
    addWall(16, 0, -21, 0.3, 3.4, 10);
    addWall(10, 0, -26, 12, 3.4, 0.3);

    // Central Altar
    const altarGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.9, 16);
    const altarMat = new THREE.MeshStandardMaterial({ map: altarTex, roughness: 0.7, color: 0x994444 });
    const altarMesh = new THREE.Mesh(altarGeo, altarMat);
    altarMesh.position.set(10, 0.45, -21);
    group.add(altarMesh);
    collisionBoxes.push(new THREE.Box3().setFromObject(altarMesh));

    // Occult Red Pulsing Light
    const altarLight = new THREE.PointLight(0xff1122, 1.5, 10);
    altarLight.position.set(10, 1.5, -21);
    group.add(altarLight);
    candles.push(altarLight);

    // 3 Relic Pedestals on the Altar
    [0, 1, 2].forEach((idx) => {
      const angle = (idx * 2 * Math.PI) / 3 - Math.PI / 2;
      const px = 10 + 0.9 * Math.cos(angle);
      const pz = -21 + 0.9 * Math.sin(angle);
      const pedestalGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 8);
      const ped = new THREE.Mesh(pedestalGeo, brassMat);
      ped.position.set(px, 0.95, pz);
      group.add(ped);
      altarPedestals.push(ped);
    });

    interactables.set('puzzle_altar', {
      mesh: altarMesh,
      data: {
        id: 'puzzle_altar',
        type: 'puzzle',
        name: 'The Eldermere Pentagram Altar',
        actionText: 'Place Ritual Relics & Banish Entity',
        position: [10, 0.9, -21],
      },
    });

    // Truth Final Note in Sanctum
    const truthNote = new THREE.Mesh(note1Geo, note1Mat);
    truthNote.position.set(10, 0.95, -21);
    truthNote.rotation.x = -Math.PI / 2;
    group.add(truthNote);

    interactables.set('note_truth', {
      mesh: truthNote,
      data: {
        id: 'note_truth',
        type: 'note',
        name: 'Arthur\'s Final Confession',
        actionText: 'Read Final Confession',
        position: [10, 0.95, -21],
      },
    });

    // Extra Battery in Sanctum
    const batSanctum = new THREE.Mesh(batGeo, batMat);
    batSanctum.position.set(14, 0.5, -24);
    group.add(batSanctum);

    interactables.set('bat_sanctum', {
      mesh: batSanctum,
      data: {
        id: 'bat_sanctum',
        type: 'battery',
        name: 'Zinc D-Cell Battery',
        actionText: 'Pick up Battery (+50%)',
        position: [14, 0.5, -24],
      },
    });

    return {
      group,
      interactables,
      collisionBoxes,
      doors,
      candles,
      clockHands: { hour: hourHand, minute: minHand },
      bookcaseMesh: secretBookcase,
      safeMesh: safeGroup,
      fuseBoxMesh: fuseGroup,
      altarPedestals,
      windows,
    };
  }
}
