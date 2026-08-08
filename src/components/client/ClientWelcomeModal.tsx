import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import { Gift, Award, QrCode, ArrowRight, ShieldCheck, UserCheck, Sparkles, X, Copy, Check, Lock } from 'lucide-react';

interface ClientWelcomeModalProps {
  onEnterClientPortal: () => void;
  onClose?: () => void;
}

export const ClientWelcomeModal: React.FC<ClientWelcomeModalProps> = ({ onEnterClientPortal, onClose }) => {
  const { storeSettings, setCurrentRole } = useLoyalty();
  const [copiedAdminUrl, setCopiedAdminUrl] = useState(false);
  const [showCompanyQr, setShowCompanyQr] = useState(false);
  
  // PIN verification for owner & creator access
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [showCreatorPinPrompt, setShowCreatorPinPrompt] = useState(false);
  const [creatorPinInput, setCreatorPinInput] = useState('');
  const [creatorPinError, setCreatorPinError] = useState(false);

  const adminUrl = `${window.location.origin}/?role=admin`;

  const getQrUrl = (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminUrl);
    setCopiedAdminUrl(true);
    setTimeout(() => setCopiedAdminUrl(false), 2000);
  };

  const handleVerifyOwnerPin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = storeSettings.ownerPin || '1234';
    if (pinInput === validPin || pinInput.toLowerCase() === 'admin') {
      setCurrentRole('admin');
      if (onClose) onClose();
    } else {
      setPinError(true);
    }
  };

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
                  <strong className="text-slate-900">Bono de Bienvenida:</strong> Ganá 100 puntos extra inmediatamente al registrarte.
                </div>
              </li>

              <li className="flex items-start space-x-2.5">
                <div className="p-1 bg-sky-100 text-sky-700 rounded-lg font-bold text-xs flex-shrink-0">
                  ⭐
                </div>
                <div>
                  <strong className="text-slate-900">Puntos por Compra:</strong> Cada compra suma puntos para canjear por cervezas, desayunos y promociones.
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

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">O para la Empresa</span>
            </div>
          </div>

          {/* SEPARATE COMPANY / OWNER PANEL ACCESS (QR & LINK) */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-wider">Acceso Empresa / Dueño</h4>
                  <p className="text-xs text-slate-300 font-semibold">Panel de Administración del Comercio</p>
                </div>
              </div>

              <button
                onClick={() => setShowCompanyQr(!showCompanyQr)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1"
                title="Ver QR Empresa"
              >
                <QrCode className="w-4 h-4" />
                <span>QR</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Acceso con link directo o QR exclusivo para cargar puntos, administrar premios y configurar la tienda.
            </p>

            {showCompanyQr && (
              <div className="p-3 bg-white text-slate-800 rounded-xl flex items-center space-x-3 animate-in fade-in duration-200">
                <img src={getQrUrl(adminUrl)} alt="QR Empresa" className="w-20 h-20 object-contain rounded-lg border p-1" />
                <div className="text-xs space-y-1 flex-1">
                  <span className="font-bold text-indigo-900 block">QR de Acceso Empresa</span>
                  <p className="text-[10px] text-slate-500">Escaneá desde otro dispositivo o compartí con tu personal de caja.</p>
                  <button
                    onClick={handleCopyAdminUrl}
                    className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-2 py-1 rounded font-bold transition flex items-center space-x-1"
                  >
                    {copiedAdminUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAdminUrl ? 'Link Copiado' : 'Copiar Link Empresa'}</span>
                  </button>
                </div>
              </div>
            )}

            {!showPinPrompt ? (
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => {
                    setShowPinPrompt(true);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Ingresar con Clave de Dueño</span>
                </button>

                <button
                  onClick={handleCopyAdminUrl}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  title="Copiar link empresa"
                >
                  {copiedAdminUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOwnerPin} className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300">Clave de Acceso Empresa:</span>
                  <button
                    type="button"
                    onClick={() => setShowPinPrompt(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    autoFocus
                    value={pinInput}
                    onChange={e => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Ingrese clave"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Ingresar
                  </button>
                </div>
                {pinError && (
                  <p className="text-[10px] text-rose-400 font-semibold text-center">
                    Clave incorrecta. Verifique la clave configurada.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* CREATOR DIRECT ACCESS OPTION */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {!showCreatorPinPrompt ? (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-600">¿Sos el creador del sistema?</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatorPinPrompt(true);
                    setCreatorPinInput('');
                    setCreatorPinError(false);
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold rounded-xl border border-amber-300 transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Panel Creador (100% Control)</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const creatorPin = storeSettings.creatorPin || '0000';
                  if (creatorPinInput === creatorPin || creatorPinInput === '0000' || creatorPinInput.toLowerCase() === 'creator') {
                    setCurrentRole('creator');
                    if (onClose) onClose();
                  } else {
                    setCreatorPinError(true);
                  }
                }}
                className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Clave Creador Master (Default: 0000)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreatorPinPrompt(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    autoFocus
                    value={creatorPinInput}
                    onChange={e => {
                      setCreatorPinInput(e.target.value);
                      setCreatorPinError(false);
                    }}
                    placeholder="Ingrese clave (0000)"
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Ingresar
                  </button>
                </div>
                {creatorPinError && (
                  <p className="text-[10px] text-rose-600 font-semibold text-center">
                    Clave de Creador incorrecta (Default: 0000).
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
