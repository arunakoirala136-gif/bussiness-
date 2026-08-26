/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, RefreshCw, BookOpen, Clock, Heart, Shield, Sparkles } from 'lucide-react';
import { GameEnding } from '../types';

interface EndGameScreenProps {
  ending: GameEnding;
  timeElapsedSec: number;
  notesCollectedCount: number;
  finalSanity: number;
  onRestart: () => void;
}

export const EndGameScreen: React.FC<EndGameScreenProps> = ({
  ending,
  timeElapsedSec,
  notesCollectedCount,
  finalSanity,
  onRestart,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const isDarkEnding = ending.type === 'consumed';

  return (
    <div id="endgame-screen-root" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-fade-in font-mono text-zinc-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 p-8 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center flex flex-col items-center">
        {/* Badge Icon */}
        <div
          className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-2xl ${
            isDarkEnding
              ? 'border-rose-600 bg-rose-950/40 text-rose-500 shadow-rose-900/40'
              : 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-amber-500/20'
          }`}
        >
          {isDarkEnding ? <Heart className="h-10 w-10 animate-pulse" /> : <Trophy className="h-10 w-10" />}
        </div>

        {/* Title */}
        <h1
          className={`text-2xl sm:text-3xl font-extrabold tracking-wider ${
            isDarkEnding ? 'text-rose-500' : 'text-amber-400'
          }`}
        >
          {ending.title}
        </h1>
        <p className="text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-widest">{ending.subtitle}</p>

        {/* Story Epilogue */}
        <div className="my-6 max-w-lg rounded-2xl bg-zinc-900/80 p-5 border border-zinc-800/80 text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif italic">
          "{ending.story}"
        </div>

        {/* Verdict Badge */}
        <div
          className={`mb-6 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase border ${
            isDarkEnding
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-amber-950/60 border-amber-500 text-amber-300'
          }`}
        >
          {ending.verdict}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md my-4">
          <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800 flex flex-col items-center">
            <Clock className="h-4 w-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-zinc-500">TIME SURVIVED</span>
            <span className="text-sm font-bold text-white mt-0.5">{formatTime(timeElapsedSec)}</span>
          </div>

          <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800 flex flex-col items-center">
            <BookOpen className="h-4 w-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-zinc-500">LORE DISCOVERED</span>
            <span className="text-sm font-bold text-white mt-0.5">{notesCollectedCount} / 6 Notes</span>
          </div>

          <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800 flex flex-col items-center">
            <Heart className="h-4 w-4 text-rose-500 mb-1" />
            <span className="text-[10px] text-zinc-500">FINAL SANITY</span>
            <span className="text-sm font-bold text-white mt-0.5">{Math.round(finalSanity)}%</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-3 text-sm font-bold text-black hover:bg-amber-400 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
        >
          <RefreshCw className="h-4 w-4" />
          PLAY AGAIN / TRY ANOTHER ENDING
        </button>
      </div>
    </div>
  );
};
