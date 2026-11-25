'use client';
import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'vara-koto:student';
const listeners = new Set<() => void>();

function read() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) fn(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage); };
}

/** Student / general choice, remembered in this browser and shared between pages. */
export function useStudent(): [boolean, (v: boolean) => void] {
  const student = useSyncExternalStore(subscribe, read, () => false);
  const set = useCallback((v: boolean) => {
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* storage blocked: keep going without remembering */ }
    listeners.forEach((fn) => fn());
  }, []);
  return [student, set];
}
