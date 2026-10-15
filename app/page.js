'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';
import HIDListener from '@/lib/HIDListeners';
import useAttendance from '@/hooks/useAttendance';
import KioskHeader from '@/components/kiosk/KioskHeader';
import KioskClock from '@/components/kiosk/KioskClock';
import KioskPunchOverlay from '@/components/kiosk/KioskPunchOverlay';
import KioskErrorOverlay from '@/components/kiosk/KioskErrorOverlay';
import KioskFooter from '@/components/kiosk/KioskFooter';
import DemoBadgeDrawer from '@/components/kiosk/DemoBadgeDrawer';

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    handleTagRead,
    clearEmployeeInfo,
    dismissError,
    loading
  } = useAttendance();

  return (
    <div className="relative h-screen max-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 overflow-hidden select-none">
      {/* Soft ambient background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-100/60 via-slate-100/40 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Utility Header */}
      <KioskHeader onOpenDemo={() => setDemoOpen(true)} />

      {/* Main Center Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-2 sm:py-4 w-full z-10 overflow-hidden">
        {/* Monospace Ambient Digital Clock */}
        <div className="w-full flex justify-center my-auto">
          <KioskClock />
        </div>

        {/* High-Tech RFID Scanning / Verification Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="kiosk-loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center my-auto py-12 p-8 rounded-3xl bg-white/90 border border-slate-200/80 shadow-xl shadow-slate-200/50 backdrop-blur-md"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio className="h-9 w-9 text-blue-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-5 text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">
                Verifying RFID Badge...
              </p>
              <span className="text-xs text-slate-500 mt-1">
                Authenticating with central database
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cinematic Full-Screen Punch Confirmation Overlay */}
      <AnimatePresence>
        {employeeInfo && !loading && (
          <KioskPunchOverlay
            key="kiosk-punch-overlay"
            employeeInfo={employeeInfo}
            attendanceLog={attendanceLog}
            employeeStatus={employeeStatus}
            onDismiss={clearEmployeeInfo}
          />
        )}
      </AnimatePresence>

      {/* Dedicated Error Overlay */}
      <AnimatePresence>
        {error && !loading && (
          <KioskErrorOverlay
            key="kiosk-error-overlay"
            error={error}
            onDismiss={dismissError}
          />
        )}
      </AnimatePresence>

      {/* Corporate Branding Footer */}
      <KioskFooter />

      {/* Interactive RFID Badge Simulator Drawer */}
      <DemoBadgeDrawer
        open={demoOpen}
        onOpenChange={setDemoOpen}
        onTagRead={handleTagRead}
        isProcessing={loading}
      />

      {/* Hardware HID & Paste Listener with shortcut */}
      <HIDListener
        onTagRead={handleTagRead}
        onToggleDemo={() => setDemoOpen((prev) => !prev)}
      />
    </div>
  );
}