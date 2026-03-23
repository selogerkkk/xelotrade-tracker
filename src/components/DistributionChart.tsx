import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Quadrante } from '../types';
import { calcularDistribuicao } from '../utils';

interface Props {
  quadrantes: Quadrante[];
}

export default function DistributionChart({ quadrantes }: Props) {
  const data = calcularDistribuicao(quadrantes);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return <div className="text-[#8888a0] text-sm text-center py-8">Sem dados</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name} ${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value} operações`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#8888a0' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
