import type { EstrategiaRaw, TimeFrame, GaleLevel } from './types';

const API_BASE = '/api/quotex/catalogue';

export async function fetchEstrategias(
  timeFrame: TimeFrame = 5,
  gale: GaleLevel = 1
): Promise<EstrategiaRaw[]> {
  const params = new URLSearchParams({
    broker: 'quotex',
    ativo: 'TODOS',
    timeFrame: String(timeFrame),
    estrategia: 'TODOS',
    gale: String(gale),
  });

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
