'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { SETTINGS } from '@/constants';

export default function KioskErrorOverlay({ error, onDismiss }) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.round((SETTINGS.ERROR_CLEAR_TIMEOUT || 4000) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onDismiss?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xl"
      onClick={onDismiss}
    >
      {/* Main Error Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-8 overflow-hidden text-center"
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all border border-slate-200 cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss error overlay"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Pulsing Warning Icon */}
        <div className="mx-auto w-18 h-18 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.6, repeat: 1 }}
          >
            <AlertTriangle className="h-9 w-9 text-rose-600" />
          </motion.div>
        </div>

        {/* Title */}
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
          Attendance Notice
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Scan Unsuccessful
        </h3>

        {/* Error message */}
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm sm:text-base font-semibold">
          {error}
        </div>

        {/* Guidance */}
        <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Please verify your badge orientation, try tapping again, or contact Human Resources if your RFID tag has not yet been assigned.
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Tap Again to Retry</span>
          </button>
        </div>

        {/* Progress Bar Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Auto-clearing in <strong className="text-slate-900 font-mono">{secondsRemaining}s</strong></span>
            <span className="text-slate-400">Tap anywhere to close</span>
          </div>

          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: (SETTINGS.ERROR_CLEAR_TIMEOUT || 4000) / 1000,
                ease: 'linear',
              }}
              className="h-full bg-rose-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
