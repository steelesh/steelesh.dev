-- Likes: one like per IP per slug
CREATE TABLE likes (
  slug     TEXT NOT NULL,
  ip_hash  TEXT NOT NULL,
  liked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (slug, ip_hash)
);

-- Materialized like counts for fast reads
CREATE TABLE like_counts (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- Page view counts
CREATE TABLE view_counts (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
