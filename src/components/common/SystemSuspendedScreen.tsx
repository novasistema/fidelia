import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { FideliaLogo } from './FideliaLogo';
import { ShieldAlert, MessageCircle, Mail, LogOut } from 'lucide-react';
import { PLATFORM_CONTACT } from '../../lib/platform';

// Pantalla para comercios suspendidos. Solo el creador de la plataforma puede reactivarlos (desde /creador).
export const SystemSuspendedScreen: React.FC = () => {
  const { storeSettings, currentRole, authUser, logout } = useLoyalty();
  const isStaffView = currentRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <FideliaLogo size="lg" darkBackground />
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{isStaffView ? 'Servicio suspendido' : 'Programa no disponible'}</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isStaffView ? 'Tu programa de puntos está pausado' : `El club de ${storeSettings.name} no está disponible por el momento`}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {isStaffView
              ? storeSettings.suspensionReason || 'El servicio de Fidelia para este comercio está suspendido. Tus datos y los puntos de tus clientes están guardados.'
              : 'Tus puntos están guardados. Volvé a intentar más tarde.'}
          </p>
        </div>

        {isStaffView && (
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-left space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>Comercio: <strong className="text-white">{storeSettings.name}</strong></span>
              <span>Plan: <strong className="text-sky-400">{storeSettings.clientPlanName || 'Fidelia'}</strong></span>
            </div>
            <p>Para reactivarlo, comunicate con {PLATFORM_CONTACT.name}:</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_CONTACT.whatsapp && (
                <a
                  href={`https://wa.me/${PLATFORM_CONTACT.whatsapp}?text=${encodeURIComponent(`Hola, quiero reactivar Fidelia para ${storeSettings.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {PLATFORM_CONTACT.email && (
                <a href={`mailto:${PLATFORM_CONTACT.email}`} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {PLATFORM_CONTACT.email}
                </a>
              )}
            </div>
          </div>
        )}

        {authUser && (
          <button onClick={() => logout()} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión ({authUser.email})
          </button>
        )}
      </div>
    </div>
  );
};
