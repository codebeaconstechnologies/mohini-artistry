ALTER TABLE order_items ADD COLUMN is_refund_allowed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN is_replace_allowed INTEGER NOT NULL DEFAULT 0;

ALTER TABLE orders ADD COLUMN delivered_at INTEGER;

CREATE TABLE return_requests (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id                      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id                 INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  user_id                       INTEGER NOT NULL REFERENCES users(id),
  type                          TEXT NOT NULL CHECK (type IN ('refund','replacement')),
  status                        TEXT NOT NULL DEFAULT 'requested',
  reason                        TEXT NOT NULL,
  admin_note                    TEXT,
  return_courier                TEXT,
  return_tracking_number        TEXT,
  replacement_courier           TEXT,
  replacement_tracking_number   TEXT,
  razorpay_refund_id            TEXT,
  refund_amount_paise           INTEGER,
  created_at                    INTEGER NOT NULL,
  updated_at                    INTEGER NOT NULL
);
CREATE INDEX idx_return_requests_order ON return_requests(order_id);
CREATE INDEX idx_return_requests_item ON return_requests(order_item_id);
CREATE INDEX idx_return_requests_status ON return_requests(status);

CREATE TABLE return_request_history (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  return_request_id   INTEGER NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  status               TEXT NOT NULL,
  note                 TEXT,
  created_at           INTEGER NOT NULL
);
CREATE INDEX idx_return_request_history_request ON return_request_history(return_request_id);
