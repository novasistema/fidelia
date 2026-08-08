import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { History, ArrowUpRight, ArrowDownLeft, Zap, ShoppingBag, Gift, Sparkles, Trophy } from 'lucide-react';

export const MovementsView: React.FC = () => {
  const { currentCustomer, movements } = useLoyalty();

  if (!currentCustomer) return null;

  const myMovements = movements.filter(m => m.customerId === currentCustomer.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Historial de Movimientos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro transparente de tus puntos sumados por compras y canjes realizados.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <History className="w-6 h-6" />
        </div>
      </div>

      {myMovements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">Sin movimientos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tus puntos ganados por compras o encuestas se reflejarán en esta lista.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {myMovements.map(mov => {
              const isEarned = mov.points > 0;
              return (
                <div key={mov.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                      isEarned ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {isEarned ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {mov.description}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {mov.date} {mov.amountPeso ? `• Maza: $${mov.amountPeso}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className={`font-black text-sm flex items-center space-x-1 ${
                    isEarned ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    <span>{isEarned ? '+' : ''}{mov.points.toLocaleString()}</span>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
