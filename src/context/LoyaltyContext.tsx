import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
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
  TierLevel
} from '../types';

interface LoyaltyContextType {
  // Active state
  currentRole: 'client' | 'admin' | 'creator';
  setCurrentRole: (role: 'client' | 'admin' | 'creator') => void;
  currentCustomer: CustomerUser | null;
  setCurrentCustomer: (customer: CustomerUser | null) => void;
  
  // Storage items
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  
  branches: Branch[];
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;

  customers: CustomerUser[];
  loginCustomer: (emailOrDni: string) => CustomerUser | null;
  registerCustomer: (data: Omit<CustomerUser, 'id' | 'points' | 'totalSpent' | 'tierId' | 'createdAt' | 'referralCode'>) => CustomerUser;
  adjustCustomerPoints: (customerId: string, pointsDelta: number, description: string) => void;
  
  rewards: RewardItem[];
  addReward: (reward: Omit<RewardItem, 'id'>) => void;
  updateReward: (id: string, reward: Partial<RewardItem>) => void;
  deleteReward: (id: string) => void;
  
  vouchers: RedemptionVoucher[];
  redeemReward: (rewardId: string) => { success: boolean; message: string; voucher?: RedemptionVoucher };
  validateVoucher: (code: string) => { success: boolean; message: string; voucher?: RedemptionVoucher };
  
  movements: PointMovement[];
  addPointsToCustomer: (customerId: string, amountPeso: number, manualPoints?: number, note?: string) => PointMovement;
  
  popupBanner: PopupBanner;
  updatePopupBanner: (popup: Partial<PopupBanner>) => void;
  
  bonusRules: BonusRule[];
  addBonusRule: (rule: Omit<BonusRule, 'id'>) => void;
  toggleBonusRule: (id: string) => void;
  deleteBonusRule: (id: string) => void;
  
  surveys: Survey[];
  createSurvey: (survey: Omit<Survey, 'id' | 'completedCustomerIds'>) => void;
  completeSurvey: (surveyId: string, answers: Record<string, string>) => { success: boolean; message: string };
  
  raffles: Raffle[];
  createRaffle: (raffle: Omit<Raffle, 'id' | 'participants'>) => void;
  enterRaffle: (raffleId: string) => { success: boolean; message: string };
  drawRaffleWinner: (raffleId: string) => { success: boolean; winnerName?: string };
  
  tiers: TierLevel[];
  
  // Helpers
  generateQRPointLink: (points: number, description: string) => string;
  claimQRPointLink: (code: string) => { success: boolean; message: string; points?: number };
  
  // Quick Switcher / Simulator / Creator
  previewCustomerView: (customer: CustomerUser) => void;
  resetDemoData: () => void;
  wipeSystemDataToFactoryReset: () => void;
}

const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'FIDELIA - Tu App de Fidelización',
  brandName: 'FIDELIA',
  logoUrl: fideliaLogoImg,
  primaryColor: '#0284c7', // Sky Blue matching photos
  pointsPerPeso: 0.1, // $10 = 1 point
  welcomePoints: 100,
  currencySymbol: '$',
  whatsappNumber: '+5491112345678',
  contactEmail: 'soporte@fidelia.app',
  address: 'Av. Corrientes 1234, CABA',
  instagramUrl: 'https://instagram.com/fidelia.app',
  websiteUrl: 'https://fidelia.app',
  poweredByText: 'FIDELIA',
  poweredByUrl: 'https://fidelia.app',
  ownerPin: '1234',
  creatorPin: '0000',
  isSystemActive: true,
  suspensionReason: 'El servicio de Fidelia para este comercio se encuentra suspendido temporalmente por falta de pago de suscripción.',
  subscriptionDueDate: '2026-08-31',
  clientPlanName: 'Plan Fidelia Pro'
};

const INITIAL_TIERS: TierLevel[] = [
  {
    id: 'bronce',
    name: 'Bronce',
    minPoints: 0,
    color: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    multiplier: 1.0,
    perks: ['Acceso al catálogo estándar', 'Encuestas con premio']
  },
  {
    id: 'plata',
    name: 'Plata',
    minPoints: 1000,
    color: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    multiplier: 1.2,
    perks: ['20% más puntos por compra', 'Acceso a sorteos VIP']
  },
  {
    id: 'oro',
    name: 'Oro',
    minPoints: 3000,
    color: 'from-amber-400 to-yellow-600',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-400 font-bold',
    multiplier: 1.5,
    perks: ['50% más puntos por compra', 'Descuento exclusivo en canjes', 'Atención prioritaria']
  },
  {
    id: 'diamante',
    name: 'Diamante',
    minPoints: 10000,
    color: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-400 font-black',
    multiplier: 2.0,
    perks: ['100% más puntos (Doble)', 'Premios exclusivos Diamante', 'Regalo sorpresa de cumpleaños']
  }
];

const INITIAL_CUSTOMERS: CustomerUser[] = [
  {
    id: 'c1',
    name: 'Tomas',
    lastName: 'Prueba',
    email: 'comerciopruebatdp@gmail.com',
    dni: '38123456',
    phone: '+54 9 11 9876-5432',
    gender: 'Masculino',
    birthDate: '1992-05-14',
    points: 3111,
    totalSpent: 45000,
    tierId: 'oro',
    createdAt: '2025-01-10',
    referralCode: 'TOMAS3111',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c2',
    name: 'María',
    lastName: 'García',
    email: 'maria.garcia@gmail.com',
    dni: '35987654',
    phone: '+54 9 11 5555-1234',
    gender: 'Femenino',
    birthDate: '1989-11-20',
    points: 1450,
    totalSpent: 22000,
    tierId: 'plata',
    createdAt: '2025-02-01',
    referralCode: 'MARIA1450',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c3',
    name: 'Carlos',
    lastName: 'Gómez',
    email: 'carlos.gomez@gmail.com',
    dni: '40111222',
    phone: '+54 9 11 4444-9988',
    gender: 'Masculino',
    birthDate: '1997-03-08',
    points: 820,
    totalSpent: 12000,
    tierId: 'bronce',
    createdAt: '2025-02-15',
    referralCode: 'CARLOS820',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c4',
    name: 'Laura',
    lastName: 'Martínez',
    email: 'laura.martinez@gmail.com',
    dni: '32444555',
    phone: '+54 9 11 3333-7766',
    gender: 'Femenino',
    birthDate: '1985-08-30',
    points: 12400,
    totalSpent: 180000,
    tierId: 'diamante',
    createdAt: '2024-11-05',
    referralCode: 'LAURA12400',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: 'Botella de 1lt de cerveza',
    category: 'Gastronomía',
    description: 'Disfrutá de una cerveza fría de 1 litro a elección (Andes, Quilmes, Stella o Cerveza Artesanal IPA/Honey).',
    pointsCost: 10, // Matching photo 4!
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80',
    stock: 50,
    isActive: true,
    terms: 'Hasta 1 canje por cliente por semana. Exclusivo para mayores de 18 años.',
    originalPrice: 3500
  },
  {
    id: 'r2',
    title: 'Café + 2 medialunas',
    category: 'Gastronomía',
    description: 'Espresso o cortado caliente acompañado de dos crujientes medialunas de manteca recién horneadas.',
    pointsCost: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    stock: 100,
    isActive: true,
    terms: 'Válido en todas las sucursales de 8:00 a 12:00 hs.',
    originalPrice: 2800
  },
  {
    id: 'r3',
    title: '1 Porción de Tarta',
    category: 'Gastronomía',
    description: 'Porción individual a elección entre Lemon Pie, Chocotorta o Tarta de Frutillas.',
    pointsCost: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
    stock: 30,
    isActive: true,
    terms: 'Sujeto a disponibilidad del día en mostrador.',
    originalPrice: 2200
  },
  {
    id: 'r4',
    title: 'Cuenco de cerámica artesanal',
    category: 'Hogar',
    description: 'Hermoso cuenco de cerámica hecho a mano con terminación esmaltada.',
    pointsCost: 800,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    isActive: true,
    terms: 'Retiro exclusivo en sucursal central.',
    originalPrice: 4500
  },
  {
    id: 'r5',
    title: '1/2 Kilo de Helado',
    category: 'Gastronomía',
    description: 'Llevate medio kilo de helado artesanal con hasta 3 gustos a elección.',
    pointsCost: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    isActive: true,
    terms: 'Válido para consumo en local o take away.',
    originalPrice: 5000
  },
  {
    id: 'r6',
    title: '30% OFF en locales',
    category: 'Descuentos',
    description: 'Cupón de 30% de descuento en tu próxima compra total.',
    pointsCost: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    stock: 99,
    isActive: true,
    terms: 'Tope de reintegro $15.000. No acumulable con otras promociones.',
    originalPrice: 8000
  }
];

const INITIAL_POPUP_BANNER: PopupBanner = {
  id: 'pop1',
  title: '¡Sumanos puntos en cada compra!',
  description: '¡Hola! Recordá que presentando tu DNI o código QR acumulas puntos para canjear por cerveza, desayunos y descuentos exclusivos.',
  imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67d1656819?w=800&auto=format&fit=crop&q=80',
  ctaText: 'Ver premios disponibles',
  ctaAction: 'catalog',
  isActive: true,
  showOncePerSession: true
};

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Sucursal Central - Palermo',
    address: 'Av. Santa Fe 3200',
    city: 'Buenos Aires',
    phone: '+54 11 4800-1122',
    hours: 'Lunes a Sábados 8:00 a 20:00 hs',
    isMain: true
  },
  {
    id: 'b2',
    name: 'Sucursal Belgrano',
    address: 'Av. Cabildo 2100',
    city: 'Buenos Aires',
    phone: '+54 11 4788-3344',
    hours: 'Lunes a Domingos 9:00 a 21:00 hs'
  },
  {
    id: 'b3',
    name: 'Sucursal Recoleta',
    address: 'Vicente López 1850',
    city: 'Buenos Aires',
    phone: '+54 11 4812-5566',
    hours: 'Lunes a Sábados 9:00 a 20:00 hs'
  }
];

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<'client' | 'admin' | 'creator'>('client');
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('tdp_current_customer');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CUSTOMERS[0]; // Tomas Prueba as default
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('tdp_store_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl || parsed.logoUrl.includes('unsplash.com')) {
          parsed.logoUrl = fideliaLogoImg;
        }
        if (!parsed.brandName || parsed.brandName === 'TuMarca') {
          parsed.brandName = 'FIDELIA';
        }
        if (!parsed.name || parsed.name === 'Comercio Prueba') {
          parsed.name = 'FIDELIA - Tu App de Fidelización';
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_STORE_SETTINGS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('tdp_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [customers, setCustomers] = useState<CustomerUser[]>(() => {
    const saved = localStorage.getItem('tdp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const saved = localStorage.getItem('tdp_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [vouchers, setVouchers] = useState<RedemptionVoucher[]>(() => {
    const saved = localStorage.getItem('tdp_vouchers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'v1',
        code: 'CANJE-88291',
        customerId: 'c1',
        customerName: 'Tomas Prueba',
        rewardId: 'r2',
        rewardTitle: 'Café + 2 medialunas',
        pointsSpent: 2000,
        createdAt: '2025-02-10 10:30',
        status: 'pending'
      }
    ];
  });

  const [movements, setMovements] = useState<PointMovement[]>(() => {
    const saved = localStorage.getItem('tdp_movements');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm1',
        customerId: 'c1',
        customerName: 'Tomas Prueba',
        type: 'earned_purchase',
        points: 3111,
        description: 'Compra en Sucursal Central #10293',
        date: '2025-02-12 14:15',
        amountPeso: 31110
      },
      {
        id: 'm2',
        customerId: 'c1',
        customerName: 'Tomas Prueba',
        type: 'spent_redemption',
        points: -2000,
        description: 'Canje de premio: Café + 2 medialunas',
        date: '2025-02-10 10:30'
      }
    ];
  });

  const [popupBanner, setPopupBanner] = useState<PopupBanner>(() => {
    const saved = localStorage.getItem('tdp_popup_banner');
    return saved ? JSON.parse(saved) : INITIAL_POPUP_BANNER;
  });

  const [bonusRules, setBonusRules] = useState<BonusRule[]>(() => {
    const saved = localStorage.getItem('tdp_bonus_rules');
    return saved ? JSON.parse(saved) : [
      {
        id: 'br1',
        title: 'LUNES TE LLEVAS MÁS PUNTOS',
        description: 'Doble de puntos en compras realizadas los días lunes',
        multiplier: 2.0,
        extraPoints: 0,
        daysOfWeek: [1], // Monday
        isActive: true
      },
      {
        id: 'br2',
        title: 'HAPPY HOUR DE PUNTOS',
        description: '+100 puntos extra en compras superiores a $10.000',
        multiplier: 1.0,
        extraPoints: 100,
        daysOfWeek: [1, 2, 3, 4, 5],
        isActive: true,
        minPurchaseAmount: 10000
      }
    ];
  });

  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('tdp_surveys');
    return saved ? JSON.parse(saved) : [
      {
        id: 's1',
        title: '¿Cómo fue tu atención en el local?',
        description: 'Respondé 3 breves preguntas y sumá 200 puntos gratis.',
        rewardPoints: 200,
        isActive: true,
        completedCustomerIds: [],
        questions: [
          { id: 'q1', question: '¿Qué tan satisfecho quedaste con la atención?', type: 'rating' },
          { id: 'q2', question: '¿Cuál es tu producto favorito?', type: 'text' },
          { id: 'q3', question: '¿Nos recomendarías con tus amigos?', type: 'multiple_choice', options: ['Sí, totalmente', 'Probablemente', 'No creo'] }
        ]
      }
    ];
  });

  const [raffles, setRaffles] = useState<Raffle[]>(() => {
    const saved = localStorage.getItem('tdp_raffles');
    return saved ? JSON.parse(saved) : [
      {
        id: 'raf1',
        title: 'Sorteo "Brunch & Momentos" para 2 personas',
        description: 'Participá y ganá un brunch completo para dos personas con espumante, torta y café especial.',
        imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
        entryCostPoints: 100,
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        isActive: true,
        participants: [
          { customerId: 'c2', customerName: 'María García', entries: 2, date: '2025-02-05' }
        ]
      }
    ];
  });

  // Sync Firestore Cloud Database in Realtime
  useEffect(() => {
    let unsubscribeCustomers: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    try {
      // 1. Sync Customers
      unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudCustomers: CustomerUser[] = [];
          snapshot.forEach(docSnap => {
            cloudCustomers.push(docSnap.data() as CustomerUser);
          });
          setCustomers(cloudCustomers);
        } else {
          // Seed demo customers to Firestore if collection is empty
          INITIAL_CUSTOMERS.forEach(c => {
            setDoc(doc(db, 'customers', c.id), c).catch(() => {});
          });
        }
      }, (err) => console.warn('Firestore customers sync:', err));

      // 2. Sync Store Settings
      unsubscribeSettings = onSnapshot(doc(db, 'storeSettings', 'main'), (docSnap) => {
        if (docSnap.exists()) {
          setStoreSettings(docSnap.data() as StoreSettings);
        } else {
          setDoc(doc(db, 'storeSettings', 'main'), INITIAL_STORE_SETTINGS).catch(() => {});
        }
      }, (err) => console.warn('Firestore settings sync:', err));
    } catch (e) {
      console.warn('Firebase connection note:', e);
    }

    return () => {
      if (unsubscribeCustomers) unsubscribeCustomers();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Save changes to localStorage as secondary cache
  useEffect(() => {
    localStorage.setItem('tdp_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('tdp_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('tdp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('tdp_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('tdp_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('tdp_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('tdp_popup_banner', JSON.stringify(popupBanner));
  }, [popupBanner]);

  useEffect(() => {
    localStorage.setItem('tdp_bonus_rules', JSON.stringify(bonusRules));
  }, [bonusRules]);

  useEffect(() => {
    localStorage.setItem('tdp_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('tdp_raffles', JSON.stringify(raffles));
  }, [raffles]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('tdp_current_customer', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('tdp_current_customer');
    }
  }, [currentCustomer]);

  // Actions implementation
  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const updated = { ...prev, ...newSettings };
      setDoc(doc(db, 'storeSettings', 'main'), updated).catch(() => {});
      return updated;
    });
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = { ...branchData, id: 'b_' + Date.now() };
    setBranches(prev => [...prev, newBranch]);
  };

  const updateBranch = (id: string, updated: Partial<Branch>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const loginCustomer = (emailOrDni: string) => {
    const normalized = emailOrDni.trim().toLowerCase();
    const found = customers.find(c => c.email.toLowerCase() === normalized || c.dni === normalized);
    if (found) {
      setCurrentCustomer(found);
      return found;
    }
    return null;
  };

  const registerCustomer = (data: Omit<CustomerUser, 'id' | 'points' | 'totalSpent' | 'tierId' | 'createdAt' | 'referralCode'>) => {
    const newCustomer: CustomerUser = {
      ...data,
      id: 'c_' + Date.now(),
      points: 100, // Welcome bonus points!
      totalSpent: 0,
      tierId: 'bronce',
      createdAt: new Date().toISOString().split('T')[0],
      referralCode: (data.name.slice(0, 3) + Math.floor(1000 + Math.random() * 9000)).toUpperCase(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name}`
    };

    // Welcome point movement
    const welcomeMov: PointMovement = {
      id: 'm_' + Date.now(),
      customerId: newCustomer.id,
      customerName: `${newCustomer.name} ${newCustomer.lastName}`,
      type: 'earned_bonus',
      points: 100,
      description: '¡Bono de bienvenida al registrarte!',
      date: new Date().toLocaleString()
    };

    setCustomers(prev => [...prev, newCustomer]);
    setMovements(prev => [welcomeMov, ...prev]);
    setCurrentCustomer(newCustomer);

    // Save to Firestore Cloud Database
    setDoc(doc(db, 'customers', newCustomer.id), newCustomer).catch(() => {});
    setDoc(doc(db, 'movements', welcomeMov.id), welcomeMov).catch(() => {});

    return newCustomer;
  };

  const adjustCustomerPoints = (customerId: string, pointsDelta: number, description: string) => {
    let updatedCustomerObj: CustomerUser | null = null;
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const newPoints = Math.max(0, c.points + pointsDelta);
        // Recalculate tier
        let newTier = c.tierId;
        if (newPoints >= 10000) newTier = 'diamante';
        else if (newPoints >= 3000) newTier = 'oro';
        else if (newPoints >= 1000) newTier = 'plata';
        else newTier = 'bronce';

        const updated = { ...c, points: newPoints, tierId: newTier };
        updatedCustomerObj = updated;
        if (currentCustomer?.id === customerId) {
          setCurrentCustomer(updated);
        }
        return updated;
      }
      return c;
    }));

    if (updatedCustomerObj) {
      setDoc(doc(db, 'customers', customerId), updatedCustomerObj).catch(() => {});
    }

    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      const mov: PointMovement = {
        id: 'm_' + Date.now(),
        customerId,
        customerName: `${cust.name} ${cust.lastName}`,
        type: 'admin_adjust',
        points: pointsDelta,
        description: description || 'Ajuste manual de puntos por administración',
        date: new Date().toLocaleString()
      };
      setMovements(prev => [mov, ...prev]);
    }
  };

  const addReward = (rewardData: Omit<RewardItem, 'id'>) => {
    const newReward: RewardItem = { ...rewardData, id: 'r_' + Date.now() };
    setRewards(prev => [newReward, ...prev]);
  };

  const updateReward = (id: string, updated: Partial<RewardItem>) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const redeemReward = (rewardId: string) => {
    if (!currentCustomer) {
      return { success: false, message: 'Debes iniciar sesión para canjear.' };
    }

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Premio no encontrado.' };
    }

    if (!reward.isActive) {
      return { success: false, message: 'Este premio no se encuentra activo.' };
    }

    if (reward.stock <= 0) {
      return { success: false, message: 'Sin stock disponible para este premio.' };
    }

    if (currentCustomer.points < reward.pointsCost) {
      return { success: false, message: `Te faltan ${reward.pointsCost - currentCustomer.points} puntos para canjear este premio.` };
    }

    // Deduct points from customer
    const updatedCustomer: CustomerUser = {
      ...currentCustomer,
      points: currentCustomer.points - reward.pointsCost
    };

    // Update customer in state
    setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? updatedCustomer : c));
    setCurrentCustomer(updatedCustomer);

    // Decrease reward stock
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, stock: r.stock - 1 } : r));

    // Create redemption voucher
    const code = 'CANJE-' + Math.floor(10000 + Math.random() * 90000);
    const voucher: RedemptionVoucher = {
      id: 'v_' + Date.now(),
      code,
      customerId: currentCustomer.id,
      customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      createdAt: new Date().toLocaleString(),
      status: 'pending'
    };

    setVouchers(prev => [voucher, ...prev]);

    // Add movement
    const mov: PointMovement = {
      id: 'm_' + Date.now(),
      customerId: currentCustomer.id,
      customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
      type: 'spent_redemption',
      points: -reward.pointsCost,
      description: `Canje de premio: ${reward.title}`,
      date: new Date().toLocaleString()
    };
    setMovements(prev => [mov, ...prev]);

    return { success: true, message: '¡Canje realizado con éxito!', voucher };
  };

  const validateVoucher = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const voucher = vouchers.find(v => v.code === cleanCode);

    if (!voucher) {
      return { success: false, message: 'Código de canje no encontrado.' };
    }

    if (voucher.status === 'used') {
      return { success: false, message: `Este canje ya fue utilizado el ${voucher.usedAt}.`, voucher };
    }

    if (voucher.status === 'cancelled') {
      return { success: false, message: 'Este cupón de canje fue cancelado.', voucher };
    }

    // Mark as used
    const nowStr = new Date().toLocaleString();
    const updatedVoucher: RedemptionVoucher = {
      ...voucher,
      status: 'used',
      usedAt: nowStr
    };

    setVouchers(prev => prev.map(v => v.id === voucher.id ? updatedVoucher : v));

    return { success: true, message: `¡Canje "${voucher.rewardTitle}" entregado y validado correctamente!`, voucher: updatedVoucher };
  };

  const addPointsToCustomer = (customerId: string, amountPeso: number, manualPoints?: number, note?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) throw new Error('Cliente no encontrado');

    let basePoints = manualPoints !== undefined && manualPoints > 0 
      ? manualPoints 
      : Math.floor(amountPeso * storeSettings.pointsPerPeso);

    if (basePoints <= 0) basePoints = 10; // minimum points

    // Check tier multiplier
    const custTier = INITIAL_TIERS.find(t => t.id === cust.tierId);
    const tierMultiplier = custTier?.multiplier || 1.0;

    // Check active bonus rules
    let bonusMultiplier = 1.0;
    let extraBonusPoints = 0;
    const currentDay = new Date().getDay();

    bonusRules.filter(r => r.isActive).forEach(rule => {
      if (rule.daysOfWeek.includes(currentDay)) {
        if (!rule.minPurchaseAmount || amountPeso >= rule.minPurchaseAmount) {
          bonusMultiplier *= rule.multiplier;
          extraBonusPoints += rule.extraPoints;
        }
      }
    });

    const calculatedPoints = Math.floor(basePoints * tierMultiplier * bonusMultiplier) + extraBonusPoints;

    const newPoints = cust.points + calculatedPoints;
    const newTotalSpent = cust.totalSpent + amountPeso;

    // Recalculate tier
    let newTier = cust.tierId;
    if (newPoints >= 10000) newTier = 'diamante';
    else if (newPoints >= 3000) newTier = 'oro';
    else if (newPoints >= 1000) newTier = 'plata';
    else newTier = 'bronce';

    const updatedCust: CustomerUser = {
      ...cust,
      points: newPoints,
      totalSpent: newTotalSpent,
      tierId: newTier
    };

    setCustomers(prev => prev.map(c => c.id === customerId ? updatedCust : c));
    if (currentCustomer?.id === customerId) {
      setCurrentCustomer(updatedCust);
    }

    const desc = note 
      ? `Compra $${amountPeso} - ${note}`
      : `Compra de $${amountPeso.toLocaleString()} en local`;

    const mov: PointMovement = {
      id: 'm_' + Date.now(),
      customerId,
      customerName: `${cust.name} ${cust.lastName}`,
      type: 'earned_purchase',
      points: calculatedPoints,
      description: desc,
      date: new Date().toLocaleString(),
      amountPeso
    };

    setMovements(prev => [mov, ...prev]);
    return mov;
  };

  const updatePopupBanner = (updated: Partial<PopupBanner>) => {
    setPopupBanner(prev => ({ ...prev, ...updated }));
  };

  const addBonusRule = (ruleData: Omit<BonusRule, 'id'>) => {
    const newRule: BonusRule = { ...ruleData, id: 'br_' + Date.now() };
    setBonusRules(prev => [...prev, newRule]);
  };

  const toggleBonusRule = (id: string) => {
    setBonusRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteBonusRule = (id: string) => {
    setBonusRules(prev => prev.filter(r => r.id !== id));
  };

  const createSurvey = (surveyData: Omit<Survey, 'id' | 'completedCustomerIds'>) => {
    const newSurvey: Survey = {
      ...surveyData,
      id: 's_' + Date.now(),
      completedCustomerIds: []
    };
    setSurveys(prev => [newSurvey, ...prev]);
  };

  const completeSurvey = (surveyId: string, answers: Record<string, string>) => {
    if (!currentCustomer) return { success: false, message: 'Debes iniciar sesión.' };

    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return { success: false, message: 'Encuesta no encontrada.' };

    if (survey.completedCustomerIds.includes(currentCustomer.id)) {
      return { success: false, message: 'Ya completaste esta encuesta anteriormente.' };
    }

    // Award survey points
    const updatedCustomer: CustomerUser = {
      ...currentCustomer,
      points: currentCustomer.points + survey.rewardPoints
    };

    setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? updatedCustomer : c));
    setCurrentCustomer(updatedCustomer);

    // Mark survey as completed
    setSurveys(prev => prev.map(s => s.id === surveyId ? {
      ...s,
      completedCustomerIds: [...s.completedCustomerIds, currentCustomer.id]
    } : s));

    // Movement
    const mov: PointMovement = {
      id: 'm_' + Date.now(),
      customerId: currentCustomer.id,
      customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
      type: 'earned_survey',
      points: survey.rewardPoints,
      description: `Completó encuesta: ${survey.title}`,
      date: new Date().toLocaleString()
    };
    setMovements(prev => [mov, ...prev]);

    return { success: true, message: `¡Gracias por tu respuesta! Sumaste ${survey.rewardPoints} puntos.` };
  };

  const createRaffle = (raffleData: Omit<Raffle, 'id' | 'participants'>) => {
    const newRaffle: Raffle = {
      ...raffleData,
      id: 'raf_' + Date.now(),
      participants: []
    };
    setRaffles(prev => [newRaffle, ...prev]);
  };

  const enterRaffle = (raffleId: string) => {
    if (!currentCustomer) return { success: false, message: 'Debes iniciar sesión.' };

    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle) return { success: false, message: 'Sorteo no encontrado.' };

    if (!raffle.isActive) return { success: false, message: 'Este sorteo ya finalizó.' };

    if (currentCustomer.points < raffle.entryCostPoints) {
      return { success: false, message: `Necesitás ${raffle.entryCostPoints} puntos para comprar una entrada.` };
    }

    // Deduct points
    const updatedCustomer: CustomerUser = {
      ...currentCustomer,
      points: currentCustomer.points - raffle.entryCostPoints
    };

    setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? updatedCustomer : c));
    setCurrentCustomer(updatedCustomer);

    // Add entry to raffle
    setRaffles(prev => prev.map(r => {
      if (r.id === raffleId) {
        const existing = r.participants.find(p => p.customerId === currentCustomer.id);
        let updatedParticipants = [...r.participants];
        if (existing) {
          updatedParticipants = updatedParticipants.map(p => p.customerId === currentCustomer.id ? { ...p, entries: p.entries + 1 } : p);
        } else {
          updatedParticipants.push({
            customerId: currentCustomer.id,
            customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
            entries: 1,
            date: new Date().toLocaleString()
          });
        }
        return { ...r, participants: updatedParticipants };
      }
      return r;
    }));

    // Movement
    const mov: PointMovement = {
      id: 'm_' + Date.now(),
      customerId: currentCustomer.id,
      customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
      type: 'spent_raffle',
      points: -raffle.entryCostPoints,
      description: `Entrada para sorteo: ${raffle.title}`,
      date: new Date().toLocaleString()
    };
    setMovements(prev => [mov, ...prev]);

    return { success: true, message: '¡Inscripción confirmada al sorteo!' };
  };

  const drawRaffleWinner = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle || raffle.participants.length === 0) {
      return { success: false };
    }

    // Random winner based on entries count
    const pool: { id: string; name: string }[] = [];
    raffle.participants.forEach(p => {
      for (let i = 0; i < p.entries; i++) {
        pool.push({ id: p.customerId, name: p.customerName });
      }
    });

    const winnerIndex = Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIndex];

    setRaffles(prev => prev.map(r => r.id === raffleId ? {
      ...r,
      isActive: false,
      winnerCustomerId: winner.id,
      winnerCustomerName: winner.name
    } : r));

    return { success: true, winnerName: winner.name };
  };

  const generateQRPointLink = (points: number, description: string) => {
    const payload = btoa(JSON.stringify({ points, description, timestamp: Date.now() }));
    return `${window.location.origin}/?claim_pts=${payload}`;
  };

  const claimQRPointLink = (payloadCode: string) => {
    if (!currentCustomer) return { success: false, message: 'Debes iniciar sesión para reclamar puntos.' };
    try {
      const decoded = JSON.parse(atob(payloadCode));
      const pts = Number(decoded.points) || 100;
      const desc = decoded.description || 'Puntos canjeados vía código QR';

      const updatedCust = { ...currentCustomer, points: currentCustomer.points + pts };
      setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? updatedCust : c));
      setCurrentCustomer(updatedCust);

      const mov: PointMovement = {
        id: 'm_' + Date.now(),
        customerId: currentCustomer.id,
        customerName: `${currentCustomer.name} ${currentCustomer.lastName}`,
        type: 'earned_bonus',
        points: pts,
        description: desc,
        date: new Date().toLocaleString()
      };
      setMovements(prev => [mov, ...prev]);

      return { success: true, message: `¡Has sumado ${pts} puntos exitosamente!`, points: pts };
    } catch (e) {
      return { success: false, message: 'Código QR o enlace inválido o caducado.' };
    }
  };

  const previewCustomerView = (cust: CustomerUser) => {
    setCurrentCustomer(cust);
    setCurrentRole('client');
  };

  const resetDemoData = () => {
    localStorage.clear();
    setStoreSettings(INITIAL_STORE_SETTINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setRewards(INITIAL_REWARDS);
    setBranches(INITIAL_BRANCHES);
    setPopupBanner(INITIAL_POPUP_BANNER);
    setCurrentCustomer(INITIAL_CUSTOMERS[0]);
  };

  const wipeSystemDataToFactoryReset = () => {
    localStorage.clear();
    setCustomers([]);
    setMovements([]);
    setVouchers([]);
    setRewards([]);
    setSurveys([]);
    setRaffles([]);
    setPopupBanner({
      id: 'pop_empty',
      title: '¡Bienvenidos a FIDELIA!',
      description: 'Comenzá a sumar puntos con tus compras.',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      ctaText: 'Ver Premios',
      ctaAction: 'catalog',
      isActive: true
    });
    setCurrentCustomer(null);
  };

  return (
    <LoyaltyContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentCustomer,
      setCurrentCustomer,
      storeSettings,
      updateStoreSettings,
      branches,
      addBranch,
      updateBranch,
      deleteBranch,
      customers,
      loginCustomer,
      registerCustomer,
      adjustCustomerPoints,
      rewards,
      addReward,
      updateReward,
      deleteReward,
      vouchers,
      redeemReward,
      validateVoucher,
      movements,
      addPointsToCustomer,
      popupBanner,
      updatePopupBanner,
      bonusRules,
      addBonusRule,
      toggleBonusRule,
      deleteBonusRule,
      surveys,
      createSurvey,
      completeSurvey,
      raffles,
      createRaffle,
      enterRaffle,
      drawRaffleWinner,
      tiers: INITIAL_TIERS,
      generateQRPointLink,
      claimQRPointLink,
      previewCustomerView,
      resetDemoData,
      wipeSystemDataToFactoryReset
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
