import type { EstrategiaRaw, AnaliseEstrategia, Settings, Quadrante, Resultado, GaleLevel } from './types';

export function analisarEstrategia(raw: EstrategiaRaw, settings: Settings, galeLevel: GaleLevel): AnaliseEstrategia {
  const { quadrantes, ativo, estrategia, atualizado, timeFrame, winrate } = raw;
  const total = quadrantes.length;

  const wins = quadrantes.filter(q => q.resultado === 'W').length;
  const losses = quadrantes.filter(q => q.resultado === 'H').length;
  const g1Count = quadrantes.filter(q => q.resultado === 'G1').length;
  const g2Count = quadrantes.filter(q => q.resultado === 'G2').length;
  const gales = g1Count + g2Count;

  const winrateSemGale = total > 0 ? (wins / total) * 100 : 0;
  const winrateG1 = total > 0 ? ((wins + g1Count) / total) * 100 : 0;
  const winrateReal = total > 0 ? ((wins + gales) / total) * 100 : 0;

  const { maiorWin, maiorLoss, streakAtual } = calcularStreaks(quadrantes);
  const tendencia = calcularTendencia(quadrantes);

  const equityCurveG2 = calcularEquityG2(quadrantes, settings);
  const equityCurveG1 = calcularEquityG1(quadrantes, settings);
  const equityCurveSemGale = calcularEquitySemGale(quadrantes, settings);

  const roiG2 = calcRoi(equityCurveG2, settings.valorInicial);
  const roiG1 = calcRoi(equityCurveG1, settings.valorInicial);
  const roiSemGale = calcRoi(equityCurveSemGale, settings.valorInicial);

  const equityCurve = galeLevel === 0 ? equityCurveSemGale : galeLevel === 1 ? equityCurveG1 : equityCurveG2;
  const roi = galeLevel === 0 ? roiSemGale : galeLevel === 1 ? roiG1 : roiG2;

  return {
    id: `${ativo}-${estrategia}`,
    ativo,
    estrategia,
    atualizado,
    timeFrame,
    galeLevel,
    winrateReportado: winrate,
    winrateReal: Math.round(winrateReal * 100) / 100,
    winrateSemGale: Math.round(winrateSemGale * 100) / 100,
    winrateG1: Math.round(winrateG1 * 100) / 100,
    totalOperacoes: total,
    totalWins: wins,
    totalLosses: losses,
    totalGales: gales,
    maiorStreakWin: maiorWin,
    maiorStreakLoss: maiorLoss,
    streakAtual,
    tendencia,
    quadrantes,
    equityCurve,
    roi,
    roiSemGale,
    roiG1,
    roiG2,
    equityCurveSemGale,
    equityCurveG1,
    equityCurveG2,
  };
}

function calcRoi(equityCurve: number[], valorInicial: number): number {
  if (equityCurve.length === 0) return 0;
  return Math.round(((equityCurve[equityCurve.length - 1] - valorInicial) / valorInicial) * 10000) / 100;
}

function calcularStreaks(quadrantes: Quadrante[]) {
  let maiorWin = 0;
  let maiorLoss = 0;
  let currentStreak = 0;
  let currentType: Resultado | null = null;

  const reversed = [...quadrantes].reverse();

  for (const q of quadrantes) {
    const isWin = q.resultado === 'W' || q.resultado === 'G1' || q.resultado === 'G2';
    if (isWin) {
      if (currentType === 'W') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentType = 'W';
      }
      maiorWin = Math.max(maiorWin, currentStreak);
    } else {
      if (currentType === 'H') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentType = 'H';
      }
      maiorLoss = Math.max(maiorLoss, currentStreak);
    }
  }

  let streakAtualTipo: 'W' | 'H' = 'W';
  let streakAtualCount = 0;
  for (let i = reversed.length - 1; i >= 0; i--) {
    const isWin = reversed[i].resultado === 'W' || reversed[i].resultado === 'G1' || reversed[i].resultado === 'G2';
    if (i === reversed.length - 1) {
      streakAtualTipo = isWin ? 'W' : 'H';
      streakAtualCount = 1;
    } else {
      const currentIsWin = isWin;
      if ((currentIsWin && streakAtualTipo === 'W') || (!currentIsWin && streakAtualTipo === 'H')) {
        streakAtualCount++;
      } else {
        break;
      }
    }
  }

  return {
    maiorWin,
    maiorLoss,
    streakAtual: { tipo: streakAtualTipo, count: streakAtualCount },
  };
}

function calcularTendencia(quadrantes: Quadrante[]): 'subindo' | 'descendo' | 'estavel' {
  if (quadrantes.length < 10) return 'estavel';
  const ultimos10 = quadrantes.slice(-10);
  const primeiros10 = quadrantes.slice(0, 10);

  const calcWr = (qs: Quadrante[]) => {
    const w = qs.filter(q => q.resultado === 'W').length;
    const g = qs.filter(q => q.resultado === 'G1' || q.resultado === 'G2').length;
    return (w + g) / qs.length;
  };

  const wrAntes = calcWr(primeiros10);
  const wrDepois = calcWr(ultimos10);
  const diff = wrDepois - wrAntes;

  if (diff > 0.1) return 'subindo';
  if (diff < -0.1) return 'descendo';
  return 'estavel';
}

function calcularEquitySemGale(quadrantes: Quadrante[], settings: Settings): number[] {
  const { valorOperacao, valorInicial, payout } = settings;
  const equity: number[] = [valorInicial];
  let balance = valorInicial;

  for (const q of quadrantes) {
    const p = payout / 100;
    switch (q.resultado) {
      case 'W':
        balance += valorOperacao * p;
        break;
      case 'H':
      case 'G1':
      case 'G2':
        balance -= valorOperacao;
        break;
    }
    equity.push(Math.round(balance * 100) / 100);
  }

  return equity;
}

function calcularEquityG1(quadrantes: Quadrante[], settings: Settings): number[] {
  const { valorOperacao, valorInicial, payout, galeMultiplier } = settings;
  const equity: number[] = [valorInicial];
  let balance = valorInicial;

  for (const q of quadrantes) {
    const p = payout / 100;
    switch (q.resultado) {
      case 'W':
        balance += valorOperacao * p;
        break;
      case 'G1': {
        const galeVal = valorOperacao * galeMultiplier;
        balance += galeVal * p - valorOperacao;
        break;
      }
      case 'G2':
      case 'H':
        balance -= valorOperacao * (1 + galeMultiplier);
        break;
    }
    equity.push(Math.round(balance * 100) / 100);
  }

  return equity;
}

function calcularEquityG2(quadrantes: Quadrante[], settings: Settings): number[] {
  const { valorOperacao, valorInicial, payout, galeMultiplier } = settings;
  const equity: number[] = [valorInicial];
  let balance = valorInicial;

  for (const q of quadrantes) {
    const p = payout / 100;
    switch (q.resultado) {
      case 'W':
        balance += valorOperacao * p;
        break;
      case 'G1': {
        const galeVal = valorOperacao * galeMultiplier;
        balance += galeVal * p - valorOperacao;
        break;
      }
      case 'G2': {
        const gale1Val = valorOperacao * galeMultiplier;
        const gale2Val = gale1Val * galeMultiplier;
        balance += gale2Val * p - valorOperacao - gale1Val;
        break;
      }
      case 'H':
        balance -= valorOperacao * (1 + galeMultiplier + galeMultiplier * galeMultiplier);
        break;
    }
    equity.push(Math.round(balance * 100) / 100);
  }

  return equity;
}

export function calcularWinrateMovel(quadrantes: Quadrante[], janela = 10) {
  const resultado: { index: number; winrate: number }[] = [];
  for (let i = janela; i <= quadrantes.length; i++) {
    const slice = quadrantes.slice(i - janela, i);
    const w = slice.filter(q => q.resultado === 'W').length;
    const g = slice.filter(q => q.resultado === 'G1' || q.resultado === 'G2').length;
    resultado.push({ index: i, winrate: ((w + g) / janela) * 100 });
  }
  return resultado;
}

export function calcularDistribuicao(quadrantes: Quadrante[]) {
  const total = quadrantes.length;
  const w = quadrantes.filter(q => q.resultado === 'W').length;
  const h = quadrantes.filter(q => q.resultado === 'H').length;
  const g1 = quadrantes.filter(q => q.resultado === 'G1').length;
  const g2 = quadrantes.filter(q => q.resultado === 'G2').length;
  return [
    { name: 'Win', value: w, percent: total > 0 ? (w / total) * 100 : 0, color: '#22c55e' },
    { name: 'Loss', value: h, percent: total > 0 ? (h / total) * 100 : 0, color: '#ef4444' },
    { name: 'Gale 1', value: g1, percent: total > 0 ? (g1 / total) * 100 : 0, color: '#eab308' },
    { name: 'Gale 2', value: g2, percent: total > 0 ? (g2 / total) * 100 : 0, color: '#f97316' },
  ].filter(d => d.value > 0);
}

export function formatHorario(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatData(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
