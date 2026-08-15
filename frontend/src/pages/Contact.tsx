import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  BUSINESS_CITY,
  BUSINESS_STATE,
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  SITE_NAME,
} from "../lib/constants";
import { WhatsAppIcon } from "../components/common/icons";

// There's no backend endpoint for a contact form yet, so this page offers
// direct mailto: / tel: / WhatsApp links instead of a form that would
// silently go nowhere. Wire up a real form once a /contact API endpoint exists.
export default function Contact() {
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Question about ${SITE_NAME}`)}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about ${SITE_NAME}.`)}`;
  const telHref = `tel:${CONTACT_PHONE_TEL}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-teal sm:text-4xl">Get in Touch</h1>
      <p className="mt-3 max-w-xl text-sm text-secondary sm:text-base">
        Have a question about an order, a custom piece, or bulk gifting? We'd love to hear from you.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <a
          href={mailtoHref}
          className="flex flex-col gap-2 rounded-2xl border border-hairline bg-softwhite p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-2xl">✉️</span>
          <h3 className="font-display text-lg font-semibold text-teal">Email Us</h3>
          <p className="text-sm text-secondary">{CONTACT_EMAIL}</p>
          <span className="mt-1 text-xs font-semibold text-turquoise">We usually reply within 24 hours →</span>
        </a>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-2 rounded-2xl border border-hairline bg-softwhite p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-2xl text-[#25D366]">
            <WhatsAppIcon className="h-7 w-7" />
          </span>
          <h3 className="font-display text-lg font-semibold text-teal">Chat on WhatsApp</h3>
          <p className="text-sm text-secondary">{WHATSAPP_DISPLAY}</p>
          <span className="mt-1 text-xs font-semibold text-turquoise">Fastest way to reach us →</span>
        </a>

        <a
          href={telHref}
          className="flex flex-col gap-2 rounded-2xl border border-hairline bg-softwhite p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-2xl">📞</span>
          <h3 className="font-display text-lg font-semibold text-teal">Call Us</h3>
          <p className="text-sm text-secondary">{CONTACT_PHONE_DISPLAY}</p>
          <span className="mt-1 text-xs font-semibold text-turquoise">Mon–Sat, 10am–7pm →</span>
        </a>
      </div>

      <div className="mt-10 rounded-2xl bg-cream/60 p-6 text-sm text-secondary">
        <h3 className="font-display text-base font-semibold text-teal">Our Workshop</h3>
        <p className="mt-1">
          {BUSINESS_CITY}, {BUSINESS_STATE}, India
        </p>
        <p className="mt-1">We currently ship across India. Delivery times vary by location and are shared once your order is prepared.</p>
      </div>
    </div>
  );
}
