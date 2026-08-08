import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Megaphone, Image as ImageIcon, Eye, Save, Check, Sparkles, AlertCircle } from 'lucide-react';

export const AdminPopupManager: React.FC = () => {
  const { popupBanner, updatePopupBanner } = useLoyalty();

  const [title, setTitle] = useState(popupBanner.title);
  const [description, setDescription] = useState(popupBanner.description);
  const [imageUrl, setImageUrl] = useState(popupBanner.imageUrl);
  const [ctaText, setCtaText] = useState(popupBanner.ctaText);
  const [ctaAction, setCtaAction] = useState(popupBanner.ctaAction || 'catalog');
  const [isActive, setIsActive] = useState(popupBanner.isActive);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePopupBanner({
      title,
      description,
      imageUrl,
      ctaText,
      ctaAction: ctaAction as any,
      isActive
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Publicidad de Entrada
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Pop-up Publicitario para Clientes
          </h1>
          <p className="text-xs text-slate-500">
            Configurá el aviso promocional desplegable que se mostrará automáticamente a tus clientes cuando ingresen al portal.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <Megaphone className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-base">
              Configuración del Pop-up
            </h3>

            {/* Active Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">
                {isActive ? 'Publicidad Activa' : 'Inactiva'}
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 relative"></div>
            </label>
          </div>

          {savedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>¡Pop-up guardado y actualizado para todos los clientes!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título Principal *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. ¡Lunes de Doble Puntos!"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción o Mensaje Promocional *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Escribí el texto que verá el cliente..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL de Imagen / Banner Promocional
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Podés pegar cualquier enlace de imagen o banner promocional de tu marca.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto del Botón (CTA)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                placeholder="Ver beneficio"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Acción al hacer click
              </label>
              <select
                value={ctaAction}
                onChange={e => setCtaAction(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="catalog">Ir al Catálogo de Premios</option>
                <option value="surveys">Ir a Encuestas</option>
                <option value="raffles">Ir a Sorteos</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Publicar Pop-up</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Vista previa del Pop-up (Tal como lo verá el cliente)</span>
          </h3>

          <div className="bg-slate-900/10 p-6 rounded-3xl border border-dashed border-slate-300 flex items-center justify-center min-h-[380px]">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-100 relative">
              {imageUrl && (
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="px-2 py-0.5 bg-sky-500 text-white font-bold text-[9px] uppercase rounded-full">
                      Novedad Exclusiva
                    </span>
                    <h4 className="font-extrabold text-base leading-tight mt-1">
                      {title || 'Título de ejemplo'}
                    </h4>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3">
                {!imageUrl && (
                  <h4 className="font-extrabold text-slate-800 text-lg">
                    {title || 'Título de ejemplo'}
                  </h4>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">
                  {description || 'Aquí aparecerá el texto de la promoción...'}
                </p>

                <div className="pt-2">
                  <button className="w-full py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm">
                    {ctaText || 'Ver beneficio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
