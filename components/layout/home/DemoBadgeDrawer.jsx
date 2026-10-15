'use client';

import { useState } from 'react';
import { CreditCard, Cpu, Sparkles, AlertTriangle, ArrowRight, CornerDownLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Seeded sample cards matching databases/schema.sql
const DEMO_BADGES = [
  {
    id: '24-00101',
    name: 'Marcus Vance',
    position: 'Team Leader',
    department: 'IT DEPARTMENT',
    tag: 'RFID-IT-001',
    accentColor: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-400',
    initials: 'MV',
    type: 'valid'
  },
  {
    id: '24-00102',
    name: 'Elena Rostova',
    position: 'Programmer',
    department: 'IT DEPARTMENT',
    tag: 'RFID-IT-002',
    accentColor: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400',
    initials: 'ER',
    type: 'valid'
  },
  {
    id: '24-00201',
    name: 'Sophia Alcantara',
    position: 'HR Officer',
    department: 'HR DEPARTMENT',
    tag: 'RFID-HR-001',
    accentColor: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-400',
    initials: 'SA',
    type: 'valid'
  },
  {
    id: '24-00501',
    name: 'Grace Villanueva',
    position: 'Operations Manager',
    department: 'OPERATIONS',
    tag: 'RFID-OPS-001',
    accentColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    initials: 'GV',
    type: 'valid'
  },
  {
    id: '00-00000',
    name: 'Super Administrator',
    position: 'System Administrator',
    department: 'IT DEPARTMENT',
    tag: '1000000001',
    accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    initials: 'SA',
    type: 'valid'
  },
  {
    id: 'N/A',
    name: 'Unregistered Card',
    position: 'Unknown / Visitor',
    department: 'SECURITY ALERT',
    tag: 'UNKNOWN-RFID-999',
    accentColor: 'from-red-500/20 to-rose-500/20 border-red-500/40 text-red-400',
    initials: '??',
    type: 'invalid',
    description: 'Simulates unregistered badge to test error buzzer & rejection'
  }
];

export default function DemoBadgeDrawer({ onTagRead, open, onOpenChange, isProcessing }) {
  const [customTag, setCustomTag] = useState('');
  const [autoClose, setAutoClose] = useState(true);

  const handleTap = (tag) => {
    if (isProcessing) return;
    if (autoClose) {
      onOpenChange(false);
    }
    // Small microtask tick to let UI close cleanly before trigger
    setTimeout(() => {
      onTagRead(tag);
    }, 50);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const trimmed = customTag.trim();
    if (!trimmed) return;
    handleTap(trimmed);
    setCustomTag('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Floating Trigger Pill */}
      <SheetTrigger
        render={
          <button
            type="button"
            className="fixed bottom-24 right-8 z-40 group flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950/50 backdrop-blur-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            title="Open Virtual RFID Card Simulator (Shortcut: D)"
          />
        }
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
        <CreditCard className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-6" />
        <span className="text-sm font-semibold tracking-wide text-cyan-100">
          Demo Badges
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-cyan-300 rounded border border-white/10">
          D
        </kbd>
      </SheetTrigger>

      {/* Drawer Content */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-slate-950/95 border-l border-slate-800/80 text-slate-100 backdrop-blur-2xl p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                RFID Tap Simulator
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400 mt-0.5">
                Simulate physical RFID card swipes without hardware.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
              Select Sample ID Badge
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer accent-cyan-500"
              />
              <span>Auto-close on tap</span>
            </label>
          </div>

          <div className="space-y-3">
            {DEMO_BADGES.map((badge) => {
              const isInvalid = badge.type === 'invalid';
              return (
                <button
                  key={badge.tag}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleTap(badge.tag)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                    "bg-gradient-to-br backdrop-blur-md hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
                    badge.accentColor,
                    isInvalid 
                      ? "hover:border-red-500/70 hover:shadow-lg hover:shadow-red-950/40" 
                      : "hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-950/40"
                  )}
                >
                  {/* Top card header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border",
                        isInvalid
                          ? "bg-red-500/20 border-red-500/30 text-red-300"
                          : "bg-cyan-500/20 border-cyan-500/30 text-cyan-200"
                      )}>
                        {badge.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-cyan-200 transition-colors">
                          {badge.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {badge.position} • {badge.department}
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 group-hover:text-cyan-300 transition-colors">
                      <Cpu className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Tag & Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div className="font-mono text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="text-slate-500">TAG:</span>
                      <span className="font-bold text-white/90">{badge.tag}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{isInvalid ? 'Tap Invalid Card' : 'Tap Card'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Tag Input Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/60 mt-auto">
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                Custom Tag Input
              </span>
              <span className="text-[10px] text-slate-500">Press Enter to tap</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter custom RFID or Ashima ID..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                disabled={isProcessing}
                className="h-10 text-xs font-mono bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
              />
              <Button
                type="submit"
                disabled={!customTag.trim() || isProcessing}
                className="h-10 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
              >
                <CornerDownLeft className="h-3.5 w-3.5 mr-1" />
                Tap
              </Button>
            </div>
          </form>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Simulates HID reader</span>
            </span>
            <span className="text-slate-500">
              Or press <kbd className="px-1 py-0.2 rounded bg-white/10 font-mono text-[10px] text-slate-300">Ctrl+V</kbd> to paste
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
