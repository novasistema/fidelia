import React, { useState } from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import { TopBarSwitcher } from './components/common/TopBarSwitcher';
import { LinkQRShareModal } from './components/common/LinkQRShareModal';
import { SystemSuspendedScreen } from './components/common/SystemSuspendedScreen';
import { CreatorDashboard } from './components/creator/CreatorDashboard';

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

const MainAppContent: React.FC = () => {
  const { currentRole, currentCustomer, storeSettings } = useLoyalty();

  // Active view states
  const [clientView, setClientView] = useState('catalog');
  const [adminView, setAdminView] = useState('dashboard');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // 1. SYSTEM SUSPENDED CHECK (FOR NON-CREATOR ROLES)
  if (storeSettings.isSystemActive === false && currentRole !== 'creator') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <TopBarSwitcher />
        <SystemSuspendedScreen />
      </div>
    );
  }

  // 2. CREATOR ROLE LAYOUT (100% CONTROL PANEL)
  if (currentRole === 'creator') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <TopBarSwitcher />
        <main className="flex-1">
          <CreatorDashboard />
        </main>
      </div>
    );
  }

  // If Client role and Welcome modal is open
  if (currentRole === 'client' && showWelcomeModal) {
    return (
      <div className="min-h-screen bg-slate-900/90 flex flex-col justify-between">
        <TopBarSwitcher onOpenQRModal={() => setIsQrModalOpen(true)} />
        <PromoModal onNavigateToSection={(section) => { setShowWelcomeModal(false); setClientView(section); }} />
        <ClientWelcomeModal
          onEnterClientPortal={() => setShowWelcomeModal(false)}
        />
        {isQrModalOpen && <LinkQRShareModal onClose={() => setIsQrModalOpen(false)} />}
      </div>
    );
  }

  // If Client role and NOT logged in, show registration/login screen
  if (currentRole === 'client' && !currentCustomer) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <TopBarSwitcher onOpenQRModal={() => setIsQrModalOpen(true)} />
        <PromoModal />
        <main className="flex-1 flex items-center justify-center p-4">
          <ClientLogin />
        </main>
        {isQrModalOpen && <LinkQRShareModal onClose={() => setIsQrModalOpen(false)} />}
      </div>
    );
  }

  // CLIENT ROLE LAYOUT
  if (currentRole === 'client') {
    return (
      <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-800">
        <TopBarSwitcher onOpenQRModal={() => setIsQrModalOpen(true)} />
        <PromoModal onNavigateToSection={(section) => setClientView(section)} />

        <div className="flex-1 flex flex-col md:flex-row">
          <ClientSidebar activeView={clientView} setActiveView={setClientView} />

          <div className="flex-1 flex flex-col min-w-0">
            <ClientHeader activeView={clientView} setActiveView={setClientView} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {clientView === 'catalog' && <CatalogView />}
              {clientView === 'redemptions' && <MyRedemptionsView />}
              {clientView === 'movements' && <MovementsView />}
              {clientView === 'branches' && <BranchesView />}
              {clientView === 'referrals' && <ReferralsView />}
              {clientView === 'surveys' && <SurveysView />}
              {clientView === 'raffles' && <RafflesView />}
            </main>
          </div>
        </div>

        {isQrModalOpen && <LinkQRShareModal onClose={() => setIsQrModalOpen(false)} />}
      </div>
    );
  }

  // ADMIN ROLE LAYOUT
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <TopBarSwitcher onOpenQRModal={() => setIsQrModalOpen(true)} />

      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar activeView={adminView} setActiveView={setAdminView} />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader onOpenQRModal={() => setIsQrModalOpen(true)} />

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
            {adminView === 'settings' && <AdminSettings />}
          </main>
        </div>
      </div>

      {isQrModalOpen && <LinkQRShareModal onClose={() => setIsQrModalOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <LoyaltyProvider>
      <MainAppContent />
    </LoyaltyProvider>
  );
}
