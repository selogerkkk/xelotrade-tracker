import type { FastifyInstance } from 'fastify';
import db from '../db.js';
import { analisar } from '../services/analysis.js';
import { DEFAULT_SETTINGS } from '../types.js';
import type { Broker, TimeFrame, GaleLevel, Quadrante } from '../types.js';

const SINCE_MAP: Record<string, number> = {
  '1h': 3600,
  '3h': 10800,
  '6h': 21600,
  '12h': 43200,
  '24h': 86400,
  '3d': 259200,
  '7d': 604800,
  '30d': 2592000,
};

export async function estrategiasRoutes(app: FastifyInstance) {
  app.get('/api/estrategias', async (req, reply) => {
    const query = req.query as {
      broker?: Broker;
      timeFrame?: string;
      gale?: string;
      since?: string;
      payout?: string;
      galeMultiplier?: string;
    };

    const broker = query.broker || 'quotex';
    const timeFrame = parseInt(query.timeFrame || '5') as TimeFrame;
    const galeLevel = parseInt(query.gale || '1') as GaleLevel;
    const since = query.since || 'all';

    const settings = {
      ...DEFAULT_SETTINGS,
      payout: parseFloat(query.payout || String(DEFAULT_SETTINGS.payout)),
      galeMultiplier: parseFloat(query.galeMultiplier || String(DEFAULT_SETTINGS.galeMultiplier)),
    };

    let sinceTimestamp = 0;
    if (since !== 'all' && SINCE_MAP[since]) {
      sinceTimestamp = Math.floor(Date.now() / 1000) - SINCE_MAP[since];
    }

    // Always query galeLevel=2 data (contains all modes: W, H, G1, G2)
    const estrategias = db.prepare(`
      SELECT * FROM estrategias
      WHERE broker = ? AND timeFrame = ? AND galeLevel = 2
    `).all(broker, timeFrame) as Array<{
      id: number;
      ativo: string;
      estrategia: string;
      broker: string;
      timeFrame: number;
      galeLevel: number;
      winrateReportado: number;
      atualizado: string;
    }>;

    const resultado = [];

    for (const est of estrategias) {
      let quadrantes: Quadrante[];

      if (sinceTimestamp > 0) {
        quadrantes = db.prepare(`
          SELECT resultado, timestamp FROM resultados
          WHERE estrategia_id = ? AND timestamp >= ?
          ORDER BY timestamp ASC
        `).all(est.id, sinceTimestamp) as Quadrante[];
      } else {
        quadrantes = db.prepare(`
          SELECT resultado, timestamp FROM resultados
          WHERE estrategia_id = ?
          ORDER BY timestamp ASC
        `).all(est.id) as Quadrante[];
      }

      if (quadrantes.length === 0) continue;

      const analise = analisar(
        `${est.ativo}-${est.estrategia}`,
        est.ativo,
        est.estrategia,
        est.broker,
        est.timeFrame,
        galeLevel,  // Use requested gale level (controls what modes are shown)
        est.winrateReportado,
        est.atualizado,
        quadrantes,
        settings
      );

      resultado.push(analise);
    }

    return reply.send(resultado);
  });
}
