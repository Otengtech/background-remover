// hooks/useUndoRedo.js
import { useState, useCallback, useRef } from 'react';

export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const lastStateRef = useRef(initialState);

  const state = history[index];

  const setState = useCallback((newState) => {
    // Debounce rapid state changes (e.g., slider movements)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const trimmed = prev.slice(0, index + 1);

        // Prevent pushing same state twice
        const lastState = trimmed[trimmed.length - 1];
        if (JSON.stringify(lastState) === JSON.stringify(newState)) {
          return trimmed;
        }

        // Only add to history if the state has meaningfully changed
        const hasMeaningfulChange = Object.keys(newState).some(key => {
          const oldVal = lastState[key];
          const newVal = newState[key];
          
          // For numeric values, consider changes above a threshold
          if (typeof oldVal === 'number' && typeof newVal === 'number') {
            return Math.abs(oldVal - newVal) > 1; // Minimum change threshold
          }
          
          // For other types, use strict equality
          return oldVal !== newVal;
        });

        if (!hasMeaningfulChange) {
          return trimmed;
        }

        const updated = [...trimmed, newState];

        // Prevent history from growing too large
        if (updated.length > maxHistory) {
          updated.shift(); // remove oldest
        }

        lastStateRef.current = newState;
        return updated;
      });

      setIndex(prevIndex => Math.min(prevIndex + 1, maxHistory - 1));
    }, 100); // 100ms debounce delay

  }, [index, maxHistory]);

  const undo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIndex(i => (i > 0 ? i - 1 : i));
  }, []);

  const redo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIndex(i => (i < history.length - 1 ? i + 1 : i));
  }, [history.length]);

  // Cleanup timeout on unmount
  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
    clearTimeoutRef // Export cleanup function
  };
};