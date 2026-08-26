/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Volume2, ShieldAlert, Sparkles, Compass, Eye, Battery, Skull } from 'lucide-react';
import { GameLocationTheme } from '../types';

interface TitleScreenProps {
  onStartGame: (theme: GameLocationTheme) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const [selectedTheme, setSelectedTheme] = useState<GameLocationTheme>('whispering_house');

  const themes: { id: GameLocationTheme; name: string; tag: string; desc: string }[] = [
    {
      id: 'whispering_house',
      name: 'The Whispering House',
      tag: 'Classic Victorian Mystery',
      desc: 'An abandoned estate shrouded in rain. Solve grandfather clock ciphers, hidden bookshelves, and occult rituals.',
    },
    {
      id: 'haunted_hospital',
      name: 'Haunted Asylum Ward 404',
      tag: 'Psychological Tension',
      desc: 'Corroded surgical wards, flickering emergency bulbs, and the echoes of departed patients.',
    },
    {
      id: 'scary_forest',
      name: 'Blackwood Forest Cabin',
      tag: 'Survival Wilderness',
      desc: 'A crumbling cabin in the deep woods surrounded by whispering fog and ancient eldritch trees.',
    },
    {
      id: 'cursed_village',
      name: 'Ravenbrook Cursed Village',
      tag: 'Folk Horror',
      desc: 'Deserted 18th-century cobblestone alleys steeped in witch trials and dark folklore.',
    },
  ];

  return (
    <div id="title-screen-root" className="relative flex min-h-screen w-full flex-col items-center justify-between bg-black p-6 font-mono text-zinc-200 overflow-hidden select-none">
      {/* Background Atmosphere & Fog Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/90 to-black z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,30,30,0.1)_0,transparent_70%)] pointer-events-none" />

      {/* Top Header info */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between pt-2">
        <div className="flex items-center gap-2 rounded-full bg-zinc-900/80 px-3 py-1 text-xs border border-zinc-800 text-zinc-400">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
          <span>FIRST-PERSON 3D HORROR EXPERIENCE</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Volume2 className="h-4 w-4 text-amber-400" />
          <span>Headphones Recommended</span>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-2xl px-4 py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-[0.3em] mb-2">
          <Skull className="h-4 w-4 animate-pulse" />
          <span>Supernatural Investigation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          THE WHISPERING HOUSE
        </h1>
        <p className="mt-3 text-sm text-zinc-400 max-w-md font-serif italic">
          "The house is never truly empty. When the flashlight flickers, listen closely to the walls..."
        </p>

        {/* Theme Selection Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              className={`p-3.5 rounded-xl border transition-all text-xs ${
                selectedTheme === t.id
                  ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-white mb-0.5">
                <span>{t.name}</span>
                <span className="text-[10px] font-normal text-amber-400/80 uppercase">{t.tag}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Start Game Action */}
        <button
          onClick={() => onStartGame(selectedTheme)}
          className="mt-8 flex items-center gap-3 rounded-2xl bg-amber-500 px-8 py-4 text-base font-extrabold text-black hover:bg-amber-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] group"
        >
          <Play className="h-5 w-5 fill-black group-hover:translate-x-0.5 transition-transform" />
          ENTER THE NIGHTMARE
        </button>

        {/* Key Features Highlights */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-zinc-400" /> Sanity & Dynamic Whispers
          </span>
          <span className="flex items-center gap-1">
            <Battery className="h-3.5 w-3.5 text-zinc-400" /> Limited Flashlight Battery
          </span>
          <span className="flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-zinc-400" /> 4 Multiple Endings
          </span>
        </div>
      </div>

      {/* Footer Controls & Instructions */}
      <div className="relative z-10 flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-4 text-xs text-zinc-500">
        <div>
          Controls: <span className="text-zinc-300 font-bold">[WASD]</span> Move |{' '}
          <span className="text-zinc-300 font-bold">[SHIFT]</span> Sprint |{' '}
          <span className="text-zinc-300 font-bold">[MOUSE]</span> Look |{' '}
          <span className="text-zinc-300 font-bold">[F]</span> Light |{' '}
          <span className="text-zinc-300 font-bold">[E]</span> Interact |{' '}
          <span className="text-zinc-300 font-bold">[TAB]</span> Journal
        </div>
        <div className="text-zinc-400 font-semibold">Click canvas to lock mouse pointer</div>
      </div>
    </div>
  );
};
