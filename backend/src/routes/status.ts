import type { FastifyInstance } from 'fastify';
import db from '../db.js';
import { getLastRun, getIsRunning, forceRefresh, getLastStats } from '../cron.js';
import type { Broker } from '../types.js';

const SINCE_MAP: Record<string, number> = {
  '1h': 3600,
  '3h': 10800,
  '6h': 21600,
  '12h': 43200,
  '24h': 86400,
  '3d': 259200,
  '7d': 604800,
};

export async function statusRoutes(app: FastifyInstance) {
  app.get('/api/status', async (_req, reply) => {
    const totalEstrategias = (db.prepare('SELECT COUNT(*) as c FROM estrategias').get() as { c: number }).c;
    const totalResultados = (db.prepare('SELECT COUNT(*) as c FROM resultados').get() as { c: number }).c;

    return reply.send({
      status: 'ok',
      lastRun: getLastRun(),
      isRunning: getIsRunning(),
      lastStats: getLastStats(),
      totalEstrategias,
      totalResultados,
    });
  });

  app.post('/api/refresh', async (_req, reply) => {
    if (getIsRunning()) {
      return reply.status(409).send({ error: 'Coleta já em andamento' });
    }

    forceRefresh().catch(() => {});
    return reply.send({ message: 'Coleta iniciada' });
  });

  app.get('/api/logs', async (req, reply) => {
    const query = req.query as {
      limit?: string;
      since?: string;
      broker?: Broker;
      status?: 'success' | 'error';
      timeFrame?: string;
      galeLevel?: string;
    };

    let where = '1=1';
    const params: any[] = [];

    if (query.since && SINCE_MAP[query.since]) {
      where += ` AND createdAt >= datetime('now', '-${SINCE_MAP[query.since]} seconds')`;
    }

    if (query.broker) {
      where += ' AND broker = ?';
      params.push(query.broker);
    }

    if (query.status) {
      where += ' AND status = ?';
      params.push(query.status);
    }

    if (query.timeFrame) {
      where += ' AND timeFrame = ?';
      params.push(parseInt(query.timeFrame));
    }

    if (query.galeLevel) {
      where += ' AND galeLevel = ?';
      params.push(parseInt(query.galeLevel));
    }

    const limit = Math.min(parseInt(query.limit || '50'), 500);

    const logs = db.prepare(`
      SELECT * FROM cron_logs
      WHERE ${where}
      ORDER BY createdAt DESC
      LIMIT ?
    `).all(...params, limit);

    return reply.send(logs);
  });
}
