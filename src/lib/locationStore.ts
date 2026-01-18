// src/lib/locationStore.ts
"use client";
import { create } from "zustand";

type State = { dong: string | null; setDong: (v: string) => void };

export const useSelectedDong = create<State>((set) => ({
  // Keep SSR and first client render consistent; hydrate from storage after mount.
  dong: null,
  setDong: (v: string) =>
    set(() => {
      if (typeof window !== "undefined") localStorage.setItem("selectedDong", v);
      return { dong: v };
    }),
}));
