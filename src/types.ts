/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameLocationTheme = 'whispering_house' | 'haunted_hospital' | 'scary_forest' | 'cursed_village';

export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'key' | 'tool' | 'battery' | 'relic' | 'clue';
  inspectableText?: string;
  usableOn?: string;
}

export interface LoreNote {
  id: string;
  title: string;
  date?: string;
  content: string;
  hint?: string;
  foundInRoom: string;
  author?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export type EndingType = 'escape' | 'banish' | 'consumed' | 'truth';

export interface GameEnding {
  type: EndingType;
  title: string;
  subtitle: string;
  story: string;
  verdict: string;
  badge: string;
}

export interface PuzzleState {
  clockSolved: boolean;
  clockTargetHour: number;
  clockTargetMinute: number;
  clockCurrentHour: number;
  clockCurrentMinute: number;

  fuseBoxSolved: boolean;
  fuseSwitches: boolean[]; // 5 switches
  fuseTarget: boolean[];

  symbolLockSolved: boolean;
  symbolDials: number[]; // 4 dials (0-3)
  symbolTarget: number[];

  safeSolved: boolean;
  safeCode: string;
  safeEntered: string;

  bookcaseUnlocked: boolean;
  ritualRelicsPlaced: {
    silverKey: boolean;
    bloodMedallion: boolean;
    starRelic: boolean;
  };
}

export interface InteractableObject {
  id: string;
  type: 'door' | 'item' | 'note' | 'puzzle' | 'battery' | 'switch' | 'container' | 'hiding_spot';
  name: string;
  actionText: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  requiresItem?: string;
  targetId?: string;
  locked?: boolean;
  opened?: boolean;
  collected?: boolean;
  customData?: any;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  mouseSensitivity: number;
  fov: number;
  filmGrain: boolean;
  vignette: boolean;
  crtEffect: boolean;
  flashlightFlicker: boolean;
  brightness: number;
}
