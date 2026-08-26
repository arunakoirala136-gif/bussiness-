/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { globalAudio } from './audio/HorrorAudioEngine';
import { gameState, INITIAL_LORE_NOTES } from './game/gameState';
import { HorrorWorld } from './game/three/HorrorWorld';
import { GameEnding, GameLocationTheme, GameSettings, InteractableObject, LoreNote } from './types';

// UI Components
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PuzzleModals } from './components/PuzzleModals';
import { InventoryJournalModal } from './components/InventoryJournalModal';
import { InspectModal } from './components/InspectModal';
import { PauseSettingsModal } from './components/PauseSettingsModal';
import { EndGameScreen } from './components/EndGameScreen';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const horrorWorldRef = useRef<HorrorWorld | null>(null);

  // App & Screen States
  const [inTitleScreen, setInTitleScreen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GameLocationTheme>('whispering_house');

  // Dynamic In-Game Reactive States
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [sanityLevel, setSanityLevel] = useState(100);
  const [currentRoom, setCurrentRoom] = useState('Grand Foyer');
  const [interactPrompt, setInteractPrompt] = useState<InteractableObject | null>(null);
  const [inventoryList, setInventoryList] = useState(gameState.inventory);
  const [notesList, setNotesList] = useState<LoreNote[]>([]);
  const [objectivesList, setObjectivesList] = useState(gameState.objectives);
  const [activeEnding, setActiveEnding] = useState<GameEnding | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'inventory' | 'journal' | 'map' | 'clock' | 'safe' | 'fusebox' | 'altar' | 'inspect' | 'settings'
  >('none');
  const [inspectedNote, setInspectedNote] = useState<LoreNote | null>(null);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    sfxVolume: 0.9,
    ambientVolume: 0.6,
    mouseSensitivity: 1.0,
    fov: 75,
    filmGrain: true,
    vignette: true,
    crtEffect: false,
    flashlightFlicker: true,
    brightness: 1.0,
  });

  // Start / Enter Game
  const handleStartGame = (theme: GameLocationTheme) => {
    setCurrentTheme(theme);
    gameState.resetGame(theme);
    setBatteryLevel(100);
    setFlashlightOn(true);
    setSanityLevel(100);
    setCurrentRoom(theme === 'haunted_hospital' ? 'Asylum Ward' : 'Grand Foyer');
    setInventoryList([...gameState.inventory]);
    setNotesList([]);
    setObjectivesList([...gameState.objectives]);
    setActiveEnding(null);
    setActiveModal('none');

    // Init Horror Audio Engine
    globalAudio.init();
    globalAudio.resume();

    setInTitleScreen(false);
  };

  // Mount 3D World when entering game
  useEffect(() => {
    if (inTitleScreen || !containerRef.current) return;

    // Cleanup previous world instance if any
    if (horrorWorldRef.current) {
      horrorWorldRef.current.destroy();
    }

    const world = new HorrorWorld(containerRef.current, settings, currentTheme);
    horrorWorldRef.current = world;

    // Register World Callbacks
    world.onInteractPromptChange = (hit) => setInteractPrompt(hit);
    world.onRoomChange = (room) => setCurrentRoom(room);
    world.onSanityChange = (sanity) => setSanityLevel(sanity);
    world.onBatteryChange = (bat) => setBatteryLevel(bat);

    return () => {
      world.destroy();
      horrorWorldRef.current = null;
    };
  }, [inTitleScreen, currentTheme]);

  // Sync settings with 3D engine & audio
  useEffect(() => {
    globalAudio.setVolumes(settings.masterVolume, settings.sfxVolume, settings.ambientVolume);
    if (horrorWorldRef.current) {
      horrorWorldRef.current.settings = settings;
      horrorWorldRef.current.setCameraFOV(settings.fov);
      horrorWorldRef.current.setExposure(settings.brightness);
    }
  }, [settings]);

  // Sync game over / endings
  useEffect(() => {
    const checkGameOver = setInterval(() => {
      if (gameState.gameOver && gameState.ending && !activeEnding) {
        setActiveEnding(gameState.ending);
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
    }, 300);
    return () => clearInterval(checkGameOver);
  }, [activeEnding]);

  // Request Pointer Lock on Canvas Click
  const handleCanvasClick = () => {
    if (activeModal !== 'none' || activeEnding || isPaused) return;
    if (containerRef.current && !document.pointerLockElement) {
      containerRef.current.requestPointerLock();
    }
  };

  // Keyboard Shortcuts (E for interact, TAB for Journal, ESC for pause/modal close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTitleScreen || activeEnding) return;

      if (e.code === 'KeyE' || e.code === 'Space') {
        if (activeModal === 'none') {
          handleTriggerInteraction();
        }
      } else if (e.code === 'Tab' || e.code === 'KeyI') {
        e.preventDefault();
        if (activeModal === 'none') {
          if (document.pointerLockElement) document.exitPointerLock();
          setActiveModal('inventory');
        } else if (activeModal === 'inventory' || activeModal === 'journal') {
          setActiveModal('none');
        }
      } else if (e.code === 'KeyM') {
        if (activeModal === 'none') {
          if (document.pointerLockElement) document.exitPointerLock();
          setActiveModal('map');
        } else if (activeModal === 'map') {
          setActiveModal('none');
        }
      } else if (e.code === 'Escape') {
        if (activeModal !== 'none') {
          setActiveModal('none');
        } else {
          setIsPaused(!isPaused);
          if (document.pointerLockElement) document.exitPointerLock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inTitleScreen, activeModal, isPaused, activeEnding, interactPrompt]);

  // Trigger Action on Current Highlighted Object
  const handleTriggerInteraction = () => {
    if (!interactPrompt || !horrorWorldRef.current) return;
    const target = interactPrompt;

    if (target.type === 'item') {
      if (target.id === 'item_flashlight') {
        globalAudio.playItemPickup();
        gameState.addItem({
          id: 'flashlight',
          name: 'Heavy Brass Flashlight',
          description: 'A vintage metal flashlight. Essential for surviving.',
          icon: 'flashlight',
          category: 'tool',
        });
        horrorWorldRef.current.removeInteractableMesh(target.id);
        gameState.checkObjectiveProgression();
        setInventoryList([...gameState.inventory]);
        setObjectivesList([...gameState.objectives]);
      }
    } else if (target.type === 'battery') {
      globalAudio.playItemPickup();
      gameState.batteryLevel = Math.min(100, gameState.batteryLevel + 50);
      setBatteryLevel(gameState.batteryLevel);
      horrorWorldRef.current.removeInteractableMesh(target.id);
      gameState.checkObjectiveProgression();
      setObjectivesList([...gameState.objectives]);
    } else if (target.type === 'note') {
      globalAudio.playCreepyWhisper();
      const foundNote = INITIAL_LORE_NOTES.find((n) => n.id === target.id) || {
        id: target.id,
        title: target.name,
        content: 'The handwriting is smudged with dried blood...',
        foundInRoom: currentRoom,
      };
      gameState.addNote(foundNote);
      setNotesList([...gameState.notes]);
      setInspectedNote(foundNote);
      if (document.pointerLockElement) document.exitPointerLock();
      setActiveModal('inspect');
    } else if (target.type === 'puzzle') {
      if (target.id === 'puzzle_clock') {
        if (document.pointerLockElement) document.exitPointerLock();
        setActiveModal('clock');
      } else if (target.id === 'puzzle_safe') {
        if (document.pointerLockElement) document.exitPointerLock();
        setActiveModal('safe');
      } else if (target.id === 'puzzle_fusebox') {
        if (document.pointerLockElement) document.exitPointerLock();
        setActiveModal('fusebox');
      } else if (target.id === 'puzzle_altar') {
        if (document.pointerLockElement) document.exitPointerLock();
        setActiveModal('altar');
      } else if (target.id === 'secret_bookshelf') {
        horrorWorldRef.current.openSecretBookcase();
        gameState.puzzles.bookcaseUnlocked = true;
        gameState.checkObjectiveProgression();
        setObjectivesList([...gameState.objectives]);
      }
    } else if (target.type === 'door') {
      if (target.id === 'main_gate') {
        if (gameState.hasItem('key_main_gate') || gameState.puzzles.safeSolved) {
          globalAudio.playUnlock();
          gameState.triggerEnding('escape');
        } else {
          globalAudio.playDoorSqueak(false);
          // Show hint tooltip
        }
      } else if (target.id === 'door_foyer_parlor') {
        globalAudio.playDoorSqueak(true);
      } else if (target.id === 'door_foyer_study') {
        if (gameState.hasItem('key_study') || gameState.puzzles.clockSolved) {
          globalAudio.playUnlock();
          globalAudio.playDoorSqueak(true);
        } else {
          globalAudio.playDoorSqueak(false);
        }
      }
    }
  };

  const handlePuzzleSolved = (type: string) => {
    setInventoryList([...gameState.inventory]);
    setObjectivesList([...gameState.objectives]);
    if (horrorWorldRef.current && type === 'clock') {
      horrorWorldRef.current.updateClockHands(3, 15);
    }
  };

  const handleUpdateSettings = (newSet: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSet }));
  };

  return (
    <div id="horror-game-app" className="relative h-screen w-screen overflow-hidden bg-black font-sans text-white select-none">
      {/* 1. Title Screen */}
      {inTitleScreen && <TitleScreen onStartGame={handleStartGame} />}

      {/* 2. Main 3D Game Canvas */}
      {!inTitleScreen && (
        <div className="relative h-full w-full">
          {/* 3D WebGL Canvas Container */}
          <div
            id="three-canvas-container"
            ref={containerRef}
            onClick={handleCanvasClick}
            className="h-full w-full cursor-crosshair"
          />

          {/* Screen FX: Vignette & Sanity Border */}
          {settings.vignette && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] z-10" />
          )}

          {/* Sanity Danger Pulse (when sanity < 35%) */}
          {sanityLevel < 35 && (
            <div className="pointer-events-none absolute inset-0 border-8 border-rose-900/40 animate-pulse z-15 shadow-[inset_0_0_80px_rgba(220,38,38,0.5)]" />
          )}

          {/* Film Grain & Scanlines */}
          {settings.filmGrain && (
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-repeat bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] z-10" />
          )}

          {/* HUD Overlay */}
          <HUD
            batteryLevel={batteryLevel}
            flashlightOn={flashlightOn}
            sanityLevel={sanityLevel}
            currentRoom={currentRoom}
            interactPrompt={interactPrompt}
            objectives={objectivesList}
            settings={settings}
            onToggleFlashlight={() => horrorWorldRef.current?.toggleFlashlight()}
            onReloadBattery={() => horrorWorldRef.current?.reloadBattery()}
            onOpenInventory={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              setActiveModal('inventory');
            }}
            onOpenMap={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              setActiveModal('map');
            }}
            onOpenSettings={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              setIsPaused(true);
            }}
            onTriggerInteract={handleTriggerInteraction}
            onTouchMove={(v) => {
              if (horrorWorldRef.current) horrorWorldRef.current.touchMoveVector = v;
            }}
            onTouchLook={(v) => {
              if (horrorWorldRef.current) horrorWorldRef.current.touchLookVector = v;
            }}
          />

          {/* Modals */}
          {/* Inventory, Journal & Map Modal */}
          {(activeModal === 'inventory' || activeModal === 'journal' || activeModal === 'map') && (
            <InventoryJournalModal
              initialTab={activeModal}
              inventory={inventoryList}
              notes={notesList}
              currentRoom={currentRoom}
              onClose={() => setActiveModal('none')}
            />
          )}

          {/* Inspect Single Note Modal */}
          {activeModal === 'inspect' && inspectedNote && (
            <InspectModal note={inspectedNote} onClose={() => setActiveModal('none')} />
          )}

          {/* Puzzle Modals (Clock, Safe, Fusebox, Altar) */}
          {(activeModal === 'clock' ||
            activeModal === 'safe' ||
            activeModal === 'fusebox' ||
            activeModal === 'altar') && (
            <PuzzleModals
              puzzleType={activeModal}
              onClose={() => setActiveModal('none')}
              onSolved={handlePuzzleSolved}
            />
          )}

          {/* Pause & Settings Modal */}
          {isPaused && (
            <PauseSettingsModal
              settings={settings}
              currentTheme={currentTheme}
              onResume={() => setIsPaused(false)}
              onRestart={() => handleStartGame(currentTheme)}
              onUpdateSettings={handleUpdateSettings}
              onSelectTheme={(t) => {
                setIsPaused(false);
                handleStartGame(t);
              }}
            />
          )}

          {/* End Game Screen */}
          {activeEnding && (
            <EndGameScreen
              ending={activeEnding}
              timeElapsedSec={gameState.timeElapsedSec}
              notesCollectedCount={notesList.length}
              finalSanity={sanityLevel}
              onRestart={() => handleStartGame(currentTheme)}
            />
          )}
        </div>
      )}
    </div>
  );
}
