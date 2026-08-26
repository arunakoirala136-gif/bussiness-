/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Eye,
  Flashlight,
  Compass,
  BookOpen,
  MapPin,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { GameSettings, InteractableObject, Objective } from '../types';

interface HUDProps {
  batteryLevel: number;
  flashlightOn: boolean;
  sanityLevel: number;
  currentRoom: string;
  interactPrompt: InteractableObject | null;
  objectives: Objective[];
  settings: GameSettings;
  onToggleFlashlight: () => void;
  onReloadBattery: () => void;
  onOpenInventory: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  onTriggerInteract: () => void;
  onTouchMove?: (v: { x: number; y: number }) => void;
  onTouchLook?: (v: { x: number; y: number }) => void;
}

export const HUD: React.FC<HUDProps> = ({
  batteryLevel,
  flashlightOn,
  sanityLevel,
  currentRoom,
  interactPrompt,
  objectives,
  settings,
  onToggleFlashlight,
  onReloadBattery,
  onOpenInventory,
  onOpenMap,
  onOpenSettings,
  onTriggerInteract,
  onTouchMove,
  onTouchLook,
}) => {
  const [showObjectives, setShowObjectives] = useState(true);
  const [touchActive, setTouchActive] = useState(false);

  // Detect touch device
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouchActive(true);
    }
  }, []);

  // Sanity status color
  const getSanityColor = () => {
    if (sanityLevel > 65) return 'text-emerald-400 border-emerald-500/30';
    if (sanityLevel > 35) return 'text-amber-400 border-amber-500/30';
    return 'text-rose-500 border-rose-600/50 animate-pulse';
  };

  const currentActiveObj = objectives.find((o) => !o.completed) || objectives[objectives.length - 1];

  return (
    <div id="horror-hud-root" className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 select-none">
      {/* Top Header: Location, Flashlight Battery, Sanity */}
      <div className="flex items-start justify-between">
        {/* Room / Compass */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            <Compass className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <span className="font-semibold tracking-wider uppercase text-zinc-100">{currentRoom}</span>
          </div>

          {/* Quick Objective Banner */}
          {currentActiveObj && (
            <div className="mt-1 max-w-sm rounded-lg bg-black/75 p-2.5 backdrop-blur-md border border-white/10 text-xs text-zinc-300 shadow-xl transition-all">
              <div className="flex items-center justify-between pb-1 text-[11px] font-mono tracking-wider text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  CURRENT OBJECTIVE
                </span>
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="pointer-events-auto text-zinc-400 hover:text-white"
                >
                  {showObjectives ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
              {showObjectives && (
                <div>
                  <p className="font-medium text-white">{currentActiveObj.title}</p>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{currentActiveObj.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Vitals: Flashlight Battery & Sanity */}
        <div className="flex items-center gap-3">
          {/* Flashlight Battery */}
          <div className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md border border-white/10 font-mono text-xs">
            <button
              onClick={onToggleFlashlight}
              className={`pointer-events-auto transition-colors ${flashlightOn ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-zinc-500'}`}
              title="Toggle Flashlight [F]"
            >
              <Flashlight className="h-4 w-4" />
            </button>
            <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-300 ${
                  batteryLevel > 30 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
            <span className={`text-[11px] ${batteryLevel < 20 ? 'text-rose-400 font-bold' : 'text-zinc-300'}`}>
              {Math.round(batteryLevel)}%
            </span>
          </div>

          {/* Sanity Meter */}
          <div
            className={`flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md border font-mono text-xs ${getSanityColor()}`}
          >
            <Eye className={`h-4 w-4 ${sanityLevel < 35 ? 'animate-bounce' : ''}`} />
            <div className="w-16 bg-zinc-800 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-300 ${
                  sanityLevel > 65 ? 'bg-emerald-400' : sanityLevel > 35 ? 'bg-amber-400' : 'bg-rose-600'
                }`}
                style={{ width: `${sanityLevel}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold">{Math.round(sanityLevel)}%</span>
          </div>

          {/* Quick Menu Button */}
          <button
            onClick={onOpenSettings}
            className="pointer-events-auto rounded-lg bg-black/70 p-2 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            title="Pause & Settings [ESC]"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center Screen: Dynamic Reticle & Interaction Prompt */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {/* Reticle */}
        <div
          className={`h-2.5 w-2.5 rounded-full border transition-all duration-200 ${
            interactPrompt
              ? 'scale-150 border-amber-400 bg-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'border-white/40 bg-white/20'
          }`}
        />

        {/* Dynamic Interaction Tooltip */}
        {interactPrompt && (
          <div className="mt-3 pointer-events-auto flex items-center gap-2 rounded-full bg-black/85 px-4 py-1.5 backdrop-blur-lg border border-amber-500/40 text-xs font-mono text-white shadow-2xl animate-fade-in">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-bold text-amber-300 border border-amber-500/30">
              E / TAP
            </span>
            <span className="font-semibold text-zinc-100">{interactPrompt.actionText || interactPrompt.name}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-end justify-between">
        {/* Left: Keyboard / Controls Guide */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
          <span className="text-zinc-200 font-bold">[WASD]</span> Move
          <span className="mx-1 text-zinc-600">|</span>
          <span className="text-zinc-200 font-bold">[SHIFT]</span> Sprint
          <span className="mx-1 text-zinc-600">|</span>
          <span className="text-zinc-200 font-bold">[F]</span> Flashlight
          <span className="mx-1 text-zinc-600">|</span>
          <span className="text-zinc-200 font-bold">[R]</span> Reload Battery
          <span className="mx-1 text-zinc-600">|</span>
          <span className="text-zinc-200 font-bold">[E]</span> Interact
        </div>

        {/* Right: Quick Action Buttons (Inventory, Map, Reload) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onReloadBattery}
            className="flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-2 text-xs font-mono text-zinc-300 backdrop-blur-md border border-white/10 hover:border-amber-400 hover:text-white transition-all shadow-lg active:scale-95"
            title="Reload Battery [R]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Reload [R]</span>
          </button>

          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-2 text-xs font-mono text-zinc-300 backdrop-blur-md border border-white/10 hover:border-amber-400 hover:text-white transition-all shadow-lg active:scale-95"
            title="Journal & Items [TAB]"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>Journal & Inventory</span>
          </button>

          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-2 text-xs font-mono text-zinc-300 backdrop-blur-md border border-white/10 hover:border-amber-400 hover:text-white transition-all shadow-lg active:scale-95"
            title="Estate Map [M]"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>Floor Map</span>
          </button>
        </div>
      </div>

      {/* Mobile Touch Overlay (Joystick & Virtual Action Buttons) */}
      {touchActive && (
        <div className="pointer-events-auto absolute inset-0 z-30 flex justify-between p-4 sm:hidden pointer-events-none">
          {/* Virtual Move Area (Left) */}
          <div
            className="pointer-events-auto h-36 w-36 self-end rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center touch-none mb-12 active:bg-white/20"
            onTouchStart={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const x = (touch.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              const y = (touch.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              if (onTouchMove) onTouchMove({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const x = (touch.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              const y = (touch.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              if (onTouchMove) onTouchMove({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
            }}
            onTouchEnd={() => {
              if (onTouchMove) onTouchMove({ x: 0, y: 0 });
            }}
          >
            <span className="text-[10px] font-mono text-zinc-400">MOVE</span>
          </div>

          {/* Virtual Action Buttons (Right) */}
          <div className="pointer-events-auto flex flex-col gap-3 self-end mb-12">
            <button
              onClick={onTriggerInteract}
              className="h-14 w-14 rounded-full bg-amber-500/80 border-2 border-amber-300 text-black font-bold text-sm shadow-xl active:scale-90 flex items-center justify-center"
            >
              USE
            </button>
            <button
              onClick={onToggleFlashlight}
              className="h-12 w-12 rounded-full bg-black/70 border border-white/30 text-amber-300 text-xs shadow-xl active:scale-90 flex items-center justify-center"
            >
              <Flashlight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
