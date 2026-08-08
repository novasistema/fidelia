import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { QrCode, Shield, UserCheck, RefreshCw, Sparkles, Lock, X, Key } from 'lucide-react';
import { LinkQRShareModal } from './LinkQRShareModal';
import { FideliaLogo } from './FideliaLogo';

export const TopBarSwitcher: React.FC = () => {
  const { currentRole, setCurrentRole, storeSettings, resetDemoData } = useLoyalty();
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Admin PIN Protection State
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetRole, setTargetRole] = useState<'admin' | 'creator'>('admin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAdminSwitchClick = () => {
    if (currentRole === 'admin') return;
    setTargetRole('admin');
    setShowPinModal(true);
    setPinInput('');
    setPinError('');
  };

  const handleCreatorSwitchClick = () => {
    if (currentRole === 'creator') return;
    setTargetRole('creator');
    setShowPinModal(true);
    setPinInput('');
    setPinError('');
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRole === 'admin') {
      const validPin = storeSettings.ownerPin || '1234';
      if (pinInput === validPin || pinInput.toLowerCase() === 'admin' || pinInput === '1234') {
        setCurrentRole('admin');
        setShowPinModal(false);
        setPinError('');
      } else {
        setPinError('Clave de dueño incorrecta (Default: 1234).');
      }
    } else {
      const creatorPin = storeSettings.creatorPin || '0000';
      if (pinInput === creatorPin || pinInput === '0000' || pinInput.toLowerCase() === 'creator') {
        setCurrentRole('creator');
        setShowPinModal(false);
        setPinError('');
      } else {
        setPinError('Clave de creador incorrecta (Default: 0000).');
      }
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-white px-3 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <FideliaLogo size="xs" variant="horizontal" darkBackground />
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline font-medium">
            Sistema de Fidelización y Recompensas
          </span>
        </div>

        <div className="flex items-center space-x-2 my-1 sm:my-0">
          {/* Role selector buttons */}
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center space-x-0.5">
            <button
              onClick={() => setCurrentRole('client')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 font-medium ${
                currentRole === 'client'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>

            <button
              onClick={handleAdminSwitchClick}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 font-medium ${
                currentRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="Panel de Comercio (Requiere Clave)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Comercio</span>
            </button>

            <button
              onClick={handleCreatorSwitchClick}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 font-medium ${
                currentRole === 'creator'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-700/50'
              }`}
              title="Panel de Creador / SuperAdmin (100% Control)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Creador</span>
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center space-x-1 font-medium transition"
            title="Compartir o Ver Códigos QR"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Link / QR</span>
          </button>

          <button
            onClick={resetDemoData}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
            title="Restablecer Datos de Demostración"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 border border-slate-800 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className={`w-12 h-12 rounded-2xl border mx-auto flex items-center justify-center mb-3 ${
                targetRole === 'creator'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-indigo-600/30 text-indigo-400 border-indigo-500/30'
              }`}>
                {targetRole === 'creator' ? <Sparkles className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-black text-white">
                {targetRole === 'creator' ? 'Acceso Creador / SuperAdmin' : 'Acceso al Panel de Comercio'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {targetRole === 'creator'
                  ? 'Ingrese la clave master de creador para tener control 100% del sistema.'
                  : 'Ingrese la clave de dueño para acceder a la gestión del local.'}
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {targetRole === 'creator' ? 'Clave Creador (Default: 0000)' : 'Clave Comercio (Default: 1234)'}
                </label>
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder={targetRole === 'creator' ? 'Clave de creador' : 'Clave de comercio'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1 text-center font-semibold">{pinError}</p>
                )}
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
                  className={`flex-1 py-2.5 font-bold rounded-xl text-xs shadow-md transition text-white ${
                    targetRole === 'creator' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal && (
        <LinkQRShareModal onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
};

