import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import { Menu, Zap } from 'lucide-react';

export const ClientHeader: React.FC<{ onOpenSidebar: () => void; onOpenQRScan?: () => void }> = ({
  onOpenSidebar,
  onOpenQRScan
}) => {
  const { currentCustomer, storeSettings, tiers } = useLoyalty();

  if (!currentCustomer) return null;

  const currentTier = tiers.find(t => t.id === currentCustomer.tierId) || tiers[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          <BrandLogo size="sm" />
        </div>

        {/* Customer Quick Stats Counter */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1.5 rounded-full shadow-xs">
            <Zap className="w-4 h-4 text-sky-600 fill-sky-500 animate-pulse" />
            <span className="font-extrabold text-sm">{currentCustomer.points.toLocaleString()}</span>
            <span className="text-xs font-semibold text-sky-700">pts</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${currentTier.badgeBg}`}>
              {currentTier.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
