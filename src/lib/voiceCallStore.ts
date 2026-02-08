"use client";
import { create } from "zustand";

export interface TranscriptEntry {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

interface VoiceCallState {
  isCallActive: boolean;
  postType: "junior" | "senior" | null;
  draft: Record<string, unknown>;
  transcript: TranscriptEntry[];

  startCall: (postType: "junior" | "senior") => void;
  endCall: () => void;
  updateField: (fields: Record<string, unknown>) => void;
  addTranscript: (entry: TranscriptEntry) => void;
  clearDraft: () => void;
  getDraftForForm: () => Record<string, unknown>;
}

const STORAGE_KEY = "voiceCallDraft";

function saveDraft(draft: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  } catch {
    // ignore storage errors
  }
}

function loadDraft(): Record<string, unknown> {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

export const useVoiceCallStore = create<VoiceCallState>((set, get) => ({
  isCallActive: false,
  postType: null,
  draft: loadDraft(),
  transcript: [],

  startCall: (postType) =>
    set({ isCallActive: true, postType, draft: {}, transcript: [] }),

  endCall: () => set({ isCallActive: false }),

  updateField: (fields) =>
    set((state) => {
      const next = { ...state.draft, ...fields };
      saveDraft(next);
      return { draft: next };
    }),

  addTranscript: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),

  clearDraft: () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    set({ draft: {}, transcript: [], postType: null });
  },

  getDraftForForm: () => {
    return { ...get().draft };
  },
}));
