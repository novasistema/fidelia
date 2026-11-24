// Planes de Fidelia. Lo usan el servidor (para hacer cumplir los límites) y la app (para mostrarlos).
// null = sin límite. Precios mensuales en pesos, sin IVA.
export interface Plan {
  id: string;
  name: string;
  price: number; // precio de lanzamiento vigente
  listPrice: number; // precio original, después de la promo
  owners: number | null;
  cashiers: number | null;
  customers: number | null;
  branches: number | null;
  hidden?: boolean;
}

// Planes a la venta: Comercio (un local) y Con sucursales.
// Los marcados hidden son planes anteriores: siguen funcionando en los comercios que ya los tienen, pero no se ofrecen.
export const ALL_PLANS: Plan[] = [
  { id: 'comercio', name: 'Comercio', price: 35000, listPrice: 42000, owners: 1, cashiers: 4, customers: null, branches: 1 },
  { id: 'sucursales', name: 'Con sucursales', price: 55000, listPrice: 65000, owners: 3, cashiers: null, customers: null, branches: null },
  { id: 'inicial', name: 'Inicial', price: 29000, listPrice: 35000, owners: 1, cashiers: 1, customers: 300, branches: 1, hidden: true },
  { id: 'pro', name: 'Pro', price: 50000, listPrice: 59000, owners: 2, cashiers: 8, customers: null, branches: 2, hidden: true },
  { id: 'cadena', name: 'Cadena', price: 58000, listPrice: 69000, owners: 3, cashiers: null, customers: null, branches: null, hidden: true }
];
export const PLANS: Plan[] = ALL_PLANS.filter(p => !p.hidden);

// Promo de lanzamiento: hasta esta fecha se cobra price; después, listPrice
export const LAUNCH_PROMO_UNTIL = '2026-12-31';
export const currentPrice = (p: Plan, today = new Date().toISOString().slice(0, 10)) => (today <= LAUNCH_PROMO_UNTIL ? p.price : p.listPrice);

export const SETUP_FEE = 45000;
export const IVA = 0.21;

// Comercios creados antes de los planes (sin planId) no tienen límites
export const planOf = (planId?: string): Plan | null => ALL_PLANS.find(p => p.id === planId) || null;
// Plan al que conviene pasarse cuando se llega a un límite
export const nextPlan = (planId?: string): Plan | null => {
  const sucursales = PLANS.find(p => p.id === 'sucursales') || null;
  return planId === 'sucursales' || planId === 'cadena' ? null : sucursales;
};
export const limitLabel = (n: number | null) => (n == null ? 'ilimitado' : String(n));
