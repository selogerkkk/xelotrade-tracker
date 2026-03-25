export type Resultado = 'W' | 'H' | 'G1' | 'G2';
export type Broker = 'quotex' | 'iqoption';
export type Since = 'all' | '1h' | '3h' | '6h' | '12h' | '24h' | '3d' | '7d';

export interface Quadrante {
  resultado: Resultado;
  timestamp: number;
}

export interface AnaliseEstrategia {
  id: string;
  ativo: string;
  estrategia: string;
  broker: string;
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
  broker: Broker;
  timeFrame: TimeFrame;
  gale: GaleLevel;
  since: Since;
  search: string;
  sortBy: SortBy;
  sortDir: 'asc' | 'desc';
}
