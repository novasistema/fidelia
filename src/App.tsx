import React, { useEffect, useState } from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import { LinkQRShareModal } from './components/common/LinkQRShareModal';
import { SystemSuspendedScreen } from './components/common/SystemSuspendedScreen';
import { CreatorDashboard } from './components/creator/CreatorDashboard';
import { AuthPanel } from './components/common/AuthPanel';
import { FideliaLogo } from './components/common/FideliaLogo';
import { queryParam, removeQueryParam } from './lib/route';

// Client Components
import { ClientWelcomeModal } from './components/client/ClientWelcomeModal';
import { ClientLogin } from './components/client/ClientLogin';
import { ClientHeader } from './components/client/ClientHeader';
import { ClientSidebar } from './components/client/ClientSidebar';
import { PromoModal } from './components/client/PromoModal';
import { CatalogView } from './components/client/CatalogView';
import { MyRedemptionsView } from './components/client/MyRedemptionsView';
import { MovementsView } from './components/client/MovementsView';
import { BranchesView } from './components/client/BranchesView';
import { ReferralsView } from './components/client/ReferralsView';
import { SurveysView } from './components/client/SurveysView';
import { RafflesView } from './components/client/RafflesView';

// Admin Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPointsManager } from './components/admin/AdminPointsManager';
import { AdminPopupManager } from './components/admin/AdminPopupManager';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminCatalog } from './components/admin/AdminCatalog';
import { AdminBonuses } from './components/admin/AdminBonuses';
import { AdminSurveys } from './components/admin/AdminSurveys';
import { AdminRaffles } from './components/admin/AdminRaffles';
import { AdminTiers } from './components/admin/AdminTiers';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminTeam } from './components/admin/AdminTeam';
import { CheckCircle2, AlertTriangle, X, Store, LogOut, Shield, Gift, Users, QrCode } from 'lucide-react';

const Loading: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const CenteredCard: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-5">{children}</div>
  </div>
);

// ---------- Presentación (/) ----------
const Landing: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col">
    <header className="p-5 flex items-center justify-between max-w-5xl w-full mx-auto">
      <FideliaLogo size="sm" variant="horizontal" darkBackground />
      <a href="/admin" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold">Ingresar comercio</a>
    </header>
    <main className="flex-1 flex items-center">
      <div className="max-w-5xl mx-auto px-5 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">Tus clientes vuelven cuando suman puntos.</h1>
          <p className="text-slate-300">
            Fidelia es el club de puntos de tu comercio: tus clientes se registran con el celular, suman en cada compra y canjean premios. Vos lo manejás desde la caja.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/admin" className="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl">Entrar a mi panel</a>
            <a href="/admin?demo=1" className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/20">Probar la demo</a>
          </div>
          <p className="text-xs text-slate-400">Demo: usuario <strong className="text-slate-200">demo</strong> · contraseña <strong className="text-slate-200">demo</strong></p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            [QrCode, 'Registro por QR', 'Pegás un QR en el mostrador y listo.'],
            [Gift, 'Premios y canjes', 'Catálogo propio, cupones y sorteos.'],
            [Users, 'Niveles y referidos', 'Premiá a los que más vuelven.'],
            [Shield, 'Seguro', 'Cada cajero con su usuario.']
          ].map(([Icon, t, d]: any) => (
            <div key={t} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Icon className="w-6 h-6 text-sky-400 mb-2" />
              <div className="font-bold text-sm">{t}</div>
              <div className="text-xs text-slate-400">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

// ---------- App de clientes (/c/<comercio>) ----------
const ClientApp: React.FC = () => {
  const { storeLoaded, storeExists, storeSettings, authReady, authUser, currentCustomer, customerLoaded, claimQRPointLink } = useLoyalty();
  const [clientView, setClientView] = useState('catalog');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !queryParam('qr') && !sessionStorage.getItem('fidelia_welcome_seen'));
  const [qrResult, setQrResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [qrClaiming, setQrClaiming] = useState(false);

  // Si se abrió con ?qr=CODIGO, se reclaman los puntos apenas el cliente está registrado
  useEffect(() => {
    const code = queryParam('qr');
    if (!code || !currentCustomer || qrClaiming) return;
    setQrClaiming(true);
    claimQRPointLink(code).then(r => {
      setQrResult({ ok: r.success, text: r.message });
      removeQueryParam('qr');
      setQrClaiming(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCustomer?.id]);

  useEffect(() => {
    if (storeSettings.primaryColor) document.documentElement.style.setProperty('--brand', storeSettings.primaryColor);
    if (storeExists) document.title = `${storeSettings.name} · Club de puntos`;
  }, [storeSettings.primaryColor, storeSettings.name, storeExists]);

  if (!storeLoaded || !authReady) return <Loading />;
  if (!storeExists)
    return (
      <CenteredCard>
        <Store className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="text-center font-black text-slate-800 text-lg">Comercio no encontrado</h1>
        <p className="text-center text-sm text-slate-500">Revisá el link o pedile uno nuevo al comercio.</p>
      </CenteredCard>
    );
  if (storeSettings.isSystemActive === false) return <SystemSuspendedScreen />;

  if (showWelcome && !authUser) {
    return (
      <div className="min-h-screen bg-slate-900/90">
        <ClientWelcomeModal
          onEnterClientPortal={() => {
            sessionStorage.setItem('fidelia_welcome_seen', '1');
            setShowWelcome(false);
          }}
        />
      </div>
    );
  }

  if (!authUser || (customerLoaded && !currentCustomer)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        {queryParam('qr') && (
          <div className="max-w-md mx-auto mt-4 px-4 w-full">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold text-center">
              Ingresá o registrate para sumar los puntos de tu código QR.
            </div>
          </div>
        )}
        <main className="flex-1 flex items-center justify-center p-4">
          <ClientLogin />
        </main>
      </div>
    );
  }

  if (!customerLoaded || !currentCustomer) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-800">
      <PromoModal onNavigateToSection={section => setClientView(section)} />

      <div className="flex-1 flex flex-col md:flex-row">
        <ClientSidebar activeView={clientView} setActiveView={setClientView} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <ClientHeader onOpenSidebar={() => setSidebarOpen(true)} />

          {qrResult && (
            <div className={`mx-4 mt-4 p-3 rounded-xl border text-sm font-semibold flex items-center justify-between gap-2 ${qrResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <span className="flex items-center gap-2">
                {qrResult.ok ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {qrResult.text}
              </span>
              <button onClick={() => setQrResult(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {clientView === 'catalog' && <CatalogView onNavigateToSection={setClientView} />}
            {clientView === 'redemptions' && <MyRedemptionsView />}
            {clientView === 'movements' && <MovementsView />}
            {clientView === 'branches' && <BranchesView />}
            {clientView === 'referrals' && <ReferralsView />}
            {clientView === 'surveys' && <SurveysView />}
            {clientView === 'raffles' && <RafflesView />}
          </main>
        </div>
      </div>
    </div>
  );
};

// ---------- Panel del comercio (/admin) ----------
const AdminApp: React.FC = () => {
  const { authReady, authUser, meLoaded, staffStores, isPlatformAdmin, storeId, setStoreId, storeLoaded, storeExists, storeSettings, staffRole, logout, isDemoAccount, resetDemo } = useLoyalty();
  const [resetting, setResetting] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    // Si un cajero tenía abierta una pantalla de dueño, vuelve al inicio
    if (staffRole === 'cashier' && !['dashboard', 'points', 'customers'].includes(adminView)) setAdminView('dashboard');
  }, [staffRole, adminView]);

  if (!authReady) return <Loading />;
  if (!authUser)
    return (
      <CenteredCard>
        <div className="flex justify-center"><FideliaLogo size="md" variant="horizontal" /></div>
        <AuthPanel title="Panel del comercio" subtitle="Entrá con el email que te habilitaron como dueño o cajero." allowUserPassword />
      </CenteredCard>
    );
  if (!meLoaded) return <Loading />;

  if (!staffStores.length && !(isPlatformAdmin && storeId)) {
    return (
      <CenteredCard>
        <Shield className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="text-center font-black text-slate-800 text-lg">Sin acceso a ningún comercio</h1>
        <p className="text-center text-sm text-slate-500">
          <strong>{authUser.email}</strong> no está habilitado como dueño ni cajero. Pedile al dueño del comercio que te agregue en “Equipo y Cajeros”.
        </p>
        <button onClick={() => logout()} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
          <LogOut className="w-4 h-4" /> Entrar con otro email
        </button>
      </CenteredCard>
    );
  }

  if (!storeId) {
    return (
      <CenteredCard>
        <h1 className="font-black text-slate-800 text-lg">Elegí el comercio</h1>
        <div className="space-y-2">
          {staffStores.map(s => (
            <button key={s.storeId} onClick={() => setStoreId(s.storeId)} className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-left">
              <div className="font-bold text-slate-800">{s.name}</div>
              <div className="text-xs text-slate-500">{s.role === 'owner' ? 'Dueño' : 'Cajero'}{!s.isSystemActive ? ' · Suspendido' : ''}</div>
            </button>
          ))}
        </div>
      </CenteredCard>
    );
  }

  if (!storeLoaded) return <Loading />;
  if (!storeExists)
    return (
      <CenteredCard>
        <h1 className="font-black text-slate-800 text-lg text-center">Comercio no encontrado</h1>
        <button onClick={() => setStoreId(null)} className="w-full py-2.5 bg-slate-100 rounded-xl text-sm font-bold">Volver</button>
      </CenteredCard>
    );
  if (storeSettings.isSystemActive === false && !isPlatformAdmin) return <SystemSuspendedScreen />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {storeSettings.isSystemActive === false && (
        <div className="bg-rose-600 text-white text-xs font-bold text-center py-1.5">Comercio suspendido · lo estás viendo como creador</div>
      )}
      {isDemoAccount && (
        <div className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>Estás en la DEMO de Fidelia · los datos son de ejemplo</span>
          <a href="/c/demo" target="_blank" rel="noopener noreferrer" className="underline">Ver app de clientes</a>
          <button
            disabled={resetting}
            onClick={async () => {
              if (!window.confirm('¿Volver la demo a los datos de ejemplo?')) return;
              setResetting(true);
              try {
                await resetDemo();
              } catch (e: any) {
                alert(e?.message || 'No se pudo restablecer.');
              } finally {
                setResetting(false);
              }
            }}
            className="underline disabled:opacity-50"
          >
            {resetting ? 'Restableciendo...' : 'Restablecer datos'}
          </button>
          <button onClick={() => logout()} className="underline">Salir</button>
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar activeView={adminView} setActiveView={setAdminView} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader onOpenQRModal={() => setIsQrModalOpen(true)} activeView={adminView} setActiveView={setAdminView} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'points' && <AdminPointsManager />}
            {adminView === 'popup' && <AdminPopupManager />}
            {adminView === 'customers' && <AdminCustomers />}
            {adminView === 'catalog' && <AdminCatalog />}
            {adminView === 'bonuses' && <AdminBonuses />}
            {adminView === 'surveys' && <AdminSurveys />}
            {adminView === 'raffles' && <AdminRaffles />}
            {adminView === 'tiers' && <AdminTiers />}
            {adminView === 'team' && <AdminTeam />}
            {adminView === 'settings' && <AdminSettings />}
          </main>
        </div>
      </div>

      {isQrModalOpen && <LinkQRShareModal onClose={() => setIsQrModalOpen(false)} />}
    </div>
  );
};

// ---------- Panel del creador (/creador) ----------
const CreatorApp: React.FC = () => {
  const { authReady, authUser, meLoaded, isPlatformAdmin, logout } = useLoyalty();
  if (!authReady) return <Loading dark />;
  if (!authUser)
    return (
      <CenteredCard dark>
        <div className="flex justify-center"><FideliaLogo size="md" variant="horizontal" /></div>
        <AuthPanel title="Panel del creador" />
      </CenteredCard>
    );
  if (!meLoaded) return <Loading dark />;
  if (!isPlatformAdmin)
    return (
      <CenteredCard dark>
        <h1 className="font-black text-slate-800 text-lg text-center">Acceso restringido</h1>
        <p className="text-sm text-slate-500 text-center">
          {authUser.email} no es creador de la plataforma. Para habilitarte, creá en Firestore el documento <code className="text-xs">platformAdmins/{authUser.uid}</code>.
        </p>
        <button onClick={() => logout()} className="w-full py-2.5 bg-slate-100 rounded-xl text-sm font-bold">Salir</button>
      </CenteredCard>
    );
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <CreatorDashboard />
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { route } = useLoyalty();
  if (route.kind === 'store') return <ClientApp />;
  if (route.kind === 'admin') return <AdminApp />;
  if (route.kind === 'creator') return <CreatorApp />;
  return <Landing />;
};

export default function App() {
  return (
    <LoyaltyProvider>
      <MainAppContent />
    </LoyaltyProvider>
  );
}
