import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Award, Zap, Check } from 'lucide-react';

export const AdminTiers: React.FC = () => {
  const { tiers } = useLoyalty();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase rounded-full border border-amber-100">
            Gamificación
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Niveles y Escalas de Clientes
          </h1>
          <p className="text-xs text-slate-500">
            Recompensá la fidelidad de tus clientes aumentando su multiplicador de puntos a medida que suben de nivel.
          </p>
        </div>
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
          <Award className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tiers.map(tier => (
          <div key={tier.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${tier.badgeBg}`}>
                Nivel {tier.name}
              </span>
              <span className="font-extrabold text-sky-600 text-sm">
                {tier.multiplier}x Multiplicador
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Requisito de puntos: <strong className="text-slate-800 font-bold">⚡ {tier.minPoints.toLocaleString()} pts</strong>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Beneficios del Nivel
              </span>
              {tier.perks.map((perk, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
