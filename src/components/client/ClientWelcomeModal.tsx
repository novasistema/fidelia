import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import { X, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

interface ClientWelcomeModalProps {
  onEnterClientPortal: () => void;
  onClose?: () => void;
}

export const ClientWelcomeModal: React.FC<ClientWelcomeModalProps> = ({ onEnterClientPortal, onClose }) => {
  const { storeSettings } = useLoyalty();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white p-6 text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex p-3 bg-white rounded-2xl shadow-lg mb-3">
            <BrandLogo size="lg" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            ¡Bienvenido a {storeSettings.brandName || storeSettings.name}!
          </h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            Sumá puntos y alcanzá increíbles premios en <strong className="text-white underline decoration-sky-300 decoration-2">{storeSettings.name}</strong>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Benefits summary list */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-sky-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Beneficios Exclusivos del Club de Fidelización</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2.5">
                <div className="p-1 bg-amber-100 text-amber-700 rounded-lg font-bold text-xs flex-shrink-0">
                  🎁
                </div>
                <div>
                  <strong className="text-slate-900">Bono de Bienvenida:</strong> Ganá {storeSettings.welcomePoints || 0} puntos de regalo al registrarte.
                </div>
              </li>

              <li className="flex items-start space-x-2.5">
                <div className="p-1 bg-sky-100 text-sky-700 rounded-lg font-bold text-xs flex-shrink-0">
                  ⭐
                </div>
                <div>
                  <strong className="text-slate-900">Puntos por Compra:</strong> Cada compra suma puntos para canjear por premios y descuentos.
                </div>
              </li>

              <li className="flex items-start space-x-2.5">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs flex-shrink-0">
                  🎟️
                </div>
                <div>
                  <strong className="text-slate-900">Sorteos & Encuestas:</strong> Participá en sorteos exclusivos y ganá puntos respondiendo breves preguntas.
                </div>
              </li>
            </ul>
          </div>

          {/* MAIN CLIENT BUTTON */}
          <div>
            <button
              onClick={onEnterClientPortal}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center space-x-2 transform active:scale-98"
            >
              <UserCheck className="w-5 h-5" />
              <span>Ingresar al Portal de Clientes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
