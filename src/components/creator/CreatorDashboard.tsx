import React, { useMemo, useState } from 'react';
import { useLoyalty, StoreSummary } from '../../context/LoyaltyContext';
import { errMsg } from '../../lib/api';
import { storeUrl } from '../../lib/route';
import { Plus, Search, Power, ExternalLink, Shield, Store, AlertTriangle, CheckCircle2, LogOut, Copy, Check, Save } from 'lucide-react';
import { FideliaLogo } from '../common/FideliaLogo';
import { PLANS, planOf, limitLabel, currentPrice, LAUNCH_PROMO_UNTIL } from '../../../api/_lib/plans';

const money = (n: number) => `$${n.toLocaleString('es-AR')}`;
const PlanOptions = () => (
  <>
    {PLANS.map(p => (
      <option key={p.id} value={p.id}>
        {p.name} · {money(currentPrice(p))} + IVA · {limitLabel(p.cashiers)} cajero(s) · {p.customers ? `${p.customers} clientes` : 'clientes ilimitados'} · {limitLabel(p.branches)} sucursal(es)
      </option>
    ))}
  </>
);

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
const slugify = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

// Panel del creador de la plataforma: alta de comercios, suscripciones y suspensiones
export const CreatorDashboard: React.FC = () => {
  const { allStores, createStore, updateSubscription, authUser, logout } = useLoyalty();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'activos' | 'vencidos' | 'suspendidos'>('todos');
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<StoreSummary | null>(null);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Formulario de alta
  const [name, setName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [planId, setPlanId] = useState('inicial');
  const [dueDate, setDueDate] = useState(addDays(30));

  // Formulario de suscripción
  const [subDue, setSubDue] = useState('');
  const [subPlanId, setSubPlanId] = useState('');
  const [subFee, setSubFee] = useState<number | ''>('');
  const [subReason, setSubReason] = useState('');

  const stats = useMemo(() => {
    const active = allStores.filter(s => s.isSystemActive !== false);
    return {
      total: allStores.length,
      active: active.length,
      suspended: allStores.length - active.length,
      overdue: active.filter(s => s.subscriptionDueDate && s.subscriptionDueDate < today()).length,
      mrr: active.reduce((a, s) => a + (Number(s.monthlyFee) || 0), 0)
    };
  }, [allStores]);

  const list = allStores
    .filter(s => {
      const q = search.trim().toLowerCase();
      if (q && !`${s.name} ${s.id}`.toLowerCase().includes(q)) return false;
      if (filter === 'activos') return s.isSystemActive !== false;
      if (filter === 'suspendidos') return s.isSystemActive === false;
      if (filter === 'vencidos') return s.isSystemActive !== false && !!s.subscriptionDueDate && s.subscriptionDueDate < today();
      return true;
    })
    .sort((a, b) => String(a.subscriptionDueDate || '9').localeCompare(String(b.subscriptionDueDate || '9')));

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(errMsg(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(() => createStore({ storeId, name, ownerEmail, ownerName, planId, subscriptionDueDate: dueDate }));
    if (ok) {
      setShowNew(false);
      setName('');
      setStoreId('');
      setOwnerEmail('');
      setOwnerName('');
    }
  };

  const openEdit = (s: StoreSummary) => {
    setEditing(s);
    setSubDue(s.subscriptionDueDate || '');
    setSubPlanId(s.planId || '');
    setSubFee(s.monthlyFee ?? '');
    setSubReason(s.suspensionReason || '');
    setError('');
  };

  const saveSub = async () => {
    if (!editing) return;
    const ok = await run(() =>
      updateSubscription(editing.id, {
        subscriptionDueDate: subDue,
        monthlyFee: Number(subFee) || 0,
        suspensionReason: subReason,
        ...(subPlanId && subPlanId !== editing.planId ? { planId: subPlanId } : {})
      })
    );
    if (ok) setEditing(null);
  };

  const toggleActive = (s: StoreSummary) => {
    const activate = s.isSystemActive === false;
    if (!activate && !window.confirm(`¿Suspender ${s.name}? El comercio y sus clientes no podrán usar el sistema hasta que lo reactives.`)) return;
    run(() =>
      updateSubscription(s.id, {
        isSystemActive: activate,
        ...(activate ? {} : { suspensionReason: s.suspensionReason || 'Servicio suspendido por falta de pago de la suscripción.' })
      })
    );
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 1800);
  };

  const input = 'w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FideliaLogo size="sm" variant="horizontal" darkBackground />
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">Panel del creador</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{authUser?.email}</span>
          <button onClick={() => logout()} className="p-2 hover:text-white hover:bg-slate-800 rounded-lg" title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Comercios', stats.total, 'text-white'],
          ['Activos', stats.active, 'text-emerald-400'],
          ['Vencidos', stats.overdue, 'text-amber-400'],
          ['Suspendidos', stats.suspended, 'text-rose-400'],
          ['Cobro mensual', `$${stats.mrr.toLocaleString('es-AR')}`, 'text-sky-400']
        ].map(([label, value, cls]) => (
          <div key={label as string} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-2xl font-black font-mono ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comercio..." className={`${input} pl-9`} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className={`${input} sm:w-44`}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="vencidos">Vencidos</option>
          <option value="suspendidos">Suspendidos</option>
        </select>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo comercio
        </button>
      </div>

      <div className="space-y-2">
        {list.length === 0 && <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 rounded-2xl border border-slate-800">No hay comercios {allStores.length ? 'con ese filtro' : 'todavía. Creá el primero.'}</div>}
        {list.map(s => {
          const active = s.isSystemActive !== false;
          const overdue = active && !!s.subscriptionDueDate && s.subscriptionDueDate < today();
          return (
            <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {s.logoUrl ? <img src={s.logoUrl} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{s.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">/c/{s.id}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {!active ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Suspendido</span>
                ) : overdue ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vencido</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Activo</span>
                )}
                <span className="text-slate-400">
                  {planOf(s.planId)?.name || s.clientPlanName || 'Sin plan (sin límites)'}
                  {planOf(s.planId)?.customers ? ` · ${s.customerCount || 0}/${planOf(s.planId)!.customers} clientes` : ` · ${s.customerCount || 0} clientes`}
                </span>
                <span className="text-slate-400">Vence: <strong className="text-slate-200">{s.subscriptionDueDate || '—'}</strong></span>
                {!!s.monthlyFee && <span className="text-slate-400">${Number(s.monthlyFee).toLocaleString('es-AR')}/mes</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => openEdit(s)} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg">Suscripción</button>
                <button
                  onClick={() => toggleActive(s)}
                  disabled={busy}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 ${active ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}
                >
                  <Power className="w-3.5 h-3.5" /> {active ? 'Suspender' : 'Reactivar'}
                </button>
                <a href={`/admin/${s.id}`} className="px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Panel
                </a>
                <button onClick={() => copy(storeUrl(s.id))} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1">
                  {copied === storeUrl(s.id) ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Link
                </button>
                <a href={`/c/${s.id}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <form onSubmit={submitNew} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-3 text-white">
            <h3 className="font-black text-lg">Nuevo comercio</h3>
            <div>
              <label className="text-xs text-slate-400">Nombre del comercio *</label>
              <input
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!storeId || storeId === slugify(name)) setStoreId(slugify(e.target.value));
                }}
                className={input}
                placeholder="Ej: Café Luna"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Link del comercio *</label>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span className="shrink-0">{window.location.host}/c/</span>
                <input required value={storeId} onChange={e => setStoreId(slugify(e.target.value))} className={input} placeholder="cafe-luna" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Email del dueño *</label>
                <input required type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className={input} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Nombre del dueño</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} className={input} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Plan</label>
              <select value={planId} onChange={e => setPlanId(e.target.value)} className={input}>
                <PlanOptions />
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Cuota mensual</label>
                <div className={`${input} text-slate-300`}>
                  {money(planOf(planId) ? currentPrice(planOf(planId)!) : 0)} + IVA
                  {planOf(planId) && currentPrice(planOf(planId)!) < planOf(planId)!.listPrice && (
                    <span className="text-[11px] text-amber-300 block">Lanzamiento hasta {LAUNCH_PROMO_UNTIL.split('-').reverse().join('/')} · después {money(planOf(planId)!.listPrice)}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Vence</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={input} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">El dueño entra en <strong>{window.location.host}/admin</strong> con ese email (Google o link por email) y configura su programa.</p>
            {error && <div className="text-xs text-rose-300">{error}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-sm">Cancelar</button>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm">{busy ? 'Creando...' : 'Crear comercio'}</button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-3 text-white">
            <h3 className="font-black text-lg">Suscripción · {editing.name}</h3>
            <div>
              <label className="text-xs text-slate-400">Plan</label>
              <select
                value={subPlanId}
                onChange={e => {
                  setSubPlanId(e.target.value);
                  const p = planOf(e.target.value);
                  if (p) setSubFee(currentPrice(p));
                }}
                className={input}
              >
                {!subPlanId && <option value="">Sin plan (sin límites)</option>}
                {planOf(subPlanId)?.hidden && <option value={subPlanId}>{planOf(subPlanId)!.name} (plan anterior)</option>}
                <PlanOptions />
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-slate-400">Cuota mensual ($, sin IVA)</label>
                <input type="number" min="0" value={subFee} onChange={e => setSubFee(e.target.value === '' ? '' : Number(e.target.value))} className={input} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Vencimiento</label>
              <div className="flex gap-2">
                <input type="date" value={subDue} onChange={e => setSubDue(e.target.value)} className={input} />
                <button
                  type="button"
                  onClick={() => {
                    const base = subDue && subDue > today() ? new Date(subDue + 'T12:00:00') : new Date();
                    base.setMonth(base.getMonth() + 1);
                    setSubDue(base.toISOString().slice(0, 10));
                  }}
                  className="px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold shrink-0"
                >
                  +1 mes
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Mensaje si se suspende</label>
              <textarea rows={2} value={subReason} onChange={e => setSubReason(e.target.value)} className={input} placeholder="Servicio suspendido por falta de pago." />
            </div>
            {error && <div className="text-xs text-rose-300">{error}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-800 rounded-xl text-sm">Cancelar</button>
              <button onClick={saveSub} disabled={busy} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
