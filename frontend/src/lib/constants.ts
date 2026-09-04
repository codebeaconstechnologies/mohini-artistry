// Site-wide constants that are safe to reference from anywhere in the app.
// Anything marked "placeholder" below must be replaced with real business
// details before this site goes live.

export const SITE_NAME = "Mohini Artistry";
export const SITE_TAGLINE = "Crafted with colour, made with love.";

/** WhatsApp business number in international format, no "+" or spaces. */
export const WHATSAPP_NUMBER = "918149637386";

/** WhatsApp number formatted for display (distinct from the calling number below). */
export const WHATSAPP_DISPLAY = "+91 81496 37386";

/** Prefilled message opened in the WhatsApp chat window. */
export const WHATSAPP_DEFAULT_MESSAGE = "Hi, I'd like to know more about your products";

/** Contact phone (calling) shown in the footer/contact page. */
export const CONTACT_PHONE_DISPLAY = "+91 97662 92409";

/** Contact phone in tel: link format. */
export const CONTACT_PHONE_TEL = "+919766292409";

/** Contact email shown in the footer/contact page. */
export const CONTACT_EMAIL = "mohiniartistry11@gmail.com";

/** Business location shown in the footer — matches the default shipping state. */
export const BUSINESS_CITY = "Pune";
export const BUSINESS_STATE = "Maharashtra";

/**
 * Multipart form field name the admin product-image upload endpoint expects.
 * The worker is being built concurrently — if it ends up using a different
 * field name than "file", change it here only.
 */
export const ADMIN_IMAGE_UPLOAD_FIELD_NAME = "file";

/** localStorage keys used across the app. */
export const AUTH_TOKEN_STORAGE_KEY = "tag_auth_token";
export const PENDING_CART_STORAGE_KEY = "tag_pending_cart";
export const RECENTLY_VIEWED_STORAGE_KEY = "tag_recently_viewed";

export const RECENTLY_VIEWED_MAX = 10;

export const RAZORPAY_CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Products priced below this (in paise) are treated as "contact for order"
 * placeholders — no fixed price yet, so the price is hidden and a WhatsApp
 * "Contact for Order" button is shown instead of Add to Cart.
 */
export const CONTACT_FOR_ORDER_MAX_PAISE = 500;
