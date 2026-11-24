import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { planOf, nextPlan, limitLabel } from '../../../api/_lib/plans';

// Muestra el plan del comercio y cuánto usa de cada límite
export const PlanUsage: React.FC<{ show?: ('owners' | 'cashiers' | 'customers' | 'branches')[] }> = ({ show = ['owners', 'cashiers', 'customers', 'branches'] }) => {
  const { storeSettings, staff, branches } = useLoyalty();
  const plan = planOf(storeSettings.planId);
  if (!plan) return null;
  const next = nextPlan(plan.id);
  const used = {
    owners: staff.filter(s => s.role === 'owner').length,
    cashiers: staff.filter(s => s.role === 'cashier').length,
    customers: storeSettings.customerCount || 0,
    branches: branches.length
  };
  const labels = { owners: 'Dueños', cashiers: 'Cajeros', customers: 'Clientes', branches: 'Sucursales' };
  const full = show.some(k => plan[k] != null && used[k] >= (plan[k] as number));

  return (
    <div className={`p-4 rounded-2xl border text-xs ${full ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="font-extrabold text-slate-800">Plan {plan.name}</span>
        {full && next && <span className="text-amber-800 font-semibold">Llegaste al límite · pedí el plan {next.name} a tu proveedor de Fidelia</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {show.map(k => {
          const lim = plan[k];
          const pct = lim == null ? 0 : Math.min(100, Math.round((used[k] / lim) * 100));
          return (
            <div key={k}>
              <div className="text-slate-500">{labels[k]}</div>
              <div className="font-bold text-slate-800">
                {used[k].toLocaleString('es-AR')} / {limitLabel(lim)}
              </div>
              {lim != null && (
                <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full ${pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
