-- Seed like counts for local testing
INSERT OR IGNORE INTO like_counts (slug, count) VALUES
  ('ucollab', 12),
  ('gitmsg', 7);

-- Seed view counts for local testing
INSERT OR IGNORE INTO view_counts (slug, count) VALUES
  ('ucollab', 342),
  ('gitmsg', 128);
