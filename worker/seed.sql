INSERT INTO categories (slug, name, description, sort_order) VALUES
  ('instant-rangoli', 'Instant Rangoli', 'Ready-to-place rangoli mats and stencil sets for a flawless design in seconds, no powder or mess.', 1),
  ('resin-reflections', 'Resin Reflections', 'Hand-poured resin art — coasters, trays, wall pieces and keepsakes with a glass-like finish.', 2),
  ('fabric-canvas-art', 'Fabric Canvas Art', 'Hand-painted fabric canvases and wall hangings blending traditional motifs with modern colour.', 3),
  ('moti-art-decor', 'Moti Art & Décor', 'Beaded moti (pearl) art and décor pieces — torans, wall hangings and festive décor strung by hand.', 4);

-- ---------------------------------------------------------------------------
-- Sample products (demo/seed data only — real photography will replace the
-- picsum.photos placeholder image URLs once uploaded through the admin panel).
-- ---------------------------------------------------------------------------

INSERT INTO products (
  slug, name, category_id, description, price_paise, compare_at_paise, stock,
  is_new_arrival, is_bestseller, is_active, rating_avg, rating_count, order_count,
  created_at, updated_at
) VALUES
  -- Instant Rangoli (5)
  ('instant-sanskar-bharti-stencil-set', 'Sanskar Bharti Rangoli Stencil Set',
    (SELECT id FROM categories WHERE slug = 'instant-rangoli'),
    'A 7-piece nesting stencil set for the classic Sanskar Bharti dot-grid style — trace, fill, lift, and your rangoli is done in minutes.',
    39900, NULL, 45, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (18 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (18 * 86400000)),
  ('instant-floral-mandala-mat', 'Floral Mandala Ready Rangoli Mat',
    (SELECT id FROM categories WHERE slug = 'instant-rangoli'),
    'A pre-printed washable mat in a symmetrical floral mandala pattern — unroll it at the door and skip the powder mess entirely.',
    54900, 64900, 28, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (2 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (2 * 86400000)),
  ('instant-diwali-diya-stencil-kit', 'Diwali Diya Stencil Kit',
    (SELECT id FROM categories WHERE slug = 'instant-rangoli'),
    'Six diya-shaped stencils in graduated sizes, ideal for framing your main rangoli design with a ring of glowing lamps.',
    29900, NULL, 50, 0, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (12 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (12 * 86400000)),
  ('instant-swastik-welcome-mat', 'Swastik Welcome Rangoli Mat',
    (SELECT id FROM categories WHERE slug = 'instant-rangoli'),
    'A compact auspicious swastik-motif mat in vermilion and gold, sized to sit neatly at the threshold of your pooja room.',
    34900, 39900, 35, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (22 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (22 * 86400000)),
  ('instant-om-symmetry-stencil-set', 'Om Symmetry Stencil Set',
    (SELECT id FROM categories WHERE slug = 'instant-rangoli'),
    'A layered stencil set that builds an Om-centred symmetrical rangoli in four easy passes, reusable across many festivals.',
    44900, NULL, 20, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (3 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (3 * 86400000)),

  -- Resin Reflections (4)
  ('resin-ocean-wave-coaster-set', 'Ocean Wave Resin Coaster Set of 4',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'Deep blue and white resin poured in swirling ocean-wave layers, cast into four coasters with a glossy, glass-like finish.',
    99900, 119900, 18, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (10 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (10 * 86400000)),
  ('resin-galaxy-swirl-tray', 'Galaxy Swirl Resin Serving Tray',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'A statement serving tray with a hand-poured galaxy swirl of violet, midnight blue, and fine gold flecks beneath a mirror-clear coat.',
    179900, NULL, 10, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (1 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (1 * 86400000)),
  ('resin-pressed-flower-keychain-set', 'Pressed Flower Resin Keychain Set',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'Real pressed marigold and jasmine blooms suspended in clear resin pendants — a set of three keychains, no two exactly alike.',
    49900, 59900, 33, 0, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (28 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (28 * 86400000)),
  ('resin-marble-agate-wall-clock', 'Marble Agate Resin Wall Clock',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'A 12-inch wall clock with a hand-poured faux-agate resin face in white, grey, and gold veining, set in a matte black frame.',
    249900, 299900, 7, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (30 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (30 * 86400000)),

  -- Resin Reflections — Fridge Magnets (2)
  ('resin-floral-fridge-magnet-set', 'Floral Resin Fridge Magnet Set of 4',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'A set of four petite resin fridge magnets, each with a pressed real flower suspended under a glossy dome finish.',
    29900, NULL, 40, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (6 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (6 * 86400000)),
  ('resin-mandala-fridge-magnet-set', 'Mandala Resin Fridge Magnet Set of 4',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'Hand-poured mini mandala designs in resin, finished with fine gold and coloured accents — a set of four fridge magnets.',
    32900, 37900, 0, 0, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (8 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (8 * 86400000)),

  -- Fabric Canvas Art (4)
  ('fabric-madhubani-elephant-canvas', 'Madhubani Elephant Hand-Painted Canvas',
    (SELECT id FROM categories WHERE slug = 'fabric-canvas-art'),
    'A caparisoned elephant rendered in traditional Madhubani line-work and natural pigments, hand-painted on stretched cotton canvas.',
    189900, NULL, 9, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (14 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (14 * 86400000)),
  ('fabric-warli-village-wall-hanging', 'Warli Village Fabric Wall Hanging',
    (SELECT id FROM categories WHERE slug = 'fabric-canvas-art'),
    'Earth-toned Warli figures depict a village harvest scene, hand-painted on raw cotton fabric and finished with a wooden hanging rod.',
    149900, 169900, 14, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (4 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (4 * 86400000)),
  ('fabric-peacock-dance-canvas', 'Peacock Dance Hand-Painted Canvas',
    (SELECT id FROM categories WHERE slug = 'fabric-canvas-art'),
    'A dancing peacock in full plumage, hand-painted in jewel-toned fabric paints across a wide canvas built for a living-room feature wall.',
    219900, NULL, 6, 0, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (19 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (19 * 86400000)),
  ('fabric-lotus-mandala-tapestry', 'Lotus Mandala Fabric Tapestry',
    (SELECT id FROM categories WHERE slug = 'fabric-canvas-art'),
    'A hand-painted lotus mandala in layered pinks and golds on soft cotton fabric, sized to double as a tapestry or a floor spread.',
    129900, 149900, 16, 1, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (5 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (5 * 86400000)),

  -- Moti Art & Décor (2)
  ('moti-pearl-toran-door-hanging', 'Pearl Moti Toran Door Hanging',
    (SELECT id FROM categories WHERE slug = 'moti-art-decor'),
    'A traditional door toran hand-strung with white and gold moti beads, finished with tassels — a festive accent for any entryway.',
    89900, NULL, 22, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (7 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (7 * 86400000)),
  ('moti-beaded-wall-hanging', 'Beaded Moti Wall Hanging',
    (SELECT id FROM categories WHERE slug = 'moti-art-decor'),
    'An intricately beaded moti wall décor piece in a mandala layout, hand-strung on a wooden ring for a statement wall accent.',
    129900, 149900, 0, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (9 * 86400000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000) - (9 * 86400000));

INSERT INTO product_images (product_id, r2_key, url, sort_order, is_primary) VALUES
  ((SELECT id FROM products WHERE slug = 'instant-sanskar-bharti-stencil-set'), 'seed/instant-sanskar-bharti-stencil-set-1.jpg', 'https://picsum.photos/seed/instant-sanskar-bharti-stencil-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'instant-sanskar-bharti-stencil-set'), 'seed/instant-sanskar-bharti-stencil-set-2.jpg', 'https://picsum.photos/seed/instant-sanskar-bharti-stencil-set-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'instant-floral-mandala-mat'), 'seed/instant-floral-mandala-mat-1.jpg', 'https://picsum.photos/seed/instant-floral-mandala-mat-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'instant-diwali-diya-stencil-kit'), 'seed/instant-diwali-diya-stencil-kit-1.jpg', 'https://picsum.photos/seed/instant-diwali-diya-stencil-kit-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'instant-diwali-diya-stencil-kit'), 'seed/instant-diwali-diya-stencil-kit-2.jpg', 'https://picsum.photos/seed/instant-diwali-diya-stencil-kit-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'instant-swastik-welcome-mat'), 'seed/instant-swastik-welcome-mat-1.jpg', 'https://picsum.photos/seed/instant-swastik-welcome-mat-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'instant-om-symmetry-stencil-set'), 'seed/instant-om-symmetry-stencil-set-1.jpg', 'https://picsum.photos/seed/instant-om-symmetry-stencil-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'instant-om-symmetry-stencil-set'), 'seed/instant-om-symmetry-stencil-set-2.jpg', 'https://picsum.photos/seed/instant-om-symmetry-stencil-set-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'resin-ocean-wave-coaster-set'), 'seed/resin-ocean-wave-coaster-set-1.jpg', 'https://picsum.photos/seed/resin-ocean-wave-coaster-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'resin-ocean-wave-coaster-set'), 'seed/resin-ocean-wave-coaster-set-2.jpg', 'https://picsum.photos/seed/resin-ocean-wave-coaster-set-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'resin-galaxy-swirl-tray'), 'seed/resin-galaxy-swirl-tray-1.jpg', 'https://picsum.photos/seed/resin-galaxy-swirl-tray-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'resin-pressed-flower-keychain-set'), 'seed/resin-pressed-flower-keychain-set-1.jpg', 'https://picsum.photos/seed/resin-pressed-flower-keychain-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'resin-pressed-flower-keychain-set'), 'seed/resin-pressed-flower-keychain-set-2.jpg', 'https://picsum.photos/seed/resin-pressed-flower-keychain-set-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'resin-marble-agate-wall-clock'), 'seed/resin-marble-agate-wall-clock-1.jpg', 'https://picsum.photos/seed/resin-marble-agate-wall-clock-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'fabric-madhubani-elephant-canvas'), 'seed/fabric-madhubani-elephant-canvas-1.jpg', 'https://picsum.photos/seed/fabric-madhubani-elephant-canvas-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'fabric-madhubani-elephant-canvas'), 'seed/fabric-madhubani-elephant-canvas-2.jpg', 'https://picsum.photos/seed/fabric-madhubani-elephant-canvas-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'fabric-warli-village-wall-hanging'), 'seed/fabric-warli-village-wall-hanging-1.jpg', 'https://picsum.photos/seed/fabric-warli-village-wall-hanging-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'fabric-peacock-dance-canvas'), 'seed/fabric-peacock-dance-canvas-1.jpg', 'https://picsum.photos/seed/fabric-peacock-dance-canvas-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'fabric-peacock-dance-canvas'), 'seed/fabric-peacock-dance-canvas-2.jpg', 'https://picsum.photos/seed/fabric-peacock-dance-canvas-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'fabric-lotus-mandala-tapestry'), 'seed/fabric-lotus-mandala-tapestry-1.jpg', 'https://picsum.photos/seed/fabric-lotus-mandala-tapestry-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'resin-floral-fridge-magnet-set'), 'seed/resin-floral-fridge-magnet-set-1.jpg', 'https://picsum.photos/seed/resin-floral-fridge-magnet-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'resin-floral-fridge-magnet-set'), 'seed/resin-floral-fridge-magnet-set-2.jpg', 'https://picsum.photos/seed/resin-floral-fridge-magnet-set-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'resin-mandala-fridge-magnet-set'), 'seed/resin-mandala-fridge-magnet-set-1.jpg', 'https://picsum.photos/seed/resin-mandala-fridge-magnet-set-1/800/800', 0, 1),

  ((SELECT id FROM products WHERE slug = 'moti-pearl-toran-door-hanging'), 'seed/moti-pearl-toran-door-hanging-1.jpg', 'https://picsum.photos/seed/moti-pearl-toran-door-hanging-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'moti-pearl-toran-door-hanging'), 'seed/moti-pearl-toran-door-hanging-2.jpg', 'https://picsum.photos/seed/moti-pearl-toran-door-hanging-2/800/800', 1, 0),

  ((SELECT id FROM products WHERE slug = 'moti-beaded-wall-hanging'), 'seed/moti-beaded-wall-hanging-1.jpg', 'https://picsum.photos/seed/moti-beaded-wall-hanging-1/800/800', 0, 1);
