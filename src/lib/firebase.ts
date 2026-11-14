import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'es';
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const EMAIL_KEY = 'fidelia_email_for_signin';

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    // Celulares o navegadores que bloquean ventanas emergentes
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
};

// Envía un link de acceso al email (sin contraseña). Al tocarlo, vuelve a esta misma página.
export const sendEmailLoginLink = async (email: string) => {
  const url = new URL(window.location.href);
  ['apiKey', 'oobCode', 'mode', 'lang'].forEach(k => url.searchParams.delete(k));
  await sendSignInLinkToEmail(auth, email, { url: url.toString(), handleCodeInApp: true });
  localStorage.setItem(EMAIL_KEY, email);
};

// Si la página se abrió desde el link del email, completa el ingreso
export const completeEmailLinkLogin = async (): Promise<'none' | 'done' | 'need_email'> => {
  if (!isSignInWithEmailLink(auth, window.location.href)) return 'none';
  const email = localStorage.getItem(EMAIL_KEY);
  if (!email) return 'need_email';
  await finishEmailLink(email);
  return 'done';
};

export const finishEmailLink = async (email: string) => {
  await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem(EMAIL_KEY);
  const url = new URL(window.location.href);
  ['apiKey', 'oobCode', 'mode', 'lang', 'continueUrl'].forEach(k => url.searchParams.delete(k));
  window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
};

export const logout = () => signOut(auth);

export const authErrorMessage = (err: any) => {
  const code = err?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Cerraste la ventana antes de terminar.';
  if (code === 'auth/invalid-email') return 'El email no es válido.';
  if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') return 'El link ya se usó o venció. Pedí uno nuevo.';
  if (code === 'auth/unauthorized-domain') return 'Este dominio no está autorizado en Firebase (Authentication → Settings → Authorized domains).';
  if (code === 'auth/operation-not-allowed') return 'Este método de ingreso no está activado en Firebase.';
  if (code === 'auth/quota-exceeded') return 'Se alcanzó el límite diario de emails. Probá con Google o más tarde.';
  return err?.message || 'No se pudo iniciar sesión.';
};
