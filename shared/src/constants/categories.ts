export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: "instant-rangoli",
    name: "Instant Rangoli",
    description: "Ready-to-place rangoli mats and stencil sets for a flawless design in seconds, no powder or mess.",
    sortOrder: 1,
  },
  {
    slug: "resin-reflections",
    name: "Resin Reflections",
    description: "Hand-poured resin art — coasters, trays, wall pieces and keepsakes with a glass-like finish.",
    sortOrder: 2,
  },
  {
    slug: "fabric-canvas-art",
    name: "Fabric Canvas Art",
    description: "Hand-painted fabric canvases and wall hangings blending traditional motifs with modern colour.",
    sortOrder: 3,
  },
  {
    slug: "moti-art-decor",
    name: "Moti Art & Décor",
    description: "Beaded moti (pearl) art and décor pieces — torans, wall hangings and festive décor strung by hand.",
    sortOrder: 4,
  },
];

export const CATEGORY_SLUGS = CATEGORY_SEEDS.map((c) => c.slug);
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
