import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Store, Share2, Bell, Sparkles, User, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  onOpenQRModal: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenQRModal }) => {
  const { storeSettings, resetDemoData } = useLoyalty();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center space-x-3">
        <span className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
          <Store className="w-4 h-4 text-sky-600" />
          <span>{storeSettings.name}</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-xs text-slate-400 font-medium">Dueño de Comercio / Administración</span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenQRModal}
          className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 border border-sky-100"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir Enlaces QR</span>
        </button>

        <button
          onClick={() => {
            if (confirm('¿Restablecer los datos iniciales de demostración?')) {
              resetDemoData();
            }
          }}
          title="Restablecer Datos Demo"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
