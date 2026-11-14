import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { RewardItem } from '../../types';
import { Search, Zap, Gift, Check, X, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CatalogView: React.FC<{ onNavigateToSection?: (sec: string) => void }> = ({ onNavigateToSection = () => {} }) => {
  const { currentCustomer, rewards, redeemReward, tiers, storeSettings, tierOf } = useLoyalty();
  const [redeeming, setRedeeming] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<{ success: boolean; message: string; voucherCode?: string } | null>(null);

  if (!currentCustomer) return null;

  const currentTier = tierOf(currentCustomer);
  const earned = currentCustomer.totalEarned ?? currentCustomer.points;
  const nextTier = tiers.find(t => t.minPoints > earned) || tiers[tiers.length - 1];
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - earned) : 0;

  // Extract unique categories
  const categories = ['Todos', ...Array.from(new Set(rewards.map(r => r.category)))];

  // Filter rewards
  const filteredRewards = rewards.filter(r => {
    if (!r.isActive) return false;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleConfirmRedemption = async () => {
    if (!selectedReward || redeeming) return;

    setRedeeming(true);
    const res = await redeemReward(selectedReward.id);
    setRedeeming(false);
    if (res.success && res.voucher) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setRedemptionResult({
        success: true,
        message: res.message,
        voucherCode: res.voucher.code
      });
    } else {
      setRedemptionResult({
        success: false,
        message: res.message
      });
    }
  };

  const closeModal = () => {
    setSelectedReward(null);
    setRedemptionResult(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header - Matching Screenshot 5 */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-bold text-xs uppercase tracking-wider rounded-full border border-sky-500/30 inline-flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{storeSettings.brandName} Fidelidad</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Hola, <span className="text-sky-400">{currentCustomer.name}</span>
            </h1>
            <p className="text-slate-300 text-sm font-medium">
              Canjeá tus puntos acumulados por increíbles premios y beneficios.
            </p>
          </div>

          {/* Points Counter Badge */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex items-center space-x-4 shadow-lg min-w-[220px]">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              <Zap className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                {currentCustomer.points.toLocaleString()}
              </div>
              <div className="text-xs text-sky-200 font-medium mt-1">
                Puntos disponibles
              </div>
            </div>
          </div>
        </div>

        {/* Tier level progress bar - Matching Photo 5 */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-semibold">Tu nivel actual es:</div>
              <div className="text-base font-extrabold text-amber-400 flex items-center space-x-1 mt-0.5">
                <span>{currentTier.name}</span>
                <span className="text-xs px-2 py-0.5 bg-amber-400/20 rounded-full text-amber-300 border border-amber-400/30">
                  {currentTier.multiplier}x Puntos
                </span>
              </div>
            </div>
            {pointsToNextTier > 0 && (
              <div className="text-right">
                <div className="text-xs text-slate-400">Te faltan para nivel {nextTier.name}:</div>
                <div className="text-sm font-extrabold text-sky-400">
                  ⚡ {pointsToNextTier.toLocaleString()} pts
                </div>
              </div>
            )}
          </div>

          <div className="bg-sky-900/40 p-4 rounded-2xl border border-sky-500/20 flex items-center justify-between">
            <div className="text-xs text-sky-200">
              Equivalencia estimada: <strong className="text-white text-sm block font-bold">${(currentCustomer.points * 1).toLocaleString()} en premios</strong>
            </div>
            <button
              onClick={() => onNavigateToSection('referidos')}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-1"
            >
              <span>¡Ganá puntos extra!</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Categories Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscá tu premio ideal..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">No encontramos premios</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Probá buscando con otro nombre o cambiando el filtro de categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map(reward => {
            const canAfford = currentCustomer.points >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Reward Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={reward.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(reward.title)}`}
                    alt={reward.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-slate-700 uppercase tracking-wider shadow-sm">
                    {reward.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-sky-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{reward.pointsCost} pts</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg leading-snug group-hover:text-sky-600 transition-colors">
                      {reward.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Stock: {reward.stock} disponibles
                    </span>

                    <button
                      onClick={() => {
                        setSelectedReward(reward);
                        setRedemptionResult(null);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center space-x-1 ${
                        canAfford
                          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Canjear' : 'Puntos insf.'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REDEMPTION CONFIRMATION MODAL - EXACT MATCH TO SCREENSHOT 4 */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!redemptionResult ? (
              /* CONFIRMATION STATE - PHOTO 4 MATCH */
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Gift className="w-8 h-8" />
                </div>

                <h3 className="font-extrabold text-slate-800 text-lg leading-tight px-2">
                  ¿Seguro que querés canjear tus puntos por <span className="text-sky-600">{selectedReward.title}</span>?
                </h3>

                {/* Calculation breakdown matching screenshot 4 */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs text-left border border-slate-100">
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Tenés</span>
                    <span className="font-bold text-sky-700 text-sm flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
                      <span>{currentCustomer.points.toLocaleString()} puntos</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Vas a utilizar</span>
                    <span className="font-bold text-sky-700 text-sm flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
                      <span>{selectedReward.pointsCost.toLocaleString()} puntos</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-800 font-extrabold">
                    <span>Te quedan</span>
                    <span className="text-sm font-black text-sky-600 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
                      <span>{(currentCustomer.points - selectedReward.pointsCost).toLocaleString()} puntos</span>
                    </span>
                  </div>
                </div>

                {selectedReward.terms && (
                  <p className="text-[11px] text-slate-400 italic">
                    * {selectedReward.terms}
                  </p>
                )}

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmRedemption}
                    disabled={redeeming}
                    className="disabled:opacity-50 flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition text-sm"
                  >
                    {redeeming ? 'Canjeando...' : 'Canjear'}
                  </button>
                </div>
              </div>
            ) : (
              /* RESULT STATE */
              <div className="text-center space-y-4">
                {redemptionResult.success ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-9 h-9 stroke-[3]" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-xl">
                      ¡Canje Exitoso!
                    </h3>
                    <p className="text-xs text-slate-600">
                      {redemptionResult.message}
                    </p>

                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
                      <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                        Código de Cupón
                      </span>
                      <div className="font-mono text-2xl font-black text-sky-900 tracking-wider">
                        {redemptionResult.voucherCode}
                      </div>
                      <span className="text-[10px] text-sky-600 block pt-1">
                        Presentá este código en caja para retirar tu premio. Podés consultarlo en "Mis canjes".
                      </span>
                    </div>

                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          closeModal();
                          onNavigateToSection('canjes');
                        }}
                        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm shadow-md transition"
                      >
                        Ver Mis Canjes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">
                      No se pudo realizar el canje
                    </h3>
                    <p className="text-xs text-red-600 font-medium">
                      {redemptionResult.message}
                    </p>
                    <button
                      onClick={closeModal}
                      className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md"
                    >
                      Entendido
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
