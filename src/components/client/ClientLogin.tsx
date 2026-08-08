import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { BrandLogo } from '../common/BrandLogo';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Rocket, ShieldCheck, ArrowRight, UserCheck, Calendar, Lock, Mail, CreditCard, ChevronLeft, Building2, Cloud } from 'lucide-react';

export const ClientLogin: React.FC = () => {
  const { storeSettings, loginCustomer, registerCustomer, setCurrentCustomer, customers } = useLoyalty();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        let found = customers.find(c => c.email.toLowerCase() === user.email?.toLowerCase());
        if (!found) {
          const names = (user.displayName || 'Cliente Google').split(' ');
          const name = names[0] || 'Cliente';
          const lastName = names.slice(1).join(' ') || 'Google';
          found = registerCustomer({
            name,
            lastName,
            email: user.email,
            dni: user.uid.slice(0, 8),
            phone: user.phoneNumber || '',
            avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
          });
        }
        setCurrentCustomer(found);
      }
    } catch (err) {
      console.warn('Google Sign In note:', err);
      // Fallback in case popups are blocked in iframe
      loginCustomer('comerciopruebatdp@gmail.com');
    }
  };

  // Login form state
  const [loginEmailOrDni, setLoginEmailOrDni] = useState('comerciopruebatdp@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regGender, setRegGender] = useState('');
  
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmailOrDni) {
      setLoginError('Por favor ingresá tu email o DNI.');
      return;
    }
    const customer = loginCustomer(loginEmailOrDni);
    if (!customer) {
      setLoginError('No se encontró un cliente con ese email o DNI. Registrate a continuación.');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (registerStep === 1) {
      if (!regName || !regLastName) {
        setRegError('Ingresá tu nombre y apellido para continuar.');
        return;
      }
      setRegisterStep(2);
    } else if (registerStep === 2) {
      if (!regEmail || !regDni) {
        setRegError('Ingresá tu email y DNI.');
        return;
      }
      setRegisterStep(3);
    } else if (registerStep === 3) {
      if (!regPassword || regPassword.length < 4) {
        setRegError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setRegError('Las contraseñas no coinciden.');
        return;
      }

      // Complete registration
      const newCust = registerCustomer({
        name: regName,
        lastName: regLastName,
        email: regEmail,
        dni: regDni,
        phone: regPhone,
        birthDate: regBirthDate,
        gender: regGender
      });
      setCurrentCustomer(newCust);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        {/* Brand Logo Header - matching uploaded photo 1 */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Sumá puntos y alcanzá increíbles premios en <strong className="text-slate-800">{storeSettings.name}</strong>.
          </p>
        </div>

        {!isRegistering ? (
          /* LOGIN FORM - Exact match to Photo 1 */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email o DNI / CUIT / CUIL
              </label>
              <input
                type="text"
                value={loginEmailOrDni}
                onChange={e => setLoginEmailOrDni(e.target.value)}
                placeholder="comerciopruebatdp@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert('Se envió un correo de recuperación a tu casilla.')}
                  className="text-xs text-sky-600 hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-2"
            >
              Ingresar
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleLoginSubmit({ preventDefault: () => {} } as any)}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                Ingresar sin contraseña
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">o continuá con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl flex items-center justify-center space-x-2 text-xs shadow-xs transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="pt-4 text-center border-t border-slate-100 text-xs">
              <span className="text-slate-500">¿No tenés cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setRegisterStep(1);
                }}
                className="text-sky-600 font-bold hover:underline"
              >
                Registrate
              </button>
            </div>
          </form>
        ) : (
          /* MULTI-STEP REGISTRATION FORM */
          <form onSubmit={handleNextStep} className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (registerStep > 1) setRegisterStep(registerStep - 1);
                  else setIsRegistering(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <h3 className="font-bold text-slate-800 text-lg">Registro</h3>
              <span className="w-8"></span>
            </div>

            {/* Step Indicators 1 - 2 - 3 */}
            <div className="flex items-center justify-center space-x-4 my-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                registerStep === 1 ? 'bg-sky-500 text-white shadow' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </div>
              <div className="w-8 h-0.5 bg-slate-200"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                registerStep === 2 ? 'bg-sky-500 text-white shadow' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </div>
              <div className="w-8 h-0.5 bg-slate-200"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                registerStep === 3 ? 'bg-sky-500 text-white shadow' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </div>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">
                {regError}
              </div>
            )}

            {registerStep === 1 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h4 className="font-bold text-slate-800 text-sm">Datos personales</h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Ej. María"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={e => setRegLastName(e.target.value)}
                    placeholder="Ej. García"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de nacimiento *</label>
                  <input
                    type="date"
                    value={regBirthDate}
                    onChange={e => setRegBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Género *</label>
                  <select
                    value={regGender}
                    onChange={e => setRegGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            )}

            {registerStep === 2 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h4 className="font-bold text-slate-800 text-sm">Identificación y Contacto</h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">DNI / CUIT / CUIL *</label>
                  <input
                    type="text"
                    value={regDni}
                    onChange={e => setRegDni(e.target.value)}
                    placeholder="Ej. 38123456"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="maria.garcia@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {registerStep === 3 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h4 className="font-bold text-slate-800 text-sm">Contraseña y Seguridad</h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar contraseña *</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
                  🎁 <strong>¡Premio especial de bienvenida!</strong> Recibirás 100 puntos extra gratis al completar tu registro.
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center space-x-1"
            >
              <span>{registerStep === 3 ? 'Completar Registro' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs">
              <span className="text-slate-500">¿Ya tenés una cuenta? </span>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-sky-600 font-bold hover:underline"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

