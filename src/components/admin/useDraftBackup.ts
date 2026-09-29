"use client";

import { useCallback, useEffect, useState } from "react";

export type DraftBackup<T> = { data: T; savedAt: number };

const storageKey = (key: string) => `sfo:draft:${key}`;

/**
 * Keeps a copy of unsaved editor changes in this browser, so a crash, an ended session or an
 * accidental Back click doesn't lose work. On the next visit it offers a copy that is newer than
 * the last save.
 */
export function useDraftBackup<T>(key: string, data: T, dirty: boolean, lastSavedAt?: string | null) {
  const [offer, setOffer] = useState<DraftBackup<T> | null>(null);

  // Look for a copy left behind by an earlier visit (browser-only, so after hydration).
  useEffect(() => {
    let found: DraftBackup<T> | null = null;
    try {
      const raw = localStorage.getItem(storageKey(key));
      found = raw ? (JSON.parse(raw) as DraftBackup<T>) : null;
    } catch {
      found = null;
    }
    const savedTime = lastSavedAt ? new Date(lastSavedAt).getTime() : 0;
    if (!found || !(found.savedAt > savedTime)) return;
    const frame = requestAnimationFrame(() => setOffer(found));
    return () => cancelAnimationFrame(frame);
  }, [key, lastSavedAt]);

  // Store a copy shortly after each change.
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey(key), JSON.stringify({ data, savedAt: Date.now() }));
      } catch {
        // Storage full or blocked: the editor still works, just without a backup.
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [key, data, dirty]);

  /** Forget the stored copy (after saving, or when the writer discards it). */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(key));
    } catch {
      // ignore
    }
    setOffer(null);
  }, [key]);

  return { offer, clear };
}
