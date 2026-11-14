import React, { useState, useEffect } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

export const PromoModal: React.FC<{ onNavigateToSection?: (section: string) => void }> = ({ onNavigateToSection }) => {
  const { popupBanner, currentRole } = useLoyalty();
  const [isOpen, setIsOpen] = useState(false);

  // Se muestra una vez por sesión (no vuelve a abrirse cada vez que llegan datos nuevos)
  const sessionKey = `fidelia_popup_${popupBanner?.title || ''}`;
  useEffect(() => {
    if (popupBanner?.isActive && popupBanner.title && currentRole === 'client') {
      if (popupBanner.showOncePerSession !== false && sessionStorage.getItem(sessionKey)) return;
      setIsOpen(true);
    }
  }, [popupBanner?.isActive, popupBanner?.title, currentRole]);

  if (!isOpen || !popupBanner || !popupBanner.isActive || currentRole !== 'client') return null;

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      /* sin almacenamiento */
    }
  };

  const handleCtaClick = () => {
    handleClose();
    if (popupBanner.ctaAction && onNavigateToSection) {
      onNavigateToSection(popupBanner.ctaAction);
    } else if (popupBanner.ctaLink) {
      window.open(popupBanner.ctaLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-250 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 flex items-center justify-center transition shadow-lg backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image / Banner */}
        {popupBanner.imageUrl && (
          <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
            <img
              src={popupBanner.imageUrl}
              alt={popupBanner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="px-2.5 py-1 bg-sky-500/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-full backdrop-blur-md inline-flex items-center space-x-1 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Novedad Exclusiva</span>
              </span>
              <h3 className="font-extrabold text-xl leading-tight text-white drop-shadow-sm">
                {popupBanner.title}
              </h3>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {!popupBanner.imageUrl && (
            <div className="space-y-1">
              <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-[10px] uppercase tracking-wider rounded-full inline-block">
                Anuncio Especial
              </span>
              <h3 className="font-extrabold text-2xl text-slate-800">
                {popupBanner.title}
              </h3>
            </div>
          )}

          <p className="text-slate-600 text-sm leading-relaxed">
            {popupBanner.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCtaClick}
              className="w-full sm:flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>{popupBanner.ctaText || 'Ver beneficio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
