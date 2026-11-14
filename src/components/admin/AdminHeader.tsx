import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Store, Share2, LogOut, ChevronDown } from 'lucide-react';
import { adminNavItems } from './AdminSidebar';

interface AdminHeaderProps {
  onOpenQRModal: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenQRModal, activeView, setActiveView }) => {
  const { storeSettings, staffRole, staffStores, storeId, setStoreId, authUser, logout, isPlatformAdmin } = useLoyalty();
  const navItems = adminNavItems(staffRole);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-2xs space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <Store className="w-4 h-4 text-sky-600 shrink-0" />
          {staffStores.length > 1 || isPlatformAdmin ? (
            <div className="relative">
              <select
                value={storeId || ''}
                onChange={e => setStoreId(e.target.value || null)}
                className="appearance-none pr-6 font-extrabold text-slate-800 text-sm bg-transparent focus:outline-none cursor-pointer"
              >
                {!staffStores.some(s => s.storeId === storeId) && storeId && <option value={storeId}>{storeSettings.name}</option>}
                {staffStores.map(s => (
                  <option key={s.storeId} value={s.storeId}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <span className="font-extrabold text-slate-800 text-sm truncate">{storeSettings.name}</span>
          )}
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">{staffRole === 'owner' ? 'Dueño' : 'Cajero'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenQRModal}
            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 border border-sky-100"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Link y QR del comercio</span>
          </button>
          <span className="text-[11px] text-slate-400 hidden lg:inline">{authUser?.email}</span>
          <button
            onClick={() => logout()}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition md:hidden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menú en celulares */}
      <select
        value={activeView}
        onChange={e => setActiveView(e.target.value)}
        className="md:hidden w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700"
      >
        {navItems.map(i => (
          <option key={i.id} value={i.id}>{i.label}</option>
        ))}
      </select>
    </header>
  );
};
