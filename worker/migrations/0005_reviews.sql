CREATE TABLE reviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  order_id      INTEGER REFERENCES orders(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    INTEGER NOT NULL,
  UNIQUE(product_id, user_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id);
