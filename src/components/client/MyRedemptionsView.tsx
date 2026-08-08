import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Gift, QrCode, CheckCircle, Clock, XCircle, ChevronRight, Copy, Check } from 'lucide-react';

export const MyRedemptionsView: React.FC = () => {
  const { currentCustomer, vouchers } = useLoyalty();
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!currentCustomer) return null;

  const myVouchers = vouchers.filter(v => v.customerId === currentCustomer.id);

  const getQrUrl = (code: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Mis Canjes de Premios</h1>
          <p className="text-xs text-slate-500 mt-1">
            Presentá el código QR o cupón de canje en caja para retirar tu premio.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <Gift className="w-6 h-6" />
        </div>
      </div>

      {myVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Gift className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">No realizaste canjes todavía</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explorá el catálogo de premios y canjeá tus puntos acumulados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myVouchers.map(voucher => {
            const isPending = voucher.status === 'pending';
            const isUsed = voucher.status === 'used';

            return (
              <div
                key={voucher.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPending ? 'border-sky-200 hover:border-sky-400 bg-sky-50/20' : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                    isPending ? 'bg-sky-100 text-sky-600' : isUsed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Gift className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-800 text-base">
                        {voucher.rewardTitle}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isUsed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isPending ? 'Pendiente de retiro' : isUsed ? 'Canjeado' : 'Cancelado'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Código: <strong className="font-mono text-slate-800">{voucher.code}</strong></span>
                      <span>•</span>
                      <span>Fecha: {voucher.createdAt}</span>
                      <span>•</span>
                      <span>Puntos: ⚡ {voucher.pointsSpent}</span>
                    </div>

                    {isUsed && voucher.usedAt && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        ✓ Entregado en local el {voucher.usedAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Voucher QR Action */}
                <div className="w-full md:w-auto flex items-center justify-end space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedVoucherCode(voucher.code)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition"
                  >
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>Mostrar QR en caja</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR MODAL FOR STORE CASHIER */}
      {selectedVoucherCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Cupón de Canje
            </h3>
            <p className="text-xs text-slate-500">
              Molleá este código QR al encargado del comercio para validar tu beneficio.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block mx-auto shadow-inner">
              <img
                src={getQrUrl(selectedVoucherCode)}
                alt="QR Canje"
                className="w-52 h-52 object-contain mx-auto"
              />
            </div>

            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
              <span className="font-mono text-lg font-black text-sky-900 tracking-wider">
                {selectedVoucherCode}
              </span>
              <button
                onClick={() => handleCopyCode(selectedVoucherCode)}
                className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => setSelectedVoucherCode(null)}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
