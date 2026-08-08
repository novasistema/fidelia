import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone, ShieldCheck, User } from 'lucide-react';

export const LinkQRShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storeSettings, currentCustomer, customers, setCurrentCustomer, setCurrentRole } = useLoyalty();
  const [copiedType, setCopiedType] = useState<'client' | 'admin' | null>(null);

  const clientUrl = `${window.location.origin}/?role=client`;
  const adminUrl = `${window.location.origin}/?role=admin`;

  const copyToClipboard = (text: string, type: 'client' | 'admin') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Generate simple QR code SVG or QuickChart QR API image URL
  const getQrUrl = (url: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-lg">Acceso y Enlaces QR del Comercio</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Client access QR */}
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5">
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-100 flex-shrink-0">
              <img 
                src={getQrUrl(clientUrl)} 
                alt="QR Cliente" 
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start space-x-1.5 text-sky-900 font-bold text-base">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>Acceso para Clientes</span>
              </div>
              <p className="text-xs text-sky-800">
                Escaneá este QR para ingresar al portal de fidelización del cliente, registrarse o canjear sus puntos acumulados.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <button
                  onClick={() => copyToClipboard(clientUrl, 'client')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm transition"
                >
                  {copiedType === 'client' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'client' ? '¡Copiado!' : 'Copiar Link Cliente'}</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('client');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ingresar como Cliente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Admin access QR */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5">
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-100 flex-shrink-0">
              <img 
                src={getQrUrl(adminUrl)} 
                alt="QR Administrador" 
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start space-x-1.5 text-indigo-900 font-bold text-base">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Panel de Administración (Dueño)</span>
              </div>
              <p className="text-xs text-indigo-800">
                Acceso exclusivo para el administrador del comercio: cargar puntos, crear publicidad pop-up, configurar premios y estadísticas.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <button
                  onClick={() => copyToClipboard(adminUrl, 'admin')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm transition"
                >
                  {copiedType === 'admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'admin' ? '¡Copiado!' : 'Copiar Link Admin'}</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ingresar como Administrador</span>
                </button>
              </div>
            </div>
          </div>

          {/* Switch Customer selector */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Simular inicio de sesión como otro cliente de prueba:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {customers.map(cust => (
                <button
                  key={cust.id}
                  onClick={() => {
                    setCurrentCustomer(cust);
                    setCurrentRole('client');
                    onClose();
                  }}
                  className={`p-2 rounded-lg border text-left text-xs transition flex items-center space-x-2 ${
                    currentCustomer?.id === cust.id
                      ? 'border-sky-500 bg-sky-50/80 font-bold text-sky-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="truncate">
                    <div>{cust.name} {cust.lastName}</div>
                    <div className="text-[10px] text-slate-500 font-normal">⚡ {cust.points} pts - Nivel {cust.tierId.toUpperCase()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
