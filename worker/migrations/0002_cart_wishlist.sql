CREATE TABLE carts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE cart_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id       INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  added_at      INTEGER NOT NULL,
  UNIQUE(cart_id, product_id)
);

CREATE TABLE wishlists (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at      INTEGER NOT NULL,
  UNIQUE(user_id, product_id)
);
CREATE INDEX idx_wishlist_user ON wishlists(user_id);
