// context/history-context.tsx
'use client';

import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ImageAdjustments } from '@/types/adjustments';

export type HistoryActionType =
  | 'image_generation'
  | 'set_primary_image'
  | 'set_generated_image'
  | 'adjustments_change'
  | 'filter_apply'
  | 'transform_apply'
  | 'selection_change'
  | 'mask_change'
  | 'stroke_add'
  | 'stroke_erase'
  | 'overlay_clear';

export type HistoryOpMeta = {
  action: HistoryActionType;
  tags?: string[];
  payload?: Record<string, unknown>;
};

export type HistoryOp = {
  id: string;
  label: string;
  timestamp: number;
  apply: () => void;
  undo: () => void;
  meta?: HistoryOpMeta;
};

type HistoryContextValue = {
  // stacks
  past: HistoryOp[];
  future: HistoryOp[];

  // operations
  push: (op: HistoryOp) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;

  // flags
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;

  // optional diagnostics
  pastCount: number;
  futureCount: number;
};

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export type HistoryProviderProps = {
  children: React.ReactNode;
  /** Max history depth before trimming oldest */
  maxStack?: number;
  /** Minimum milliseconds between pushes to avoid spam */
  throttleMs?: number;
};

export function HistoryProvider({
  children,
  maxStack = 500,
  throttleMs = 150,
}: HistoryProviderProps) {
  const [past, setPast] = useState<HistoryOp[]>([]);
  const [future, setFuture] = useState<HistoryOp[]>([]);
  const lastPushRef = useRef<number>(0);

  const push = (op: HistoryOp) => {
    const now = Date.now();
    if (now - lastPushRef.current < throttleMs) {
      // Throttle excessive pushes
      return;
    }
    lastPushRef.current = now;

    setPast((prev) => {
      const next = [...prev, op];
      if (next.length > maxStack) {
        next.shift(); // trim oldest
      }
      return next;
    });
    setFuture([]); // clear redo stack on new action
  };

  const undo = () => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const op = prevPast[prevPast.length - 1];
      try {
        op.undo();
      } catch (e) {
        console.error('History undo error:', e);
      }
      // move op to future stack
      setFuture((prevFuture) => [...prevFuture, op]);
      const trimmed = prevPast.slice(0, prevPast.length - 1);
      return trimmed;
    });
  };

  const redo = () => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const op = prevFuture[prevFuture.length - 1];
      try {
        op.apply();
      } catch (e) {
        console.error('History redo error:', e);
      }
      // move op back to past
      setPast((prevPast) => [...prevPast, op]);
      const trimmed = prevFuture.slice(0, prevFuture.length - 1);
      return trimmed;
    });
  };

  const clear = () => {
    setPast([]);
    setFuture([]);
  };

  const value = useMemo<HistoryContextValue>(() => {
    return {
      past,
      future,
      push,
      undo,
      redo,
      clear,
      isUndoAvailable: past.length > 0,
      isRedoAvailable: future.length > 0,
      pastCount: past.length,
      futureCount: future.length,
    };
  }, [past, future]);

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}

/**
 * Utility: Create a HistoryOp for adjustments change using a setter that replaces state.
 * This encodes prev and next adjustments so undo/redo are idempotent.
 */
export function createAdjustmentsChangeOp(
  prev: ImageAdjustments,
  next: ImageAdjustments,
  setAdjustments: (a: ImageAdjustments) => void,
  label = 'Adjustments Change',
): HistoryOp {
  return {
    id: uuidv4(),
    label,
    timestamp: Date.now(),
    apply: () => setAdjustments(next),
    undo: () => setAdjustments(prev),
    meta: {
      action: 'adjustments_change',
      payload: { prev, next },
      tags: ['editor', 'adjustments'],
    },
  };
}

/**
 * Utility: Generic state setter operation with explicit apply/undo closures.
 * Useful for strokes, masks, filters, etc.
 */
export function createStateSetterOp(
  label: string,
  action: HistoryActionType,
  applyFn: () => void,
  undoFn: () => void,
  payload?: Record<string, unknown>,
  tags?: string[],
): HistoryOp {
  return {
    id: uuidv4(),
    label,
    timestamp: Date.now(),
    apply: applyFn,
    undo: undoFn,
    meta: {
      action,
      payload,
      tags,
    },
  };
}

/**
 * Example builders for canvas strokes and overlays
 * These are placeholders; wire apply/undo with your canvas/overlay buffers.
 */
export function createStrokeAddOp(
  applyAddStroke: () => void,
  undoAddStroke: () => void,
  payload?: Record<string, unknown>,
): HistoryOp {
  return createStateSetterOp('Stroke Add', 'stroke_add', applyAddStroke, undoAddStroke, payload, [
    'canvas',
    'stroke',
  ]);
}

export function createStrokeEraseOp(
  applyEraseStroke: () => void,
  undoEraseStroke: () => void,
  payload?: Record<string, unknown>,
): HistoryOp {
  return createStateSetterOp('Stroke Erase', 'stroke_erase', applyEraseStroke, undoEraseStroke, payload, [
    'canvas',
    'stroke',
  ]);
}

export function createOverlayClearOp(
  applyClear: () => void,
  undoRestore: () => void,
): HistoryOp {
  return createStateSetterOp('Overlay Clear', 'overlay_clear', applyClear, undoRestore, undefined, [
    'canvas',
    'overlay',
  ]);
}