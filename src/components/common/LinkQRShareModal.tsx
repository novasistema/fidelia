import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone, Printer, Shield } from 'lucide-react';
import { storeUrl } from '../../lib/route';

const qrImg = (url: string, size = 220) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(url)}`;

// Link y QR del comercio para que los clientes se sumen (para imprimir en el mostrador)
export const LinkQRShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storeSettings, storeId } = useLoyalty();
  const [copied, setCopied] = useState<'client' | 'admin' | null>(null);
  if (!storeId) return null;

  const clientUrl = storeUrl(storeId);
  const adminUrl = `${window.location.origin}/admin`;

  const copy = (text: string, type: 'client' | 'admin') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const printPoster = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const esc = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>QR ${esc(storeSettings.name)}</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#0f172a}h1{font-size:34px;margin:0 0 8px}p{font-size:18px;margin:6px 0}img.qr{width:360px;height:360px;margin:24px auto;display:block}.url{font-family:monospace;font-size:14px;color:#475569}</style>
      </head><body>
      ${storeSettings.logoUrl ? `<img src="${esc(storeSettings.logoUrl)}" style="max-height:90px;margin-bottom:12px">` : ''}
      <h1>¡Sumá puntos en ${esc(storeSettings.name)}!</h1>
      <p>Escaneá el código, registrate en 1 minuto y ganá ${storeSettings.welcomePoints || 0} puntos de regalo.</p>
      <img class="qr" src="${qrImg(clientUrl, 600)}" onload="setTimeout(()=>window.print(),300)">
      <p class="url">${esc(clientUrl)}</p>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-lg">Link y QR de {storeSettings.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex flex-col md:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-100 flex-shrink-0">
              <img src={qrImg(clientUrl)} alt="QR para clientes" className="w-32 h-32 object-contain" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start space-x-1.5 text-sky-900 font-bold text-base">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>Para tus clientes</span>
              </div>
              <p className="text-xs text-sky-800">Pegalo en el mostrador o compartilo por WhatsApp e Instagram. Los clientes se registran, ven sus puntos y canjean premios.</p>
              <code className="block text-[11px] text-slate-600 break-all">{clientUrl}</code>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <button onClick={() => copy(clientUrl, 'client')} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1">
                  {copied === 'client' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'client' ? '¡Copiado!' : 'Copiar link'}</span>
                </button>
                <button onClick={printPoster} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 text-xs font-semibold rounded-lg flex items-center space-x-1">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir cartel</span>
                </button>
                <a href={clientUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 text-xs font-semibold rounded-lg flex items-center space-x-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-900 font-bold text-sm">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Panel del comercio (dueño y cajeros)</span>
            </div>
            <p className="text-xs text-indigo-800">Cada persona entra con su propio email. Agregá cajeros en “Equipo y Cajeros”.</p>
            <button onClick={() => copy(adminUrl, 'admin')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg inline-flex items-center space-x-1">
              {copied === 'admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'admin' ? '¡Copiado!' : adminUrl}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
