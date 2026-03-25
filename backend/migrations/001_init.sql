CREATE TABLE IF NOT EXISTS estrategias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ativo TEXT NOT NULL,
  estrategia TEXT NOT NULL,
  broker TEXT NOT NULL,
  timeFrame INTEGER NOT NULL,
  galeLevel INTEGER NOT NULL,
  winrateReportado REAL,
  atualizado TEXT,
  updatedAt TEXT DEFAULT (datetime('now')),
  UNIQUE(ativo, estrategia, broker, timeFrame, galeLevel)
);

CREATE TABLE IF NOT EXISTS resultados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estrategia_id INTEGER NOT NULL,
  resultado TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (estrategia_id) REFERENCES estrategias(id),
  UNIQUE(estrategia_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_resultados_ts ON resultados(estrategia_id, timestamp);
