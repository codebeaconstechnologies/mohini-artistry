CREATE TABLE coupons (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  code                TEXT NOT NULL UNIQUE,
  type                TEXT NOT NULL CHECK (type IN ('percent','flat','free_shipping')),
  value               INTEGER NOT NULL DEFAULT 0,
  min_order_paise     INTEGER NOT NULL DEFAULT 0,
  max_discount_paise  INTEGER,
  is_active           INTEGER NOT NULL DEFAULT 1,
  starts_at           INTEGER,
  expires_at          INTEGER,
  usage_limit         INTEGER,
  usage_count         INTEGER NOT NULL DEFAULT 0,
  per_user_limit      INTEGER NOT NULL DEFAULT 1,
  created_at          INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_coupons_code ON coupons(code);

CREATE TABLE coupon_redemptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id     INTEGER NOT NULL REFERENCES coupons(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  order_id      INTEGER NOT NULL REFERENCES orders(id),
  redeemed_at   INTEGER NOT NULL
);
CREATE INDEX idx_coupon_redemptions_user_coupon ON coupon_redemptions(user_id, coupon_id);
