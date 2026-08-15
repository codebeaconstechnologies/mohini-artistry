import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

/**
 * Shared "go to checkout" gate used by CartSidebar, Cart, and ProductDetail's
 * Buy Now button: authenticated users navigate straight to /checkout,
 * anonymous users see the AuthGateModal instead of a silent redirect, and
 * land on /checkout automatically once they log in or register.
 */
export function useCheckoutGate(): () => void {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthGate = useUiStore((s) => s.openAuthGate);

  return () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      openAuthGate("/checkout");
    }
  };
}
