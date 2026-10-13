"use client";

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/dateUtils';

/**
 * HeaderClock Component
 * 
 * Self-contained live clock for the admin header.
 * Encapsulates the 1-second interval to avoid re-rendering
 * parent header controls and dialogs.
 * 
 * @param {Object} props
 * @param {'desktop' | 'mobile'} [props.variant='desktop']
 */
export default function HeaderClock({ variant = 'desktop' }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (variant === 'mobile') {
    return (
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="font-semibold text-gray-900 text-sm">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col">
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-lg font-semibold text-gray-900">
          {formatTime(currentTime)}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Calendar className="h-3 w-3 text-gray-500" />
        <span className="text-sm text-gray-500">
          {formatDate(currentTime)}
        </span>
      </div>
    </div>
  );
}
