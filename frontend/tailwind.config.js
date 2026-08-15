/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand — Deep Teal. Headings, navbar text, footer bg, premium UI.
        teal: {
          DEFAULT: "#0D3B4E",
          hover: "#092C3A",
        },
        // Primary CTA — Magenta Pink. Buttons, active states, wishlist, highlights.
        magenta: {
          DEFAULT: "#C2185B",
          hover: "#A9144E",
        },
        // Premium accent — Royal Gold. Thin borders, badges, decorative highlights.
        gold: "#D4A017",
        // Accent — Sunset Orange. Offers, festival badges, sale labels.
        orange: "#F08A24",
        // Accent — Turquoise. Links, secondary buttons, hover states.
        turquoise: "#0FA3A3",
        // Luxury accent — Royal Purple. Used sparingly for premium sections.
        purple: "#3B1D4A",
        // Main background — Warm Cream.
        cream: "#FFF6E8",
        // Card/panel background — Soft White.
        softwhite: "#FFFCF7",
        // Main text — Charcoal (never pure black).
        charcoal: "#1A1A1A",
        // Secondary/supporting text.
        secondary: "#52666D",
        // Card borders, dividers, input borders, decorative lines.
        hairline: "#E8D8B8",
        // Muted light text for use on dark teal surfaces (e.g. footer secondary text).
        mist: "#D7E2E5",
      },
      fontFamily: {
        display: ["'Playfair Display'", "'Cinzel'", "Georgia", "serif"],
        body: ["'Lato'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
