import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { CustomerUser } from '../../types';
import { Users, Search, Plus, Minus, Edit2, ShieldAlert, Zap, Filter } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, adjustCustomerPoints, previewCustomerView, tiers } = useLoyalty();

  const [search, setSearch] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('todos');

  // Manual adjustment modal state
  const [adjustCust, setAdjustCust] = useState<CustomerUser | null>(null);
  const [pointsDelta, setPointsDelta] = useState<number>(100);
  const [adjustNote, setAdjustNote] = useState('Ajuste de puntos por atencion');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.dni.includes(search);
    const matchesTier = selectedTierFilter === 'todos' || c.tierId === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCust) return;

    adjustCustomerPoints(adjustCust.id, pointsDelta, adjustNote);
    setAdjustCust(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Base de Datos
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Gestión de Clientes
          </h1>
          <p className="text-xs text-slate-500">
            Consulta la lista de clientes registrados, sus puntos acumulados, niveles y ajustes manuales.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, DNI o Email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedTierFilter}
            onChange={e => setSelectedTierFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          >
            <option value="todos">Todos los niveles</option>
            <option value="bronce">Bronce</option>
            <option value="plata">Plata</option>
            <option value="oro">Oro</option>
            <option value="diamante">Diamante</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">DNI / Contacto</th>
                <th className="p-4">Nivel</th>
                <th className="p-4">Puntos</th>
                <th className="p-4">Total Compras</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(cust => {
                const tier = tiers.find(t => t.id === cust.tierId) || tiers[0];
                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-800 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {cust.name[0]}{cust.lastName[0]}
                      </div>
                      <div>
                        <div>{cust.name} {cust.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Registrado {cust.createdAt}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-700">DNI: {cust.dni}</div>
                      <div className="text-[10px] text-slate-400">{cust.email}</div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.badgeBg}`}>
                        {tier.name}
                      </span>
                    </td>

                    <td className="p-4 font-black text-sky-600 text-sm">
                      ⚡ {cust.points.toLocaleString()} pts
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      ${cust.totalSpent.toLocaleString()}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setAdjustCust(cust)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition"
                      >
                        Ajustar Puntos
                      </button>

                      <button
                        onClick={() => previewCustomerView(cust)}
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-xl text-[11px] transition"
                      >
                        Simular Vista
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {adjustCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Ajustar puntos a {adjustCust.name} {adjustCust.lastName}
            </h3>
            <p className="text-xs text-slate-500">
              Puntos actuales: <strong className="text-sky-600">{adjustCust.points} pts</strong>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Variación de puntos (+ o -)
                </label>
                <input
                  type="number"
                  required
                  value={pointsDelta}
                  onChange={e => setPointsDelta(Number(e.target.value))}
                  placeholder="Ej. 100 o -50"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo o Justificación del ajuste
                </label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  placeholder="Ej. Compensación por atención"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setAdjustCust(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md text-xs transition"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
