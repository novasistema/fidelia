import React, { useEffect, useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { TierLevel } from '../../types';
import { Award, Check, Plus, Trash2, Save } from 'lucide-react';

// Niveles por puntos ganados en total (canjear no hace bajar de nivel)
export const AdminTiers: React.FC = () => {
  const { tiers, saveTiers, customers, tierOf } = useLoyalty();
  const [draft, setDraft] = useState<TierLevel[]>(tiers);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => setDraft(tiers), [tiers]);

  const update = (i: number, patch: Partial<TierLevel>) => setDraft(d => d.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await saveTiers(draft.map(t => ({ ...t, perks: t.perks.filter(p => p.trim()) })));
      setMsg({ ok: true, text: 'Niveles guardados.' });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase rounded-full border border-amber-100">Gamificación</span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">Niveles y Escalas de Clientes</h1>
          <p className="text-xs text-slate-500">
            El nivel depende de los puntos <strong>ganados en total</strong>: canjear premios no hace bajar de nivel. Cada nivel multiplica los puntos de las compras.
          </p>
        </div>
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
          <Award className="w-6 h-6" />
        </div>
      </div>

      {msg && <div className={`p-3 rounded-xl text-xs font-semibold border ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {draft.map((tier, i) => (
          <div key={tier.id + i} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${tier.badgeBg}`}>Nivel {tier.name || '—'}</span>
              <span className="text-xs text-slate-500">{customers.filter(c => tierOf(c).id === tier.id).length} clientes</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3">
                <label className="text-[11px] font-bold text-slate-500">Nombre</label>
                <input value={tier.name} onChange={e => update(i, { name: e.target.value })} className={input} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-500">Desde (puntos ganados)</label>
                <input type="number" min="0" disabled={i === 0} value={i === 0 ? 0 : tier.minPoints} onChange={e => update(i, { minPoints: Number(e.target.value) || 0 })} className={input} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Multiplica</label>
                <input type="number" min="1" max="10" step="0.1" value={tier.multiplier} onChange={e => update(i, { multiplier: Number(e.target.value) || 1 })} className={input} />
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beneficios del nivel</span>
              {tier.perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <input value={perk} onChange={e => update(i, { perks: tier.perks.map((p, k) => (k === idx ? e.target.value : p)) })} className={`${input} py-1.5 text-xs`} />
                  <button onClick={() => update(i, { perks: tier.perks.filter((_, k) => k !== idx) })} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => update(i, { perks: [...tier.perks, ''] })} className="text-xs font-bold text-sky-600 hover:underline">+ Agregar beneficio</button>
            </div>
            {draft.length > 1 && i > 0 && (
              <button onClick={() => setDraft(d => d.filter((_, j) => j !== i))} className="text-xs text-rose-600 hover:underline">Eliminar nivel</button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        {draft.length < 8 && (
          <button
            onClick={() =>
              setDraft(d => [
                ...d,
                { id: `nivel${Date.now()}`, name: 'Nuevo', minPoints: (d[d.length - 1]?.minPoints || 0) + 1000, multiplier: 1, color: 'from-slate-400 to-slate-600', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', perks: [] }
              ])
            }
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Agregar nivel
          </button>
        )}
        <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar niveles'}
        </button>
      </div>
    </div>
  );
};
