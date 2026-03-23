import type { Quadrante } from '../types';

interface HeatmapProps {
  quadrantes: Quadrante[];
  maxItems?: number;
}

export default function Heatmap({ quadrantes, maxItems = 20 }: HeatmapProps) {
  const items = quadrantes.slice(-maxItems);

  const getColor = (resultado: string) => {
    switch (resultado) {
      case 'W': return 'bg-[#22c55e]';
      case 'H': return 'bg-[#ef4444]';
      case 'G1': return 'bg-[#eab308]';
      case 'G2': return 'bg-[#f97316]';
      default: return 'bg-[#555570]';
    }
  };

  return (
    <div className="flex gap-0.5 flex-wrap">
      {items.map((q) => (
        <div
          key={q.timestamp}
          className={`w-3 h-3 rounded-sm ${getColor(q.resultado)} opacity-80 hover:opacity-100 transition-opacity`}
          title={`${q.resultado} - ${new Date(q.timestamp * 1000).toLocaleString('pt-BR')}`}
        />
      ))}
    </div>
  );
}
