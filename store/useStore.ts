"use client";

import { create } from "zustand";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

type Store = {
  // 🧭 Category selection
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;

  // 📱 Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;

  // 🔔 Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useStore = create<Store>((set) => ({
  // 🧭 Category
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  // 📱 Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),

  // 🔔 Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), ...toast }
      ]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
  clearToasts: () => set({ toasts: [] }),
}));
