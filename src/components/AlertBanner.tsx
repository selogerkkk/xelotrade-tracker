import { Bell, X } from 'lucide-react';
import type { AnaliseEstrategia } from '../types';

interface Props {
  alerts: AnaliseEstrategia[];
  onDismiss: () => void;
  onClick: (analise: AnaliseEstrategia) => void;
}

export default function AlertBanner({ alerts, onDismiss, onClick }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
      <Bell className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
      <span className="text-sm text-[#22c55e] font-medium">
        {alerts.length} estrategia{alerts.length > 1 ? 's' : ''} com winrate alto:
      </span>
      <div className="flex gap-2 flex-wrap flex-1">
        {alerts.map(a => (
          <button
            type="button"
            key={a.id}
            onClick={() => onClick(a)}
            className="bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#22c55e]/30 transition-colors"
          >
            {a.ativo} ({a.winrateReal.toFixed(0)}%)
          </button>
        ))}
      </div>
      <button type="button" onClick={onDismiss} className="text-[#22c55e]/60 hover:text-[#22c55e] transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
