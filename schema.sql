DROP TABLE IF EXISTS votes;
CREATE TABLE votes (
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (item_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_item ON votes(item_id);