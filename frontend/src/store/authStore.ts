import { create } from "zustand";
import type { User, RegisterInput, LoginInput } from "@mohini-artistry/shared";
import { authApi } from "../api/auth";
import { setAuthToken, setUnauthorizedHandler } from "../api/client";
import { AUTH_TOKEN_STORAGE_KEY } from "../lib/constants";
import { useCartStore } from "./cartStore";
import { useWishlistStore } from "./wishlistStore";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True until the initial hydrate() (token check + /auth/me) has settled. */
  isHydrating: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,

  login: async (input) => {
    const res = await authApi.login(input);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, res.token);
    setAuthToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    await useCartStore.getState().flushPendingCart();
    void useWishlistStore.getState().fetchWishlist();
  },

  register: async (input) => {
    const res = await authApi.register(input);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, res.token);
    setAuthToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    await useCartStore.getState().flushPendingCart();
    void useWishlistStore.getState().fetchWishlist();
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
    useCartStore.getState().resetLocal();
    useWishlistStore.getState().reset();
  },

  hydrate: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    setAuthToken(token);
    try {
      const user = await authApi.me();
      set({ user, token, isAuthenticated: true, isHydrating: false });
      // A pending (logged-out) local cart may exist from an earlier session
      // on this device even though the token itself is already valid.
      await useCartStore.getState().flushPendingCart();
      void useWishlistStore.getState().fetchWishlist();
    } catch {
      // Invalid/expired token — log out silently, no error shown on load.
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setAuthToken(null);
      set({ user: null, token: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));

// Any 401 from the API client logs the user out globally.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
