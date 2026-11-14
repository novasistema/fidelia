import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  BarChart3,
  Zap,
  Megaphone,
  Users,
  Gift,
  Sparkles,
  ClipboardList,
  Trophy,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  UserCog
} from 'lucide-react';

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
  const { storeId, staffRole, logout } = useLoyalty();
  const navItems = adminNavItems(staffRole);

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-2 text-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <BrandLogo size="sm" showTagline />
          <span className="inline-block mt-2 text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
            {staffRole === 'owner' ? 'Panel del Dueño' : 'Panel de Caja'}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        {storeId && (
          <a
            href={`/c/${storeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Ver App de Clientes</span>
          </a>
        )}
        <button
          onClick={() => logout()}
          className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-400 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export const adminNavItems = (role: 'owner' | 'cashier' | null) => {
  const all = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3 },
    { id: 'points', label: 'Sumar / Validar Puntos', icon: Zap },
    { id: 'popup', label: 'Pop-up Publicitario', icon: Megaphone },
    { id: 'customers', label: 'Clientes Registrados', icon: Users },
    { id: 'catalog', label: 'Catálogo de Premios', icon: Gift },
    { id: 'bonuses', label: 'Reglas & Bonificaciones', icon: Sparkles },
    { id: 'surveys', label: 'Encuestas', icon: ClipboardList },
    { id: 'raffles', label: 'Sorteos', icon: Trophy },
    { id: 'tiers', label: 'Niveles & Escalas', icon: Award },
    { id: 'team', label: 'Equipo y Cajeros', icon: UserCog },
    { id: 'settings', label: 'Configuración & QR', icon: Settings }
  ];
  const cashierViews = ['dashboard', 'points', 'customers'];
  return role === 'owner' ? all : all.filter(i => cashierViews.includes(i.id));
};
