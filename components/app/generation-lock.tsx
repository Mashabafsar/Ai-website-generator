"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type GenerationLockContextValue = {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
  /** Call when the user tries to leave during a build. */
  warnStay: () => void;
};

const GenerationLockContext = createContext<GenerationLockContextValue | null>(null);

const STAY_MESSAGE =
  "Please stay on this page while your website is being created. Navigation will unlock when it finishes.";

/**
 * Holds the app chrome still while a website is being written. Leaving the
 * page aborts the browser stream and the build looks like it restarted.
 */
export function GenerationLockProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(false);

  const lock = useCallback(() => setLocked(true), []);
  const unlock = useCallback(() => setLocked(false), []);
  const warnStay = useCallback(() => {
    toast.message("Website still creating", { description: STAY_MESSAGE });
  }, []);

  useEffect(() => {
    if (!locked) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [locked]);

  const value = useMemo(
    () => ({ locked, lock, unlock, warnStay }),
    [locked, lock, unlock, warnStay]
  );

  return (
    <GenerationLockContext.Provider value={value}>{children}</GenerationLockContext.Provider>
  );
}

export function useGenerationLock(): GenerationLockContextValue {
  const ctx = useContext(GenerationLockContext);
  if (!ctx) {
    return {
      locked: false,
      lock: () => undefined,
      unlock: () => undefined,
      warnStay: () => undefined,
    };
  }
  return ctx;
}

/** Locks the shell for as long as `active` is true. */
export function useHoldGenerationLock(active: boolean): void {
  const { lock, unlock } = useGenerationLock();
  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active, lock, unlock]);
}
