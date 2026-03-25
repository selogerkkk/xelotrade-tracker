import type { EstrategiaRaw, Broker, TimeFrame, GaleLevel } from '../types.js';

const SIO_BASE = 'https://sio.tools';

export async function fetchFromSio(
  broker: Broker,
  timeFrame: TimeFrame,
  gale: GaleLevel,
  retries = 2
): Promise<EstrategiaRaw[]> {
  const url = `${SIO_BASE}/quotex/catalogue?broker=${broker}&ativo=TODOS&timeFrame=${timeFrame}&estrategia=TODOS&gale=${gale}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 502 || res.status === 503) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error(`SIO API error: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(`SIO API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return [];
}
