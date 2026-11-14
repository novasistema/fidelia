import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { storeUrl } from '../../lib/route';
import { UserPlus, Share2, Copy, Check, QrCode, Sparkles, MessageCircle } from 'lucide-react';

export const ReferralsView: React.FC = () => {
  const { currentCustomer, storeSettings, storeId } = useLoyalty();
  const [copied, setCopied] = useState(false);

  if (!currentCustomer) return null;

  const referralUrl = `${storeUrl(storeId || '')}?ref=${currentCustomer.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `¡Hola! Registrate en el programa de fidelización de ${storeSettings.name} usando mi código de invitación ${currentCustomer.referralCode} y ¡ambos sumamos puntos gratis! 👇\n${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getQrUrl = (url: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 bg-white/20 font-bold text-xs uppercase tracking-wider rounded-full inline-flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Programa de Referidos</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Invitá a tus amigos y ¡ganá {(storeSettings.referralPoints || 0).toLocaleString('es-AR')} puntos!
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-md">
            Compartí tu enlace o código con tus amigos. Cuando se registren con tu código y hagan su primera compra, vos y tu amigo ganan puntos extra.
          </p>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[180px]">
          <span className="text-[11px] font-bold text-sky-200 block uppercase">Tu Código Único</span>
          <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
            {currentCustomer.referralCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Link and Share Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-sky-600" />
            <span>Compartir tu Enlace</span>
          </h3>

          <p className="text-xs text-slate-500">
            Copiá tu enlace personal o envialo directamente por WhatsApp a tus contactos.
          </p>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-700 truncate pr-2">
              {referralUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Invitación por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-center">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center justify-center space-x-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            <span>Tu Código QR de Invitación</span>
          </h3>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
            <img
              src={getQrUrl(referralUrl)}
              alt="QR Referido"
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>

          <p className="text-xs text-slate-500">
            Tu amigo puede escanear este QR con la cámara de su celular para registrarse al instante.
          </p>
        </div>
      </div>
    </div>
  );
};
