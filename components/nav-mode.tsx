"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { routeMode, type NavMode } from "@/components/nav-items";

/* Operator / Author mode. Operator is the default landing (dashboard); Author
   is the course-building surface. The rail shows the chosen mode's places, the
   header lockup names it, and the account menu switches it, the same way the
   Training Hub handles Learner / Supervisor mode. Mode persists in
   localStorage; a route that belongs to one mode forces that mode. */

const MODE_STORAGE_KEY = "bm-mode";
const MODE_VERSION_KEY = "bm-mode-version";
/* Bump when the default landing mode changes — resets stored preference once. */
const MODE_VERSION = "2";

type NavModeValue = {
  mode: NavMode;
  switchMode: (next: NavMode) => void;
};

const NavModeContext = createContext<NavModeValue | null>(null);

export function NavModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const forcedMode = routeMode(pathname);
  const [mode, setMode] = useState<NavMode>(() => forcedMode ?? "operator");

  useEffect(() => {
    const version = localStorage.getItem(MODE_VERSION_KEY);
    if (version !== MODE_VERSION) {
      localStorage.setItem(MODE_VERSION_KEY, MODE_VERSION);
      localStorage.setItem(MODE_STORAGE_KEY, "operator");
      setMode(forcedMode ?? "operator");
      return;
    }
    if (forcedMode) {
      setMode(forcedMode);
      return;
    }
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "author" || stored === "operator") setMode(stored);
  }, [forcedMode]);

  const switchMode = useCallback(
    (next: NavMode) => {
      if (next === mode) return;
      setMode(next);
      localStorage.setItem(MODE_STORAGE_KEY, next);
      router.push(next === "author" ? "/course-studio/" : "/dashboard/");
    },
    [mode, router],
  );

  return <NavModeContext.Provider value={{ mode, switchMode }}>{children}</NavModeContext.Provider>;
}

export function useNavMode() {
  const ctx = useContext(NavModeContext);
  if (!ctx) throw new Error("useNavMode must be used within NavModeProvider");
  return ctx;
}
