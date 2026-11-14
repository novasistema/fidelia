import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import { AuthPanel } from '../common/AuthPanel';
import { errMsg } from '../../lib/api';
import { queryParam } from '../../lib/route';
import { UserCheck, LogOut } from 'lucide-react';

// Paso 1: ingresar (Google o email). Paso 2: completar los datos para sumarse al club del comercio.
export const ClientLogin: React.FC = () => {
  const { storeSettings, authUser, registerCustomer, logout } = useLoyalty();

  const names = (authUser?.displayName || '').split(' ');
  const [name, setName] = useState(names[0] || '');
  const [lastName, setLastName] = useState(names.slice(1).join(' '));
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [referralCode, setReferralCode] = useState(() => queryParam('ref').toUpperCase());
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!accept) {
      setError('Aceptá los términos del programa para continuar.');
      return;
    }
    setBusy(true);
    try {
      await registerCustomer({ name, lastName, dni, phone, birthDate, gender, referralCode });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <div className="w-full max-w-md mx-auto my-auto p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Sumá puntos y canjealos por premios en <strong className="text-slate-800">{storeSettings.name}</strong>.
          </p>
        </div>

        {!authUser ? (
          <AuthPanel title="Ingresá o registrate" subtitle="Usá tu cuenta de Google o tu email." />
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="text-center">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                Completá tus datos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Una sola vez. Con tu DNI te identifican en la caja. Ganás <strong>{storeSettings.welcomePoints || 0} puntos</strong> de bienvenida.
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={input} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido *</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)} className={input} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">DNI / CUIT *</label>
              <input required inputMode="numeric" value={dni} onChange={e => setDni(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Sin puntos ni guiones" className={input} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Celular</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Para avisos por WhatsApp" className={input} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nacimiento</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Género</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className={input}>
                  <option value="">Prefiero no decir</option>
                  <option>Femenino</option>
                  <option>Masculino</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código de invitación</label>
                <input value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} placeholder="Opcional" className={input} />
              </div>
            </div>

            <label className="flex items-start gap-2 text-[11px] text-slate-600">
              <input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} className="mt-0.5" />
              <span>Acepto sumarme al programa de puntos de {storeSettings.name} y que usen mis datos para administrarlo y avisarme de promociones.</span>
            </label>

            <button type="submit" disabled={busy} className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition">
              {busy ? 'Registrando...' : 'Sumarme y recibir mis puntos'}
            </button>

            <button type="button" onClick={() => logout()} className="w-full text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              No soy {authUser.email} · salir
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
