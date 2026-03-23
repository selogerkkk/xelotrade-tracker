import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Quadrante } from '../types';
import { calcularWinrateMovel } from '../utils';

interface Props {
  quadrantes: Quadrante[];
  janela?: number;
}

export default function PerformanceChart({ quadrantes, janela = 10 }: Props) {
  const data = calcularWinrateMovel(quadrantes, janela).map(d => ({
    index: d.index,
    winrate: Math.round(d.winrate * 10) / 10,
  }));

  if (data.length < 2) {
    return <div className="text-[#8888a0] text-sm text-center py-8">Dados insuficientes para gráfico</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="index" stroke="#8888a0" fontSize={10} />
          <YAxis stroke="#8888a0" fontSize={10} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#8888a0' }}
            itemStyle={{ color: '#f0f0f5' }}
          />
          <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="winrate" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
