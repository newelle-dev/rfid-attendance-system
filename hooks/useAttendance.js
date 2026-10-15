'use client';

import { useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';
import { API, STATUS, SETTINGS } from '@/constants';

export default function useAttendance() {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playError] = useSound('/sounds/error.mp3');

  const clearEmployeeInfo = useCallback(() => {
    setEmployeeInfo(null);
    setAttendanceLog(null);
    setEmployeeStatus(null);
    setLoading(false);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-dismiss punch overlay
  useEffect(() => {
    if (!employeeInfo) return;
    const timer = setTimeout(() => {
      clearEmployeeInfo();
    }, SETTINGS.AUTO_CLEAR_TIMEOUT);
    return () => clearTimeout(timer);
  }, [employeeInfo, clearEmployeeInfo]);

  // Auto-dismiss error overlay
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      dismissError();
    }, SETTINGS.ERROR_CLEAR_TIMEOUT);
    return () => clearTimeout(timer);
  }, [error, dismissError]);

  const handleTagRead = useCallback(async (tag) => {
    if (!tag) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API.ADD_ATTENDANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfid_tag: tag }),
      });
      const result = await response.json();

      if (response.ok) {
        setEmployeeInfo(result.employee);
        setAttendanceLog(result.attendanceLog);
        setEmployeeStatus(result.logType === 'IN' ? STATUS.CLOCKED_IN : STATUS.CLOCKED_OUT);
        setError(null);
        try { playSuccess(); } catch {}
      } else {
        clearEmployeeInfo();
        setError(result.error || 'An unexpected error occurred.');
        try { playError(); } catch {}
      }
    } catch (err) {
      clearEmployeeInfo();
      setError('An unexpected error occurred while processing the RFID tag.');
      try { playError(); } catch {}
    } finally {
      setLoading(false);
    }
  }, [clearEmployeeInfo, playSuccess, playError]);

  // Derived state: instructions only show when idle
  const showInstructions = !employeeInfo && !error && !loading;

  return {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead,
    clearEmployeeInfo,
    dismissError,
    loading
  };
}