'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Maximize2, Minimize2, Shield, Radio } from 'lucide-react';

export default function KioskHeader({ onOpenDemo }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-8 sm:px-12 md:px-16 py-5 sm:py-6 z-20">
      {/* Terminal Station Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-sm font-bold tracking-wider uppercase text-slate-800">
            Terminal 01
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-blue-600" />
            RFID Reader Active
          </span>
        </div>
      </div>

      {/* Top Utilities Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sample Badges Trigger */}
        <button
          type="button"
          onClick={onOpenDemo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50/95 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
          title="Open interactive badge simulator (Shortcut: D)"
        >
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span className="hidden sm:inline">Sample Badges</span>
          <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-white text-blue-700 rounded border border-blue-200 shadow-xs">
            D
          </kbd>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/95 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all shadow-sm cursor-pointer active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-slate-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Discreet Admin Portal Link */}
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer active:scale-95"
          title="Staff & Admin Portal"
        >
          <Shield className="h-4 w-4 text-slate-500" />
          <span className="hidden md:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}
