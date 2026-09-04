-- Incremental seed: run this once against the LIVE database to add the new
-- "Moti Art & Décor" category, Resin fridge magnet samples, and Moti samples
-- without re-inserting anything that's already there (seed.sql would conflict
-- on the existing unique slugs).
--
-- Usage:
--   cd worker
--   npx wrangler d1 execute mohini-artistry-db --remote --file=./seed_additions_2026-09.sql

INSERT INTO categories (slug, name, description, sort_order) VALUES
  ('moti-art-decor', 'Moti Art & Décor', 'Beaded moti (pearl) art and décor pieces — torans, wall hangings and festive décor strung by hand.', 4);

INSERT INTO products (
  slug, name, category_id, description, price_paise, compare_at_paise, stock,
  is_new_arrival, is_bestseller, is_active, rating_avg, rating_count, order_count,
  created_at, updated_at
) VALUES
  ('resin-floral-fridge-magnet-set', 'Floral Resin Fridge Magnet Set of 4',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'A set of four petite resin fridge magnets, each with a pressed real flower suspended under a glossy dome finish.',
    29900, NULL, 40, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000), (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('resin-mandala-fridge-magnet-set', 'Mandala Resin Fridge Magnet Set of 4',
    (SELECT id FROM categories WHERE slug = 'resin-reflections'),
    'Hand-poured mini mandala designs in resin, finished with fine gold and coloured accents — a set of four fridge magnets.',
    32900, 37900, 0, 0, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000), (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('moti-pearl-toran-door-hanging', 'Pearl Moti Toran Door Hanging',
    (SELECT id FROM categories WHERE slug = 'moti-art-decor'),
    'A traditional door toran hand-strung with white and gold moti beads, finished with tassels — a festive accent for any entryway.',
    89900, NULL, 22, 1, 0, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000), (CAST(strftime('%s','now') AS INTEGER) * 1000)),
  ('moti-beaded-wall-hanging', 'Beaded Moti Wall Hanging',
    (SELECT id FROM categories WHERE slug = 'moti-art-decor'),
    'An intricately beaded moti wall décor piece in a mandala layout, hand-strung on a wooden ring for a statement wall accent.',
    129900, 149900, 0, 0, 1, 1, 0, 0, 0,
    (CAST(strftime('%s','now') AS INTEGER) * 1000), (CAST(strftime('%s','now') AS INTEGER) * 1000));

INSERT INTO product_images (product_id, r2_key, url, sort_order, is_primary) VALUES
  ((SELECT id FROM products WHERE slug = 'resin-floral-fridge-magnet-set'), 'seed/resin-floral-fridge-magnet-set-1.jpg', 'https://picsum.photos/seed/resin-floral-fridge-magnet-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'resin-floral-fridge-magnet-set'), 'seed/resin-floral-fridge-magnet-set-2.jpg', 'https://picsum.photos/seed/resin-floral-fridge-magnet-set-2/800/800', 1, 0),
  ((SELECT id FROM products WHERE slug = 'resin-mandala-fridge-magnet-set'), 'seed/resin-mandala-fridge-magnet-set-1.jpg', 'https://picsum.photos/seed/resin-mandala-fridge-magnet-set-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'moti-pearl-toran-door-hanging'), 'seed/moti-pearl-toran-door-hanging-1.jpg', 'https://picsum.photos/seed/moti-pearl-toran-door-hanging-1/800/800', 0, 1),
  ((SELECT id FROM products WHERE slug = 'moti-pearl-toran-door-hanging'), 'seed/moti-pearl-toran-door-hanging-2.jpg', 'https://picsum.photos/seed/moti-pearl-toran-door-hanging-2/800/800', 1, 0),
  ((SELECT id FROM products WHERE slug = 'moti-beaded-wall-hanging'), 'seed/moti-beaded-wall-hanging-1.jpg', 'https://picsum.photos/seed/moti-beaded-wall-hanging-1/800/800', 0, 1);
