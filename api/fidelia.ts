// POST /api/fidelia { action, ...datos }  ·  Header: Authorization: Bearer <token de Firebase>
import { ACTIONS, ApiError, Ctx } from './_lib/core.js';
import { adminAuth, adminDb } from './_lib/db-admin.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Usar POST' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const action = ACTIONS[body.action];
    if (!action) throw new ApiError(400, 'Acción desconocida.');

    const header = String(req.headers?.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new ApiError(401, 'Iniciá sesión para continuar.');
    const authClient = adminAuth(); // si falta la credencial del servidor, avisa con un error claro
    let decoded;
    try {
      decoded = await authClient.verifyIdToken(token);
    } catch {
      throw new ApiError(401, 'Tu sesión venció. Volvé a iniciar sesión.');
    }
    const ctx: Ctx = {
      uid: decoded.uid,
      email: String(decoded.email || '').toLowerCase(),
      emailVerified: decoded.email_verified === true,
      displayName: decoded.name,
      photoURL: decoded.picture
    };

    const result = await action(adminDb, ctx, body);
    res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    const status = err instanceof ApiError ? err.status : 500;
    if (status === 500) console.error('[fidelia]', err);
    res.status(status).json({ ok: false, error: status === 500 ? `Error del servidor: ${err?.message || 'desconocido'}` : err.message });
  }
}
