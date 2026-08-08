import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Settings, QrCode, Store, MapPin, Save, Check, ExternalLink, Share2, Copy, Globe, Instagram, Phone, Mail, Zap, Lock } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings, branches } = useLoyalty();

  const [name, setName] = useState(storeSettings.name);
  const [brandName, setBrandName] = useState(storeSettings.brandName || 'TuMarca');
  const [logoUrl, setLogoUrl] = useState(storeSettings.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(storeSettings.primaryColor);
  const [pointsPerPeso, setPointsPerPeso] = useState(storeSettings.pointsPerPeso);
  const [welcomePoints, setWelcomePoints] = useState(storeSettings.welcomePoints);
  const [ownerPin, setOwnerPin] = useState(storeSettings.ownerPin || '1234');

  // Contact & Social fields requested by user
  const [instagramUrl, setInstagramUrl] = useState(storeSettings.instagramUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(storeSettings.websiteUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings.whatsappNumber || '');
  const [contactEmail, setContactEmail] = useState(storeSettings.contactEmail || '');
  const [poweredByText, setPoweredByText] = useState(storeSettings.poweredByText || 'TuMarca');
  const [poweredByUrl, setPoweredByUrl] = useState(storeSettings.poweredByUrl || '');

  const [savedMsg, setSavedMsg] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      name,
      brandName: brandName || 'TuMarca',
      logoUrl,
      primaryColor,
      pointsPerPeso,
      welcomePoints,
      ownerPin: ownerPin || '1234',
      instagramUrl,
      websiteUrl,
      whatsappNumber,
      contactEmail,
      poweredByText,
      poweredByUrl
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const clientAccessUrl = `${window.location.origin}/?role=client`;
  const adminAccessUrl = `${window.location.origin}/?role=admin`;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const getQrUrl = (url: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded-full">
            Ajustes del Sistema
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Configuración del Comercio & Enlaces QR
          </h1>
          <p className="text-xs text-slate-500">
            Personalizá la identidad visual de tu marca, las sucursales y gestioná los accesos QR para clientes y administradores.
          </p>
        </div>
        <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center font-bold">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand & Points Settings */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Store className="w-5 h-5 text-sky-600" />
            <span>Datos de la Empresa</span>
          </h3>

          {savedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>¡Configuración guardada correctamente!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Fantasía del Comercio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. TuMarca Fidelización"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Logo del Comercio (Imagen JPG / PNG)
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.jpg"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="flex items-center space-x-2">
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer border border-slate-200 transition">
                  <span>📁 Cargar JPG/PNG desde la PC</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setLogoUrl(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl transition"
                  >
                    Usar 'TuMarca' por defecto
                  </button>
                )}
              </div>

              {/* Logo Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Vista Previa del Logo:</span>
                <div className="h-10 px-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                  ) : (
                    <span className="text-sm font-black text-sky-600 tracking-tight">TuMarca</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Regla de Conversión Puntos vs Pesos */}
          <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-sky-900 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-sky-600" />
                <span>Regla de Acumulación: ¿Cuántos $ Pesos valen Puntos?</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full border border-sky-300">
                Regla Principal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesos ($) necesarios para acumular 1 Punto
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={pointsPerPeso > 0 ? (1 / pointsPerPeso) : 10}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val > 0) {
                        setPointsPerPeso(1 / val);
                      }
                    }}
                    placeholder="Ej. 10"
                    className="w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ejemplo: Si ponés <b>10</b>, por cada $10 gastados el cliente suma 1 punto.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Puntos de Bienvenida (Regalo al registrarse)
                </label>
                <input
                  type="number"
                  min="0"
                  value={welcomePoints}
                  onChange={e => setWelcomePoints(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Puntos iniciales que recibe un cliente nuevo como regalo.
                </p>
              </div>
            </div>

            {/* Ejemplos dinámicos en tiempo real */}
            <div className="p-3 bg-white/90 border border-sky-100 rounded-xl text-xs text-slate-700 space-y-1">
              <span className="font-bold text-sky-900 block text-[11px] uppercase tracking-wider">
                Simulación en vivo para tu negocio:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 font-medium">
                <span>• Compra de <b>$1.000</b> = <span className="text-sky-600 font-bold">{Math.round(1000 * pointsPerPeso)} pts</span></span>
                <span>• Compra de <b>$5.000</b> = <span className="text-sky-600 font-bold">{Math.round(5000 * pointsPerPeso)} pts</span></span>
                <span>• Compra de <b>$20.000</b> = <span className="text-sky-600 font-bold">{Math.round(20000 * pointsPerPeso)} pts</span></span>
              </div>
            </div>
          </div>

          {/* Configuración de Clave de Seguridad / Acceso Dueño */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Seguridad: Clave de Acceso al Panel de Comercio</span>
              </h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-300">
                Acceso Dueño
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clave de Comercio (Por defecto: 1234)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ownerPin}
                  onChange={e => setOwnerPin(e.target.value)}
                  placeholder="Ej. 1234"
                  className="w-full max-w-xs px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Esta es la clave confidencial necesaria para ingresar al Panel de Dueño desde el portal del cliente. Podés cambiarla en cualquier momento.
              </p>
            </div>
          </div>

          {/* Contact Data & Social Links Section requested by user */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Redes Sociales & Datos de Contacto</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>URL Instagram</span>
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/tumarca"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>Sitio Web / Tienda</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://tumarca.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp / Teléfono</span>
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="+5491112345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Email de Contacto</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contacto@tumarca.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold text-slate-700 block">Texto Pie de Página (Powered By):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nombre Marca / Sistema</label>
                  <input
                    type="text"
                    value={poweredByText}
                    onChange={e => {
                      setPoweredByText(e.target.value);
                      setBrandName(e.target.value);
                    }}
                    placeholder="Ej. TuMarca"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">URL al Hacer Clic</label>
                  <input
                    type="url"
                    value={poweredByUrl}
                    onChange={e => setPoweredByUrl(e.target.value)}
                    placeholder="https://tumarca.com"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>

        {/* Separated Links & QRs - Fulfilling User Request */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center space-x-2 border-b border-slate-100 pb-3">
            <QrCode className="w-5 h-5 text-sky-600" />
            <span>Accesos Separados por Link o QR</span>
          </h3>

          {/* Client Access */}
          <div className="space-y-3 p-4 bg-sky-50/70 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Ingreso Clientes</span>
                <h4 className="font-extrabold text-slate-800 text-sm">QR de Registro en Mostrador</h4>
              </div>
              <img src={getQrUrl(clientAccessUrl)} alt="QR Cliente" className="w-14 h-14 object-contain rounded-lg border bg-white p-1" />
            </div>

            <p className="text-[11px] text-slate-500">
              Imprimí este QR para que tus clientes lo escaneen en la caja e ingresen a la WebApp.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(clientAccessUrl)}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
              >
                {copiedLink === clientAccessUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === clientAccessUrl ? 'Copiado' : 'Copiar Link Cliente'}</span>
              </button>
            </div>
          </div>

          {/* Admin Access */}
          <div className="space-y-3 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Ingreso Administrador</span>
                <h4 className="font-extrabold text-slate-800 text-sm">Portal del Comercio</h4>
              </div>
              <img src={getQrUrl(adminAccessUrl)} alt="QR Admin" className="w-14 h-14 object-contain rounded-lg border bg-white p-1" />
            </div>

            <p className="text-[11px] text-slate-500">
              Acceso exclusivo para el dueño del comercio y sus cajeros.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(adminAccessUrl)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
              >
                {copiedLink === adminAccessUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === adminAccessUrl ? 'Copiado' : 'Copiar Link Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
