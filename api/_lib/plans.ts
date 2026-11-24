// Planes de Fidelia. Lo usan el servidor (para hacer cumplir los límites) y la app (para mostrarlos).
// null = sin límite. Precios mensuales en pesos, sin IVA.
export interface Plan {
  id: string;
  name: string;
  price: number;
  owners: number | null;
  cashiers: number | null;
  customers: number | null;
  branches: number | null;
}

export const PLANS: Plan[] = [
  { id: 'inicial', name: 'Inicial', price: 25000, owners: 1, cashiers: 1, customers: 300, branches: 1 },
  { id: 'comercio', name: 'Comercio', price: 38000, owners: 1, cashiers: 4, customers: null, branches: 1 },
  { id: 'pro', name: 'Pro', price: 47000, owners: 2, cashiers: 8, customers: null, branches: 2 },
  { id: 'cadena', name: 'Cadena', price: 55000, owners: 3, cashiers: null, customers: null, branches: null }
];

export const SETUP_FEE = 45000;
export const IVA = 0.21;

// Comercios creados antes de los planes (sin planId) no tienen límites
export const planOf = (planId?: string): Plan | null => PLANS.find(p => p.id === planId) || null;
export const nextPlan = (planId?: string): Plan | null => {
  const i = PLANS.findIndex(p => p.id === planId);
  return i >= 0 && i < PLANS.length - 1 ? PLANS[i + 1] : null;
};
export const limitLabel = (n: number | null) => (n == null ? 'ilimitado' : String(n));
