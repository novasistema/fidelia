// Conexión del servidor a Firebase con credenciales de administrador (variable FIREBASE_SERVICE_ACCOUNT en Vercel)
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { DB, Tx } from './core.js';

// Base de datos de Firestore del proyecto (la crea AI Studio con un id propio)
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || 'ai-studio-tiendadepuntosfi-5293aa81-62e6-44e0-bcb3-de3e1a357149';

let app: App | undefined;
let fs: Firestore | undefined;

const getApp = () => {
  if (app) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Falta configurar FIREBASE_SERVICE_ACCOUNT en Vercel.');
  const sa = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
  app = getApps()[0] || initializeApp({ credential: cert(sa) });
  return app;
};

export const adminAuth = () => getAuth(getApp());

const firestore = () => {
  if (fs) return fs;
  fs = getFirestore(getApp(), DATABASE_ID);
  fs.settings({ ignoreUndefinedProperties: true });
  return fs;
};

export const adminDb: DB = {
  run: fn =>
    firestore().runTransaction(async t => {
      const db = firestore();
      const tx: Tx = {
        get: async path => {
          const s = await t.get(db.doc(path));
          return s.exists ? s.data() : null;
        },
        query: async (col, field, value) => {
          const s = await t.get(db.collection(col).where(field, '==', value).limit(50));
          return s.docs.map(d => ({ id: d.id, data: d.data() }));
        },
        set: (path, data) => {
          t.set(db.doc(path), data);
        },
        update: (path, data) => {
          t.update(db.doc(path), data);
        },
        delete: path => {
          t.delete(db.doc(path));
        }
      };
      return fn(tx);
    })
};
