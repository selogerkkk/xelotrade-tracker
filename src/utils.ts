import type { Quadrante } from './types';

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
