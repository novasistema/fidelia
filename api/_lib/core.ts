// Núcleo de Fidelia: toda la lógica que mueve puntos, canjes y configuración.
// Corre SOLO en el servidor. Los navegadores nunca escriben directo en la base:
// así nadie puede regalarse puntos, saltear una suspensión o leer datos de otro.
import { randomInt } from 'crypto';
import { planOf, nextPlan, PLANS } from './plans.js';

// ---------- Acceso a datos (Firestore real o memoria para pruebas) ----------
export interface Tx {
  get(path: string): Promise<any | null>;
  query(col: string, field: string, value: any): Promise<{ id: string; data: any }[]>;
  set(path: string, data: any): void;
  update(path: string, data: any): void;
  delete(path: string): void;
}
export interface DB {
  run<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
const fail = (status: number, msg: string): never => {
  throw new ApiError(status, msg);
};

export interface Ctx {
  uid: string;
  email: string; // en minúsculas
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

// ---------- Utilidades ----------
const TZ = 'America/Argentina/Buenos_Aires';
export const nowIso = () => new Date().toISOString();
export const nowLabel = () =>
  new Intl.DateTimeFormat('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
const todayArg = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()); // AAAA-MM-DD
const weekdayArg = () => {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
};
const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para dictarlos sin errores
export const randCode = (n: number) => Array.from({ length: n }, () => ALNUM[randomInt(ALNUM.length)]).join('');
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${randCode(5).toLowerCase()}`;

const str = (v: any, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: any, min = 0, max = 1e12) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return Math.min(max, Math.max(min, n));
};
const int = (v: any, min = 0, max = 1e9) => {
  const n = num(v, min, max);
  return Number.isNaN(n) ? NaN : Math.floor(n);
};
const bool = (v: any) => v === true;
const nonEmpty = (v: string, msg: string) => (v ? v : fail(400, msg));

// ---------- Valores por defecto de un comercio nuevo ----------
export const DEFAULT_TIERS = [
  { id: 'bronce', name: 'Bronce', minPoints: 0, color: 'from-amber-700 to-amber-900', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', multiplier: 1.0, perks: ['Acceso al catálogo de premios', 'Encuestas con premio'] },
  { id: 'plata', name: 'Plata', minPoints: 1000, color: 'from-slate-400 to-slate-600', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', multiplier: 1.2, perks: ['20% más puntos por compra'] },
  { id: 'oro', name: 'Oro', minPoints: 3000, color: 'from-amber-400 to-yellow-600', badgeBg: 'bg-amber-50 text-amber-900 border-amber-400 font-bold', multiplier: 1.5, perks: ['50% más puntos por compra'] },
  { id: 'diamante', name: 'Diamante', minPoints: 10000, color: 'from-cyan-400 to-blue-600', badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-400 font-black', multiplier: 2.0, perks: ['Puntos dobles en cada compra'] }
];

export const newStoreDoc = (id: string, name: string, plan: string, dueDate: string) => ({
  id,
  name,
  brandName: name,
  logoUrl: '',
  primaryColor: '#0284c7',
  pointsPerPeso: 0.01, // 1 punto cada $100
  welcomePoints: 100,
  referralPoints: 500,
  currencySymbol: '$',
  whatsappNumber: '',
  contactEmail: '',
  address: '',
  instagramUrl: '',
  websiteUrl: '',
  branches: [],
  bonusRules: [],
  tiers: DEFAULT_TIERS,
  popupBanner: { id: 'pop', title: '', description: '', imageUrl: '', ctaText: 'Ver premios', ctaAction: 'catalog', isActive: false, showOncePerSession: true },
  // Suscripción: solo la toca el creador de la plataforma
  isSystemActive: true,
  suspensionReason: '',
  subscriptionDueDate: dueDate,
  clientPlanName: plan,
  createdAt: nowIso()
});

// Nivel según puntos ganados en toda la historia (canjear NO te baja de nivel)
export const tierFor = (tiers: any[], totalEarned: number) => {
  const list = [...(tiers?.length ? tiers : DEFAULT_TIERS)].sort((a, b) => a.minPoints - b.minPoints);
  let current = list[0];
  for (const t of list) if (totalEarned >= t.minPoints) current = t;
  return current;
};

export const purchasePoints = (store: any, customer: any, amount: number, manualPoints?: number) => {
  if (manualPoints && manualPoints > 0) return { points: Math.floor(manualPoints), detail: 'Puntos indicados manualmente' };
  const base = Math.floor(amount * (Number(store.pointsPerPeso) || 0));
  if (base <= 0) return { points: 0, detail: 'Monto insuficiente para sumar puntos' };
  const tier = tierFor(store.tiers, customer.totalEarned || 0);
  let mult = Number(tier?.multiplier) || 1;
  let extra = 0;
  const applied: string[] = [];
  const day = weekdayArg();
  for (const r of store.bonusRules || []) {
    if (!r.isActive || !(r.daysOfWeek || []).includes(day)) continue;
    if (r.minPurchaseAmount && amount < r.minPurchaseAmount) continue;
    mult *= Number(r.multiplier) || 1;
    extra += Number(r.extraPoints) || 0;
    applied.push(r.title);
  }
  const points = Math.floor(base * mult) + extra;
  const detail = [`Nivel ${tier?.name || ''} x${tier?.multiplier || 1}`, ...applied].join(' · ');
  return { points, detail };
};

// ---------- Límites del plan ----------
const planLimitMsg = (store: any, what: string, limit: number) => {
  const next = nextPlan(store.planId);
  const plan = planOf(store.planId);
  return `Tu plan ${plan?.name || ''} permite ${limit} ${what}.${next ? ` Pasate al plan ${next.name} para tener más.` : ''} Consultá con tu proveedor de Fidelia.`;
};

// ---------- Lecturas comunes ----------
const S = (storeId: string) => `stores/${storeId}`;

const loadStore = async (tx: Tx, storeId: string, isAdmin = false) => {
  if (!/^[a-z0-9-]{3,40}$/.test(storeId || '')) fail(400, 'Comercio inválido.');
  const store = await tx.get(S(storeId));
  if (!store) fail(404, 'Comercio no encontrado.');
  if (store.isSystemActive === false && !isAdmin) fail(403, store.suspensionReason || 'El servicio de este comercio está suspendido.');
  return store;
};

const isPlatformAdmin = async (tx: Tx, ctx: Ctx) => !!(await tx.get(`platformAdmins/${ctx.uid}`));

// ---------- Cuenta de demostración (usuario "demo" / contraseña "demo") ----------
// Solo puede entrar al comercio "demo", que se arma solo con datos de ejemplo.
export const DEMO_EMAIL = 'demo@fidelia.demo';
export const DEMO_STORE = 'demo';
const isDemo = (ctx: Ctx) => ctx.email === DEMO_EMAIL;

const IMG = (id: string) => `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=80`;

export const seedDemoStore = (tx: Tx) => {
  const store = {
    ...newStoreDoc(DEMO_STORE, 'Comercio Demo', 'Plan Demo', '2099-12-31'),
    brandName: 'Club Demo',
    pointsPerPeso: 0.01,
    welcomePoints: 100,
    referralPoints: 300,
    whatsappNumber: '',
    address: 'Av. Siempre Viva 742',
    branches: [{ id: 'b1', name: 'Casa Central', address: 'Av. Siempre Viva 742', city: 'Córdoba', phone: '', hours: 'Lunes a sábado de 8 a 20 hs', isMain: true }],
    bonusRules: [
      { id: 'br1', title: 'LUNES DE PUNTOS DOBLES', description: 'Todas las compras de los lunes suman el doble', multiplier: 2, extraPoints: 0, daysOfWeek: [1], isActive: true },
      { id: 'br2', title: '+50 PUNTOS EN COMPRAS GRANDES', description: '50 puntos extra en compras desde $50.000', multiplier: 1, extraPoints: 50, daysOfWeek: [1, 2, 3, 4, 5, 6], isActive: true, minPurchaseAmount: 50000 }
    ],
    popupBanner: { id: 'pop', title: '¡Bienvenido al Club Demo!', description: 'Sumá puntos en cada compra y canjealos por premios. Esta es una demostración de Fidelia.', imageUrl: IMG('photo-1556742049-0a67d1656819'), ctaText: 'Ver premios', ctaAction: 'catalog', ctaLink: '', isActive: true, showOncePerSession: true },
    isDemo: true,
    planId: 'cadena'
  };
  tx.set(S(DEMO_STORE), store);
  tx.set(`${S(DEMO_STORE)}/staff/${DEMO_EMAIL}`, { email: DEMO_EMAIL, role: 'owner', name: 'Usuario Demo', addedBy: 'sistema', addedAt: nowIso() });
  tx.set(`staffIndex/${DEMO_EMAIL}`, { email: DEMO_EMAIL, stores: { [DEMO_STORE]: 'owner' } });

  const rewards = [
    { id: 'r1', title: 'Café + 2 medialunas', category: 'Gastronomía', pointsCost: 200, stock: 50, img: 'photo-1517256064527-09c73fc73e38', originalPrice: 3500 },
    { id: 'r2', title: '10% de descuento', category: 'Descuentos', pointsCost: 300, stock: 99, img: 'photo-1607082348824-0a96f2a4b9da', originalPrice: 5000 },
    { id: 'r3', title: 'Porción de torta', category: 'Gastronomía', pointsCost: 400, stock: 30, img: 'photo-1535141192574-5d4897c13136', originalPrice: 4000 },
    { id: 'r4', title: 'Taza de cerámica', category: 'Regalos', pointsCost: 800, stock: 15, img: 'photo-1610701596007-11502861dcfa', originalPrice: 9000 },
    { id: 'r5', title: '30% de descuento', category: 'Descuentos', pointsCost: 1500, stock: 20, img: 'photo-1607082348824-0a96f2a4b9da', originalPrice: 15000 }
  ];
  for (const r of rewards)
    tx.set(`${S(DEMO_STORE)}/rewards/${r.id}`, {
      id: r.id, title: r.title, category: r.category, description: `Canjealo en el mostrador presentando tu código.`, pointsCost: r.pointsCost,
      imageUrl: IMG(r.img), stock: r.stock, isActive: true, terms: 'Válido en Casa Central.', originalPrice: r.originalPrice, updatedAt: nowIso()
    });

  const customers = [
    { id: 'demo-c1', name: 'María', lastName: 'García', dni: '30111222', phone: '5493510000001', points: 1450, totalEarned: 2050, totalSpent: 205000 },
    { id: 'demo-c2', name: 'Carlos', lastName: 'Gómez', dni: '28999888', phone: '5493510000002', points: 820, totalEarned: 820, totalSpent: 82000 },
    { id: 'demo-c3', name: 'Laura', lastName: 'Martínez', dni: '35444555', phone: '5493510000003', points: 3600, totalEarned: 4400, totalSpent: 440000 },
    { id: 'demo-c4', name: 'Jorge', lastName: 'López', dni: '25333444', phone: '5493510000004', points: 260, totalEarned: 260, totalSpent: 16000 }
  ];
  const day = (d: number) => new Date(Date.now() - d * 86400000);
  const label = (d: Date) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  let n = 0;
  for (const c of customers) {
    const tier = tierFor(store.tiers, c.totalEarned);
    tx.set(`${S(DEMO_STORE)}/customers/${c.id}`, {
      ...c, email: `${c.name.toLowerCase()}@ejemplo.com`, birthDate: '', gender: '', tierId: tier.id, createdAt: day(60).toISOString().slice(0, 10), createdAtIso: day(60).toISOString(),
      referralCode: `${c.name.toUpperCase().slice(0, 4)}${1000 + n}`, referredBy: '', referralRewarded: false, avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}%20${c.lastName}`
    });
    const movs = [
      { d: 50, type: 'earned_bonus', points: 100, description: '¡Bono de bienvenida!' },
      { d: 20, type: 'earned_purchase', points: c.totalEarned - 100, description: `Compra de $${((c.totalEarned - 100) * 100).toLocaleString('es-AR')}`, amountPeso: (c.totalEarned - 100) * 100 }
    ];
    if (c.points < c.totalEarned) movs.push({ d: 5, type: 'spent_redemption', points: c.points - c.totalEarned, description: 'Canje de premio: Taza de cerámica' } as any);
    for (const m of movs) {
      const id = `demo-m${++n}`;
      tx.set(`${S(DEMO_STORE)}/movements/${id}`, { id, customerId: c.id, customerName: `${c.name} ${c.lastName}`, date: label(day(m.d)), createdAt: day(m.d).toISOString(), staffEmail: m.type === 'earned_purchase' ? DEMO_EMAIL : undefined, ...m, d: undefined });
    }
  }
  tx.set(`${S(DEMO_STORE)}/vouchers/demo-v1`, {
    id: 'demo-v1', code: 'CANJE-DEMO01', customerId: 'demo-c1', customerName: 'María García', rewardId: 'r1', rewardTitle: 'Café + 2 medialunas', pointsSpent: 200,
    createdAt: label(day(1)), createdAtIso: day(1).toISOString(), status: 'pending'
  });
  tx.set(`${S(DEMO_STORE)}/raffles/demo-raf1`, {
    id: 'demo-raf1', title: 'Sorteo de fin de mes', description: 'Ganate una orden de compra de $50.000.', imageUrl: IMG('photo-1513151233558-d860c5398176'),
    entryCostPoints: 100, startDate: day(10).toISOString().slice(0, 10), endDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10), isActive: true,
    participants: [
      { customerId: 'demo-c1', customerName: 'María García', entries: 3, date: label(day(3)) },
      { customerId: 'demo-c3', customerName: 'Laura Martínez', entries: 5, date: label(day(2)) }
    ],
    createdAt: day(10).toISOString()
  });
  tx.set(`${S(DEMO_STORE)}/surveys/demo-s1`, {
    id: 'demo-s1', title: '¿Cómo fue tu atención?', description: 'Respondé 3 preguntas y sumá 50 puntos.', rewardPoints: 50, isActive: true, completedCustomerIds: ['demo-c3'], createdAt: day(15).toISOString(),
    questions: [
      { id: 'q1', question: '¿Cómo calificarías la atención?', type: 'rating' },
      { id: 'q2', question: '¿Qué te gustaría que agreguemos?', type: 'text' },
      { id: 'q3', question: '¿Con qué frecuencia nos visitás?', type: 'multiple_choice', options: ['Varias veces por semana', 'Una vez por semana', 'Ocasionalmente'] }
    ]
  });
};

const ensureDemo = (db: DB) =>
  db.run(async tx => {
    if (await tx.get(S(DEMO_STORE))) return;
    seedDemoStore(tx);
  });

const requireStaff = async (tx: Tx, ctx: Ctx, storeId: string, roles: ('owner' | 'cashier')[] = ['owner', 'cashier']) => {
  const admin = await isPlatformAdmin(tx, ctx);
  if (admin) return { role: 'owner' as const, admin: true };
  if (isDemo(ctx) && storeId !== DEMO_STORE) fail(403, 'La cuenta demo solo puede usar el comercio de demostración.');
  if (!ctx.emailVerified && !isDemo(ctx)) fail(403, 'Tu email no está verificado.');
  const staff = await tx.get(`${S(storeId)}/staff/${ctx.email}`);
  if (!staff || !roles.includes(staff.role)) fail(403, 'No tenés permiso para esta acción en este comercio.');
  return { role: staff.role as 'owner' | 'cashier', admin: false };
};

const loadCustomer = async (tx: Tx, storeId: string, customerId: string) => {
  const c = await tx.get(`${S(storeId)}/customers/${customerId}`);
  if (!c) fail(404, 'Cliente no encontrado en este comercio.');
  return c;
};

// Aplica un cambio de puntos y devuelve los campos a guardar en el cliente + el movimiento
const pointsChange = (store: any, customer: any, delta: number, type: string, description: string, extra: any = {}) => {
  const points = Math.max(0, (customer.points || 0) + delta);
  const applied = points - (customer.points || 0);
  const totalEarned = (customer.totalEarned || 0) + (applied > 0 ? applied : 0);
  const tier = tierFor(store.tiers, totalEarned);
  const movement = {
    id: newId('m'),
    customerId: customer.id,
    customerName: `${customer.name} ${customer.lastName}`.trim(),
    type,
    points: applied,
    description,
    date: nowLabel(),
    createdAt: nowIso(),
    ...extra
  };
  return { patch: { points, totalEarned, tierId: tier.id, updatedAt: nowIso() }, movement, applied };
};

// ---------- Acciones ----------
type Handler = (db: DB, ctx: Ctx, b: any) => Promise<any>;

const me: Handler = async (db, ctx) => {
  if (isDemo(ctx)) await ensureDemo(db);
  return db.run(async tx => {
    const admin = await isPlatformAdmin(tx, ctx);
    const idx = ctx.emailVerified || isDemo(ctx) ? await tx.get(`staffIndex/${ctx.email}`) : null;
    const entries = Object.entries((idx?.stores || {}) as Record<string, string>);
    const stores = [];
    for (const [storeId, role] of entries) {
      const s = await tx.get(S(storeId));
      if (s) stores.push({ storeId, role, name: s.name, isSystemActive: s.isSystemActive !== false });
    }
    return { isPlatformAdmin: admin, staffStores: stores, isDemo: isDemo(ctx) };
  });
};

// Vuelve el comercio demo a sus datos de ejemplo (lo usa el creador o la cuenta demo)
const resetDemo: Handler = async (db, ctx) => {
  const allowed = isDemo(ctx) || (await db.run(tx => isPlatformAdmin(tx, ctx)));
  if (!allowed) fail(403, 'No tenés permiso.');
  await db.run(async tx => {
    seedDemoStore(tx);
  });
  return { ok: true };
};

// --- Clientes ---
const registerCustomer: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId);
    const existing = await tx.get(`${S(storeId)}/customers/${ctx.uid}`);
    if (existing) return { customer: existing };
    if (!ctx.email) fail(400, 'Tu cuenta no tiene email.');
    const custLimit = planOf(store.planId)?.customers;
    if (custLimit != null && (store.customerCount || 0) >= custLimit)
      fail(403, `${store.name} alcanzó el máximo de clientes de su plan. Avisale al comercio para que puedas sumarte.`);
    const name = nonEmpty(str(b.name, 60), 'Ingresá tu nombre.');
    const lastName = nonEmpty(str(b.lastName, 60), 'Ingresá tu apellido.');
    const dni = str(b.dni, 15).replace(/\D/g, '');
    if (dni.length < 7 || dni.length > 11) fail(400, 'Ingresá un DNI/CUIT válido (solo números).');
    const dupDni = await tx.query(`${S(storeId)}/customers`, 'dni', dni);
    if (dupDni.length) fail(409, 'Ya hay un cliente registrado con ese DNI en este comercio. Si es tuyo, pedile al comercio que lo revise.');
    const refCode = str(b.referralCode, 20).toUpperCase();
    const referrer = refCode ? (await tx.query(`${S(storeId)}/customers`, 'referralCode', refCode))[0] : undefined;
    let referralCode = '';
    for (let i = 0; i < 5 && !referralCode; i++) {
      const candidate = (name.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 4) || 'CLI').toUpperCase() + randCode(4);
      if (!(await tx.query(`${S(storeId)}/customers`, 'referralCode', candidate)).length) referralCode = candidate;
    }
    if (!referralCode) referralCode = randCode(8);

    const welcome = int(store.welcomePoints, 0, 1e6) || 0;
    const tier = tierFor(store.tiers, welcome);
    const customer = {
      id: ctx.uid,
      name,
      lastName,
      email: ctx.email,
      dni,
      phone: str(b.phone, 30),
      birthDate: str(b.birthDate, 10),
      gender: str(b.gender, 20),
      points: welcome,
      totalEarned: welcome,
      totalSpent: 0,
      tierId: tier.id,
      createdAt: todayArg(),
      createdAtIso: nowIso(),
      referralCode,
      referredBy: referrer && referrer.id !== ctx.uid ? referrer.id : '',
      referralRewarded: false,
      avatarUrl: str(ctx.photoURL, 500) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}`
    };
    tx.set(`${S(storeId)}/customers/${ctx.uid}`, customer);
    tx.update(S(storeId), { customerCount: (store.customerCount || 0) + 1 });
    if (welcome > 0) {
      const mov = { id: newId('m'), customerId: ctx.uid, customerName: `${name} ${lastName}`, type: 'earned_bonus', points: welcome, description: '¡Bono de bienvenida!', date: nowLabel(), createdAt: nowIso() };
      tx.set(`${S(storeId)}/movements/${mov.id}`, mov);
    }
    return { customer };
  });

const redeem: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId);
    const customer = await loadCustomer(tx, storeId, ctx.uid);
    const rewardId = str(b.rewardId, 80);
    const reward = await tx.get(`${S(storeId)}/rewards/${rewardId}`);
    if (!reward) fail(404, 'Premio no encontrado.');
    if (!reward.isActive) fail(400, 'Este premio no está disponible.');
    if ((reward.stock || 0) <= 0) fail(400, 'Sin stock disponible para este premio.');
    const cost = int(reward.pointsCost, 1);
    if ((customer.points || 0) < cost) fail(400, `Te faltan ${cost - (customer.points || 0)} puntos para este premio.`);

    const { patch, movement } = pointsChange(store, customer, -cost, 'spent_redemption', `Canje de premio: ${reward.title}`);
    const voucher = {
      id: newId('v'),
      code: `CANJE-${randCode(6)}`,
      customerId: customer.id,
      customerName: movement.customerName,
      rewardId,
      rewardTitle: reward.title,
      pointsSpent: cost,
      createdAt: nowLabel(),
      createdAtIso: nowIso(),
      status: 'pending'
    };
    tx.update(`${S(storeId)}/customers/${customer.id}`, patch);
    tx.update(`${S(storeId)}/rewards/${rewardId}`, { stock: (reward.stock || 0) - 1 });
    tx.set(`${S(storeId)}/vouchers/${voucher.id}`, voucher);
    tx.set(`${S(storeId)}/movements/${movement.id}`, { ...movement, voucherId: voucher.id });
    return { voucher, message: '¡Canje realizado con éxito!' };
  });

const enterRaffle: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId);
    const customer = await loadCustomer(tx, storeId, ctx.uid);
    const raffleId = str(b.raffleId, 80);
    const raffle = await tx.get(`${S(storeId)}/raffles/${raffleId}`);
    if (!raffle) fail(404, 'Sorteo no encontrado.');
    if (!raffle.isActive || raffle.winnerCustomerId) fail(400, 'Este sorteo ya finalizó.');
    if (raffle.endDate && raffle.endDate < todayArg()) fail(400, 'La inscripción a este sorteo ya cerró.');
    const entries = int(b.entries ?? 1, 1, 100);
    const cost = int(raffle.entryCostPoints, 0) * entries;
    if ((customer.points || 0) < cost) fail(400, `Necesitás ${cost} puntos para ${entries === 1 ? 'una chance' : `${entries} chances`}.`);

    const participants = [...(raffle.participants || [])];
    const i = participants.findIndex((p: any) => p.customerId === customer.id);
    if (i >= 0) participants[i] = { ...participants[i], entries: participants[i].entries + entries };
    else participants.push({ customerId: customer.id, customerName: `${customer.name} ${customer.lastName}`, entries, date: nowLabel() });

    const { patch, movement } = pointsChange(store, customer, -cost, 'spent_raffle', `${entries === 1 ? 'Chance' : `${entries} chances`} para el sorteo: ${raffle.title}`);
    tx.update(`${S(storeId)}/customers/${customer.id}`, patch);
    tx.update(`${S(storeId)}/raffles/${raffleId}`, { participants });
    tx.set(`${S(storeId)}/movements/${movement.id}`, movement);
    return { message: '¡Inscripción confirmada al sorteo!' };
  });

const completeSurvey: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId);
    const customer = await loadCustomer(tx, storeId, ctx.uid);
    const surveyId = str(b.surveyId, 80);
    const survey = await tx.get(`${S(storeId)}/surveys/${surveyId}`);
    if (!survey || !survey.isActive) fail(404, 'Encuesta no disponible.');
    const prev = await tx.get(`${S(storeId)}/surveys/${surveyId}/responses/${customer.id}`);
    if (prev) fail(409, 'Ya completaste esta encuesta.');
    const answers: Record<string, string> = {};
    for (const q of survey.questions || []) {
      const a = str(b.answers?.[q.id], 1000);
      if (!a) fail(400, 'Respondé todas las preguntas.');
      answers[q.id] = a;
    }
    const reward = int(survey.rewardPoints, 0, 1e6);
    const { patch, movement } = pointsChange(store, customer, reward, 'earned_survey', `Completó la encuesta: ${survey.title}`);
    tx.set(`${S(storeId)}/surveys/${surveyId}/responses/${customer.id}`, { customerId: customer.id, customerName: movement.customerName, answers, date: nowLabel(), createdAt: nowIso() });
    tx.update(`${S(storeId)}/surveys/${surveyId}`, { completedCustomerIds: [...(survey.completedCustomerIds || []), customer.id] });
    tx.update(`${S(storeId)}/customers/${customer.id}`, patch);
    tx.set(`${S(storeId)}/movements/${movement.id}`, movement);
    return { message: `¡Gracias por responder! Sumaste ${reward} puntos.` };
  });

const claimQr: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId);
    const customer = await loadCustomer(tx, storeId, ctx.uid);
    const code = str(b.code, 40).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const qr = code ? await tx.get(`${S(storeId)}/qrcodes/${code}`) : null;
    if (!qr) fail(404, 'Código QR inválido.');
    if (qr.usedBy) fail(409, 'Este código QR ya fue usado.');
    if (qr.expiresAt && qr.expiresAt < nowIso()) fail(410, 'Este código QR venció.');
    const { patch, movement } = pointsChange(store, customer, int(qr.points, 1), 'earned_bonus', qr.description || 'Puntos por código QR', { qrCode: code });
    tx.update(`${S(storeId)}/qrcodes/${code}`, { usedBy: customer.id, usedByName: movement.customerName, usedAt: nowIso() });
    tx.update(`${S(storeId)}/customers/${customer.id}`, patch);
    tx.set(`${S(storeId)}/movements/${movement.id}`, movement);
    return { points: movement.points, message: `¡Sumaste ${movement.points} puntos!` };
  });

// --- Caja (dueño o cajero) ---
const addPurchase: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId);
    const customer = await loadCustomer(tx, storeId, str(b.customerId, 128));
    const amount = num(b.amount, 0, 1e10);
    if (Number.isNaN(amount)) fail(400, 'Monto inválido.');
    const manual = b.manualPoints != null && b.manualPoints !== '' ? int(b.manualPoints, 0, 1e7) : undefined;
    if (!amount && !manual) fail(400, 'Ingresá el monto de la compra o los puntos.');
    const { points, detail } = purchasePoints(store, customer, amount, manual);
    const note = str(b.note, 200);
    const desc = `Compra de ${store.currencySymbol || '$'}${amount.toLocaleString('es-AR')}${note ? ` · ${note}` : ''}`;

    // Referido: cuando el invitado hace su PRIMERA compra, ganan los dos
    const isFirstPurchase = !(customer.totalSpent > 0) && amount > 0;
    const referralBonus = isFirstPurchase && customer.referredBy && !customer.referralRewarded ? int(store.referralPoints, 0, 1e6) : 0;
    const referrer = referralBonus ? await tx.get(`${S(storeId)}/customers/${customer.referredBy}`) : null;

    const { patch, movement } = pointsChange(store, customer, points + referralBonus, 'earned_purchase', desc + (referralBonus ? ` (+${referralBonus} por referido)` : ''), {
      amountPeso: amount,
      detail,
      staffEmail: ctx.email
    });
    tx.update(`${S(storeId)}/customers/${customer.id}`, {
      ...patch,
      totalSpent: (customer.totalSpent || 0) + amount,
      ...(referralBonus ? { referralRewarded: true } : {})
    });
    tx.set(`${S(storeId)}/movements/${movement.id}`, movement);
    if (referrer && referralBonus) {
      const r = pointsChange(store, referrer, referralBonus, 'earned_referral', `Tu invitado ${customer.name} hizo su primera compra`);
      tx.update(`${S(storeId)}/customers/${referrer.id}`, r.patch);
      tx.set(`${S(storeId)}/movements/${r.movement.id}`, r.movement);
    }
    return { movement };
  });

const validateVoucher: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId);
    const code = str(b.code, 40).toUpperCase().replace(/\s/g, '');
    const found = (await tx.query(`${S(storeId)}/vouchers`, 'code', code))[0];
    if (!found) return { success: false, message: 'Código de canje no encontrado.' };
    const v = found.data;
    if (v.status === 'used') return { success: false, message: `Este canje ya fue entregado el ${v.usedAt}.`, voucher: v };
    if (v.status === 'cancelled') return { success: false, message: 'Este canje fue cancelado.', voucher: v };
    const upd = { status: 'used', usedAt: nowLabel(), usedBy: ctx.email };
    tx.update(`${S(storeId)}/vouchers/${found.id}`, upd);
    return { success: true, message: `¡"${v.rewardTitle}" entregado a ${v.customerName}!`, voucher: { ...v, ...upd } };
  });

const cancelVoucher: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const voucherId = str(b.voucherId, 80);
    const v = await tx.get(`${S(storeId)}/vouchers/${voucherId}`);
    if (!v) fail(404, 'Canje no encontrado.');
    if (v.status !== 'pending') fail(400, 'Solo se pueden cancelar canjes pendientes de entrega.');
    const customer = await loadCustomer(tx, storeId, v.customerId);
    const reward = await tx.get(`${S(storeId)}/rewards/${v.rewardId}`);
    // Devolución de puntos: no cuenta como "ganados" para el nivel
    const points = (customer.points || 0) + v.pointsSpent;
    tx.update(`${S(storeId)}/customers/${customer.id}`, { points, updatedAt: nowIso() });
    if (reward) tx.update(`${S(storeId)}/rewards/${v.rewardId}`, { stock: (reward.stock || 0) + 1 });
    tx.update(`${S(storeId)}/vouchers/${voucherId}`, { status: 'cancelled', cancelledAt: nowLabel(), cancelledBy: ctx.email });
    const mov = { id: newId('m'), customerId: customer.id, customerName: v.customerName, type: 'admin_adjust', points: v.pointsSpent, description: `Devolución por canje cancelado: ${v.rewardTitle}`, date: nowLabel(), createdAt: nowIso(), staffEmail: ctx.email };
    tx.set(`${S(storeId)}/movements/${mov.id}`, mov);
    void store;
    return { message: 'Canje cancelado y puntos devueltos.' };
  });

const createQr: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId);
    const points = int(b.points, 1, 100000);
    if (Number.isNaN(points) || points < 1) fail(400, 'Indicá los puntos del QR (entre 1 y 100.000).');
    const hours = int(b.hoursValid ?? 24, 1, 24 * 90);
    const code = randCode(10);
    const qr = {
      code,
      points,
      description: str(b.description, 120) || 'Puntos por código QR',
      createdBy: ctx.email,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
      usedBy: ''
    };
    tx.set(`${S(storeId)}/qrcodes/${code}`, qr);
    return { code, expiresAt: qr.expiresAt };
  });

const adjustPoints: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const customer = await loadCustomer(tx, storeId, str(b.customerId, 128));
    const delta = int(b.delta, -1e7, 1e7);
    if (!delta) fail(400, 'Indicá cuántos puntos sumar o restar.');
    const { patch, movement } = pointsChange(store, customer, delta, 'admin_adjust', str(b.note, 200) || 'Ajuste manual de puntos', { staffEmail: ctx.email });
    tx.update(`${S(storeId)}/customers/${customer.id}`, patch);
    tx.set(`${S(storeId)}/movements/${movement.id}`, movement);
    return { movement };
  });

// --- Configuración del comercio (dueño) ---
const cleanTiers = (tiers: any) => {
  if (!Array.isArray(tiers) || !tiers.length) fail(400, 'Tiene que haber al menos un nivel.');
  return tiers.slice(0, 10).map((t: any, i: number) => ({
    id: str(t.id, 30) || `nivel${i + 1}`,
    name: nonEmpty(str(t.name, 30), 'Cada nivel necesita un nombre.'),
    minPoints: int(t.minPoints, 0, 1e9) || 0,
    color: str(t.color, 80) || DEFAULT_TIERS[Math.min(i, 3)].color,
    badgeBg: str(t.badgeBg, 120) || DEFAULT_TIERS[Math.min(i, 3)].badgeBg,
    multiplier: num(t.multiplier, 1, 10) || 1,
    perks: (Array.isArray(t.perks) ? t.perks : []).map((p: any) => str(p, 120)).filter(Boolean).slice(0, 8)
  }));
};
const cleanBonusRules = (rules: any) =>
  (Array.isArray(rules) ? rules : []).slice(0, 30).map((r: any) => ({
    id: str(r.id, 40) || newId('br'),
    title: nonEmpty(str(r.title, 80), 'La promoción necesita un título.'),
    description: str(r.description, 200),
    multiplier: num(r.multiplier, 1, 10) || 1,
    extraPoints: int(r.extraPoints, 0, 1e6) || 0,
    daysOfWeek: (Array.isArray(r.daysOfWeek) ? r.daysOfWeek : []).map((d: any) => int(d, 0, 6)).filter((d: number) => !Number.isNaN(d)),
    isActive: bool(r.isActive),
    ...(r.minPurchaseAmount ? { minPurchaseAmount: num(r.minPurchaseAmount, 0) } : {})
  }));
const cleanBranches = (list: any) =>
  (Array.isArray(list) ? list : []).slice(0, 50).map((x: any) => ({
    id: str(x.id, 40) || newId('b'),
    name: nonEmpty(str(x.name, 80), 'La sucursal necesita un nombre.'),
    address: str(x.address, 150),
    city: str(x.city, 80),
    phone: str(x.phone, 40),
    hours: str(x.hours, 120),
    isMain: bool(x.isMain)
  }));
const cleanPopup = (p: any) => ({
  id: 'pop',
  title: str(p?.title, 100),
  description: str(p?.description, 500),
  imageUrl: str(p?.imageUrl, 400000),
  ctaText: str(p?.ctaText, 40),
  ctaAction: ['catalog', 'surveys', 'raffles', 'link'].includes(p?.ctaAction) ? p.ctaAction : 'catalog',
  ctaLink: str(p?.ctaLink, 400),
  isActive: bool(p?.isActive),
  showOncePerSession: p?.showOncePerSession !== false
});

const updateStore: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const p = b.patch || {};
    const out: any = {};
    const texts: [string, number][] = [['name', 80], ['brandName', 40], ['primaryColor', 20], ['currencySymbol', 5], ['whatsappNumber', 30], ['contactEmail', 100], ['address', 150], ['instagramUrl', 200], ['websiteUrl', 200]];
    for (const [k, max] of texts) if (k in p) out[k] = str(p[k], max);
    if ('logoUrl' in p) {
      const logo = str(p.logoUrl, 700000);
      if (logo.length >= 700000) fail(400, 'El logo es muy pesado. Usá una imagen de menos de 500 KB.');
      out.logoUrl = logo;
    }
    if ('pointsPerPeso' in p) {
      const v = num(p.pointsPerPeso, 0, 100);
      if (Number.isNaN(v)) fail(400, 'Puntos por peso inválido.');
      out.pointsPerPeso = v;
    }
    if ('welcomePoints' in p) out.welcomePoints = int(p.welcomePoints, 0, 1e6) || 0;
    if ('referralPoints' in p) out.referralPoints = int(p.referralPoints, 0, 1e6) || 0;
    if ('tiers' in p) out.tiers = cleanTiers(p.tiers);
    if ('bonusRules' in p) out.bonusRules = cleanBonusRules(p.bonusRules);
    if ('branches' in p) {
      out.branches = cleanBranches(p.branches);
      const lim = planOf(store.planId)?.branches;
      if (lim != null && out.branches.length > lim) fail(403, planLimitMsg(store, lim === 1 ? 'sucursal' : 'sucursales', lim));
    }
    if ('popupBanner' in p) out.popupBanner = cleanPopup(p.popupBanner);
    if (out.name === '') fail(400, 'El comercio necesita un nombre.');
    if (!Object.keys(out).length) fail(400, 'No hay cambios para guardar.');
    out.updatedAt = nowIso();
    tx.update(S(storeId), out);
    return { ok: true };
  });

const saveReward: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const r = b.reward || {};
    const id = str(r.id, 80) || newId('r');
    const reward = {
      id,
      title: nonEmpty(str(r.title, 100), 'El premio necesita un título.'),
      category: str(r.category, 40) || 'General',
      description: str(r.description, 600),
      pointsCost: int(r.pointsCost, 1, 1e7) || fail(400, 'Indicá el costo en puntos.'),
      imageUrl: str(r.imageUrl, 400000),
      stock: int(r.stock, 0, 1e7) || 0,
      isActive: r.isActive !== false,
      terms: str(r.terms, 400),
      ...(r.originalPrice ? { originalPrice: num(r.originalPrice, 0) } : {}),
      updatedAt: nowIso()
    };
    tx.set(`${S(storeId)}/rewards/${id}`, reward);
    return { reward };
  });

const deleteItem = (col: 'rewards' | 'surveys' | 'raffles'): Handler => async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const id = str(b.id, 80);
    if (!(await tx.get(`${S(storeId)}/${col}/${id}`))) fail(404, 'No encontrado.');
    tx.delete(`${S(storeId)}/${col}/${id}`);
    return { ok: true };
  });

const saveSurvey: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const s = b.survey || {};
    const id = str(s.id, 80);
    const prev = id ? await tx.get(`${S(storeId)}/surveys/${id}`) : null;
    if (prev && Object.keys(s).every(k => ['id', 'isActive'].includes(k))) {
      tx.update(`${S(storeId)}/surveys/${id}`, { isActive: bool(s.isActive) });
      return { ok: true };
    }
    const questions = (Array.isArray(s.questions) ? s.questions : []).slice(0, 15).map((q: any, i: number) => ({
      id: str(q.id, 20) || `q${i + 1}`,
      question: nonEmpty(str(q.question, 200), 'Hay una pregunta vacía.'),
      type: ['multiple_choice', 'text', 'rating'].includes(q.type) ? q.type : 'text',
      ...(q.type === 'multiple_choice' ? { options: (q.options || []).map((o: any) => str(o, 80)).filter(Boolean).slice(0, 10) } : {})
    }));
    if (!questions.length) fail(400, 'La encuesta necesita al menos una pregunta.');
    const newSurveyId = id || newId('s');
    tx.set(`${S(storeId)}/surveys/${newSurveyId}`, {
      id: newSurveyId,
      title: nonEmpty(str(s.title, 100), 'La encuesta necesita un título.'),
      description: str(s.description, 300),
      rewardPoints: int(s.rewardPoints, 0, 1e6) || 0,
      isActive: s.isActive !== false,
      questions,
      completedCustomerIds: prev?.completedCustomerIds || [],
      createdAt: prev?.createdAt || nowIso()
    });
    return { ok: true };
  });

const saveRaffle: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const r = b.raffle || {};
    const id = str(r.id, 80);
    const prev = id ? await tx.get(`${S(storeId)}/raffles/${id}`) : null;
    if (prev?.winnerCustomerId) fail(400, 'Ese sorteo ya se realizó y no se puede modificar.');
    const raffleId = id || newId('raf');
    tx.set(`${S(storeId)}/raffles/${raffleId}`, {
      id: raffleId,
      title: nonEmpty(str(r.title, 100), 'El sorteo necesita un título.'),
      description: str(r.description, 500),
      imageUrl: str(r.imageUrl, 400000),
      entryCostPoints: int(r.entryCostPoints, 0, 1e7) || 0,
      startDate: str(r.startDate, 10) || todayArg(),
      endDate: str(r.endDate, 10),
      isActive: r.isActive !== false,
      participants: prev?.participants || [],
      createdAt: prev?.createdAt || nowIso()
    });
    return { ok: true };
  });

const drawRaffle: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    const raffleId = str(b.raffleId, 80);
    const raffle = await tx.get(`${S(storeId)}/raffles/${raffleId}`);
    if (!raffle) fail(404, 'Sorteo no encontrado.');
    if (raffle.winnerCustomerId) fail(400, `Este sorteo ya se realizó. Ganó ${raffle.winnerCustomerName}.`);
    const pool: { id: string; name: string }[] = [];
    for (const p of raffle.participants || []) for (let i = 0; i < p.entries; i++) pool.push({ id: p.customerId, name: p.customerName });
    if (!pool.length) fail(400, 'No hay participantes anotados.');
    const winner = pool[randomInt(pool.length)];
    tx.update(`${S(storeId)}/raffles/${raffleId}`, {
      isActive: false,
      winnerCustomerId: winner.id,
      winnerCustomerName: winner.name,
      drawnAt: nowIso(),
      drawnBy: ctx.email,
      totalTicketsAtDraw: pool.length
    });
    return { success: true, winnerName: winner.name };
  });

// --- Equipo del comercio ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const addStaffTx = async (tx: Tx, storeId: string, email: string, role: 'owner' | 'cashier', name: string, by: string) => {
  const idx = (await tx.get(`staffIndex/${email}`)) || { email, stores: {} };
  tx.set(`${S(storeId)}/staff/${email}`, { email, role, name, addedBy: by, addedAt: nowIso() });
  tx.set(`staffIndex/${email}`, { email, stores: { ...(idx.stores || {}), [storeId]: role } });
};

const addStaff: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    const store = await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    if (isDemo(ctx)) fail(403, 'En la demo no se puede modificar el equipo.');
    const email = str(b.email, 120).toLowerCase();
    if (!EMAIL_RE.test(email)) fail(400, 'Email inválido.');
    const role = b.role === 'owner' ? 'owner' : 'cashier';
    const plan = planOf(store.planId);
    const lim = plan ? (role === 'owner' ? plan.owners : plan.cashiers) : null;
    if (lim != null) {
      const same = await tx.query(`${S(storeId)}/staff`, 'role', role);
      if (same.filter(m => m.id !== email).length >= lim)
        fail(403, planLimitMsg(store, role === 'owner' ? (lim === 1 ? 'dueño' : 'dueños') : lim === 1 ? 'cajero' : 'cajeros', lim));
    }
    await addStaffTx(tx, storeId, email, role, str(b.name, 80), ctx.email);
    return { ok: true };
  });

const removeStaff: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, await isPlatformAdmin(tx, ctx));
    await requireStaff(tx, ctx, storeId, ['owner']);
    if (isDemo(ctx)) fail(403, 'En la demo no se puede modificar el equipo.');
    const email = str(b.email, 120).toLowerCase();
    const staff = await tx.get(`${S(storeId)}/staff/${email}`);
    if (!staff) fail(404, 'Esa persona no está en el equipo.');
    const owners = await tx.query(`${S(storeId)}/staff`, 'role', 'owner');
    if (staff.role === 'owner' && owners.length <= 1) fail(400, 'No podés quitar al único dueño del comercio.');
    const idx = await tx.get(`staffIndex/${email}`);
    const stores = { ...(idx?.stores || {}) };
    delete stores[storeId];
    tx.delete(`${S(storeId)}/staff/${email}`);
    tx.set(`staffIndex/${email}`, { email, stores });
    return { ok: true };
  });

// --- Plataforma (solo el creador) ---
const requirePlatformAdmin = async (tx: Tx, ctx: Ctx) => {
  if (!(await isPlatformAdmin(tx, ctx))) fail(403, 'Solo el creador de la plataforma puede hacer esto.');
};
const RESERVED = ['admin', 'creador', 'api', 'c', 'app', 'www', 'login', DEMO_STORE];

const createStore: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    await requirePlatformAdmin(tx, ctx);
    const storeId = str(b.storeId, 40).toLowerCase();
    if (!/^[a-z0-9-]{3,40}$/.test(storeId) || RESERVED.includes(storeId)) fail(400, 'El identificador del comercio debe tener entre 3 y 40 letras minúsculas, números o guiones.');
    if (await tx.get(S(storeId))) fail(409, 'Ya existe un comercio con ese identificador.');
    const name = nonEmpty(str(b.name, 80), 'Indicá el nombre del comercio.');
    const ownerEmail = str(b.ownerEmail, 120).toLowerCase();
    if (!EMAIL_RE.test(ownerEmail)) fail(400, 'Indicá un email válido para el dueño.');
    const idx = (await tx.get(`staffIndex/${ownerEmail}`)) || { email: ownerEmail, stores: {} };
    const plan = planOf(str(b.planId, 20)) || PLANS[0];
    tx.set(S(storeId), {
      ...newStoreDoc(storeId, name, plan.name, str(b.subscriptionDueDate, 10)),
      planId: plan.id,
      monthlyFee: b.monthlyFee != null && b.monthlyFee !== '' ? num(b.monthlyFee, 0) : plan.price,
      customerCount: 0
    });
    tx.set(`${S(storeId)}/staff/${ownerEmail}`, { email: ownerEmail, role: 'owner', name: str(b.ownerName, 80), addedBy: ctx.email, addedAt: nowIso() });
    tx.set(`staffIndex/${ownerEmail}`, { email: ownerEmail, stores: { ...(idx.stores || {}), [storeId]: 'owner' } });
    return { storeId };
  });

const updateSubscription: Handler = async (db, ctx, b) =>
  db.run(async tx => {
    await requirePlatformAdmin(tx, ctx);
    const storeId = str(b.storeId, 40);
    await loadStore(tx, storeId, true);
    const out: any = { updatedAt: nowIso() };
    if ('isSystemActive' in b) out.isSystemActive = bool(b.isSystemActive);
    if ('suspensionReason' in b) out.suspensionReason = str(b.suspensionReason, 300);
    if ('subscriptionDueDate' in b) out.subscriptionDueDate = str(b.subscriptionDueDate, 10);
    if ('clientPlanName' in b) out.clientPlanName = str(b.clientPlanName, 60);
    if ('monthlyFee' in b) out.monthlyFee = num(b.monthlyFee, 0);
    if ('planId' in b) {
      const plan = planOf(str(b.planId, 20));
      if (!plan) fail(400, 'Plan inválido.');
      out.planId = plan!.id;
      out.clientPlanName = plan!.name;
      if (!('monthlyFee' in b)) out.monthlyFee = plan!.price;
    }
    tx.update(S(storeId), out);
    return { ok: true };
  });

export const ACTIONS: Record<string, Handler> = {
  me,
  resetDemo,
  registerCustomer,
  redeem,
  enterRaffle,
  completeSurvey,
  claimQr,
  addPurchase,
  validateVoucher,
  cancelVoucher,
  createQr,
  adjustPoints,
  updateStore,
  saveReward,
  deleteReward: deleteItem('rewards'),
  saveSurvey,
  deleteSurvey: deleteItem('surveys'),
  saveRaffle,
  deleteRaffle: deleteItem('raffles'),
  drawRaffle,
  addStaff,
  removeStaff,
  createStore,
  updateSubscription
};
