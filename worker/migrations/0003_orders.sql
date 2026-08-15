CREATE TABLE orders (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number          TEXT NOT NULL UNIQUE,
  user_id               INTEGER NOT NULL REFERENCES users(id),
  status                TEXT NOT NULL DEFAULT 'placed'
                          CHECK (status IN ('placed','prepared','shipped','delivered','cancelled')),
  subtotal_paise        INTEGER NOT NULL,
  shipping_paise        INTEGER NOT NULL,
  discount_paise        INTEGER NOT NULL DEFAULT 0,
  total_paise           INTEGER NOT NULL,
  coupon_code           TEXT,
  shipping_name         TEXT NOT NULL,
  shipping_phone        TEXT NOT NULL,
  shipping_address1     TEXT NOT NULL,
  shipping_address2     TEXT,
  shipping_state        TEXT NOT NULL DEFAULT 'Maharashtra',
  shipping_city         TEXT NOT NULL,
  shipping_pincode      TEXT NOT NULL,
  contact_email         TEXT NOT NULL,
  razorpay_order_id     TEXT NOT NULL UNIQUE,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','verified','failed')),
  payment_verified_at   INTEGER,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_razorpay_order ON orders(razorpay_order_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        INTEGER NOT NULL REFERENCES products(id),
  product_name      TEXT NOT NULL,
  unit_price_paise  INTEGER NOT NULL,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  line_total_paise  INTEGER NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  note          TEXT,
  created_at    INTEGER NOT NULL
);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
