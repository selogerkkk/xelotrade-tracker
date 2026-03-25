import type { Quadrante, AnaliseEstrategia, Settings, GaleLevel } from '../types.js';

export function analisar(
  id: string,
  ativo: string,
  estrategia: string,
  broker: string,
  timeFrame: number,
  galeLevel: GaleLevel,
  winrateReportado: number,
  atualizado: string,
  quadrantes: Quadrante[],
  settings: Settings
): AnaliseEstrategia {
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

  const equityCurveSemGale = calcularEquitySemGale(quadrantes, settings);
  const equityCurveG1 = calcularEquityG1(quadrantes, settings);
  const equityCurveG2 = calcularEquityG2(quadrantes, settings);

  const roiSemGale = calcRoi(equityCurveSemGale, settings.valorInicial);
  const roiG1 = calcRoi(equityCurveG1, settings.valorInicial);
  const roiG2 = calcRoi(equityCurveG2, settings.valorInicial);

  return {
    id,
    ativo,
    estrategia,
    broker,
    atualizado,
    timeFrame,
    galeLevel,
    winrateReportado,
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
    roiSemGale,
    roiG1,
    roiG2,
    equityCurveSemGale,
    equityCurveG1,
    equityCurveG2,
    quadrantes,
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
  let currentType: string | null = null;

  const reversed = [...quadrantes].reverse();

  for (const q of quadrantes) {
    const isWin = q.resultado === 'W' || q.resultado === 'G1' || q.resultado === 'G2';
    if (isWin) {
      if (currentType === 'W') currentStreak++;
      else { currentStreak = 1; currentType = 'W'; }
      maiorWin = Math.max(maiorWin, currentStreak);
    } else {
      if (currentType === 'H') currentStreak++;
      else { currentStreak = 1; currentType = 'H'; }
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
      if ((isWin && streakAtualTipo === 'W') || (!isWin && streakAtualTipo === 'H')) {
        streakAtualCount++;
      } else break;
    }
  }

  return { maiorWin, maiorLoss, streakAtual: { tipo: streakAtualTipo, count: streakAtualCount } };
}

function calcularTendencia(quadrantes: Quadrante[]): 'subindo' | 'descendo' | 'estavel' {
  if (quadrantes.length < 10) return 'estavel';
  const calcWr = (qs: Quadrante[]) => {
    const w = qs.filter(q => q.resultado === 'W').length;
    const g = qs.filter(q => q.resultado === 'G1' || q.resultado === 'G2').length;
    return (w + g) / qs.length;
  };
  const diff = calcWr(quadrantes.slice(-10)) - calcWr(quadrantes.slice(0, 10));
  if (diff > 0.1) return 'subindo';
  if (diff < -0.1) return 'descendo';
  return 'estavel';
}

function calcularEquitySemGale(quadrantes: Quadrante[], s: Settings): number[] {
  const equity: number[] = [s.valorInicial];
  let balance = s.valorInicial;
  for (const q of quadrantes) {
    if (q.resultado === 'W') balance += s.valorOperacao * (s.payout / 100);
    else balance -= s.valorOperacao;
    equity.push(Math.round(balance * 100) / 100);
  }
  return equity;
}

function calcularEquityG1(quadrantes: Quadrante[], s: Settings): number[] {
  const equity: number[] = [s.valorInicial];
  let balance = s.valorInicial;
  for (const q of quadrantes) {
    const p = s.payout / 100;
    switch (q.resultado) {
      case 'W': balance += s.valorOperacao * p; break;
      case 'G1': { const gale = s.valorOperacao * s.galeMultiplier; balance += gale * p - s.valorOperacao; break; }
      case 'G2':
      case 'H': balance -= s.valorOperacao * (1 + s.galeMultiplier); break;
    }
    equity.push(Math.round(balance * 100) / 100);
  }
  return equity;
}

function calcularEquityG2(quadrantes: Quadrante[], s: Settings): number[] {
  const equity: number[] = [s.valorInicial];
  let balance = s.valorInicial;
  for (const q of quadrantes) {
    const p = s.payout / 100;
    switch (q.resultado) {
      case 'W': balance += s.valorOperacao * p; break;
      case 'G1': { const g1 = s.valorOperacao * s.galeMultiplier; balance += g1 * p - s.valorOperacao; break; }
      case 'G2': { const g1 = s.valorOperacao * s.galeMultiplier; const g2 = g1 * s.galeMultiplier; balance += g2 * p - s.valorOperacao - g1; break; }
      case 'H': balance -= s.valorOperacao * (1 + s.galeMultiplier + s.galeMultiplier * s.galeMultiplier); break;
    }
    equity.push(Math.round(balance * 100) / 100);
  }
  return equity;
}
