export type Broker = 'quotex' | 'iqoption';
export type TimeFrame = 1 | 5 | 15 | 30;
export type GaleLevel = 0 | 1 | 2;
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

export interface EstrategiaDB {
  id: number;
  ativo: string;
  estrategia: string;
  broker: string;
  timeFrame: number;
  galeLevel: number;
  winrateReportado: number;
  atualizado: string;
  updatedAt: string;
}

export interface ResultadoDB {
  id: number;
  estrategia_id: number;
  resultado: string;
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
  roiSemGale: number;
  roiG1: number;
  roiG2: number;
  equityCurveSemGale: number[];
  equityCurveG1: number[];
  equityCurveG2: number[];
  quadrantes: Quadrante[];
}

export interface Settings {
  payout: number;
  galeMultiplier: number;
  valorInicial: number;
  valorOperacao: number;
}

export const DEFAULT_SETTINGS: Settings = {
  payout: 82,
  galeMultiplier: 2.2,
  valorInicial: 100,
  valorOperacao: 5,
};
