// Rutas de Fidelia
//   /                 → presentación de Fidelia
//   /c/<comercio>     → app de clientes del comercio (?qr=CODIGO suma puntos, ?ref=CODIGO referido)
//   /admin            → panel del comercio (dueño y cajeros)
//   /creador          → panel del creador de la plataforma
export type Route =
  | { kind: 'landing' }
  | { kind: 'store'; storeId: string }
  | { kind: 'admin'; storeId?: string }
  | { kind: 'creator' };

export const parseRoute = (): Route => {
  const parts = window.location.pathname.split('/').filter(Boolean).map(p => decodeURIComponent(p).toLowerCase());
  if (parts[0] === 'c' && parts[1]) return { kind: 'store', storeId: parts[1] };
  if (parts[0] === 'admin') return { kind: 'admin', storeId: parts[1] };
  if (parts[0] === 'creador') return { kind: 'creator' };
  return { kind: 'landing' };
};

export const queryParam = (key: string) => new URLSearchParams(window.location.search).get(key) || '';

export const removeQueryParam = (key: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, '', url.pathname + url.search);
};

export const storeUrl = (storeId: string) => `${window.location.origin}/c/${storeId}`;
