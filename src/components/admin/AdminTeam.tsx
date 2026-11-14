import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { UserCog, Trash2, UserPlus, Shield, Store } from 'lucide-react';

// Dueños y cajeros del comercio. Cada uno entra en /admin con su propio email.
export const AdminTeam: React.FC = () => {
  const { staff, addStaff, removeStaff, authUser } = useLoyalty();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'cashier' | 'owner'>('cashier');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await addStaff(email.trim(), role, name.trim());
      setMsg({ ok: true, text: `${email} ya puede entrar en ${window.location.host}/admin con ese email.` });
      setEmail('');
      setName('');
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message || 'No se pudo agregar.' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (target: string) => {
    if (!window.confirm(`¿Quitar el acceso de ${target}?`)) return;
    try {
      await removeStaff(target);
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message || 'No se pudo quitar.' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Equipo y Cajeros</h1>
          <p className="text-xs text-slate-500">
            Los <strong>cajeros</strong> cargan compras, generan QR y entregan canjes. Los <strong>dueños</strong> además configuran premios, niveles, promociones y el equipo.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center"><UserCog className="w-6 h-6" /></div>
      </div>

      {msg && <div className={`p-3 rounded-xl text-xs font-semibold border ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>}

      <form onSubmit={add} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Email (Google o el que usa) *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <option value="cashier">Cajero</option>
            <option value="owner">Dueño</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="sm:col-span-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5">
          <UserPlus className="w-4 h-4" /> {busy ? 'Agregando...' : 'Dar acceso'}
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {staff.map(m => (
          <div key={m.email} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.role === 'owner' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {m.role === 'owner' ? <Shield className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-800 truncate">{m.name || m.email}</div>
                <div className="text-xs text-slate-500 truncate">{m.email} · {m.role === 'owner' ? 'Dueño' : 'Cajero'}</div>
              </div>
            </div>
            {m.email !== authUser?.email?.toLowerCase() && (
              <button onClick={() => remove(m.email)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Quitar acceso">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
