import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'xelotrade.db');
const migrationsPath = path.join(__dirname, '..', 'migrations');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    executedAt TEXT DEFAULT (datetime('now'))
  );
`);

function runMigrations(): void {
  const files = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const executed = new Set(
    db.prepare('SELECT name FROM migrations').all().map((r: any) => r.name)
  );

  const insertMigration = db.prepare('INSERT INTO migrations (name) VALUES (?)');
  const runSQL = db.transaction((name: string, sql: string) => {
    db.exec(sql);
    insertMigration.run(name);
  });

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`[DB] Migration ${file} já executada, pulando`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf-8');
    console.log(`[DB] Executando migration: ${file}`);
    runSQL(file, sql);
    console.log(`[DB] Migration ${file} concluída`);
  }
}

runMigrations();

export default db;

export function upsertEstrategia(
  ativo: string,
  estrategia: string,
  broker: string,
  timeFrame: number,
  galeLevel: number,
  winrateReportado: number,
  atualizado: string
): number {
  const stmt = db.prepare(`
    INSERT INTO estrategias (ativo, estrategia, broker, timeFrame, galeLevel, winrateReportado, atualizado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(ativo, estrategia, broker, timeFrame, galeLevel)
    DO UPDATE SET winrateReportado = ?, atualizado = ?, updatedAt = datetime('now')
    RETURNING id
  `);

  const row = stmt.get(
    ativo, estrategia, broker, timeFrame, galeLevel, winrateReportado, atualizado,
    winrateReportado, atualizado
  ) as { id: number };

  return row.id;
}

export function insertResultado(estrategiaId: number, resultado: string, timestamp: number): boolean {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO resultados (estrategia_id, resultado, timestamp)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(estrategiaId, resultado, timestamp);
  return result.changes > 0;
}

export function insertCronLog(
  broker: string,
  timeFrame: number,
  galeLevel: number,
  status: 'success' | 'error',
  novos: number,
  total: number,
  tempo: number,
  erro: string | null = null
): void {
  const stmt = db.prepare(`
    INSERT INTO cron_logs (broker, timeFrame, galeLevel, status, novos, total, tempo, erro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(broker, timeFrame, galeLevel, status, novos, total, tempo, erro);
}
