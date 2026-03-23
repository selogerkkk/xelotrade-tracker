import { X, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import type { AnaliseEstrategia } from '../types';
import { formatHorario, formatData } from '../utils';
import PerformanceChart from './PerformanceChart';
import DistributionChart from './DistributionChart';
import EquityChart from './EquityChart';
import Heatmap from './Heatmap';
import { useSettings } from '../context/SettingsContext';

interface Props {
  analise: AnaliseEstrategia | null;
  onClose: () => void;
}

function getRoiColor(roi: number) {
  return roi >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]';
}

export default function DetailModal({ analise, onClose }: Props) {
  const { settings } = useSettings();

  if (!analise) return null;

  const TendenciaIcon = analise.tendencia === 'subindo' ? TrendingUp : analise.tendencia === 'descendo' ? TrendingDown : Minus;
  const tendenciaColor = analise.tendencia === 'subindo' ? 'text-[#22c55e]' : analise.tendencia === 'descendo' ? 'text-[#ef4444]' : 'text-[#8888a0]';
  const wrColor = analise.winrateReal >= 75 ? 'text-[#22c55e]' : analise.winrateReal >= 65 ? 'text-[#eab308]' : 'text-[#ef4444]';

  const g1Count = analise.quadrantes.filter(q => q.resultado === 'G1').length;
  const g2Count = analise.quadrantes.filter(q => q.resultado === 'G2').length;

  const modos = [
    { label: 'Sem Gale', roi: analise.roiSemGale, equity: analise.equityCurveSemGale },
  ];

  if (analise.galeLevel >= 1) {
    modos.push({ label: 'Gale 1', roi: analise.roiG1, equity: analise.equityCurveG1 });
  }
  if (analise.galeLevel >= 2) {
    modos.push({ label: 'Gale 2', roi: analise.roiG2, equity: analise.equityCurveG2 });
  }

  const melhorRoi = Math.max(...modos.map(m => m.roi));
  const gridCols = modos.length === 1 ? 'grid-cols-1' : modos.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-[#12121a] border border-[#2a2a3a] rounded-xl w-full max-w-5xl my-8"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#12121a] border-b border-[#2a2a3a] p-4 flex justify-between items-center rounded-t-xl z-10">
          <div>
            <h2 className="text-xl font-bold text-[#f0f0f5]">{analise.ativo}</h2>
            <p className="text-sm text-[#8888a0]">
              {analise.estrategia} &middot; M{analise.timeFrame} &middot; Gale {analise.galeLevel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TendenciaIcon className={`w-5 h-5 ${tendenciaColor}`} />
            <span className={`text-2xl font-bold ${wrColor}`}>{analise.winrateReal.toFixed(1)}%</span>
            <button type="button" onClick={onClose} className="text-[#8888a0] hover:text-[#f0f0f5] transition-colors ml-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className={`grid gap-3 ${analise.galeLevel === 0 ? 'grid-cols-1' : analise.galeLevel === 1 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div className="bg-[#1a1a25] border border-[#eab308]/30 rounded-lg p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase">WR Sem Gale</div>
              <div className="text-xl font-bold text-[#eab308]">{analise.winrateSemGale.toFixed(1)}%</div>
              <div className="text-[10px] text-[#555570]">{analise.totalWins}W / {analise.totalLosses + g1Count + g2Count}L / {analise.totalOperacoes}</div>
            </div>
            {analise.galeLevel >= 1 && (
              <div className="bg-[#1a1a25] border border-[#3b82f6]/30 rounded-lg p-3 text-center">
                <div className="text-[10px] text-[#8888a0] uppercase">WR Gale 1</div>
                <div className="text-xl font-bold text-[#3b82f6]">{analise.winrateG1.toFixed(1)}%</div>
                <div className="text-[10px] text-[#555570]">{analise.totalWins + g1Count}W / {analise.totalLosses + g2Count}L / {analise.totalOperacoes}</div>
              </div>
            )}
            {analise.galeLevel >= 2 && (
              <div className="bg-[#1a1a25] border border-[#22c55e]/30 rounded-lg p-3 text-center">
                <div className="text-[10px] text-[#8888a0] uppercase">WR Gale 2</div>
                <div className="text-xl font-bold text-[#22c55e]">{analise.winrateReal.toFixed(1)}%</div>
                <div className="text-[10px] text-[#555570]">{analise.totalWins + analise.totalGales}W / {analise.totalLosses}L / {analise.totalOperacoes}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase">Operações</div>
              <div className="text-xl font-bold text-[#f0f0f5]">{analise.totalOperacoes}</div>
            </div>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase">Maior Streak W</div>
              <div className="text-xl font-bold text-[#22c55e]">{analise.maiorStreakWin}</div>
            </div>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase">Maior Streak H</div>
              <div className="text-xl font-bold text-[#ef4444]">{analise.maiorStreakLoss}</div>
            </div>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase">Streak Atual</div>
              <div className={`text-xl font-bold ${analise.streakAtual.tipo === 'W' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {analise.streakAtual.count} {analise.streakAtual.tipo}
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d14] border border-[#2a2a3a] rounded-xl p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              Comparação de Modos
              <span className="text-[10px] text-[#8888a0] font-normal">
                Payout: {settings.payout}% &middot; Gale: {settings.galeMultiplier}x &middot; Entrada: R${settings.valorOperacao}
              </span>
            </h3>

            <div className={`grid ${gridCols} gap-3`}>
              {modos.map((modo) => {
                const isMelhor = modo.roi === melhorRoi && melhorRoi > 0;
                const finalEquity = modo.equity.length > 0 ? modo.equity[modo.equity.length - 1] : settings.valorInicial;
                const lucro = finalEquity - settings.valorInicial;

                return (
                  <div
                    key={modo.label}
                    className={`border rounded-lg p-4 ${
                      isMelhor
                        ? 'bg-[#22c55e]/5 border-[#22c55e]/40'
                        : 'bg-[#1a1a25] border-[#2a2a3a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#f0f0f5]">{modo.label}</span>
                      {isMelhor && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded-full">
                          <Trophy className="w-3 h-3" /> MELHOR
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="text-[10px] text-[#8888a0] uppercase">ROI</div>
                        <div className={`text-lg font-bold ${getRoiColor(modo.roi)}`}>
                          {modo.roi > 0 ? '+' : ''}{modo.roi}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-[#8888a0] uppercase">Lucro</div>
                        <div className={`text-lg font-bold ${lucro >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          R${lucro >= 0 ? '+' : ''}{lucro.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-[#8888a0] uppercase">Final</div>
                        <div className="text-lg font-bold text-[#f0f0f5]">
                          R${finalEquity.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <EquityChart equityCurve={modo.equity} valorInicial={settings.valorInicial} height={120} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-2">Heatmap Completo</h3>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-4">
              <Heatmap quadrantes={analise.quadrantes} maxItems={analise.quadrantes.length} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-2">Performance ao Longo do Tempo</h3>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-4">
              <PerformanceChart quadrantes={analise.quadrantes} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-2">Distribuição de Resultados</h3>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg p-4">
              <DistributionChart quadrantes={analise.quadrantes} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-2">Últimos Resultados</h3>
            <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="text-left p-2 text-[#8888a0] text-xs">#</th>
                    <th className="text-left p-2 text-[#8888a0] text-xs">Resultado</th>
                    <th className="text-left p-2 text-[#8888a0] text-xs">Horário</th>
                    <th className="text-left p-2 text-[#8888a0] text-xs">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {analise.quadrantes.slice(-20).reverse().map((q, i) => (
                    <tr key={`${q.timestamp}-${i}`} className="border-b border-[#2a2a3a]/50">
                      <td className="p-2 text-[#8888a0]">{analise.quadrantes.length - i}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          q.resultado === 'W' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                          q.resultado === 'H' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                          'bg-[#eab308]/20 text-[#eab308]'
                        }`}>
                          {q.resultado}
                        </span>
                      </td>
                      <td className="p-2 text-[#f0f0f5]">{formatHorario(q.timestamp)}</td>
                      <td className="p-2 text-[#8888a0]">{formatData(q.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-[#555570] text-center">
            Última atualização: {analise.atualizado}
          </div>
        </div>
      </div>
    </div>
  );
}
