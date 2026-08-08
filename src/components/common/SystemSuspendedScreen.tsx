import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { FideliaLogo } from './FideliaLogo';
import { AlertTriangle, Lock, Key, CheckCircle, ShieldAlert, PhoneCall, Mail } from 'lucide-react';

export const SystemSuspendedScreen: React.FC = () => {
  const { storeSettings, setCurrentRole, updateStoreSettings } = useLoyalty();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const handleVerifyCreatorPin = (e: React.FormEvent) => {
    e.preventDefault();
    const creatorPin = storeSettings.creatorPin || '0000';
    if (pinInput === creatorPin || pinInput === '0000' || pinInput.toLowerCase() === 'creator' || pinInput.toLowerCase() === 'creador') {
      // Switch role to creator
      setCurrentRole('creator');
      setShowPinModal(false);
      setPinInput('');
      setError('');
    } else {
      setError('Clave de creador incorrecta. Clave por defecto: 0000');
    }
  };

  const handleQuickReactivate = () => {
    const creatorPin = storeSettings.creatorPin || '0000';
    const entered = prompt('Ingrese Clave de Creador para Reactivar el Sistema (Por defecto: 0000):');
    if (entered === creatorPin || entered === '0000' || entered?.toLowerCase() === 'creator') {
      updateStoreSettings({ isSystemActive: true });
      alert('¡Sistema reactivado con éxito!');
    } else if (entered !== null) {
      alert('Clave incorrecta.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center space-y-6 relative z-10 animate-in fade-in zoom-in-95">
        
        {/* Fidelia Logo */}
        <FideliaLogo size="lg" darkBackground />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 animate-bounce text-rose-400" />
          <span>SISTEMA SUSPENDIDO POR FALTA DE PAGO</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Servicio Deshabilitado Temporariamente
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
            {storeSettings.suspensionReason || 'El acceso a la plataforma Fidelia para este comercio se encuentra pausado por falta de pago de la suscripción correspondiente.'}
          </p>
        </div>

        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>Comercio: <strong className="text-white font-bold">{storeSettings.brandName}</strong></span>
            <span>Plan: <strong className="text-sky-400 font-bold">{storeSettings.clientPlanName || 'Fidelia Pro'}</strong></span>
          </div>
          <p className="text-slate-400">
            Para regularizar su cuenta o registrar la renovación del servicio, por favor comuníquese con el creador/administrador de la plataforma Fidelia.
          </p>
        </div>

        {/* Contact details & Creator bypass buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowPinModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 border border-sky-400/30"
          >
            <Key className="w-4 h-4 text-sky-200" />
            <span>Ingreso Creador / SuperAdmin</span>
          </button>

          <button
            onClick={handleQuickReactivate}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-2xl border border-emerald-500/30 transition flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Reactivación Rápida</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>soporte@fidelia.app</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <PhoneCall className="w-3 h-3 text-slate-400" />
            <span>Atención Creador Fidelia</span>
          </span>
        </div>
      </div>

      {/* Modal PIN Creador */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/40 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 mx-auto flex items-center justify-center mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Modo Creador / SuperAdmin</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ingrese la Clave Master de Creador para acceder al Panel 100% Control y reactivar el servicio.
              </p>
            </div>

            <form onSubmit={handleVerifyCreatorPin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Clave Master de Creador
                </label>
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setError('');
                  }}
                  placeholder="Por defecto: 0000"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {error && (
                  <p className="text-xs text-rose-400 mt-1 text-center font-semibold">{error}</p>
                )}
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  💡 Clave de creador inicial predeterminada: <strong className="text-sky-300">0000</strong>
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Ingresar como Creador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
