import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Settings as SettingsIcon, BarChart3, RefreshCw } from 'lucide-react';
import type { Filters, AnaliseEstrategia } from './types';
import { fetchEstrategias } from './api';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import FiltersBar from './components/Filters';
import StrategyCard from './components/StrategyCard';
import DetailModal from './components/DetailModal';
import SettingsPanel from './components/SettingsPanel';
import AlertBanner from './components/AlertBanner';
import './index.css';

function Dashboard() {
  const { settings } = useSettings();
  const [analises, setAnalises] = useState<AnaliseEstrategia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalise, setSelectedAnalise] = useState<AnaliseEstrategia | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const prevAlertsRef = useRef<string>('');

  const [filters, setFilters] = useState<Filters>({
    broker: 'quotex',
    timeFrame: 5,
    gale: 1,
    since: 'all',
    search: '',
    sortBy: 'winrate',
    sortDir: 'desc',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEstrategias(
        filters.timeFrame,
        filters.gale,
        filters.broker,
        filters.since
      );
      setAnalises(data);
      setAlertsDismissed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [filters.timeFrame, filters.gale, filters.broker, filters.since]);

  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => loadDataRef.current(), 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let result = analises;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(a =>
        a.ativo.toLowerCase().includes(s) ||
        a.estrategia.toLowerCase().includes(s)
      );
    }

    result.sort((a, b) => {
      let diff = 0;
      switch (filters.sortBy) {
        case 'winrate': diff = a.winrateReal - b.winrateReal; break;
        case 'winrateSemGale': diff = a.winrateSemGale - b.winrateSemGale; break;
        case 'roi': diff = a.roiSemGale - b.roiSemGale; break;
        case 'updated': diff = a.atualizado.localeCompare(b.atualizado); break;
        case 'streak': diff = a.streakAtual.count - b.streakAtual.count; break;
      }
      return filters.sortDir === 'desc' ? -diff : diff;
    });

    return result;
  }, [analises, filters]);

  const alertes = useMemo(() => {
    return analises.filter(a => {
      const wr = filters.gale === 0 ? a.winrateSemGale
        : filters.gale === 1 ? a.winrateG1
        : a.winrateReal;
      return wr >= settings.alertWinrate;
    });
  }, [analises, settings.alertWinrate, filters.gale]);

  useEffect(() => {
    if (settings.alertEnabled && alertes.length > 0) {
      const currentKey = alertes.map(a => a.id).join(',');
      if (currentKey !== prevAlertsRef.current) {
        prevAlertsRef.current = currentKey;
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+fm5eTjYeEgH17eHZzcnFwcHBxcnR2eHt+gYSIi46QkZGPjYuIhIB8eHVyb2xtbW5vcXN2eXyAg4aJjJCTlJOSkI6Lh4N/e3dzb2xqaWlpa2xtb3J1eHx/goaJjJCUlpeWlJKQjIiDfXhzbmpmY2FhYWJjZGZobG9zd3yBhYqOkpeam5qYlZGMh395cm1oY19cW1tbXF5fYWVoa25xdXqAhIiNkZWYmpqYlZKNiH94cGpmYFtYV1ZWVldYWltcXmFkaGxvc3d7gIOHipCUl5mZl5WSjoqDfXdxamVgWlZSUFBQUFJTU1VXWVxeYWVobG9zeHuAg4eKkJSXmZmXlZKOioN9d3FqZWBaVlJQUFBQUlNTVVdZXF5hZWhrb3N4e4CDh4qQlJeZmZeVko6Kg313cWplYFpWUlBQUA==');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
      }
    }
  }, [alertes, settings.alertEnabled]);

  const stats = useMemo(() => {
    if (analises.length === 0) return null;

    // Get winrate based on selected gale level
    const getWr = (a: AnaliseEstrategia) =>
      filters.gale === 0 ? a.winrateSemGale
      : filters.gale === 1 ? a.winrateG1
      : a.winrateReal;

    const avgWr = analises.reduce((s, a) => s + getWr(a), 0) / analises.length;
    const best = analises.reduce((b, a) => getWr(a) > getWr(b) ? a : b, analises[0]);
    const totalOps = analises.reduce((s, a) => s + a.totalOperacoes, 0);
    return { avgWr: avgWr.toFixed(1), best, bestWr: getWr(best), totalOps, total: analises.length };
  }, [analises, filters.gale]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="bg-[#12121a] border-b border-[#2a2a3a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#3b82f6]" />
            <div>
              <h1 className="text-lg font-bold leading-tight">XeloTrade Tracker</h1>
              <p className="text-[10px] text-[#8888a0]">
                {filters.broker === 'quotex' ? 'Quotex' : 'IQ Option'} · M{filters.timeFrame} · Gale {filters.gale}
                {filters.since !== 'all' && ` · ${filters.since}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-[#1a1a25] text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#22222f] transition-all disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg bg-[#1a1a25] text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#22222f] transition-all"
              title="Configurações"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase tracking-wider">Estratégias</div>
              <div className="text-2xl font-bold text-[#3b82f6]">{stats.total}</div>
            </div>
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase tracking-wider">Winrate Médio</div>
              <div className={`text-2xl font-bold ${Number(stats.avgWr) >= 75 ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>{stats.avgWr}%</div>
            </div>
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase tracking-wider">Melhor</div>
              <div className="text-lg font-bold text-[#22c55e] truncate">{stats.best.ativo}</div>
              <div className="text-[10px] text-[#8888a0]">{stats.bestWr.toFixed(1)}%</div>
            </div>
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-3 text-center">
              <div className="text-[10px] text-[#8888a0] uppercase tracking-wider">Total Operações</div>
              <div className="text-2xl font-bold text-[#f0f0f5]">{stats.totalOps}</div>
            </div>
          </div>
        )}

        {!alertsDismissed && (
          <AlertBanner
            alerts={alertes}
            onDismiss={() => setAlertsDismissed(true)}
            onClick={setSelectedAnalise}
          />
        )}

        <FiltersBar filters={filters} onChange={setFilters} onRefresh={loadData} loading={loading} />

        {error && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 mb-6 text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        {loading && analises.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#3b82f6] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => {
              const displayWr = filters.gale === 0 ? a.winrateSemGale
                : filters.gale === 1 ? a.winrateG1
                : a.winrateReal;
              return (
                <StrategyCard
                  key={a.id}
                  analise={a}
                  onClick={() => setSelectedAnalise(a)}
                  isAlert={displayWr >= settings.alertWinrate}
                />
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && analises.length > 0 && (
          <div className="text-center py-20 text-[#8888a0]">
            Nenhuma estratégia encontrada com os filtros atuais
          </div>
        )}
      </main>

      <DetailModal analise={selectedAnalise} onClose={() => setSelectedAnalise(null)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Dashboard />
    </SettingsProvider>
  );
}
