/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Volume2, Sliders, Eye, Sun, Sparkles, RefreshCw, Play, Home, Check } from 'lucide-react';
import { GameLocationTheme, GameSettings } from '../types';

interface PauseSettingsModalProps {
  settings: GameSettings;
  currentTheme: GameLocationTheme;
  onResume: () => void;
  onRestart: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onSelectTheme: (theme: GameLocationTheme) => void;
}

export const PauseSettingsModal: React.FC<PauseSettingsModalProps> = ({
  settings,
  currentTheme,
  onResume,
  onRestart,
  onUpdateSettings,
  onSelectTheme,
}) => {
  const themes: { id: GameLocationTheme; name: string; desc: string }[] = [
    {
      id: 'whispering_house',
      name: 'The Whispering House',
      desc: 'Abandoned Victorian estate on a dark stormy night filled with supernatural secrets.',
    },
    {
      id: 'haunted_hospital',
      name: 'Haunted Asylum (Ward 404)',
      desc: 'Decommissioned psychiatric hospital with medical ward horrors and flickering bulbs.',
    },
    {
      id: 'scary_forest',
      name: 'Blackwood Forest Cabin',
      desc: 'Remote decaying cabin surrounded by whispering fog and ancient eldritch trees.',
    },
    {
      id: 'cursed_village',
      name: 'Ravenbrook Cursed Hamlet',
      desc: 'Deserted 18th-century cobblestone village steeped in witch folklore.',
    },
  ];

  return (
    <div id="pause-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-fade-in font-mono text-zinc-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-zinc-950 p-6 border border-zinc-800 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-400 tracking-wider">GAME PAUSED</h2>
            <p className="text-xs text-zinc-400">Atmospheric 3D Horror Settings & Environment</p>
          </div>
          <button
            onClick={onResume}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="my-6 space-y-6">
          {/* Audio Controls */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-3">
              <Volume2 className="h-4 w-4" />
              <span>AUDIO LEVELS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Master Volume</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>SFX & Footsteps</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Storm & Drone</span>
                  <span>{Math.round(settings.ambientVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => onUpdateSettings({ ambientVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Gameplay & Visual Controls */}
          <div className="border-t border-zinc-800 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-3">
              <Sliders className="h-4 w-4" />
              <span>GAMEPLAY & DISPLAY</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Look Sensitivity</span>
                  <span>{settings.mouseSensitivity.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Camera FOV</span>
                  <span>{settings.fov}°</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={settings.fov}
                  onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Exposure / Brightness</span>
                  <span>{settings.brightness.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={settings.brightness}
                  onChange={(e) => onUpdateSettings({ brightness: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>
            </div>

            {/* Post Process Toggles */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => onUpdateSettings({ filmGrain: !settings.filmGrain })}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  settings.filmGrain ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                Film Grain: {settings.filmGrain ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => onUpdateSettings({ vignette: !settings.vignette })}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  settings.vignette ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                Vignette: {settings.vignette ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => onUpdateSettings({ crtEffect: !settings.crtEffect })}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  settings.crtEffect ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                CRT Scanlines: {settings.crtEffect ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Theme / Scenario Switcher */}
          <div className="border-t border-zinc-800 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-3">
              <Home className="h-4 w-4" />
              <span>HORROR THEME & SCENARIO SELECTION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    currentTheme === t.id
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{t.name}</span>
                    {currentTheme === t.id && <Check className="h-4 w-4 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 leading-snug">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800/60 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            RESTART NIGHTMARE
          </button>

          <button
            onClick={onResume}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2 text-xs font-bold text-black hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
          >
            <Play className="h-4 w-4" />
            RESUME GAME
          </button>
        </div>
      </div>
    </div>
  );
};
