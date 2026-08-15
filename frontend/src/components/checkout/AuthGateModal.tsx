import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import { CloseIcon } from "../common/icons";

/**
 * Global auth gate: opened (via uiStore.openAuthGate) instead of a silent
 * redirect whenever an anonymous user tries to check out. On success it
 * closes and sends the user to wherever they were headed (authGateReturnTo).
 */
export default function AuthGateModal() {
  const isOpen = useUiStore((s) => s.isAuthGateOpen);
  const returnTo = useUiStore((s) => s.authGateReturnTo);
  const closeAuthGate = useUiStore((s) => s.closeAuthGate);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  if (!isOpen) return null;

  function handleSuccess() {
    closeAuthGate();
    if (returnTo) navigate(returnTo);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeAuthGate} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl bg-softwhite p-6 shadow-2xl">
        <button
          type="button"
          onClick={closeAuthGate}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-secondary hover:bg-cream"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <h2 className="font-display text-xl font-semibold text-teal">
          {tab === "login" ? "Log in to continue" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-secondary">Please log in or register to proceed to checkout.</p>

        <div className="mt-4 flex rounded-full bg-cream p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
              tab === "login" ? "bg-white text-teal shadow" : "text-secondary"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
              tab === "register" ? "bg-white text-teal shadow" : "text-secondary"
            }`}
          >
            Register
          </button>
        </div>

        <div className="mt-5">{tab === "login" ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}</div>
      </div>
    </div>
  );
}
