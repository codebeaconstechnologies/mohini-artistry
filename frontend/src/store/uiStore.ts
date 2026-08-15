import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface UiState {
  isCartOpen: boolean;
  isAuthGateOpen: boolean;
  /** Where to send the user after a successful login/register from the auth gate. */
  authGateReturnTo: string | null;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openAuthGate: (returnTo?: string) => void;
  closeAuthGate: () => void;
  pushToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
}

let nextToastId = 1;

export const useUiStore = create<UiState>((set, get) => ({
  isCartOpen: false,
  isAuthGateOpen: false,
  authGateReturnTo: null,
  toasts: [],

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

  openAuthGate: (returnTo) => set({ isAuthGateOpen: true, authGateReturnTo: returnTo ?? null, isCartOpen: false }),
  closeAuthGate: () => set({ isAuthGateOpen: false, authGateReturnTo: null }),

  pushToast: (message, type = "info") => {
    const id = nextToastId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
