import cron from 'node-cron';
import { fetchFromSio } from './services/sio.js';
import { upsertEstrategia, insertResultado, insertCronLog } from './db.js';
import type { Broker, TimeFrame, GaleLevel } from './types.js';

const BROKERS: Broker[] = ['quotex', 'iqoption'];
const TIMEFRAMES: TimeFrame[] = [1, 5, 15, 30];
const GALE_LEVELS: GaleLevel[] = [2];  // Only fetch gale=2, derive other modes from it

interface FetchTask {
  broker: Broker;
  timeFrame: TimeFrame;
  gale: GaleLevel;
}

function generateTasks(): FetchTask[] {
  const tasks: FetchTask[] = [];
  for (const broker of BROKERS) {
    for (const timeFrame of TIMEFRAMES) {
      for (const gale of GALE_LEVELS) {
        tasks.push({ broker, timeFrame, gale });
      }
    }
  }
  return tasks;
}

let lastRun: string | null = null;
let isRunning = false;
let lastStats = { novos: 0, erros: 0, tempo: 0 };

async function processTask(task: FetchTask): Promise<{ novos: number; total: number; erro: boolean; errorMsg: string | null }> {
  const startTime = Date.now();
  try {
    const data = await fetchFromSio(task.broker, task.timeFrame, task.gale);
    let novos = 0;
    let total = 0;

    for (const item of data) {
      const estrategiaId = upsertEstrategia(
        item.ativo,
        item.estrategia,
        task.broker,
        task.timeFrame,
        task.gale,
        item.winrate,
        item.atualizado
      );

      for (const q of item.quadrantes) {
        total++;
        if (insertResultado(estrategiaId, q.resultado, q.timestamp)) {
          novos++;
        }
      }
    }

    const tempo = Date.now() - startTime;
    insertCronLog(task.broker, task.timeFrame, task.gale, 'success', novos, total, tempo);

    console.log(`[CRON] ${task.broker} M${task.timeFrame} G${task.gale}: ${novos} novos de ${total} (${tempo}ms)`);
    return { novos, total, erro: false, errorMsg: null };
  } catch (err) {
    const tempo = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);
    insertCronLog(task.broker, task.timeFrame, task.gale, 'error', 0, 0, tempo, errorMsg);

    console.error(`[CRON] Erro: ${task.broker} M${task.timeFrame} G${task.gale}`, errorMsg);
    return { novos: 0, total: 0, erro: true, errorMsg };
  }
}

async function coletarDados(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  const startTime = Date.now();
  console.log(`\n[CRON] ========== Iniciando coleta: ${new Date().toISOString()} ==========`);

  const tasks = generateTasks();
  console.log(`[CRON] ${tasks.length} tarefas para processar`);

  // Executar em paralelo com limite de 4 simultâneas
  const results: { novos: number; total: number; erro: boolean }[] = [];
  for (let i = 0; i < tasks.length; i += 4) {
    const batch = tasks.slice(i, i + 4);
    const batchResults = await Promise.all(batch.map(processTask));
    results.push(...batchResults);
  }

  const totalNovos = results.reduce((s, r) => s + r.novos, 0);
  const totalResultados = results.reduce((s, r) => s + r.total, 0);
  const totalErros = results.filter(r => r.erro).length;
  const tempo = Date.now() - startTime;

  lastRun = new Date().toISOString();
  lastStats = { novos: totalNovos, erros: totalErros, tempo };
  isRunning = false;

  console.log(`[CRON] ========== Concluído em ${tempo}ms ==========`);
  console.log(`[CRON] ${totalNovos} novos de ${totalResultados} resultados, ${totalErros} erros\n`);
}

export function startCron(): void {
  console.log('[CRON] Agendado para rodar a cada 5 minutos');

  // Rodar imediatamente na inicialização
  coletarDados();

  // Agendar a cada 5 minutos
  cron.schedule('*/5 * * * *', () => {
    coletarDados();
  });
}

export function forceRefresh(): Promise<void> {
  return coletarDados();
}

export function getLastRun(): string | null {
  return lastRun;
}

export function getIsRunning(): boolean {
  return isRunning;
}

export function getLastStats() {
  return lastStats;
}
