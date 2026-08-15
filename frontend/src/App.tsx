import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./router";
import Header from "./components/layout/Header";
import PromoBanner from "./components/layout/PromoBanner";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import CartSidebar from "./components/layout/CartSidebar";
import AuthGateModal from "./components/checkout/AuthGateModal";
import ToastViewport from "./components/common/ToastViewport";
import { useAuthStore } from "./store/authStore";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
    // Runs once on mount; hydrate itself is a stable zustand action reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <PromoBanner />
      <Header />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartSidebar />
      <AuthGateModal />
      <ToastViewport />
    </div>
  );
}
