'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dayjs from 'dayjs';
import { 
  CheckCircle2, 
  LogOut, 
  Clock, 
  Building2, 
  Briefcase, 
  BadgeCheck, 
  LogIn
} from 'lucide-react';
import { SETTINGS } from '@/constants';

export default function KioskPunchOverlay({
  employeeInfo,
  attendanceLog,
  employeeStatus,
  onDismiss
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.round((SETTINGS.AUTO_CLEAR_TIMEOUT || 9000) / 1000)
  );

  // Countdown timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut (Escape or Space to dismiss immediately)
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

  if (!employeeInfo) return null;

  const isClockIn = employeeStatus === 'Clocked In';
  const firstName = employeeInfo.name?.split(' ')[0] || 'Employee';

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  };

  const formatPunchTime = (timeString) => {
    if (!timeString) return '--:--';
    return dayjs(timeString).format('h:mm A');
  };

  const formatPunchSeconds = (timeString) => {
    if (!timeString) return '';
    return dayjs(timeString).format(':ss');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
      onClick={onDismiss}
    >
      {/* Main Overlay Dossier Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl sm:rounded-4xl border-2 shadow-2xl p-6 sm:p-9 md:p-11 ${
          isClockIn
            ? 'border-emerald-300 shadow-emerald-950/10'
            : 'border-amber-300 shadow-amber-950/10'
        }`}
      >
        {/* Top Dismiss Button */}
        {/* <button
          type="button"
          onClick={onDismiss}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all border border-slate-200 cursor-pointer"
          title="Dismiss (Esc)"
          aria-label="Dismiss punch overlay"
        >
          <X className="h-6 w-6" />
        </button> */}

        {/* Header Greeting & Punch Type Pill */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b-2 border-slate-100 pb-5 sm:pb-6">
          <div className="text-center sm:text-left">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600">
              Attendance Recorded
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-0.5">
              {getGreeting()}
            </h2>
          </div>

          {/* Large Punch Status Pill */}
          <div
            className={`inline-flex items-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full font-black text-xl sm:text-2xl md:text-3xl border-2 shadow-sm ${
              isClockIn
                ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                : 'bg-amber-50 text-amber-900 border-amber-400'
            }`}
          >
            {isClockIn ? (
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600" />
            ) : (
              <LogOut className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600" />
            )}
            <span>{isClockIn ? 'CLOCKED IN' : 'CLOCKED OUT'}</span>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6 sm:mt-8">
          {/* Left Column: Photo / Avatar */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              className={`relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-3xl sm:rounded-4xl overflow-hidden border-4 shadow-xl ${
                isClockIn ? 'border-emerald-500' : 'border-amber-500'
              }`}
            >
              {employeeInfo?.photo ? (
                <Image
                  src={employeeInfo.photo}
                  alt={employeeInfo.name}
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-100 via-slate-50 to-slate-200 text-slate-700 select-none">
                  <span className="text-7xl font-extrabold text-slate-700">
                    {employeeInfo.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <span className="text-sm text-slate-500 uppercase tracking-widest mt-3 font-semibold">
                    Employee Badge
                  </span>
                </div>
              )}
            </div>

            {/* Ashima ID Badge */}
            <div className="mt-5 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-base sm:text-lg font-mono font-bold flex items-center gap-2.5 shadow-xs">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span>ID: {employeeInfo.ashima_id}</span>
            </div>
          </div>

          {/* Right Column: Name, Department, Position & Timestamps */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-slate-500 font-bold">
                Employee Name
              </p>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mt-1">
                {employeeInfo.name}
              </h3>
            </div>

            {/* Department and Position Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Department
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
                  {employeeInfo.department || 'General'}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 font-semibold">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  Position
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
                  {employeeInfo.position || 'Staff'}
                </p>
              </div>
            </div>

            {/* Paired Attendance Log Cards */}
            <div className="pt-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 uppercase">
                Today&apos;s Paired Attendance Log
              </span>

              <div className="grid grid-cols-2 gap-5 mt-3">
                {/* Time In Card */}
                <div
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                    isClockIn
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-md'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700">
                    <span className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Time In
                    </span>
                    {isClockIn && (
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-bold">
                        Recorded
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-slate-900">
                      {formatPunchTime(attendanceLog?.in_time)}
                    </span>
                    <span className="text-sm sm:text-base font-mono text-slate-500">
                      {formatPunchSeconds(attendanceLog?.in_time)}
                    </span>
                  </div>
                </div>

                {/* Time Out Card */}
                <div
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                    !isClockIn && attendanceLog?.out_time
                      ? 'bg-amber-50/70 border-amber-300 shadow-md'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700">
                    <span className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      Time Out
                    </span>
                    {!isClockIn && attendanceLog?.out_time && (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-bold">
                        Recorded
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-slate-900">
                      {formatPunchTime(attendanceLog?.out_time)}
                    </span>
                    <span className="text-sm sm:text-base font-mono text-slate-500">
                      {formatPunchSeconds(attendanceLog?.out_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Dismiss Progress Bar & Countdown Footer */}
        <div className="mt-6 sm:mt-8 pt-4 border-t-2 border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm sm:text-base text-slate-500">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Auto-clearing in <strong className="text-slate-900 font-mono font-bold text-base sm:text-lg">{secondsRemaining}s</strong>
            </span>
            <span className="text-slate-400 text-xs sm:text-sm">
              Tap anywhere or press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold">Esc</kbd> to return
            </span>
          </div>

          {/* Animated shrinking progress line */}
          <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: (SETTINGS.AUTO_CLEAR_TIMEOUT || 9000) / 1000,
                ease: 'linear',
              }}
              className={`h-full rounded-full ${
                isClockIn ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
