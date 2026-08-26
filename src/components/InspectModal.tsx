/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { LoreNote } from '../types';

interface InspectModalProps {
  note: LoreNote;
  onClose: () => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({ note, onClose }) => {
  return (
    <div id="inspect-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg rounded-2xl bg-amber-950/40 p-8 border border-amber-800/60 shadow-2xl text-amber-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-amber-400 hover:bg-amber-900/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-amber-800/50 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <BookOpen className="h-4 w-4" />
            <span>DISCOVERED CLUE</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{note.title}</h2>
          <div className="flex items-center justify-between text-xs text-amber-400/80 mt-1">
            <span>Author: {note.author || 'Unknown'}</span>
            <span>{note.date || 'Undated'}</span>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto pr-2 my-4">
          <p className="text-sm font-serif italic leading-relaxed whitespace-pre-line text-amber-100/90">
            "{note.content}"
          </p>
        </div>

        {note.hint && (
          <div className="mt-4 rounded-lg bg-black/50 p-3 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Clue Recorded to Journal: {note.hint}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-amber-600/80 py-2.5 text-xs font-bold text-black hover:bg-amber-500 active:scale-95 transition-all"
        >
          CLOSE & STORE IN JOURNAL [ESC]
        </button>
      </div>
    </div>
  );
};
