import type { AnaliseEstrategia, TimeFrame, GaleLevel, Broker } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchEstrategias(
  timeFrame: TimeFrame = 5,
  gale: GaleLevel = 1,
  broker: Broker = 'quotex',
  since: string = 'all'
): Promise<AnaliseEstrategia[]> {
  const params = new URLSearchParams({
    broker,
    timeFrame: String(timeFrame),
    gale: String(gale),
    since,
  });

  const res = await fetch(`${API_BASE}/api/estrategias?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchStatus(): Promise<{
  status: string;
  lastRun: string | null;
  isRunning: boolean;
  lastStats: { novos: number; erros: number; tempo: number };
  totalEstrategias: number;
  totalResultados: number;
}> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function forceRefresh(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/refresh`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
