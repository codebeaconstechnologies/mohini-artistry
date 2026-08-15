CREATE TABLE rate_limit_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket_key    TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX idx_rate_limit_bucket_time ON rate_limit_events(bucket_key, created_at);
