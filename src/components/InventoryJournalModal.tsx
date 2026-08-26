/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Package,
  MapPin,
  Key,
  Battery,
  Shield,
  FileText,
  Clock,
  Sparkles,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { GameItem, LoreNote } from '../types';

interface InventoryJournalModalProps {
  initialTab?: 'inventory' | 'journal' | 'map';
  inventory: GameItem[];
  notes: LoreNote[];
  currentRoom: string;
  onClose: () => void;
}

export const InventoryJournalModal: React.FC<InventoryJournalModalProps> = ({
  initialTab = 'inventory',
  inventory,
  notes,
  currentRoom,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'journal' | 'map'>(initialTab);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(inventory[0] || null);
  const [selectedNote, setSelectedNote] = useState<LoreNote | null>(notes[0] || null);

  const getItemIcon = (cat: string) => {
    switch (cat) {
      case 'key':
        return <Key className="h-5 w-5 text-amber-400" />;
      case 'battery':
        return <Battery className="h-5 w-5 text-emerald-400" />;
      case 'relic':
        return <Sparkles className="h-5 w-5 text-purple-400" />;
      default:
        return <Package className="h-5 w-5 text-zinc-300" />;
    }
  };

  return (
    <div id="journal-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg animate-fade-in font-mono text-zinc-200">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-zinc-950 border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" />
              INVENTORY ({inventory.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('journal');
                if (!selectedNote && notes.length > 0) setSelectedNote(notes[0]);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              JOURNAL & LORE ({notes.length}/6)
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="h-4 w-4" />
              ESTATE BLUEPRINT
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Left Item Grid */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-max overflow-y-auto pr-2">
                {inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`flex flex-col items-center justify-center rounded-xl p-4 text-center transition-all border ${
                      selectedItem?.id === item.id
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="mb-2 p-3 rounded-full bg-black/50">{getItemIcon(item.category)}</div>
                    <span className="text-xs font-bold text-zinc-200 line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase mt-0.5">{item.category}</span>
                  </button>
                ))}
              </div>

              {/* Right Detail Pane */}
              <div className="rounded-xl bg-zinc-900/60 p-5 border border-zinc-800 flex flex-col justify-between">
                {selectedItem ? (
                  <div>
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                      {getItemIcon(selectedItem.category)}
                      <div>
                        <h3 className="text-sm font-bold text-amber-300">{selectedItem.name}</h3>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{selectedItem.category}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-zinc-300 leading-relaxed">{selectedItem.description}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
                    Select an item to inspect its details.
                  </div>
                )}
                <div className="text-[11px] text-zinc-500 text-center pt-4 border-t border-zinc-800">
                  Total Items: {inventory.length}
                </div>
              </div>
            </div>
          )}

          {/* 2. JOURNAL TAB */}
          {activeTab === 'journal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Note List */}
              <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                {notes.length === 0 ? (
                  <div className="p-4 text-xs text-zinc-500 text-center rounded-xl bg-zinc-900 border border-zinc-800">
                    No diary entries or notes discovered yet. Explore tables and mantles to uncover the mystery.
                  </div>
                ) : (
                  notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                        selectedNote?.id === note.id
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-bold line-clamp-1">{note.title}</span>
                      <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {note.foundInRoom}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Note Reader */}
              <div className="md:col-span-2 rounded-xl bg-amber-950/20 p-6 border border-amber-900/40 text-amber-100 flex flex-col justify-between overflow-y-auto">
                {selectedNote ? (
                  <div>
                    <div className="border-b border-amber-800/40 pb-3 mb-4">
                      <h2 className="text-base font-bold text-amber-300">{selectedNote.title}</h2>
                      <div className="flex items-center justify-between text-[11px] text-amber-500/80 mt-1 font-mono">
                        <span>Author: {selectedNote.author || 'Unknown'}</span>
                        <span>Date: {selectedNote.date || 'Lost to Time'}</span>
                      </div>
                    </div>

                    <p className="text-sm font-serif leading-relaxed whitespace-pre-line text-amber-100/90 italic">
                      "{selectedNote.content}"
                    </p>

                    {selectedNote.hint && (
                      <div className="mt-6 rounded-lg bg-black/40 p-3 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Investigation Clue: {selectedNote.hint}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                    Select a note from the left to read its contents.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ESTATE MAP TAB */}
          {activeTab === 'map' && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl p-6 border border-zinc-700 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-amber-400">ELDERMERE ESTATE - GROUND & SUB-LEVEL SCHEMATIC</h3>
                  <span className="text-xs text-zinc-400">Current: <span className="text-white font-bold">{currentRoom}</span></span>
                </div>

                {/* Blueprint Diagram */}
                <div className="my-6 grid grid-cols-3 gap-3 text-center text-xs font-bold">
                  {/* Library */}
                  <div className={`p-4 rounded-xl border ${currentRoom.includes('Library') ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    THE LIBRARY & STUDY
                    <span className="block text-[10px] font-normal text-zinc-500 mt-1">[Safe & Secret Shelf]</span>
                  </div>

                  {/* Foyer */}
                  <div className={`p-4 rounded-xl border ${currentRoom === 'Grand Foyer' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    GRAND FOYER
                    <span className="block text-[10px] font-normal text-zinc-500 mt-1">[Grandfather Clock / Main Gate]</span>
                  </div>

                  {/* Parlor */}
                  <div className={`p-4 rounded-xl border ${currentRoom === 'The Parlor' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    THE PARLOR
                    <span className="block text-[10px] font-normal text-zinc-500 mt-1">[Hearth & Eleanor's Mantle]</span>
                  </div>

                  {/* Cellar Maintenance */}
                  <div className={`p-4 rounded-xl border ${currentRoom.includes('Maintenance') ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    CELLAR MAINTENANCE
                    <span className="block text-[10px] font-normal text-zinc-500 mt-1">[Circuit Breakers]</span>
                  </div>

                  {/* Stone Corridor */}
                  <div className={`p-4 rounded-xl border ${currentRoom.includes('Cellar Passage') ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    STONE PASSAGE
                    <span className="block text-[10px] font-normal text-zinc-500 mt-1">[Hidden Sub-Level]</span>
                  </div>

                  {/* Occult Sanctum */}
                  <div className={`p-4 rounded-xl border ${currentRoom.includes('Sanctum') ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                    OCCULT SANCTUM
                    <span className="block text-[10px] font-normal text-rose-500 mt-1">[Ritual Altar & Banishment]</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Current Player Position
                  </div>
                  <div>Press [M] to toggle blueprint in-game</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
