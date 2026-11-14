import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Home,
  Gift,
  History,
  MapPin,
  Phone,
  UserPlus,
  ClipboardList,
  Trophy,
  LogOut,
  Instagram,
  Globe,
  Sparkles
} from 'lucide-react';

interface ClientSidebarProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  activeView,
  setActiveView,
  activeSection,
  setActiveSection,
  isOpen = false,
  onClose = () => {}
}) => {
  const { currentCustomer, storeSettings, tierOf, logout } = useLoyalty();

  if (!currentCustomer) return null;

  const currentTier = tierOf(currentCustomer);
  const currentNav = activeView || activeSection || 'catalog';
  const handleSelectNav = setActiveView || setActiveSection || (() => {});

  const menuItems = [
    { id: 'catalog', label: 'Catálogo de Premios', icon: Home },
    { id: 'redemptions', label: 'Mis Canjes', icon: Gift },
    { id: 'movements', label: 'Historial de Puntos', icon: History },
    { id: 'branches', label: 'Sucursales', icon: MapPin },
    { id: 'referrals', label: 'Invitá a un Amigo', icon: UserPlus },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList },
    { id: 'raffles', label: 'Sorteos', icon: Trophy }
  ];

  const handleNavClick = (id: string) => {
    handleSelectNav(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-slate-200 w-72 flex-shrink-0 flex flex-col justify-between min-h-full ${
          isOpen ? 'fixed inset-y-0 left-0 z-40 shadow-2xl' : 'hidden md:flex'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex justify-start mb-4">
            <BrandLogo size="md" showTagline />
          </div>

          {/* Customer Profile Pill */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              {currentCustomer.name[0]}{currentCustomer.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {currentCustomer.name} {currentCustomer.lastName}
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentTier.badgeBg}`}>
                  Nivel {currentTier.name}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Customer button */}
          <button
            onClick={() => logout()}
            className="w-full mt-3 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-slate-500 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            {storeSettings.poweredByUrl ? (
              <a
                href={storeSettings.poweredByUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-600 transition underline decoration-dotted"
              >
                Powered by {storeSettings.poweredByText || storeSettings.brandName}
              </a>
            ) : (
              <span>Powered by {storeSettings.poweredByText || storeSettings.brandName}</span>
            )}

            <div className="flex items-center space-x-2">
              {storeSettings.instagramUrl && (
                <a
                  href={storeSettings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="text-slate-400 hover:text-pink-600 transition"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {storeSettings.websiteUrl && (
                <a
                  href={storeSettings.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Sitio Web"
                  className="text-slate-400 hover:text-sky-600 transition"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}

              {storeSettings.whatsappNumber && (
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                  className="text-slate-400 hover:text-emerald-600 transition"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
