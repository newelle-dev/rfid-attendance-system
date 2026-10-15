'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Globe2 } from 'lucide-react';

export default function KioskClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTime(new Date());
    });

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] select-none">
        <div className="h-44 sm:h-56 w-[500px] sm:w-[850px] bg-slate-200/60 animate-pulse rounded-3xl" />
        <div className="h-10 w-80 bg-slate-200/60 animate-pulse rounded-xl mt-6" />
      </div>
    );
  }

  const d = dayjs(time);
  const hours = d.format('hh');
  const minutes = d.format('mm');
  const seconds = d.format('ss');
  const secondsNum = time.getSeconds();
  const ampm = d.format('A');
  const dateFormatted = d.format('dddd, MMMM D, YYYY');
  const secondsPercent = ((secondsNum + 1) / 60) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center select-none my-auto w-full max-w-5xl px-4"
    >
      {/* High-Tech Corporate HUD Master Frame */}
      <div className="relative w-full rounded-3xl sm:rounded-[2.5rem] bg-white/95 backdrop-blur-xl border-2 border-slate-200/90 shadow-2xl shadow-slate-300/60 p-6 sm:p-8 md:p-10 overflow-hidden">
        {/* Futuristic HUD Corner Crosshairs */}
        <div className="absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 border-blue-600/80 pointer-events-none" />

        {/* Ambient Top HUD Telemetry Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 sm:mb-4 text-[11px] sm:text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-600 font-bold">SYS.TIME // LIVE</span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-600 font-bold">
            <Globe2 className="h-3.5 w-3.5 shrink-0" />
            <span>Philippine Standard Time (PST • UTC+8)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-slate-400">
            <span>SYNC: 1000MS NTP</span>
          </div>
        </div>

        {/* Center Display: Dual-Tone Giant HUD Digits */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 my-1 sm:my-2">
          {/* Main Time Hours & Minutes */}
          <div className="flex items-baseline font-mono font-extrabold tracking-tighter leading-none select-none">
            {/* Hours */}
            <span className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] text-slate-900 drop-shadow-xs">
              {hours}
            </span>

            {/* Glowing HUD Pulsing Colon */}
            <span className="text-6xl sm:text-7xl md:text-[9rem] lg:text-[11rem] xl:text-[12.5rem] text-blue-600 animate-pulse px-1 sm:px-2">
              :
            </span>

            {/* Minutes */}
            <span className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] text-slate-900 drop-shadow-xs">
              {minutes}
            </span>
          </div>

          {/* Precision Seconds & AM/PM Stack */}
          <div className="flex flex-col justify-between self-stretch py-2 sm:py-3 md:py-4 pl-3 sm:pl-5 border-l-2 border-slate-100">
            {/* AM/PM High-Tech Tag */}
            <div className="inline-flex items-center justify-center px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-blue-50/90 border-2 border-blue-200 text-blue-700 font-mono font-black text-base sm:text-lg md:text-xl lg:text-2xl shadow-xs">
              {ampm}
            </div>

            {/* Live Electric Blue HUD Seconds */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                SEC
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-mono font-black text-blue-600 tabular-nums leading-none">
                {seconds}
              </span>
            </div>
          </div>
        </div>

        {/* 60-Second Real-Time HUD Calibrated Progress Meter */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono font-bold text-slate-400 mb-1.5 px-0.5">
            <span>00s</span>
            <span>15s</span>
            <span className="text-blue-600 font-extrabold">30s</span>
            <span>45s</span>
            <span>60s</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden relative">
            {/* Smooth Fill Track */}
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full"
              style={{ width: `${secondsPercent}%` }}
              transition={{ ease: 'linear', duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Formatted Date Banner (Clean & Minimal) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 sm:mt-7 flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-md"
      >
        <span className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-600 animate-pulse" />
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
          {dateFormatted}
        </span>
      </motion.div>
    </motion.div>
  );
}
