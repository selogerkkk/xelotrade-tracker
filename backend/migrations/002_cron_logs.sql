CREATE TABLE IF NOT EXISTS cron_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broker TEXT NOT NULL,
  timeFrame INTEGER NOT NULL,
  galeLevel INTEGER NOT NULL,
  status TEXT NOT NULL,
  novos INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  erro TEXT,
  tempo INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_date ON cron_logs(createdAt);
