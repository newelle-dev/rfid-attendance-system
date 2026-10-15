'use client';

import { useEffect, useRef } from 'react';

export default function HIDListener({ onTagRead, onToggleDemo }) {
  const tagBuffer = useRef('');
  const readingTimeout = useRef(null);

  useEffect(() => {
    const isInputActive = (target) => {
      const tagName = target?.tagName;
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target?.isContentEditable
      );
    };

    const handleKeyDown = (event) => {
      // Ignore keystrokes inside form input elements or editable content
      if (isInputActive(event.target)) {
        return;
      }

      // Shortcut to toggle interactive demo drawer on 'd' or 'D' key
      if (
        (event.key === 'd' || event.key === 'D') &&
        onToggleDemo &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        if (tagBuffer.current.length === 0) {
          event.preventDefault();
          onToggleDemo();
          return;
        }
      }

      // Ignore modifier keys and non-character keys except Enter
      if (event.key.length > 1 && event.key !== 'Enter') return;

      // Start or continue reading
      if (readingTimeout.current) clearTimeout(readingTimeout.current);

      if (event.key === 'Enter') {
        if (tagBuffer.current.length > 0) {
          onTagRead(tagBuffer.current);
        }
        tagBuffer.current = '';
      } else {
        tagBuffer.current += event.key;
        // Short debounce: if Enter is not pressed within 50ms, auto-submit
        readingTimeout.current = setTimeout(() => {
          if (tagBuffer.current.length > 0) {
            onTagRead(tagBuffer.current);
            tagBuffer.current = '';
          }
        }, 50);
      }
    };

    const handlePaste = (event) => {
      if (isInputActive(event.target)) return;
      const pasted = event.clipboardData?.getData('text')?.trim();
      if (pasted && onTagRead) {
        event.preventDefault();
        onTagRead(pasted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      if (readingTimeout.current) clearTimeout(readingTimeout.current);
    };
  }, [onTagRead, onToggleDemo]);

  return null; // No visible UI needed for fast processing
}