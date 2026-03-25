import type { Filters as FiltersType, TimeFrame, GaleLevel, SortBy, Broker, Since } from '../types';

interface FiltersBarProps {
  filters: FiltersType;
  onChange: (f: FiltersType) => void;
  onRefresh: () => void;
  loading: boolean;
}

const brokerOptions: { value: Broker; label: string }[] = [
  { value: 'quotex', label: 'Quotex' },
  { value: 'iqoption', label: 'IQ Option' },
];

const timeFrames: { value: TimeFrame; label: string }[] = [
  { value: 1, label: 'M1' },
  { value: 5, label: 'M5' },
  { value: 15, label: 'M15' },
  { value: 30, label: 'M30' },
];

const galeOptions: { value: GaleLevel; label: string }[] = [
  { value: 0, label: 'Sem Gale' },
  { value: 1, label: 'Gale 1' },
  { value: 2, label: 'Gale 2' },
];

const sinceOptions: { value: Since; label: string }[] = [
  { value: '3h', label: '3h' },
  { value: '6h', label: '6h' },
  { value: '12h', label: '12h' },
  { value: '24h', label: '24h' },
  { value: '3d', label: '3d' },
  { value: '7d', label: '7d' },
  { value: 'all', label: 'Tudo' },
];

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'winrate', label: 'Winrate' },
  { value: 'winrateSemGale', label: 'WR Sem Gale' },
  { value: 'roi', label: 'ROI' },
  { value: 'updated', label: 'Atualizado' },
  { value: 'streak', label: 'Streak' },
];

export default function FiltersBar({ filters, onChange, onRefresh, loading }: FiltersBarProps) {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 mb-6 space-y-3">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Broker</span>
          <div className="flex gap-1">
            {brokerOptions.map(b => (
              <button
                type="button"
                key={b.value}
                onClick={() => onChange({ ...filters, broker: b.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.broker === b.value
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#1a1a25] text-[#8888a0] hover:bg-[#22222f]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Timeframe</span>
          <div className="flex gap-1">
            {timeFrames.map(tf => (
              <button
                type="button"
                key={tf.value}
                onClick={() => onChange({ ...filters, timeFrame: tf.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.timeFrame === tf.value
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#1a1a25] text-[#8888a0] hover:bg-[#22222f]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Gale</span>
          <div className="flex gap-1">
            {galeOptions.map(g => (
              <button
                type="button"
                key={g.value}
                onClick={() => onChange({ ...filters, gale: g.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.gale === g.value
                    ? 'bg-[#a855f7] text-white'
                    : 'bg-[#1a1a25] text-[#8888a0] hover:bg-[#22222f]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Período</span>
          <div className="flex gap-1 flex-wrap">
            {sinceOptions.map(s => (
              <button
                type="button"
                key={s.value}
                onClick={() => onChange({ ...filters, since: s.value })}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.since === s.value
                    ? 'bg-[#eab308] text-black'
                    : 'bg-[#1a1a25] text-[#8888a0] hover:bg-[#22222f]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Ordenar</span>
          <div className="flex gap-1 items-center">
            <select
              value={filters.sortBy}
              onChange={e => onChange({ ...filters, sortBy: e.target.value as SortBy })}
              className="bg-[#1a1a25] text-[#f0f0f5] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6]"
            >
              {sortOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange({ ...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
              className="px-3 py-1.5 rounded-lg text-sm bg-[#1a1a25] text-[#8888a0] hover:bg-[#22222f] transition-all"
            >
              {filters.sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span className="text-xs text-[#8888a0] uppercase tracking-wider">Buscar</span>
          <input
            type="text"
            placeholder="Ativo ou estratégia..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="bg-[#1a1a25] text-[#f0f0f5] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] placeholder-[#555570]"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all disabled:opacity-50 mt-5"
        >
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>
    </div>
  );
}
