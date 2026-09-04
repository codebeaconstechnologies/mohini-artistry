// Per-category accent colours from the brand design system. Purely presentational —
// used to give each of the four product categories a distinct, tasteful accent
// (tile borders, category chips) without making the whole site look "rainbow".
export interface CategoryAccent {
  /** Tailwind text-color class for the category's primary accent. */
  text: string;
  /** Tailwind ring/border-color class (with opacity) for the category's primary accent. */
  ring: string;
  /** Tailwind text-color class for the category's secondary accent. */
  secondaryText: string;
}

const DEFAULT_ACCENT: CategoryAccent = {
  text: "text-teal",
  ring: "ring-hairline",
  secondaryText: "text-secondary",
};

const CATEGORY_ACCENTS: Record<string, CategoryAccent> = {
  "instant-rangoli": { text: "text-orange", ring: "ring-orange/30", secondaryText: "text-gold" },
  "resin-reflections": { text: "text-turquoise", ring: "ring-turquoise/30", secondaryText: "text-teal" },
  "fabric-canvas-art": { text: "text-magenta", ring: "ring-purple/30", secondaryText: "text-purple" },
  "moti-art-decor": { text: "text-gold", ring: "ring-gold/30", secondaryText: "text-orange" },
};

export function getCategoryAccent(slug: string | undefined): CategoryAccent {
  if (!slug) return DEFAULT_ACCENT;
  return CATEGORY_ACCENTS[slug] ?? DEFAULT_ACCENT;
}
