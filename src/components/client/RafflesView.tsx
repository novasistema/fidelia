import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Trophy, Zap, Ticket, Calendar, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RafflesView: React.FC = () => {
  const { currentCustomer, raffles, enterRaffle } = useLoyalty();
  const [msg, setMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  if (!currentCustomer) return null;

  const handleEnter = (raffleId: string) => {
    const res = enterRaffle(raffleId);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60 });
    }
    setMsg({ id: raffleId, text: res.message, success: res.success });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Sorteos & Premios Masivos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Usá tus puntos acumulados para adquirir entradas e incentivar tu suerte.
          </p>
        </div>
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {raffles.map(raffle => {
          const userParticipant = raffle.participants.find(p => p.customerId === currentCustomer.id);
          const entriesCount = userParticipant ? userParticipant.entries : 0;
          const canAfford = currentCustomer.points >= raffle.entryCostPoints;

          return (
            <div key={raffle.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={raffle.imageUrl}
                    alt={raffle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow-md flex items-center space-x-1">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>⚡ {raffle.entryCostPoints} pts por entrada</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    {raffle.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {raffle.description}
                  </p>

                  <div className="pt-2 text-xs text-slate-600 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Fecha de cierre: <strong>{raffle.endDate}</strong></span>
                  </div>

                  {entriesCount > 0 && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-900 flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span>¡Tenés {entriesCount} {entriesCount === 1 ? 'entrada' : 'entradas'} participando!</span>
                    </div>
                  )}

                  {msg && msg.id === raffle.id && (
                    <div className={`p-3 rounded-xl text-xs font-bold ${
                      msg.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 mt-2">
                <button
                  onClick={() => handleEnter(raffle.id)}
                  disabled={!canAfford || !raffle.isActive}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 ${
                    canAfford && raffle.isActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>{canAfford ? 'Comprar entrada con puntos' : 'Puntos insuficientes'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
