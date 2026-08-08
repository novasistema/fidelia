import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Zap, QrCode, CheckCircle, Search, Gift, DollarSign, Send, Copy, Check, MessageCircle, Calculator, Sparkles, Plus, RotateCcw, TrendingUp, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPointsManager: React.FC = () => {
  const { customers, addPointsToCustomer, validateVoucher, generateQRPointLink, storeSettings } = useLoyalty();

  const [activeTab, setActiveTab] = useState<'direct' | 'qr' | 'validate'>('direct');

  // Direct points addition form
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [purchaseAmount, setPurchaseAmount] = useState<number | ''>(15000);
  const [manualPoints, setManualPoints] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [directSuccessMsg, setDirectSuccessMsg] = useState('');
  const [lastTransaction, setLastTransaction] = useState<{
    customerName: string;
    phone: string;
    earnedPoints: number;
    totalPoints: number;
  } | null>(null);

  // Calculator state
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1);
  const [calcBonusPercent, setCalcBonusPercent] = useState<number>(0);

  // QR / Link generation
  const [qrPoints, setQrPoints] = useState<number>(100);
  const [qrDescription, setQrDescription] = useState('Premio 100 puntos por visita');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Voucher validation form
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState<{ success: boolean; message: string; voucher?: any } | null>(null);

  const buildWhatsAppUrl = (phone: string, customerName: string, earned: number, total: number) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const brand = storeSettings.brandName || storeSettings.name || 'nuestro comercio';
    const text = `¡Hola ${customerName}! 👋\n\nTe informamos que en *${brand}* te acreditamos *+${earned.toLocaleString()} puntos* ⚡.\n\n📊 *Tu resumen de puntos:* \n• Puntos sumados hoy: *+${earned.toLocaleString()} pts*\n• Tu saldo acumulado total: *${total.toLocaleString()} puntos*\n\n¡Gracias por tu preferencia! 🎁`;
    
    if (cleanPhone) {
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    } else {
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    const amount = Number(purchaseAmount) || 0;
    const manual = manualPoints ? Number(manualPoints) : undefined;

    const cust = customers.find(c => c.id === selectedCustomerId);
    const mov = addPointsToCustomer(selectedCustomerId, amount, manual, note);
    confetti({ particleCount: 60, spread: 50 });

    const custName = `${cust?.name || ''} ${cust?.lastName || ''}`.trim();
    const updatedTotal = (cust?.points || 0) + mov.points;

    setLastTransaction({
      customerName: custName,
      phone: cust?.phone || '',
      earnedPoints: mov.points,
      totalPoints: updatedTotal,
    });

    setDirectSuccessMsg(`¡Bien! Los ${mov.points} puntos fueron entregados con éxito a ${custName}.`);
    
    // reset form
    setNote('');
  };

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    const link = generateQRPointLink(qrPoints, qrDescription);
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode) return;

    const res = validateVoucher(voucherCode);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60 });
    }
    setVoucherResult(res);
  };

  const selectedCust = customers.find(c => c.id === selectedCustomerId);
  const estimatedPoints = Math.floor((Number(purchaseAmount) || 0) * storeSettings.pointsPerPeso);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Operatoria Simple
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Administrar Puntos y Canjes
          </h1>
          <p className="text-xs text-slate-500">
            Carga de puntos rápida en mostrador, emisión por QR y validación de cupones de canje.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {/* Tabs Switcher - Matching Screenshot 9 */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
            activeTab === 'direct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Suma Directa</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
            activeTab === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-sky-600" />
          <span>Suma por QR o Link</span>
        </button>

        <button
          onClick={() => setActiveTab('validate')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
            activeTab === 'validate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="w-4 h-4 text-indigo-600" />
          <span>Validar Canje</span>
        </button>
      </div>

      {/* TAB 1: SUMA DIRECTA - MATCHING PHOTO 9 */}
      {activeTab === 'direct' && (
        <form onSubmit={handleDirectSubmit} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-lg">
            Suma directa de puntos por compra
          </h3>

          {directSuccessMsg && lastTransaction && (
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl font-bold text-xs shadow-xl border border-emerald-400/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">¡Puntos Acreditados con Éxito!</h4>
                  <p className="text-xs text-emerald-100 font-medium">{directSuccessMsg}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-emerald-300/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-emerald-100 font-medium text-xs space-y-0.5">
                  <div>👤 Cliente: <strong className="text-white font-bold">{lastTransaction.customerName}</strong></div>
                  <div>⚡ Puntos sumados: <strong className="text-amber-300 font-extrabold">+{lastTransaction.earnedPoints.toLocaleString()} pts</strong> | Total acumulado: <strong className="text-white font-black">{lastTransaction.totalPoints.toLocaleString()} pts</strong></div>
                </div>

                <a
                  href={buildWhatsAppUrl(lastTransaction.phone, lastTransaction.customerName, lastTransaction.earnedPoints, lastTransaction.totalPoints)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 border border-emerald-200 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Enviar Mensaje por WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Seleccionar Cliente (Email / DNI / Nombre) *
            </label>
            <select
              value={selectedCustomerId}
              onChange={e => {
                setSelectedCustomerId(e.target.value);
                setDirectSuccessMsg('');
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.lastName} — DNI: {c.dni} — {c.email} (Puntos actuales: {c.points})
                </option>
              ))}
            </select>
          </div>

          {/* CALCULADORA DE PUNTOS POR DINERO GASTADO */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-5 shadow-lg border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                    <span>Calculadora de Puntos por Compra</span>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] uppercase font-bold rounded-full border border-sky-400/30">
                      Rápida
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Regla del comercio: <strong className="text-sky-300 font-semibold">${Math.round(1 / (storeSettings.pointsPerPeso || 0.01)).toLocaleString()} gastados = 1 Punto base</strong>
                  </p>
                </div>
              </div>

              {(purchaseAmount !== '' || manualPoints !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseAmount('');
                    setManualPoints('');
                    setCalcMultiplier(1);
                    setCalcBonusPercent(0);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700 transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* Quick Cash Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Monto Gastado Rápido ($):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1000, 5000, 10000, 20000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setPurchaseAmount(amt);
                      setDirectSuccessMsg('');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                      purchaseAmount === amt
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    ${amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Incremental Quick Add Buttons */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 text-[11px] font-bold whitespace-nowrap">+ Sumar $:</span>
              {[1000, 5000, 10000].map(addVal => (
                <button
                  key={addVal}
                  type="button"
                  onClick={() => {
                    const current = Number(purchaseAmount) || 0;
                    setPurchaseAmount(current + addVal);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg font-bold text-[11px] border border-slate-700 transition flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>${addVal.toLocaleString()}</span>
                </button>
              ))}
            </div>

            {/* Multipliers & Bonus Percent Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Multiplicador Promocional</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { mult: 1, label: '1x Normal' },
                    { mult: 1.5, label: '1.5x Promo' },
                    { mult: 2, label: '2x Doble' },
                    { mult: 3, label: '3x Triple' }
                  ].map(m => (
                    <button
                      key={m.mult}
                      type="button"
                      onClick={() => {
                        setCalcMultiplier(m.mult);
                        if (m.mult !== 1 || calcBonusPercent !== 0) {
                          const base = Math.floor((Number(purchaseAmount) || 0) * storeSettings.pointsPerPeso);
                          const total = Math.floor(base * m.mult * (1 + calcBonusPercent / 100));
                          setManualPoints(total);
                        } else {
                          setManualPoints('');
                        }
                      }}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition ${
                        calcMultiplier === m.mult
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Percent className="w-3 h-3 text-emerald-400" />
                  <span>Bonus Extra de Puntos</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 10, 25, 50].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setCalcBonusPercent(b);
                        if (b !== 0 || calcMultiplier !== 1) {
                          const base = Math.floor((Number(purchaseAmount) || 0) * storeSettings.pointsPerPeso);
                          const total = Math.floor(base * calcMultiplier * (1 + b / 100));
                          setManualPoints(total);
                        } else {
                          setManualPoints('');
                        }
                      }}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition ${
                        calcBonusPercent === b
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      +{b}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                  Resultado de la Conversión
                </span>
                <div className="text-xl sm:text-2xl font-black text-sky-400 flex items-center justify-center sm:justify-start space-x-2">
                  <span>⚡ {((manualPoints !== '' && manualPoints !== undefined) ? Number(manualPoints) : Math.floor((Number(purchaseAmount) || 0) * storeSettings.pointsPerPeso)).toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-300">puntos a acreditar</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Por consumo de <strong>${(Number(purchaseAmount) || 0).toLocaleString()}</strong>
                  {calcMultiplier > 1 && <span className="text-amber-300 font-bold"> ({calcMultiplier}x promo)</span>}
                  {calcBonusPercent > 0 && <span className="text-emerald-300 font-bold"> (+{calcBonusPercent}% bonus)</span>}
                </p>
              </div>

              {(calcMultiplier > 1 || calcBonusPercent > 0) && (
                <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl whitespace-nowrap">
                  Puntos manuales aplicados
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monto gastado en Dinero ($) *
              </label>
              <input
                type="number"
                value={purchaseAmount}
                onChange={e => {
                  setPurchaseAmount(e.target.value ? Number(e.target.value) : '');
                  setDirectSuccessMsg('');
                }}
                placeholder="15000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Puntos Manuales (Opcional - reemplaza cálculo automático)
              </label>
              <input
                type="number"
                value={manualPoints}
                onChange={e => {
                  setManualPoints(e.target.value ? Number(e.target.value) : '');
                  setDirectSuccessMsg('');
                }}
                placeholder="Ej. 500"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones / Nro de comprobante
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej. Comprobante #10293, Ticket de caja"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Breakdown calculation box - matching photo 9 */}
          <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-100 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Puntos base acumulados:</span>
              <strong className="text-slate-800 font-bold">{estimatedPoints} puntos</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Puntos extra por nivel ({selectedCust?.tierId.toUpperCase()}):</span>
              <strong className="text-slate-800 font-bold">Incluido</strong>
            </div>
            <div className="pt-2 border-t border-sky-200/80 flex justify-between items-center font-black text-sky-900 text-sm">
              <span>El cliente sumará:</span>
              <span>⚡ {manualPoints ? manualPoints : estimatedPoints} puntos</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Entregar Puntos</span>
          </button>
        </form>
      )}

      {/* TAB 2: SUMA POR QR O LINK - MATCHING PHOTO 9 */}
      {activeTab === 'qr' && (
        <form onSubmit={handleGenerateQR} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-lg">
            Suma por QR o Enlace de Puntos
          </h3>
          <p className="text-xs text-slate-500">
            Generá un código QR para mostrar en mostrador o un link para WhatsApp que permita a los clientes sumar puntos al escanear.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad de Puntos a Entregar
              </label>
              <input
                type="number"
                value={qrPoints}
                onChange={e => setQrPoints(Number(e.target.value))}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo / Descripción del beneficio
              </label>
              <input
                type="text"
                value={qrDescription}
                onChange={e => setQrDescription(e.target.value)}
                placeholder="Puntos por compra o promoción"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Generar Código QR y Enlace</span>
          </button>

          {generatedLink && (
            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-sky-800 uppercase block">Código QR Generado</span>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedLink)}`}
                    alt="QR Generado"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = `¡Reclamá tus ${qrPoints} puntos de regalo en ${storeSettings.name}! 👇\n${generatedLink}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* TAB 3: VALIDAR CANJE - MATCHING PHOTO 9 */}
      {activeTab === 'validate' && (
        <form onSubmit={handleValidateVoucherSubmit} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="font-extrabold text-slate-800 text-lg">
            Validar y Entregar Premio Canjeado
          </h3>
          <p className="text-xs text-slate-500">
            Ingresá el código del cupón que te presenta el cliente (ej. <strong>CANJE-88291</strong>) para marcarlo como entregado.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Código de Cupón de Canje *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={voucherCode}
                onChange={e => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setVoucherResult(null);
                }}
                placeholder="CANJE-88291"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Validar Cupón
              </button>
            </div>
          </div>

          {voucherResult && (
            <div className={`p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              voucherResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-extrabold text-sm flex items-center space-x-2">
                {voucherResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Gift className="w-5 h-5 text-rose-600" />}
                <span>{voucherResult.message}</span>
              </div>

              {voucherResult.voucher && (
                <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 font-medium">
                  <div>Cliente: <strong>{voucherResult.voucher.customerName}</strong></div>
                  <div>Premio: <strong>{voucherResult.voucher.rewardTitle}</strong></div>
                  <div>Puntos util.: <strong>{voucherResult.voucher.pointsSpent} pts</strong></div>
                  <div>Estado: <strong>{voucherResult.voucher.status.toUpperCase()}</strong></div>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
};
