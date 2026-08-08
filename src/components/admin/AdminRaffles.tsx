import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Trophy, Plus, Award, Ticket, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminRaffles: React.FC = () => {
  const { raffles, createRaffle, drawRaffleWinner } = useLoyalty();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryCostPoints, setEntryCostPoints] = useState(100);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80');
  const [isCreating, setIsCreating] = useState(false);
  const [drawResult, setDrawResult] = useState<{ id: string; winnerName?: string } | null>(null);

  const handleCreateRaffle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    createRaffle({
      title,
      description,
      imageUrl,
      entryCostPoints,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2025-03-30',
      isActive: true
    });

    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  const handleDrawWinner = (raffleId: string) => {
    const res = drawRaffleWinner(raffleId);
    if (res.success && res.winnerName) {
      confetti({ particleCount: 120, spread: 80 });
      setDrawResult({ id: raffleId, winnerName: res.winnerName });
    } else {
      alert('No hay participantes registrados en este sorteo para sortear.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase rounded-full border border-amber-100">
            Fidelización Avanzada
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Gestión de Sorteos Masivos
          </h1>
          <p className="text-xs text-slate-500">
            Armá sorteos a medida donde los clientes participan usando sus puntos acumulados.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Sorteo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {raffles.map(raffle => (
          <div key={raffle.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-44 bg-slate-900">
                <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                  ⚡ {raffle.entryCostPoints} pts / entrada
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {raffle.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {raffle.description}
                </p>

                <div className="pt-2 text-xs font-bold text-slate-700">
                  Participantes inscritos: {raffle.participants.length}
                </div>

                {raffle.winnerCustomerName && (
                  <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>¡Ganador sorteado: {raffle.winnerCustomerName}!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-2">
              {raffle.isActive ? (
                <button
                  onClick={() => handleDrawWinner(raffle.id)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1"
                >
                  <Award className="w-4 h-4" />
                  <span>Realizar Sorteo Automático</span>
                </button>
              ) : (
                <span className="block text-center text-xs font-bold text-slate-400 py-2">
                  Sorteo Finalizado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Nuevo Sorteo
            </h3>

            <form onSubmit={handleCreateRaffle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Sorteo *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. Sorteo Brunch para 2 personas"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Inscribite por puntos y participá..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Costo por Entrada (Pts)</label>
                  <input
                    type="number"
                    value={entryCostPoints}
                    onChange={e => setEntryCostPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
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
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Crear Sorteo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
