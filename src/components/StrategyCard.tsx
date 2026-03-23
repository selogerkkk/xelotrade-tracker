import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AnaliseEstrategia } from '../types';
import Heatmap from './Heatmap';

interface StrategyCardProps {
  analise: AnaliseEstrategia;
  onClick: () => void;
  isAlert: boolean;
}

export default function StrategyCard({ analise, onClick, isAlert }: StrategyCardProps) {
  const wrColor = analise.winrateReal >= 75 ? 'text-[#22c55e]' : analise.winrateReal >= 65 ? 'text-[#eab308]' : 'text-[#ef4444]';
  const barColor = analise.winrateReal >= 75 ? 'bg-[#22c55e]' : analise.winrateReal >= 65 ? 'bg-[#eab308]' : 'bg-[#ef4444]';

  const TendenciaIcon = analise.tendencia === 'subindo' ? TrendingUp : analise.tendencia === 'descendo' ? TrendingDown : Minus;
  const tendenciaColor = analise.tendencia === 'subindo' ? 'text-[#22c55e]' : analise.tendencia === 'descendo' ? 'text-[#ef4444]' : 'text-[#8888a0]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-[#1a1a25] border rounded-xl p-4 text-left transition-all hover:bg-[#22222f] hover:border-[#3b82f6] w-full ${
        isAlert ? 'border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-[#2a2a3a]'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-bold text-[#f0f0f5]">{analise.ativo}</div>
          <div className="text-xs text-[#8888a0]">{analise.estrategia}</div>
        </div>
        <div className="flex items-center gap-1">
          <TendenciaIcon className={`w-4 h-4 ${tendenciaColor}`} />
          {isAlert && <span className="text-[10px] bg-[#22c55e] text-black font-bold px-1.5 py-0.5 rounded">ALERTA</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className={`text-2xl font-bold ${wrColor}`}>{analise.winrateReal.toFixed(1)}%</div>
        <div className="flex-1">
          <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(analise.winrateReal, 100)}%` }} />
          </div>
          <div className="text-[10px] text-[#8888a0] mt-0.5">
            {analise.totalWins + analise.totalGales}W / {analise.totalLosses}L
            <span className="text-[#555570] ml-1">({analise.totalWins} direto)</span>
          </div>
        </div>
      </div>

      <Heatmap quadrantes={analise.quadrantes} maxItems={15} />

      <div className={`grid gap-1 mt-3 ${analise.galeLevel === 0 ? 'grid-cols-1' : analise.galeLevel === 1 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <div className={`text-center rounded-md py-1 ${analise.roiSemGale >= 0 ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10'}`}>
          <div className="text-[9px] text-[#8888a0]">SG</div>
          <div className={`text-[11px] font-bold ${analise.roiSemGale >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {analise.roiSemGale > 0 ? '+' : ''}{analise.roiSemGale}%
          </div>
        </div>
        {analise.galeLevel >= 1 && (
          <div className={`text-center rounded-md py-1 ${analise.roiG1 >= 0 ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10'}`}>
            <div className="text-[9px] text-[#8888a0]">G1</div>
            <div className={`text-[11px] font-bold ${analise.roiG1 >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {analise.roiG1 > 0 ? '+' : ''}{analise.roiG1}%
            </div>
          </div>
        )}
        {analise.galeLevel >= 2 && (
          <div className={`text-center rounded-md py-1 ${analise.roiG2 >= 0 ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10'}`}>
            <div className="text-[9px] text-[#8888a0]">G2</div>
            <div className={`text-[11px] font-bold ${analise.roiG2 >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {analise.roiG2 > 0 ? '+' : ''}{analise.roiG2}%
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 text-[10px] text-[#8888a0]">
        <span>Streak: {analise.streakAtual.count} {analise.streakAtual.tipo === 'W' ? '🟢' : '🔴'}</span>
        <span>M{analise.timeFrame}</span>
      </div>
    </button>
  );
}
