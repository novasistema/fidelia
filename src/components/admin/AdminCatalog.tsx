import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { RewardItem } from '../../types';
import { Gift, Plus, Edit2, Trash2, Zap, Check, Eye } from 'lucide-react';

export const AdminCatalog: React.FC = () => {
  const { rewards, addReward, updateReward, deleteReward } = useLoyalty();

  const [editingReward, setEditingReward] = useState<Partial<RewardItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;

    if (editingReward.id) {
      updateReward(editingReward.id, editingReward);
    } else {
      addReward({
        title: editingReward.title || 'Nuevo Premio',
        category: editingReward.category || 'Gastronomía',
        description: editingReward.description || '',
        pointsCost: editingReward.pointsCost || 100,
        imageUrl: editingReward.imageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
        stock: editingReward.stock || 50,
        isActive: editingReward.isActive !== undefined ? editingReward.isActive : true,
        terms: editingReward.terms || ''
      });
    }

    setEditingReward(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Catálogo
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Gestión de Premios
          </h1>
          <p className="text-xs text-slate-500">
            Crea y administra los premios disponibles en la tienda de puntos.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReward({
              title: '',
              category: 'Gastronomía',
              description: '',
              pointsCost: 1000,
              imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
              stock: 50,
              isActive: true
            });
            setIsCreating(true);
          }}
          className="px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Premio</span>
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <div
            key={reward.id}
            className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
              reward.isActive ? 'border-slate-200/80' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="relative h-44 bg-slate-100">
                <img src={reward.imageUrl} alt={reward.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-slate-700 uppercase">
                  {reward.category}
                </div>
                <div className="absolute top-3 right-3 bg-sky-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm">
                  ⚡ {reward.pointsCost} pts
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {reward.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {reward.description}
                </p>
                <div className="text-[11px] text-slate-400 font-medium">
                  Stock: {reward.stock} unidades • Estado: {reward.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
              <button
                onClick={() => updateReward(reward.id, { isActive: !reward.isActive })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  reward.isActive ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {reward.isActive ? 'Pausar' : 'Activar'}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditingReward(reward);
                    setIsCreating(false);
                  }}
                  className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReward(reward.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              {isCreating ? 'Crear Nuevo Premio' : 'Editar Premio'}
            </h3>

            <form onSubmit={handleSaveReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Premio *</label>
                <input
                  type="text"
                  required
                  value={editingReward.title || ''}
                  onChange={e => setEditingReward({ ...editingReward, title: e.target.value })}
                  placeholder="Ej. Botella de Cerveza 1lt"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría *</label>
                  <input
                    type="text"
                    required
                    value={editingReward.category || ''}
                    onChange={e => setEditingReward({ ...editingReward, category: e.target.value })}
                    placeholder="Gastronomía, Descuentos, etc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Costo en Puntos *</label>
                  <input
                    type="number"
                    required
                    value={editingReward.pointsCost || ''}
                    onChange={e => setEditingReward({ ...editingReward, pointsCost: Number(e.target.value) })}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción corta</label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={e => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    value={editingReward.stock || 0}
                    onChange={e => setEditingReward({ ...editingReward, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    value={editingReward.imageUrl || ''}
                    onChange={e => setEditingReward({ ...editingReward, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md text-xs transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
