import { useCallback, useRef, useState } from 'react';

// Generic undo/redo stack for the section list. Every call to `set` pushes
// the previous value onto the undo stack; `undo`/`redo` walk between them
// without re-triggering a push (so redo isn't wiped out by undo itself).
export function useUndoRedo<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);
  const skipNextPush = useRef(false);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      if (!skipNextPush.current) {
        undoStack.current.push(prev);
        if (undoStack.current.length > 100) undoStack.current.shift();
        redoStack.current = [];
      }
      skipNextPush.current = false;
      return resolved;
    });
  }, []);

  // Replaces the current value without recording undo history — used when
  // loading data from the server, not for user edits.
  const reset = useCallback((next: T) => {
    undoStack.current = [];
    redoStack.current = [];
    setValue(next);
  }, []);

  const undo = useCallback(() => {
    setValue((current) => {
      const prev = undoStack.current.pop();
      if (prev === undefined) return current;
      redoStack.current.push(current);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setValue((current) => {
      const next = redoStack.current.pop();
      if (next === undefined) return current;
      undoStack.current.push(current);
      return next;
    });
  }, []);

  return {
    value,
    set,
    reset,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}
