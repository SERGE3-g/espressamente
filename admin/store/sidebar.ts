"use client";

import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  hydrated: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  hydrate: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: true, // default collapsed, hydrate from localStorage on mount
  hydrated: false,
  toggle: () =>
    set((s) => {
      const next = !s.collapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed", String(next));
      }
      return { collapsed: next };
    }),
  setCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
    set({ collapsed });
  },
  hydrate: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-collapsed");
      set({ collapsed: stored === null ? false : stored === "true", hydrated: true });
    }
  },
}));
