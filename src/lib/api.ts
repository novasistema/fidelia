import { auth } from './firebase';

export class ApiCallError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Llama al servidor seguro de Fidelia con el token de la sesión actual
export const callApi = async <T = any>(action: string, body: Record<string, any> = {}): Promise<T> => {
  const user = auth.currentUser;
  if (!user) throw new ApiCallError(401, 'Iniciá sesión para continuar.');
  const token = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch('/api/fidelia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...body })
    });
  } catch {
    throw new ApiCallError(0, 'Sin conexión. Revisá tu internet e intentá de nuevo.');
  }
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* respuesta vacía */
  }
  if (!res.ok || data.ok === false) throw new ApiCallError(res.status, data.error || `Error ${res.status}`);
  return data as T;
};

export const errMsg = (e: any) => (e instanceof Error ? e.message : String(e || 'Error inesperado'));
