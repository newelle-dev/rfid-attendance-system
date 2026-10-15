'use client';

import { useState } from 'react';
import { CreditCard, Cpu, Sparkles, AlertTriangle, ArrowRight, CornerDownLeft, ShieldCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Seeded sample cards matching databases/schema.sql
const DEMO_BADGES = [
  {
    id: '24-00101',
    name: 'Marcus Vance',
    position: 'Team Leader',
    department: 'IT DEPARTMENT',
    tag: 'RFID-IT-001',
    accentColor: 'from-blue-50/80 to-cyan-50/80 border-blue-200 text-blue-900',
    initials: 'MV',
    type: 'valid'
  },
  {
    id: '24-00102',
    name: 'Elena Rostova',
    position: 'Programmer',
    department: 'IT DEPARTMENT',
    tag: 'RFID-IT-002',
    accentColor: 'from-indigo-50/80 to-purple-50/80 border-indigo-200 text-indigo-900',
    initials: 'ER',
    type: 'valid'
  },
  {
    id: '24-00201',
    name: 'Sophia Alcantara',
    position: 'HR Officer',
    department: 'HR DEPARTMENT',
    tag: 'RFID-HR-001',
    accentColor: 'from-pink-50/80 to-rose-50/80 border-pink-200 text-pink-900',
    initials: 'SA',
    type: 'valid'
  },
  {
    id: '24-00501',
    name: 'Grace Villanueva',
    position: 'Operations Manager',
    department: 'OPERATIONS',
    tag: 'RFID-OPS-001',
    accentColor: 'from-amber-50/80 to-orange-50/80 border-amber-200 text-amber-900',
    initials: 'GV',
    type: 'valid'
  },
  {
    id: '00-00000',
    name: 'Super Administrator',
    position: 'System Administrator',
    department: 'IT DEPARTMENT',
    tag: '1000000001',
    accentColor: 'from-emerald-50/80 to-teal-50/80 border-emerald-200 text-emerald-900',
    initials: 'SA',
    type: 'valid'
  },
  {
    id: 'N/A',
    name: 'Unregistered Card',
    position: 'Unknown / Visitor',
    department: 'SECURITY ALERT',
    tag: 'UNKNOWN-RFID-999',
    accentColor: 'from-rose-50/80 to-red-50/80 border-rose-200 text-rose-900',
    initials: '??',
    type: 'invalid',
    description: 'Simulates unregistered badge to test error buzzer & rejection'
  }
];

export default function DemoBadgeDrawer({ onTagRead, open, onOpenChange, isProcessing }) {
  const [customTag, setCustomTag] = useState('');

  const handleTap = (tag) => {
    if (isProcessing) return;
    onOpenChange(false);
    setTimeout(() => {
      onTagRead(tag);
    }, 60);
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-white border-l border-slate-200 text-slate-900 p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900 tracking-wide flex items-center gap-2">
                RFID Tap Simulator
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 mt-0.5">
                Simulate physical RFID card swipes without hardware.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
              Select Sample ID Badge
            </span>
            <button
              id="quick-test-invalid-badge"
              type="button"
              onClick={() => handleTap('UNKNOWN-RFID-999')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Trigger simulated unregistered badge rejection"
            >
              <AlertTriangle className="h-3 w-3 text-rose-600" />
              <span>Test Invalid Card</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {DEMO_BADGES.map((badge) => {
              const isInvalid = badge.type === 'invalid';
              return (
                <button
                  key={badge.tag}
                  id={isInvalid ? 'demo-badge-invalid' : `demo-badge-${badge.tag}`}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleTap(badge.tag)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all duration-200 group relative overflow-hidden cursor-pointer',
                    'bg-gradient-to-br shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none',
                    badge.accentColor,
                    isInvalid
                      ? 'hover:border-rose-400'
                      : 'hover:border-blue-400'
                  )}
                >
                  {/* Top card header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border',
                          isInvalid
                            ? 'bg-rose-100 border-rose-200 text-rose-700'
                            : 'bg-white border-slate-200 text-blue-700 shadow-2xs'
                        )}
                      >
                        {badge.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                          {badge.name}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500">
                          {badge.position} • {badge.department}
                        </div>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-white/80 border border-slate-200 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <Cpu className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Tag & Action Footer */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-xs">
                    <div className="font-mono text-[10px] sm:text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="text-slate-400">TAG:</span>
                      <span className="font-semibold text-slate-800">{badge.tag}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 mt-auto">
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-600">
                Custom Tag Input
              </span>
              <span className="text-[10px] text-slate-400">Press Enter to tap</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="demo-custom-tag-input"
                type="text"
                placeholder="Enter custom RFID or Ashima ID..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                disabled={isProcessing}
                className="h-9 text-xs font-mono bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/40"
              />
              <Button
                id="demo-custom-tag-submit"
                type="submit"
                disabled={!customTag.trim() || isProcessing}
                className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <CornerDownLeft className="h-3.5 w-3.5 mr-1" />
                Tap
              </Button>
            </div>
          </form>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Simulates HID reader</span>
            </span>
            <span className="text-slate-400">
              Or press <kbd className="px-1 py-0.2 rounded bg-slate-200/80 font-mono text-[10px] text-slate-700">Ctrl+V</kbd> to paste
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
