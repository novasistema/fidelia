import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BonusRule } from '../../types';
import { Sparkles, Calendar, Plus, Trash2, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export const AdminBonuses: React.FC = () => {
  const { bonusRules, addBonusRule, toggleBonusRule, deleteBonusRule } = useLoyalty();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [multiplier, setMultiplier] = useState(2.0);
  const [extraPoints, setExtraPoints] = useState(0);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday default
  const [isCreating, setIsCreating] = useState(false);

  const daysList = [
    { id: 0, name: 'Dom' },
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' }
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addBonusRule({
      title,
      description,
      multiplier,
      extraPoints,
      daysOfWeek: selectedDays,
      isActive: true
    });

    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Reglas Inteligentes
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Bonificaciones Inteligentes
          </h1>
          <p className="text-xs text-slate-500">
            Configurá reglas de multiplicación de puntos en días específicos (ej. LUNES TE LLEVAS MÁS PUNTOS) o por monto.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Bonificación</span>
        </button>
      </div>

      <div className="space-y-4">
        {bonusRules.map(rule => (
          <div key={rule.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {rule.isActive ? 'Activa' : 'Pausada'}
                </span>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {rule.title}
                </h3>
              </div>

              <p className="text-xs text-slate-500">
                {rule.description}
              </p>

              <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Días aplicables: {rule.daysOfWeek.map(d => daysList.find(day => day.id === d)?.name).join(', ')}</span>
                <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                  Multiplier: {rule.multiplier}x
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleBonusRule(rule.id)}
                className="p-2 text-slate-600 hover:text-sky-600 transition"
              >
                {rule.isActive ? <ToggleRight className="w-8 h-8 text-sky-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>

              <button
                onClick={() => deleteBonusRule(rule.id)}
                className="p-2 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Nueva Regla de Bonificación
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Regla *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. LUNES TE LLEVAS MÁS PUNTOS"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Doble de puntos en compras realizadas los lunes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Multiplicador (1.5x, 2x...)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiplier}
                    onChange={e => setMultiplier(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Puntos Extra Fijos</label>
                  <input
                    type="number"
                    value={extraPoints}
                    onChange={e => setExtraPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Días de la semana aplicables</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysList.map(d => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedDays.includes(d.id) ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Guardar Bonificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
