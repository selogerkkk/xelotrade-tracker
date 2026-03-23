export type Resultado = 'W' | 'H' | 'G1' | 'G2';

export interface Quadrante {
  resultado: Resultado;
  timestamp: number;
}

export interface EstrategiaRaw {
  ativo: string;
  atualizado: string;
  estrategia: string;
  quadrantes: Quadrante[];
  timeFrame: number;
  winrate: number;
}

export interface AnaliseEstrategia {
  id: string;
  ativo: string;
  estrategia: string;
  atualizado: string;
  timeFrame: number;
  galeLevel: GaleLevel;
  winrateReportado: number;
  winrateReal: number;
  winrateSemGale: number;
  winrateG1: number;
  totalOperacoes: number;
  totalWins: number;
  totalLosses: number;
  totalGales: number;
  maiorStreakWin: number;
  maiorStreakLoss: number;
  streakAtual: { tipo: 'W' | 'H'; count: number };
  tendencia: 'subindo' | 'descendo' | 'estavel';
  quadrantes: Quadrante[];
  equityCurve: number[];
  roi: number;
  roiSemGale: number;
  roiG1: number;
  roiG2: number;
  equityCurveSemGale: number[];
  equityCurveG1: number[];
  equityCurveG2: number[];
}

export interface Settings {
  payout: number;
  galeMultiplier: number;
  valorInicial: number;
  valorOperacao: number;
  alertWinrate: number;
  alertEnabled: boolean;
}

export type TimeFrame = 1 | 5 | 15 | 30;
export type GaleLevel = 0 | 1 | 2;
export type SortBy = 'winrate' | 'winrateSemGale' | 'updated' | 'streak' | 'roi';

export interface Filters {
  timeFrame: TimeFrame;
  gale: GaleLevel;
  search: string;
  sortBy: SortBy;
  sortDir: 'asc' | 'desc';
}
