import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  equityCurve: number[];
  valorInicial: number;
  height?: number;
}

export default function EquityChart({ equityCurve, valorInicial, height = 256 }: Props) {
  const data = equityCurve.map((value, index) => ({
    index,
    equity: Math.round(value * 100) / 100,
  }));

  if (data.length < 2) {
    return <div className="text-[#8888a0] text-sm text-center py-8">Dados insuficientes</div>;
  }

  const lastValue = data[data.length - 1].equity;
  const isPositive = lastValue >= valorInicial;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`equity-${height}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
        <XAxis dataKey="index" stroke="#8888a0" fontSize={10} />
        <YAxis stroke="#8888a0" fontSize={10} />
        <Tooltip
          contentStyle={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(v) => `Operação ${v}`}
          formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Equity']}
        />
        <ReferenceLine y={valorInicial} stroke="#8888a0" strokeDasharray="5 5" strokeOpacity={0.5} />
        <Area type="monotone" dataKey="equity" stroke={strokeColor} fill={`url(#equity-${height})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
