import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "../../lib/constants";
import { WhatsAppIcon } from "../common/icons";

// WHATSAPP_NUMBER is a placeholder (src/lib/constants.ts) — replace with the
// real business WhatsApp number before launch.
export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      style={{ position: "fixed" }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
