'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';
import EmployeeCard from '@/components/layout/home/EmployeeCard';
import EmployeePhoto from '@/components/layout/home/EmployeePhoto';
import ErrorDisplay from '@/components/layout/home/ErrorDisplay';
import DemoBadgeDrawer from '@/components/layout/home/DemoBadgeDrawer';
import useAttendance from '@/hooks/useAttendance';
import { ANIMATIONS } from '@/constants';
import Image from 'next/image';

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead,
    clearEmployeeInfo,
    loading // <-- Destructure loading
  } = useAttendance();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Clock component at the top */}
      <motion.div 
        className="pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Clock />
      </motion.div>

      {/* Conditional main content */}
      <div className="container my-5 mx-auto px-8 pb-20">
        {/* Instructions or welcome message */}
        <AnimatePresence>
          {showInstructions && !error && (
            <motion.div 
              className="text-center my-10"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={ANIMATIONS.fadeIn}
            >
              <motion.h2 
                className="text-5xl font-bold text-cyan-300"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Please Tap Your ID Card
              </motion.h2>

              {/* Portfolio Showcase Quick Trigger */}
              <motion.div
                className="mt-6 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 text-cyan-200 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-950/50 backdrop-blur-sm cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span>No RFID scanner? Tap here to test sample badges</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/10 text-cyan-300 rounded border border-white/10">
                    D
                  </kbd>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Employee data display */}
        <AnimatePresence>
          {employeeInfo && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              variants={ANIMATIONS.fadeIn}
            >
              {/* Left side - Employee Info */}
              <EmployeeCard 
                employeeInfo={employeeInfo} 
                attendanceLog={attendanceLog}
                employeeStatus={employeeStatus} 
              />
              
              {/* Right side - Photo and status */}
              <EmployeePhoto 
                employeeInfo={employeeInfo}
                employeeStatus={employeeStatus} 
              />
              
            </motion.div>
            
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && <ErrorDisplay error={error} />}
        </AnimatePresence>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center mt-10">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-cyan-500"></div>
            <span className="ml-6 text-3xl text-cyan-500 font-bold">Processing...</span>
          </div>
        )}
      </div>

      {/* Company branding footer */}
      <div className="fixed bottom-0 left-0 w-full bg-black/30 backdrop-blur">
        <div className="container mx-auto relative flex justify-between items-center px-8">
          {/* Title on the left */}
          <div className="text-2xl font-bold">Security Attendance System</div>
          
          {/* Spinner absolutely centered */}
          {loading && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-cyan-500"></div>
            </div>
          )}

          {/* Logo on the right */}
          <div>
            <Image
              src="/ew-logo-full.png" 
              alt="EWBPO Logo" 
              width={300}
              height={53}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Portfolio Showcase Demo Badge Drawer */}
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