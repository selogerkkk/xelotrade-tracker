import { Settings as SettingsIcon, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: Props) {
  const { settings, updateSettings } = useSettings();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#1a1a25] border border-[#2a2a3a] rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#8888a0]" />
            <h2 className="text-lg font-bold text-[#f0f0f5]">Configurações</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#8888a0] hover:text-[#f0f0f5] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="payout" className="block text-xs text-[#8888a0] uppercase tracking-wider mb-1">
              Payout Médio: {settings.payout}%
            </label>
            <input
              id="payout"
              type="range"
              min={50}
              max={95}
              value={settings.payout}
              onChange={e => updateSettings({ payout: Number(e.target.value) })}
              className="w-full accent-[#22c55e]"
            />
            <div className="flex justify-between text-[10px] text-[#555570]">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          <div>
            <label htmlFor="gale" className="block text-xs text-[#8888a0] uppercase tracking-wider mb-1">
              Multiplicador Gale: {settings.galeMultiplier}x
            </label>
            <input
              id="gale"
              type="range"
              min={150}
              max={300}
              step={10}
              value={settings.galeMultiplier * 100}
              onChange={e => updateSettings({ galeMultiplier: Number(e.target.value) / 100 })}
              className="w-full accent-[#a855f7]"
            />
            <div className="flex justify-between text-[10px] text-[#555570]">
              <span>1.5x</span>
              <span>3.0x</span>
            </div>
          </div>

          <div>
            <label htmlFor="capital" className="block text-xs text-[#8888a0] uppercase tracking-wider mb-1">Capital Inicial (R$)</label>
            <input
              id="capital"
              type="number"
              min={10}
              value={settings.valorInicial}
              onChange={e => updateSettings({ valorInicial: Number(e.target.value) })}
              className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div>
            <label htmlFor="valorOp" className="block text-xs text-[#8888a0] uppercase tracking-wider mb-1">Valor por Operação (R$)</label>
            <input
              id="valorOp"
              type="number"
              min={1}
              value={settings.valorOperacao}
              onChange={e => updateSettings({ valorOperacao: Number(e.target.value) })}
              className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div>
            <label htmlFor="alertWr" className="block text-xs text-[#8888a0] uppercase tracking-wider mb-1">
              Alerta Winrate Mínimo: {settings.alertWinrate}%
            </label>
            <input
              id="alertWr"
              type="range"
              min={50}
              max={90}
              value={settings.alertWinrate}
              onChange={e => updateSettings({ alertWinrate: Number(e.target.value) })}
              className="w-full accent-[#eab308]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ alertEnabled: !settings.alertEnabled })}
              className={`w-10 h-6 rounded-full transition-all relative ${
                settings.alertEnabled ? 'bg-[#22c55e]' : 'bg-[#2a2a3a]'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                settings.alertEnabled ? 'left-5' : 'left-1'
              }`} />
            </button>
            <span className="text-sm text-[#8888a0]">Alertas sonoros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
