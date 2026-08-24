import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CheckIn } from "./tasks";

const STORAGE_KEY = "fokus.checkin";

interface StoredCheckIn extends CheckIn {
  date: string; // YYYY-MM-DD
  at: string; // ISO
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface CheckInContextValue {
  checkIn: CheckIn | null;
  checkedInAt: string | null;
  isToday: boolean;
  saveCheckIn: (data: CheckIn) => void;
  clearCheckIn: () => void;
}

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredCheckIn | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw) as StoredCheckIn);
    } catch {
      /* ignora */
    }
  }, []);

  const saveCheckIn = useCallback((data: CheckIn) => {
    const next: StoredCheckIn = { ...data, date: today(), at: new Date().toISOString() };
    setStored(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignora */
    }
  }, []);

  const clearCheckIn = useCallback(() => {
    setStored(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignora */
    }
  }, []);

  const value = useMemo<CheckInContextValue>(() => {
    const checkIn: CheckIn | null = stored
      ? {
          energy: stored.energy,
          mood: stored.mood,
          availableMinutes: stored.availableMinutes,
          priorities: stored.priorities ?? "",
        }
      : null;
    return {
      checkIn,
      checkedInAt: stored?.at ?? null,
      isToday: stored?.date === today(),
      saveCheckIn,
      clearCheckIn,
    };
  }, [stored, saveCheckIn, clearCheckIn]);

  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
}

export function useCheckIn(): CheckInContextValue {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error("useCheckIn deve ser usado dentro de <CheckInProvider>");
  return ctx;
}
