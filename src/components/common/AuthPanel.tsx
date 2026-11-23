import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, User, Lock } from 'lucide-react';
import { queryParam } from '../../lib/route';
import { useLoyalty } from '../../context/LoyaltyContext';
import { loginWithGoogle, sendEmailLoginLink, finishEmailLink, authErrorMessage, loginWithUserPassword } from '../../lib/firebase';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

// Ingreso sin contraseña: Google o link por email
export const AuthPanel: React.FC<{ title?: string; subtitle?: string; allowUserPassword?: boolean }> = ({ title, subtitle, allowUserPassword }) => {
  const { emailLinkNeedsEmail, setEmailLinkNeedsEmail } = useLoyalty();
  const demoFromLink = queryParam('demo') === '1';
  const [showUserPass, setShowUserPass] = useState(!!allowUserPassword && demoFromLink);
  const [userName, setUserName] = useState(demoFromLink ? 'demo' : '');
  const [password, setPassword] = useState(demoFromLink ? 'demo' : '');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const google = async () => {
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Ingresá un email válido.');
      return;
    }
    setBusy(true);
    try {
      if (emailLinkNeedsEmail) {
        await finishEmailLink(clean);
        setEmailLinkNeedsEmail(false);
      } else {
        await sendEmailLoginLink(clean);
        setSent(true);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const userPassLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await loginWithUserPassword(userName, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (showUserPass) {
    const inp = 'w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
    return (
      <form onSubmit={userPassLogin} className="space-y-3">
        {(title || subtitle) && (
          <div className="text-center">
            {title && <h3 className="font-extrabold text-slate-800 text-lg">{title}</h3>}
            <p className="text-xs text-slate-500 mt-1">Ingresá con usuario y contraseña.</p>
          </div>
        )}
        {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">{error}</div>}
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Usuario" autoCapitalize="none" autoComplete="username" className={inp} />
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" autoComplete="current-password" className={inp} />
        </div>
        <button type="submit" disabled={busy} className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm">
          {busy ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={() => setShowUserPass(false)} className="w-full text-xs font-bold text-slate-500 hover:text-slate-800">
          Volver a Google / email
        </button>
      </form>
    );
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="font-extrabold text-slate-800">Revisá tu email</h3>
        <p className="text-xs text-slate-600">
          Te mandamos un link a <strong>{email}</strong>. Tocalo desde este mismo celular o computadora para entrar.
          Si no lo ves, buscá en Spam o Promociones.
        </p>
        <button onClick={() => setSent(false)} className="text-xs font-bold text-sky-600 hover:underline">
          Usar otro email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="text-center">
          {title && <h3 className="font-extrabold text-slate-800 text-lg">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">{error}</div>}

      {emailLinkNeedsEmail && (
        <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
          Abriste el link en otro dispositivo. Confirmá tu email para terminar de entrar.
        </div>
      )}

      {!emailLinkNeedsEmail && (
        <>
          <button
            onClick={google}
            disabled={busy}
            className="w-full py-3 bg-white hover:bg-slate-50 disabled:opacity-60 border border-slate-300 text-slate-800 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xs transition"
          >
            <GoogleIcon />
            <span>Continuar con Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white px-3 text-slate-400 font-bold">o con tu email</span></div>
          </div>
        </>
      )}

      <form onSubmit={sendLink} className="space-y-3">
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition"
        >
          <span>{busy ? 'Un momento...' : emailLinkNeedsEmail ? 'Confirmar y entrar' : 'Enviarme un link para entrar'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {!emailLinkNeedsEmail && <p className="text-[11px] text-slate-400 text-center">Sin contraseñas: te llega un link por email y entrás con un toque.</p>}
      </form>

      {allowUserPassword && !emailLinkNeedsEmail && (
        <button onClick={() => setShowUserPass(true)} className="w-full text-xs font-bold text-sky-600 hover:underline">
          Entrar con usuario y contraseña
        </button>
      )}
    </div>
  );
};
