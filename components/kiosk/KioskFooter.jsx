'use client';

import Image from 'next/image';
import { ShieldCheck, Radio } from 'lucide-react';

export default function KioskFooter() {
  return (
    <footer className="w-full py-5 sm:py-6 px-8 sm:px-14 lg:px-20 bg-white/95 backdrop-blur-md border-t-2 border-slate-200/90 z-10 select-none shrink-0">
      <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
        {/* Left: System name & Status indicators */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            <ShieldCheck className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-600 shrink-0" />
            <span>Security Attendance Terminal</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-500 font-medium">
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-mono text-xs sm:text-sm md:text-base font-bold shadow-xs">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              Scanner Ready
            </span>
            <span className="text-slate-400 font-mono text-xs sm:text-sm">
              Encrypted HID
            </span>
          </div>
        </div>

        {/* Right: Large Company Logo */}
        <div className="flex items-center shrink-0">
          <Image
            src="/ew-logo-full.png"
            alt="EastWest BPO Logo"
            width={380}
            height={80}
            className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-sm"
            priority
          />
        </div>
      </div>
    </footer>
  );
}
