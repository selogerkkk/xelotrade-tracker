import Fastify from 'fastify';
import { estrategiasRoutes } from './routes/estrategias.js';
import { statusRoutes } from './routes/status.js';
import { startCron } from './cron.js';

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({ logger: true });

await app.register(import('@fastify/cors'), {
  origin: true,
});

await app.register(estrategiasRoutes);
await app.register(statusRoutes);

app.get('/api/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`Server running on http://${HOST}:${PORT}`);
  startCron();
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
