import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { FideliaLogo } from '../common/FideliaLogo';
import {
  ShieldAlert,
  Power,
  Trash2,
  RefreshCw,
  Users,
  Award,
  CreditCard,
  Key,
  Settings,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  Database,
  Lock,
  DollarSign,
  Info,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreatorDashboard: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    customers,
    movements,
    vouchers,
    rewards,
    wipeSystemDataToFactoryReset,
    resetDemoData,
    setCurrentRole
  } = useLoyalty();

  // Custom Suspension Message state
  const [suspensionMessage, setSuspensionMessage] = useState(
    storeSettings.suspensionReason || 'El servicio de Fidelia para este comercio se encuentra suspendido temporalmente por falta de pago de suscripción.'
  );
  const [planName, setPlanName] = useState(storeSettings.clientPlanName || 'Plan Fidelia Pro');
  const [dueDate, setDueDate] = useState(storeSettings.subscriptionDueDate || '2026-08-31');

  // Master PIN state
  const [creatorPin, setCreatorPin] = useState(storeSettings.creatorPin || '0000');
  const [ownerPin, setOwnerPin] = useState(storeSettings.ownerPin || '1234');
  const [pinSavedMsg, setPinSavedMsg] = useState(false);

  // Danger Zone / Wipe Confirmation Modal
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState('');

  const handleToggleSystemStatus = () => {
    const newStatus = !storeSettings.isSystemActive;
    updateStoreSettings({
      isSystemActive: newStatus,
      suspensionReason: suspensionMessage,
      clientPlanName: planName,
      subscriptionDueDate: dueDate
    });

    if (newStatus) {
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      suspensionReason: suspensionMessage,
      clientPlanName: planName,
      subscriptionDueDate: dueDate,
      creatorPin,
      ownerPin
    });
    setPinSavedMsg(true);
    setTimeout(() => setPinSavedMsg(false), 3000);
  };

  const handleConfirmFactoryReset = () => {
    if (confirmInput.trim().toUpperCase() === 'BORRAR TODO') {
      wipeSystemDataToFactoryReset();
      setShowWipeModal(false);
      setConfirmInput('');
      setWipeSuccessMsg('¡El sistema ha sido reseteado al 100%! Todos los datos fueron borrados para comenzar desde cero.');
      setTimeout(() => setWipeSuccessMsg(''), 5000);
    }
  };

  // Stats
  const totalCustomers = customers.length;
  const totalPointsInCirculation = customers.reduce((sum, c) => sum + (c.points || 0), 0);
  const totalMovementsCount = movements.length;
  const totalVouchersRedeemed = vouchers.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 p-6 rounded-3xl border border-sky-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <FideliaLogo size="md" variant="iconOnly" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Panel SuperAdmin Creador</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                storeSettings.isSystemActive !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}>
                {storeSettings.isSystemActive !== false ? '🟢 Sistema Activo' : '🔴 Sistema Suspendido'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              Control Total de Plataforma Fidelia
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión exclusiva del creador para el comercio <strong className="text-white">{storeSettings.brandName}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setCurrentRole('admin')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            Ir a Panel Comercio
          </button>
          <button
            onClick={() => setCurrentRole('client')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Ir a Portal Cliente
          </button>
        </div>
      </div>

      {wipeSuccessMsg && (
        <div className="p-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{wipeSuccessMsg}</span>
        </div>
      )}

      {/* Global System Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clientes Registrados</span>
            <span className="text-2xl font-black text-white">{totalCustomers.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Puntos en Circulación</span>
            <span className="text-2xl font-black text-amber-300">{totalPointsInCirculation.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Canjes Realizados</span>
            <span className="text-2xl font-black text-emerald-300">{totalVouchersRedeemed.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Movimientos de Puntos</span>
            <span className="text-2xl font-black text-indigo-300">{totalMovementsCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: ACTIVAR / DESACTIVAR SISTEMA (SUSCRIPCIÓN POR FALTA DE PAGO) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <Power className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Estado de Suscripción y Licencia del Comercio
                </h3>
                <p className="text-xs text-slate-400">
                  Active o desactive el sistema por falta de pago. Al desactivar, los clientes y administradores verán el bloqueo.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleSystemStatus}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg transition flex items-center space-x-2 border ${
                storeSettings.isSystemActive !== false
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>
                {storeSettings.isSystemActive !== false ? 'DESACTIVAR SISTEMA (Falta de Pago)' : 'ACTIVAR SISTEMA (Servicio Al Día)'}
              </span>
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Nombre del Plan de Suscripción</span>
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="Ej. Plan Fidelia Pro Mensual"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fecha de Vencimiento de Suscripción</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Mensaje de Bloqueo Visible en Pantalla (Por Falta de Pago)</span>
              </label>
              <textarea
                rows={3}
                value={suspensionMessage}
                onChange={e => setSuspensionMessage(e.target.value)}
                placeholder="Mensaje a mostrar cuando se desactiva el servicio..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Este texto se muestra en pantalla completa a clientes y administradores cuando el sistema está desactivado.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Guardar Parámetros de Licencia
              </button>

              {pinSavedMsg && (
                <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Configuración guardada correctamente</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Col: CLAVES MASTER Y SEGURIDAD */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Claves de Acceso Master</h3>
              <p className="text-xs text-slate-400">Protección PIN para Creador y Dueño</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Clave de Creador / SuperAdmin (100% Control)</span>
              </label>
              <input
                type="text"
                value={creatorPin}
                onChange={e => setCreatorPin(e.target.value)}
                placeholder="Por defecto: 0000"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono font-bold text-white text-center tracking-widest focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Le permite ingresar al Panel Creador desde cualquier pantalla de bloqueo.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Clave de Acceso Comercio / Dueño</span>
              </label>
              <input
                type="text"
                value={ownerPin}
                onChange={e => setOwnerPin(e.target.value)}
                placeholder="Por defecto: 1234"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono font-bold text-white text-center tracking-widest focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Clave de seguridad que debe ingresar el dueño/encargado para entrar al panel administrativo.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Actualizar Claves Master
            </button>
          </form>
        </div>
      </div>

      {/* DANGER ZONE: BORRAR DATOS PARA COMENZAR DE CERO */}
      <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-500/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white flex items-center space-x-2">
                <span>Zona Crítica: Restablecimiento de Fábrica y Borrado Cero</span>
                <span className="px-2 py-0.5 bg-rose-500/30 text-rose-300 text-[10px] uppercase font-extrabold rounded-full border border-rose-400/40">
                  Acción Irreversible
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Permite eliminar todos los registros de clientes, puntos, canjes, premios y comenzar la base de datos 100% limpia desde cero.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowWipeModal(true);
              setConfirmInput('');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl transition border border-rose-400/40 flex items-center justify-center space-x-2 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>BORRAR DATOS Y COMENZAR DE CERO</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-300 flex items-center space-x-1">
              <Info className="w-4 h-4" />
              <span>¿Qué se borra con el Reseteo de Fábrica?</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Elimina todos los usuarios registrados, el historial de carga de puntos, canjes solicitados, vales activos, encuestas y sorteos creados.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-sky-300 flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer Datos de Demostración</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si solo desea recargar los datos iniciales de prueba (ej. clientes de ejemplo Tomas, María, Carlos) haga clic en el botón de recarga de la barra superior.
            </p>
          </div>
        </div>
      </div>

      {/* Wipe Modal Confirmation */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">Confirmación de Borrado Cero</h3>
              <p className="text-xs text-slate-300">
                Esta acción eliminará <strong className="text-rose-400">TODOS los clientes, transacciones de puntos y datos</strong>. La aplicación quedará completamente en blanco para iniciar desde cero.
              </p>
            </div>

            <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-500/30 text-xs text-rose-200">
              Para confirmar el borrado total, escriba exactamente: <strong className="text-white font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">BORRAR TODO</strong>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="Escriba BORRAR TODO"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-mono font-bold text-white uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmInput.trim().toUpperCase() !== 'BORRAR TODO'}
                onClick={handleConfirmFactoryReset}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black rounded-xl text-xs shadow-lg transition"
              >
                Confirmar Borrado Cero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
