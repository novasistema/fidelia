// Estado global de Fidelia: sesión, comercio actual y datos en tiempo real desde Firestore.
// Todas las acciones que cambian datos pasan por el servidor (/api/fidelia).
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db, completeEmailLinkLogin, logout as fbLogout } from '../lib/firebase';
import { callApi, errMsg } from '../lib/api';
import { parseRoute, Route, storeUrl } from '../lib/route';
import fideliaLogoImg from '../assets/images/fidelia_system_logo_1786191017639.jpg';
import {
  CustomerUser,
  StoreSettings,
  Branch,
  RewardItem,
  RedemptionVoucher,
  PointMovement,
  PopupBanner,
  BonusRule,
  Survey,
  Raffle,
  TierLevel,
  StaffMember,
  StaffStore
} from '../types';

export const DEFAULT_TIERS: TierLevel[] = [
  { id: 'bronce', name: 'Bronce', minPoints: 0, color: 'from-amber-700 to-amber-900', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', multiplier: 1.0, perks: ['Acceso al catálogo de premios'] },
  { id: 'plata', name: 'Plata', minPoints: 1000, color: 'from-slate-400 to-slate-600', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', multiplier: 1.2, perks: ['20% más puntos por compra'] },
  { id: 'oro', name: 'Oro', minPoints: 3000, color: 'from-amber-400 to-yellow-600', badgeBg: 'bg-amber-50 text-amber-900 border-amber-400 font-bold', multiplier: 1.5, perks: ['50% más puntos por compra'] },
  { id: 'diamante', name: 'Diamante', minPoints: 10000, color: 'from-cyan-400 to-blue-600', badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-400 font-black', multiplier: 2.0, perks: ['Puntos dobles en cada compra'] }
];

const EMPTY_POPUP: PopupBanner = { id: 'pop', title: '', description: '', imageUrl: '', ctaText: '', ctaAction: 'catalog', isActive: false, showOncePerSession: true };

const PLATFORM_SETTINGS: StoreSettings = {
  name: 'FIDELIA',
  brandName: 'FIDELIA',
  logoUrl: fideliaLogoImg,
  primaryColor: '#0284c7',
  pointsPerPeso: 0.01,
  currencySymbol: '$',
  isSystemActive: true,
  poweredByText: 'FIDELIA'
};

export interface StoreSummary extends StoreSettings {
  id: string;
}

type Result = { success: boolean; message: string };

interface LoyaltyContextType {
  route: Route;
  authUser: User | null;
  authReady: boolean;
  emailLinkNeedsEmail: boolean;
  setEmailLinkNeedsEmail: (v: boolean) => void;
  logout: () => Promise<void>;

  // Rol según la ruta: clientes (/c/...), comercio (/admin), creador (/creador)
  currentRole: 'client' | 'admin' | 'creator';
  isPlatformAdmin: boolean;
  staffStores: StaffStore[];
  staffRole: 'owner' | 'cashier' | null;
  meLoaded: boolean;
  refreshMe: () => Promise<void>;
  isDemoAccount: boolean;
  resetDemo: () => Promise<void>;

  storeId: string | null;
  setStoreId: (id: string | null) => void;
  storeLoaded: boolean;
  storeExists: boolean;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;

  branches: Branch[];
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, branch: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  currentCustomer: CustomerUser | null;
  customerLoaded: boolean;
  registerCustomer: (data: { name: string; lastName: string; dni: string; phone?: string; birthDate?: string; gender?: string; referralCode?: string }) => Promise<CustomerUser>;

  customers: CustomerUser[];
  adjustCustomerPoints: (customerId: string, pointsDelta: number, description: string) => Promise<void>;

  rewards: RewardItem[];
  addReward: (reward: Omit<RewardItem, 'id'>) => Promise<void>;
  updateReward: (id: string, reward: Partial<RewardItem>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;

  vouchers: RedemptionVoucher[];
  redeemReward: (rewardId: string) => Promise<Result & { voucher?: RedemptionVoucher }>;
  validateVoucher: (code: string) => Promise<Result & { voucher?: RedemptionVoucher }>;
  cancelVoucher: (voucherId: string) => Promise<Result>;

  movements: PointMovement[];
  addPointsToCustomer: (customerId: string, amountPeso: number, manualPoints?: number, note?: string) => Promise<PointMovement>;

  popupBanner: PopupBanner;
  updatePopupBanner: (popup: Partial<PopupBanner>) => Promise<void>;

  bonusRules: BonusRule[];
  addBonusRule: (rule: Omit<BonusRule, 'id'>) => Promise<void>;
  toggleBonusRule: (id: string) => Promise<void>;
  deleteBonusRule: (id: string) => Promise<void>;

  surveys: Survey[];
  createSurvey: (survey: Omit<Survey, 'id' | 'completedCustomerIds'>) => Promise<void>;
  toggleSurvey: (id: string, isActive: boolean) => Promise<void>;
  completeSurvey: (surveyId: string, answers: Record<string, string>) => Promise<Result>;

  raffles: Raffle[];
  createRaffle: (raffle: Omit<Raffle, 'id' | 'participants'>) => Promise<void>;
  enterRaffle: (raffleId: string, entries?: number) => Promise<Result>;
  drawRaffleWinner: (raffleId: string) => Promise<{ success: boolean; winnerName?: string; message?: string }>;

  tiers: TierLevel[];
  saveTiers: (tiers: TierLevel[]) => Promise<void>;
  tierOf: (customer: CustomerUser | null) => TierLevel;

  staff: StaffMember[];
  addStaff: (email: string, role: 'owner' | 'cashier', name?: string) => Promise<void>;
  removeStaff: (email: string) => Promise<void>;

  generateQRPointLink: (points: number, description: string, hoursValid?: number) => Promise<string>;
  claimQRPointLink: (code: string) => Promise<Result & { points?: number }>;

  // Creador de la plataforma
  allStores: StoreSummary[];
  createStore: (data: { storeId: string; name: string; ownerEmail: string; ownerName?: string; planId?: string; monthlyFee?: number; subscriptionDueDate?: string }) => Promise<void>;
  updateSubscription: (storeId: string, data: { isSystemActive?: boolean; suspensionReason?: string; subscriptionDueDate?: string; planId?: string; monthlyFee?: number }) => Promise<void>;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

const sortByDate = <T extends { createdAt?: string; createdAtIso?: string }>(list: T[]) =>
  [...list].sort((a, b) => String(b.createdAtIso || b.createdAt || '').localeCompare(String(a.createdAtIso || a.createdAt || '')));

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route] = useState<Route>(() => parseRoute());
  const currentRole: 'client' | 'admin' | 'creator' = route.kind === 'admin' ? 'admin' : route.kind === 'creator' ? 'creator' : 'client';

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emailLinkNeedsEmail, setEmailLinkNeedsEmail] = useState(false);

  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [staffStores, setStaffStores] = useState<StaffStore[]>([]);
  const [meLoaded, setMeLoaded] = useState(false);
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  const [storeId, setStoreIdState] = useState<string | null>(() => {
    if (route.kind === 'store') return route.storeId;
    if (route.kind === 'admin') return route.storeId || localStorage.getItem('fidelia_admin_store') || null;
    return null;
  });
  const [storeDoc, setStoreDoc] = useState<StoreSettings | null>(null);
  const [storeLoaded, setStoreLoaded] = useState(false);

  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null);
  const [customerLoaded, setCustomerLoaded] = useState(false);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [movements, setMovements] = useState<PointMovement[]>([]);
  const [vouchers, setVouchers] = useState<RedemptionVoucher[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allStores, setAllStores] = useState<StoreSummary[]>([]);

  // --- Sesión ---
  useEffect(() => {
    completeEmailLinkLogin()
      .then(r => r === 'need_email' && setEmailLinkNeedsEmail(true))
      .catch(e => console.warn('Email link:', e));
    return onAuthStateChanged(auth, u => {
      setAuthUser(u);
      setAuthReady(true);
    });
  }, []);

  const refreshMe = async () => {
    if (!auth.currentUser) {
      setIsPlatformAdmin(false);
      setStaffStores([]);
      setMeLoaded(true);
      return;
    }
    try {
      const r = await callApi<{ isPlatformAdmin: boolean; staffStores: StaffStore[]; isDemo?: boolean }>('me');
      setIsPlatformAdmin(r.isPlatformAdmin);
      setStaffStores(r.staffStores);
      setIsDemoAccount(!!r.isDemo);
    } catch (e) {
      console.warn('me:', e);
    } finally {
      setMeLoaded(true);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    setMeLoaded(false);
    if (currentRole === 'client') {
      setMeLoaded(true);
      return;
    }
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authReady]);

  // En el panel del comercio: elegir automáticamente el comercio si hay uno solo
  useEffect(() => {
    if (currentRole !== 'admin' || !meLoaded) return;
    if (isPlatformAdmin && storeId) return;
    const valid = staffStores.some(s => s.storeId === storeId);
    if (!valid) setStoreIdState(staffStores.length === 1 ? staffStores[0].storeId : null);
  }, [currentRole, meLoaded, staffStores, isPlatformAdmin, storeId]);

  const setStoreId = (id: string | null) => {
    setStoreIdState(id);
    if (id) localStorage.setItem('fidelia_admin_store', id);
    else localStorage.removeItem('fidelia_admin_store');
  };

  const staffRole: 'owner' | 'cashier' | null = isPlatformAdmin && storeId ? 'owner' : staffStores.find(s => s.storeId === storeId)?.role || null;
  const canManage = currentRole !== 'client' && !!staffRole;

  // --- Datos públicos del comercio ---
  useEffect(() => {
    setStoreDoc(null);
    setStoreLoaded(false);
    setRewards([]);
    if (!storeId) {
      setStoreLoaded(true);
      return;
    }
    const unsubStore = onSnapshot(
      doc(db, 'stores', storeId),
      s => {
        setStoreDoc(s.exists() ? ({ id: s.id, ...s.data() } as StoreSettings) : null);
        setStoreLoaded(true);
      },
      err => {
        console.warn('store:', err);
        setStoreLoaded(true);
      }
    );
    const unsubRewards = onSnapshot(collection(db, 'stores', storeId, 'rewards'), s => setRewards(s.docs.map(d => ({ ...(d.data() as RewardItem), id: d.id }))), err => console.warn('rewards:', err));
    return () => {
      unsubStore();
      unsubRewards();
    };
  }, [storeId]);

  // --- Datos con sesión: encuestas, sorteos y lo propio del cliente ---
  useEffect(() => {
    setSurveys([]);
    setRaffles([]);
    setCurrentCustomer(null);
    setCustomerLoaded(false);
    if (!storeId || !authUser) {
      setCustomerLoaded(true);
      return;
    }
    const unsubs = [
      onSnapshot(collection(db, 'stores', storeId, 'surveys'), s => setSurveys(s.docs.map(d => ({ ...(d.data() as Survey), id: d.id }))), err => console.warn('surveys:', err)),
      onSnapshot(collection(db, 'stores', storeId, 'raffles'), s => setRaffles(s.docs.map(d => ({ ...(d.data() as Raffle), id: d.id }))), err => console.warn('raffles:', err))
    ];
    if (currentRole === 'client') {
      unsubs.push(
        onSnapshot(
          doc(db, 'stores', storeId, 'customers', authUser.uid),
          s => {
            setCurrentCustomer(s.exists() ? ({ ...(s.data() as CustomerUser), id: s.id }) : null);
            setCustomerLoaded(true);
          },
          err => {
            console.warn('customer:', err);
            setCustomerLoaded(true);
          }
        ),
        onSnapshot(query(collection(db, 'stores', storeId, 'movements'), where('customerId', '==', authUser.uid)), s => setMovements(sortByDate(s.docs.map(d => d.data() as PointMovement))), err => console.warn('movements:', err)),
        onSnapshot(query(collection(db, 'stores', storeId, 'vouchers'), where('customerId', '==', authUser.uid)), s => setVouchers(sortByDate(s.docs.map(d => d.data() as RedemptionVoucher))), err => console.warn('vouchers:', err))
      );
    } else {
      setCustomerLoaded(true);
    }
    return () => unsubs.forEach(u => u());
  }, [storeId, authUser, currentRole]);

  // --- Datos del equipo del comercio ---
  useEffect(() => {
    setCustomers([]);
    setStaff([]);
    if (currentRole === 'client') return;
    if (!storeId || !authUser || !canManage) {
      setMovements([]);
      setVouchers([]);
      return;
    }
    const unsubs = [
      onSnapshot(collection(db, 'stores', storeId, 'customers'), s => setCustomers(s.docs.map(d => ({ ...(d.data() as CustomerUser), id: d.id }))), err => console.warn('customers:', err)),
      onSnapshot(query(collection(db, 'stores', storeId, 'movements'), orderBy('createdAt', 'desc'), limit(1000)), s => setMovements(s.docs.map(d => d.data() as PointMovement)), err => console.warn('movements:', err)),
      onSnapshot(query(collection(db, 'stores', storeId, 'vouchers'), orderBy('createdAtIso', 'desc'), limit(1000)), s => setVouchers(s.docs.map(d => d.data() as RedemptionVoucher)), err => console.warn('vouchers:', err)),
      onSnapshot(collection(db, 'stores', storeId, 'staff'), s => setStaff(s.docs.map(d => d.data() as StaffMember)), err => console.warn('staff:', err))
    ];
    return () => unsubs.forEach(u => u());
  }, [storeId, authUser, currentRole, canManage]);

  // --- Creador: listado de comercios ---
  useEffect(() => {
    setAllStores([]);
    if (currentRole !== 'creator' || !isPlatformAdmin) return;
    return onSnapshot(collection(db, 'stores'), s => setAllStores(s.docs.map(d => ({ ...(d.data() as StoreSettings), id: d.id }))), err => console.warn('stores:', err));
  }, [currentRole, isPlatformAdmin]);

  // --- Valores derivados ---
  const storeSettings: StoreSettings = useMemo(() => {
    if (!storeDoc) return PLATFORM_SETTINGS;
    return { ...PLATFORM_SETTINGS, ...storeDoc, logoUrl: storeDoc.logoUrl || '', brandName: storeDoc.brandName || storeDoc.name };
  }, [storeDoc]);
  const tiers = useMemo(() => [...(storeDoc?.tiers?.length ? storeDoc.tiers : DEFAULT_TIERS)].sort((a, b) => a.minPoints - b.minPoints), [storeDoc]);
  const branches = storeDoc?.branches || [];
  const bonusRules = storeDoc?.bonusRules || [];
  const popupBanner = storeDoc?.popupBanner || EMPTY_POPUP;

  const tierOf = (c: CustomerUser | null) => {
    const earned = c?.totalEarned ?? c?.points ?? 0;
    let t = tiers[0];
    for (const x of tiers) if (earned >= x.minPoints) t = x;
    return tiers.find(x => x.id === c?.tierId && earned >= x.minPoints) || t;
  };

  const sid = () => {
    if (!storeId) throw new Error('No hay un comercio seleccionado.');
    return storeId;
  };
  const patchStore = (patch: Partial<StoreSettings>) => callApi('updateStore', { storeId: sid(), patch }).then(() => undefined);
  const asResult = async <T extends object>(p: Promise<T & { message?: string }>): Promise<Result & T> => {
    try {
      const r = await p;
      return { success: true, message: r.message || 'Listo', ...r };
    } catch (e) {
      return { success: false, message: errMsg(e) } as Result & T;
    }
  };

  const value: LoyaltyContextType = {
    route,
    authUser,
    authReady,
    emailLinkNeedsEmail,
    setEmailLinkNeedsEmail,
    logout: async () => {
      await fbLogout();
      setIsPlatformAdmin(false);
      setStaffStores([]);
      setIsDemoAccount(false);
    },
    currentRole,
    isPlatformAdmin,
    staffStores,
    staffRole,
    meLoaded,
    refreshMe,
    isDemoAccount,
    resetDemo: () => callApi('resetDemo').then(() => undefined),

    storeId,
    setStoreId,
    storeLoaded,
    storeExists: !!storeDoc,
    storeSettings,
    updateStoreSettings: patchStore,

    branches,
    addBranch: b => patchStore({ branches: [...branches, { ...b, id: `b_${Date.now()}` }] }),
    updateBranch: (id, b) => patchStore({ branches: branches.map(x => (x.id === id ? { ...x, ...b } : x)) }),
    deleteBranch: id => patchStore({ branches: branches.filter(x => x.id !== id) }),

    currentCustomer,
    customerLoaded,
    registerCustomer: async data => (await callApi<{ customer: CustomerUser }>('registerCustomer', { storeId: sid(), ...data })).customer,

    customers,
    adjustCustomerPoints: (customerId, delta, note) => callApi('adjustPoints', { storeId: sid(), customerId, delta, note }).then(() => undefined),

    rewards,
    addReward: r => callApi('saveReward', { storeId: sid(), reward: r }).then(() => undefined),
    updateReward: (id, r) => {
      const prev = rewards.find(x => x.id === id);
      return callApi('saveReward', { storeId: sid(), reward: { ...prev, ...r, id } }).then(() => undefined);
    },
    deleteReward: id => callApi('deleteReward', { storeId: sid(), id }).then(() => undefined),

    vouchers,
    redeemReward: rewardId => asResult(callApi<{ voucher: RedemptionVoucher }>('redeem', { storeId: sid(), rewardId })),
    validateVoucher: async code => {
      try {
        const r = await callApi<{ success: boolean; message: string; voucher?: RedemptionVoucher }>('validateVoucher', { storeId: sid(), code });
        return { success: r.success, message: r.message, voucher: r.voucher };
      } catch (e) {
        return { success: false, message: errMsg(e) };
      }
    },
    cancelVoucher: voucherId => asResult(callApi('cancelVoucher', { storeId: sid(), voucherId })),

    movements,
    addPointsToCustomer: async (customerId, amountPeso, manualPoints, note) =>
      (await callApi<{ movement: PointMovement }>('addPurchase', { storeId: sid(), customerId, amount: amountPeso, manualPoints, note })).movement,

    popupBanner,
    updatePopupBanner: p => patchStore({ popupBanner: { ...popupBanner, ...p } }),

    bonusRules,
    addBonusRule: r => patchStore({ bonusRules: [...bonusRules, { ...r, id: `br_${Date.now()}` }] }),
    toggleBonusRule: id => patchStore({ bonusRules: bonusRules.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r)) }),
    deleteBonusRule: id => patchStore({ bonusRules: bonusRules.filter(r => r.id !== id) }),

    surveys,
    createSurvey: s => callApi('saveSurvey', { storeId: sid(), survey: s }).then(() => undefined),
    toggleSurvey: (id, isActive) => callApi('saveSurvey', { storeId: sid(), survey: { id, isActive } }).then(() => undefined),
    completeSurvey: (surveyId, answers) => asResult(callApi('completeSurvey', { storeId: sid(), surveyId, answers })),

    raffles,
    createRaffle: r => callApi('saveRaffle', { storeId: sid(), raffle: r }).then(() => undefined),
    enterRaffle: (raffleId, entries = 1) => asResult(callApi('enterRaffle', { storeId: sid(), raffleId, entries })),
    drawRaffleWinner: async raffleId => {
      try {
        const r = await callApi<{ winnerName: string }>('drawRaffle', { storeId: sid(), raffleId });
        return { success: true, winnerName: r.winnerName };
      } catch (e) {
        return { success: false, message: errMsg(e) };
      }
    },

    tiers,
    saveTiers: t => patchStore({ tiers: t }),
    tierOf,

    staff,
    addStaff: (email, role, name) => callApi('addStaff', { storeId: sid(), email, role, name }).then(() => undefined),
    removeStaff: email => callApi('removeStaff', { storeId: sid(), email }).then(() => undefined),

    generateQRPointLink: async (points, description, hoursValid = 24) => {
      const r = await callApi<{ code: string }>('createQr', { storeId: sid(), points, description, hoursValid });
      return `${storeUrl(sid())}?qr=${r.code}`;
    },
    claimQRPointLink: code => asResult(callApi<{ points: number }>('claimQr', { storeId: sid(), code })),

    allStores,
    createStore: data => callApi('createStore', data).then(() => undefined),
    updateSubscription: (id, data) => callApi('updateSubscription', { storeId: id, ...data }).then(() => undefined)
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) throw new Error('useLoyalty must be used within a LoyaltyProvider');
  return context;
};
