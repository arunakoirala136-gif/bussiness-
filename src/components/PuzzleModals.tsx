/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Lock, Zap, Sparkles, Shield, RotateCw, AlertTriangle } from 'lucide-react';
import { globalAudio } from '../audio/HorrorAudioEngine';
import { gameState } from '../game/gameState';

interface PuzzleModalProps {
  puzzleType: 'clock' | 'safe' | 'fusebox' | 'altar';
  onClose: () => void;
  onSolved: (type: string) => void;
}

export const PuzzleModals: React.FC<PuzzleModalProps> = ({ puzzleType, onClose, onSolved }) => {
  // Clock state
  const [hour, setHour] = useState(gameState.puzzles.clockCurrentHour);
  const [minute, setMinute] = useState(gameState.puzzles.clockCurrentMinute);

  // Safe state
  const [safeInput, setSafeInput] = useState('');

  // Fusebox state
  const [switches, setSwitches] = useState<boolean[]>([...gameState.puzzles.fuseSwitches]);

  // Altar state
  const [relics, setRelics] = useState({ ...gameState.puzzles.ritualRelicsPlaced });

  // 1. Clock Solver
  const handleClockChange = (hDelta: number, mDelta: number) => {
    globalAudio.playClockTick();
    let newH = (hour + hDelta) % 12;
    if (newH <= 0) newH += 12;
    let newM = (minute + mDelta) % 60;
    if (newM < 0) newM += 60;

    setHour(newH);
    setMinute(newM);
    gameState.puzzles.clockCurrentHour = newH;
    gameState.puzzles.clockCurrentMinute = newM;

    if (newH === gameState.puzzles.clockTargetHour && newM === gameState.puzzles.clockTargetMinute) {
      gameState.puzzles.clockSolved = true;
      globalAudio.playClockChime();
      globalAudio.playPuzzleSuccess();
      gameState.addItem({
        id: 'key_study',
        name: 'Master Study Brass Key',
        description: 'An ornate brass key that slid out of the Grandfather Clock secret drawer.',
        icon: 'key',
        category: 'key',
      });
      gameState.checkObjectiveProgression();
      onSolved('clock');
    }
  };

  // 2. Safe Solver
  const handleKeypadPress = (digit: string) => {
    if (safeInput.length >= 4) return;
    globalAudio.playFootstep('stone');
    const nextCode = safeInput + digit;
    setSafeInput(nextCode);

    if (nextCode.length === 4) {
      if (nextCode === gameState.puzzles.safeCode) {
        gameState.puzzles.safeSolved = true;
        globalAudio.playUnlock();
        globalAudio.playPuzzleSuccess();
        gameState.addItem({
          id: 'relic_silver_key',
          name: 'Silver Relic Key (Occult Anchor 1)',
          description: 'An ancient silver key inscribed with occult symbols.',
          icon: 'relic',
          category: 'relic',
        });
        gameState.addItem({
          id: 'key_main_gate',
          name: 'Heavy Iron Gate Key',
          description: 'The master key to the estate\'s main exit gate!',
          icon: 'key',
          category: 'key',
        });
        gameState.checkObjectiveProgression();
        onSolved('safe');
      } else {
        setTimeout(() => {
          globalAudio.playJumpscareStinger();
          setSafeInput('');
        }, 500);
      }
    }
  };

  // 3. Fusebox Solver
  const toggleSwitch = (index: number) => {
    globalAudio.playFlashlightClick(true);
    const updated = [...switches];
    updated[index] = !updated[index];
    setSwitches(updated);
    gameState.puzzles.fuseSwitches = updated;

    // Target: 1, 3, 5 ON; 2, 4 OFF
    const solved = updated.every((val, i) => val === gameState.puzzles.fuseTarget[i]);
    if (solved) {
      gameState.puzzles.fuseBoxSolved = true;
      globalAudio.playPuzzleSuccess();
      gameState.addItem({
        id: 'relic_star',
        name: 'Star of Eldermere (Occult Anchor 3)',
        description: 'A radiant golden celestial emblem recovered from the powered vault.',
        icon: 'relic',
        category: 'relic',
      });
      gameState.checkObjectiveProgression();
      onSolved('fusebox');
    }
  };

  // 4. Ritual Altar Solver
  const handlePlaceRelic = (relicKey: 'silverKey' | 'bloodMedallion' | 'starRelic', itemId: string) => {
    if (!gameState.hasItem(itemId) && !relics[relicKey]) return;
    globalAudio.playItemPickup();
    const updated = { ...relics, [relicKey]: true };
    setRelics(updated);
    gameState.puzzles.ritualRelicsPlaced = updated;
    gameState.removeItem(itemId);
  };

  const handleTriggerBanishment = () => {
    if (relics.silverKey && (relics.bloodMedallion || true) && (relics.starRelic || true)) {
      globalAudio.playPuzzleSuccess();
      gameState.triggerEnding('banish');
    }
  };

  return (
    <div id="puzzle-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 p-6 border border-zinc-700 shadow-2xl text-zinc-200 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. CLOCK MODAL */}
        {puzzleType === 'clock' && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-amber-400 tracking-wider">GRANDFATHER CLOCK MECHANISM</h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              "When darkness falls upon the chime... at THREE the spirits wake, a QUARTER PAST the seals shall break."
            </p>

            {/* Clock Face Display */}
            <div className="relative my-6 flex h-48 w-48 items-center justify-center rounded-full bg-zinc-900 border-4 border-amber-800 shadow-inner">
              <div className="absolute inset-0 rounded-full border border-amber-600/30" />
              {/* Roman Numerals */}
              <span className="absolute top-2 text-xs font-bold text-amber-300">XII</span>
              <span className="absolute right-3 text-xs font-bold text-amber-300">III</span>
              <span className="absolute bottom-2 text-xs font-bold text-amber-300">VI</span>
              <span className="absolute left-3 text-xs font-bold text-amber-300">IX</span>

              {/* Hour Hand */}
              <div
                className="absolute h-14 w-1 bg-amber-200 origin-bottom rounded transition-transform duration-300 shadow-md"
                style={{
                  bottom: '50%',
                  transform: `rotate(${((hour % 12) + minute / 60) * 30}deg)`,
                }}
              />
              {/* Minute Hand */}
              <div
                className="absolute h-20 w-0.5 bg-rose-400 origin-bottom rounded transition-transform duration-300 shadow-md"
                style={{
                  bottom: '50%',
                  transform: `rotate(${minute * 6}deg)`,
                }}
              />
              <div className="h-3 w-3 rounded-full bg-amber-500 z-10" />
            </div>

            {/* Current Time Display */}
            <div className="text-2xl font-bold text-white tracking-widest bg-black/60 px-6 py-2 rounded-lg border border-zinc-700">
              {String(hour).padStart(2, '0')} : {String(minute).padStart(2, '0')}
            </div>

            {/* Adjustment Controls */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleClockChange(-1, 0)}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 active:scale-95 border border-zinc-600"
              >
                Hour -
              </button>
              <button
                onClick={() => handleClockChange(1, 0)}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 active:scale-95 border border-zinc-600"
              >
                Hour +
              </button>
              <button
                onClick={() => handleClockChange(0, -15)}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 active:scale-95 border border-zinc-600"
              >
                Min -15
              </button>
              <button
                onClick={() => handleClockChange(0, 15)}
                className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 active:scale-95 border border-zinc-600"
              >
                Min +15
              </button>
            </div>

            {gameState.puzzles.clockSolved && (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold animate-bounce">
                <Check className="h-5 w-5" /> Clock drawer opened! Acquired Master Study Key.
              </div>
            )}
          </div>
        )}

        {/* 2. SAFE MODAL */}
        {puzzleType === 'safe' && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-amber-400 tracking-wider">MASTER WALL SAFE</h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              Enter the 4-digit code found in the Occult Scholar's Treatise (7-4-1-9).
            </p>

            {/* Code Display Screen */}
            <div className="my-5 flex h-14 w-56 items-center justify-center rounded-lg bg-black border-2 border-amber-600/60 text-2xl font-mono tracking-widest text-amber-400 shadow-inner">
              {safeInput.padEnd(4, '_')}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-48">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') setSafeInput('');
                    else if (key !== 'OK') handleKeypadPress(key);
                  }}
                  className="flex h-12 items-center justify-center rounded-lg bg-zinc-800 text-lg font-bold text-zinc-200 hover:bg-zinc-700 hover:text-amber-300 active:scale-95 border border-zinc-700 shadow"
                >
                  {key}
                </button>
              ))}
            </div>

            {gameState.puzzles.safeSolved && (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold animate-bounce">
                <Check className="h-5 w-5" /> Safe Unlocked! Acquired Silver Relic & Iron Gate Key!
              </div>
            )}
          </div>
        )}

        {/* 3. FUSE BOX MODAL */}
        {puzzleType === 'fusebox' && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-amber-400 tracking-wider">CELLAR CIRCUIT BREAKER</h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              Align the 5 breaker switches according to the electrical diagram (ON, OFF, ON, OFF, ON).
            </p>

            {/* 5 Breaker Switches */}
            <div className="my-6 flex gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-700">
              {switches.map((isOn, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-zinc-400">#0{idx + 1}</span>
                  <button
                    onClick={() => toggleSwitch(idx)}
                    className={`h-24 w-10 rounded-lg border-2 flex flex-col justify-between p-1 transition-all ${
                      isOn
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        : 'bg-zinc-800 border-zinc-600'
                    }`}
                  >
                    <div
                      className={`h-8 w-full rounded transition-all ${
                        isOn ? 'bg-amber-400 shadow-md' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="text-[9px] font-bold text-zinc-300">{isOn ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              ))}
            </div>

            {gameState.puzzles.fuseBoxSolved && (
              <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm font-bold animate-bounce">
                <Zap className="h-5 w-5" /> Power Restored! Vault unlocked (Star of Eldermere obtained).
              </div>
            )}
          </div>
        )}

        {/* 4. OCCULT ALTAR MODAL */}
        {puzzleType === 'altar' && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-rose-500 tracking-wider">THE ELDERMERE RITUAL ALTAR</h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-md">
              Place the three anchor relics onto the pentagram pedestals to banish the Whispering Presence.
            </p>

            {/* Relic Slots */}
            <div className="my-6 grid grid-cols-3 gap-4">
              {/* Relic 1 */}
              <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 border border-zinc-700">
                <span className="text-[10px] text-zinc-400">RELIC 1</span>
                <span className="text-xs font-bold text-zinc-200">Silver Key</span>
                {relics.silverKey ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlaceRelic('silverKey', 'relic_silver_key')}
                    disabled={!gameState.hasItem('relic_silver_key')}
                    className={`h-12 w-24 rounded text-xs font-bold transition-all ${
                      gameState.hasItem('relic_silver_key')
                        ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-md'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {gameState.hasItem('relic_silver_key') ? 'Place Key' : 'Missing'}
                  </button>
                )}
              </div>

              {/* Relic 2 */}
              <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 border border-zinc-700">
                <span className="text-[10px] text-zinc-400">RELIC 2</span>
                <span className="text-xs font-bold text-zinc-200">Blood Medallion</span>
                {relics.bloodMedallion ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlaceRelic('bloodMedallion', 'relic_blood_medallion')}
                    className="h-12 w-24 rounded bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-md"
                  >
                    Place Medallion
                  </button>
                )}
              </div>

              {/* Relic 3 */}
              <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-3 border border-zinc-700">
                <span className="text-[10px] text-zinc-400">RELIC 3</span>
                <span className="text-xs font-bold text-zinc-200">Star Relic</span>
                {relics.starRelic ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                    <Check className="h-6 w-6" />
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlaceRelic('starRelic', 'relic_star')}
                    disabled={!gameState.hasItem('relic_star')}
                    className={`h-12 w-24 rounded text-xs font-bold transition-all ${
                      gameState.hasItem('relic_star')
                        ? 'bg-purple-500 text-white hover:bg-purple-400 shadow-md'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {gameState.hasItem('relic_star') ? 'Place Star' : 'Missing'}
                  </button>
                )}
              </div>
            </div>

            {/* Trigger Banishment */}
            <button
              onClick={handleTriggerBanishment}
              className="mt-2 flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-rose-500 active:scale-95 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              ACTIVATE BANISHMENT RITUAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
