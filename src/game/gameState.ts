/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EndingType, GameEnding, GameItem, GameLocationTheme, LoreNote, Objective, PuzzleState } from '../types';

export const INITIAL_LORE_NOTES: LoreNote[] = [
  {
    id: 'note_foyer',
    title: 'Waterlogged Journal Entry - Nov 14, 1928',
    date: 'November 14, 1928',
    foundInRoom: 'Grand Foyer',
    author: 'Lord Arthur Eldermere',
    content: `The storm outside will not abate. The knocking inside the walls has grown louder since midnight. 
Eleanor claims she heard our daughter laughing in the sealed basement, but Evelyn has been gone for three winters. 
If anyone finds this... do NOT trust the shadows when the lights flicker. Keep the flashlight fed with zinc cells.`,
    hint: 'Search nearby tables for fresh batteries and inspect locked doors.',
  },
  {
    id: 'note_parlor',
    title: 'Poem on the Parlor Mantle',
    date: 'Unknown',
    foundInRoom: 'The Parlor',
    author: 'Eleanor Eldermere',
    content: `When darkness falls upon the chime,
The dead awaken in lost time.
At THREE the restless spirits wake,
A QUARTER PAST the seals shall break.
Set the great hands where shadows gleam,
To pierce the veil of Arthur's dream.`,
    hint: 'Grandfather clock must be set to 3:15 to unlock the secret drawer.',
  },
  {
    id: 'note_library',
    title: 'Occult Treatise: "Shadows of Eldermere"',
    date: 'October 3, 1927',
    foundInRoom: 'The Library',
    author: 'Occult Scholar Thorne',
    content: `The entity cannot be destroyed by iron or flame. It binds itself to three anchor relics:
1. The Silver Relic Key (hidden inside the Master Safe - Code 7-4-1-9).
2. The Blood Medallion (sealed in the Attic Chest).
3. The Star of Eldermere (resting behind the locked Cellar gate).
Place all three upon the Pentagram in the depths to banish the Whispering Presence for all eternity.`,
    hint: 'Safe code is 7419. Gathering all 3 relics allows the Banishment Ending!',
  },
  {
    id: 'note_cellar',
    title: 'Engineer\'s Electrical Diagram',
    date: 'August 1928',
    foundInRoom: 'Cellar Maintenance',
    author: 'Chief Electrician Vance',
    content: `The auxiliary generator breaker was tripped after the flood. 
To route power to the Occult Chamber and illuminate the basement corridors, set switches 1, 3, and 5 UP (ON), while keeping switches 2 and 4 DOWN (OFF).`,
    hint: 'Fuse Box configuration: ON, OFF, ON, OFF, ON (1, 3, 5).',
  },
  {
    id: 'note_attic',
    title: 'Torn Diary Page of Evelyn',
    date: 'December 1927',
    foundInRoom: 'Dusty Attic',
    author: 'Little Evelyn',
    content: `The whispers are not monsters... they are memories. Father tried to pull me back across the veil, but he opened the gate to something vast and hungry. 
I left the Blood Medallion here. If you are reading this, please finish what he started, or run as fast as you can.`,
    hint: 'The ritual can set the trapped spirits free.',
  },
  {
    id: 'note_truth',
    title: 'Confession of Arthur Eldermere',
    date: 'Final Entry - Dec 31, 1928',
    foundInRoom: 'Secret Occult Sanctum',
    author: 'Lord Arthur Eldermere',
    content: `It was not a curse from without, but our own grief that invited it. I traded my soul for one more hour with my daughter. 
Now we are woven into the very timber and mortar of this estate. Whoever you are, you now know the entire truth of Eldermere.`,
    hint: 'Finding this completes the Secret Truth condition!',
  },
];

export const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: 'obj_flashlight',
    title: 'Find Light & Batteries',
    description: 'Search the Grand Foyer to pick up your heavy brass flashlight and extra batteries.',
    completed: false,
    order: 1,
  },
  {
    id: 'obj_clock',
    title: 'Solve the Grandfather Clock Riddle',
    description: 'Read the poem in the Parlor and align the clock hands to 3:15.',
    completed: false,
    order: 2,
  },
  {
    id: 'obj_library_secret',
    title: 'Unlock Library Passage & Safe',
    description: 'Inspect the bookshelf to find "Shadows of Eldermere" and unlock the safe with code 7419.',
    completed: false,
    order: 3,
  },
  {
    id: 'obj_fuse_box',
    title: 'Restore Power in the Cellar',
    description: 'Navigate down to the Cellar and configure the 5 fuse switches.',
    completed: false,
    order: 4,
  },
  {
    id: 'obj_escape_or_banish',
    title: 'Escape the House OR Banish the Entity',
    description: 'Use the Main Gate Key to escape the estate, or place the 3 Relics on the Altar to banish the whispers forever.',
    completed: false,
    order: 5,
  },
];

export const ENDINGS_DATA: Record<EndingType, GameEnding> = {
  escape: {
    type: 'escape',
    title: 'ENDING 1: THE LONE SURVIVOR',
    subtitle: 'Escaped into the Storm',
    story: `You pushed open the heavy iron gate into the howling rain. The whispers behind you rose into a furious screech before fading into the night wind. You survived... but the memories of the Whispering House will haunt your dreams for the rest of your life.`,
    verdict: 'SURVIVED - THE GATES ARE CLOSED',
    badge: 'Survivor',
  },
  banish: {
    type: 'banish',
    title: 'ENDING 2: THE PURIFIER',
    subtitle: 'The Curse is Lifted',
    story: `As the third relic snapped into the ritual altar, brilliant blinding light surged across the house. The shadow entity dissolved into weeping mist, and the trapped souls of the Eldermere family found peace at last. Dawn broke through the shattered stained-glass windows.`,
    verdict: 'TRUE HERO - RITUAL COMPLETED',
    badge: 'Purifier',
  },
  consumed: {
    type: 'consumed',
    title: 'ENDING 3: CONSUMED BY WHISPERS',
    subtitle: 'Lost to the Void',
    story: `Your sanity collapsed under the relentless whispers and crushing darkness. The shadow presence enveloped you completely, pulling you into the cold walls. You are now another voice whispering in the dark for future trespassers to hear.`,
    verdict: 'LOST TO THE VOID - SANITY DEPLETED',
    badge: 'Lost Soul',
  },
  truth: {
    type: 'truth',
    title: 'ENDING 4: THE SECRET TRUTH',
    subtitle: 'The Eldermere Legacy Solved',
    story: `Having gathered every lost diary entry and decoded Arthur\'s final confession, you banished the darkness with complete knowledge of the tragedy. You not only survived, but you brought the true story of the Eldermere family to light, sealing the rift between worlds.`,
    verdict: 'MASTER INVESTIGATOR - 100% LORE DISCOVERED',
    badge: 'Master Sleuth',
  },
};

export class GameStateManager {
  public theme: GameLocationTheme = 'whispering_house';
  public flashlightOn: boolean = true;
  public batteryLevel: number = 100; // 0 - 100
  public sanityLevel: number = 100; // 0 - 100
  public currentRoomName: string = 'Grand Foyer';

  public inventory: GameItem[] = [
    {
      id: 'flashlight',
      name: 'Heavy Brass Flashlight',
      description: 'A vintage metal flashlight. Essential for surviving the pitch dark.',
      icon: 'flashlight',
      category: 'tool',
    },
    {
      id: 'battery_1',
      name: 'Zinc D-Cell Battery',
      description: 'Restores 45% flashlight charge. Press [R] to reload.',
      icon: 'battery',
      category: 'battery',
    },
  ];

  public notes: LoreNote[] = [];
  public objectives: Objective[] = JSON.parse(JSON.stringify(INITIAL_OBJECTIVES));
  public puzzles: PuzzleState = {
    clockSolved: false,
    clockTargetHour: 3,
    clockTargetMinute: 15,
    clockCurrentHour: 12,
    clockCurrentMinute: 0,

    fuseBoxSolved: false,
    fuseSwitches: [false, false, false, false, false],
    fuseTarget: [true, false, true, false, true], // 1, 3, 5 ON

    symbolLockSolved: false,
    symbolDials: [0, 0, 0, 0],
    symbolTarget: [2, 1, 3, 0], // Crow, Moon, Eye, Skull

    safeSolved: false,
    safeCode: '7419',
    safeEntered: '',

    bookcaseUnlocked: false,
    ritualRelicsPlaced: {
      silverKey: false,
      bloodMedallion: false,
      starRelic: false,
    },
  };

  public unlockedDoors: Set<string> = new Set(['door_foyer_parlor']);
  public openedContainers: Set<string> = new Set();
  public activeJumpscares: Set<string> = new Set();
  public timeElapsedSec: number = 0;
  public gameOver: boolean = false;
  public ending: GameEnding | null = null;

  public resetGame(newTheme: GameLocationTheme = 'whispering_house') {
    this.theme = newTheme;
    this.flashlightOn = true;
    this.batteryLevel = 100;
    this.sanityLevel = 100;
    this.currentRoomName = newTheme === 'haunted_hospital' ? 'Asylum Ward A' : (newTheme === 'scary_forest' ? 'Forgotten Cabin' : 'Grand Foyer');
    this.inventory = [
      {
        id: 'flashlight',
        name: 'Heavy Brass Flashlight',
        description: 'A vintage metal flashlight. Essential for surviving the dark.',
        icon: 'flashlight',
        category: 'tool',
      },
      {
        id: 'battery_1',
        name: 'Zinc D-Cell Battery',
        description: 'Restores 45% flashlight charge.',
        icon: 'battery',
        category: 'battery',
      },
    ];
    this.notes = [];
    this.objectives = JSON.parse(JSON.stringify(INITIAL_OBJECTIVES));
    this.puzzles = {
      clockSolved: false,
      clockTargetHour: 3,
      clockTargetMinute: 15,
      clockCurrentHour: 12,
      clockCurrentMinute: 0,
      fuseBoxSolved: false,
      fuseSwitches: [false, false, false, false, false],
      fuseTarget: [true, false, true, false, true],
      symbolLockSolved: false,
      symbolDials: [0, 0, 0, 0],
      symbolTarget: [2, 1, 3, 0],
      safeSolved: false,
      safeCode: '7419',
      safeEntered: '',
      bookcaseUnlocked: false,
      ritualRelicsPlaced: {
        silverKey: false,
        bloodMedallion: false,
        starRelic: false,
      },
    };
    this.unlockedDoors = new Set(['door_foyer_parlor']);
    this.openedContainers = new Set();
    this.activeJumpscares = new Set();
    this.timeElapsedSec = 0;
    this.gameOver = false;
    this.ending = null;
  }

  public addItem(item: GameItem) {
    if (!this.inventory.find((i) => i.id === item.id)) {
      this.inventory.push(item);
    }
  }

  public removeItem(itemId: string) {
    this.inventory = this.inventory.filter((i) => i.id !== itemId);
  }

  public hasItem(itemId: string): boolean {
    return this.inventory.some((i) => i.id === itemId);
  }

  public addNote(note: LoreNote) {
    if (!this.notes.find((n) => n.id === note.id)) {
      this.notes.push(note);
    }
  }

  public reloadBattery(): boolean {
    const batteryIdx = this.inventory.findIndex((i) => i.category === 'battery');
    if (batteryIdx !== -1) {
      this.inventory.splice(batteryIdx, 1);
      this.batteryLevel = Math.min(100, this.batteryLevel + 50);
      return true;
    }
    return false;
  }

  public checkObjectiveProgression() {
    // 1. Light & battery
    if (this.inventory.some((i) => i.id.startsWith('battery')) && this.objectives[0]) {
      this.objectives[0].completed = true;
    }
    // 2. Clock
    if (this.puzzles.clockSolved && this.objectives[1]) {
      this.objectives[1].completed = true;
    }
    // 3. Library / Safe
    if ((this.puzzles.bookcaseUnlocked || this.puzzles.safeSolved) && this.objectives[2]) {
      this.objectives[2].completed = true;
    }
    // 4. Fuse box
    if (this.puzzles.fuseBoxSolved && this.objectives[3]) {
      this.objectives[3].completed = true;
    }
    // 5. Relics or gate
    const relicsPlaced = Object.values(this.puzzles.ritualRelicsPlaced).filter(Boolean).length;
    if (relicsPlaced >= 3 || this.hasItem('key_main_gate')) {
      if (this.objectives[4]) this.objectives[4].completed = true;
    }
  }

  public triggerEnding(type: EndingType) {
    this.gameOver = true;
    // Check if player collected all 6 notes for Truth ending
    if (type === 'banish' && this.notes.length >= 5) {
      this.ending = ENDINGS_DATA.truth;
    } else {
      this.ending = ENDINGS_DATA[type];
    }
  }
}

export const gameState = new GameStateManager();
