import React from 'react';
import fideliaLogoImg from '../../assets/images/fidelia_system_logo_1786191017639.jpg';

interface FideliaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'iconOnly';
  className?: string;
  darkBackground?: boolean;
}

export const FideliaLogo: React.FC<FideliaLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  darkBackground = false,
}) => {
  // Size mappings for image height/width
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const subTextSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  if (variant === 'iconOnly') {
    return (
      <div className={`inline-flex items-center justify-center rounded-full overflow-hidden border-2 border-sky-400/30 shadow-md ${sizeClasses[size]} ${className}`}>
        <img
          src={fideliaLogoImg}
          alt="Fidelia Logo"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center space-x-2.5 ${className}`}>
        <div className={`rounded-full overflow-hidden border border-sky-400/30 shadow-sm flex-shrink-0 ${sizeClasses[size]}`}>
          <img
            src={fideliaLogoImg}
            alt="Fidelia Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${textSizes[size]} ${darkBackground ? 'text-white' : 'text-slate-900'}`}>
            FIDELIA
          </span>
          <span className={`font-bold tracking-wider text-sky-500 uppercase ${subTextSizes[size]}`}>
            TU APP DE FIDELIZACIÓN
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className={`rounded-full overflow-hidden border-4 border-sky-400/20 shadow-xl mb-2 ${sizeClasses[size]}`}>
        <img
          src={fideliaLogoImg}
          alt="FIDELIA - Tu App de Fidelización"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <h2 className={`font-black tracking-tight leading-none ${textSizes[size]} ${darkBackground ? 'text-white' : 'text-slate-900'}`}>
        FIDELIA
      </h2>
      <p className={`font-extrabold tracking-widest text-sky-500 uppercase mt-1 ${subTextSizes[size]}`}>
        TU APP DE FIDELIZACIÓN
      </p>
      <p className={`font-bold tracking-wider uppercase text-slate-400 mt-0.5 ${subTextSizes[size]}`}>
        PUNTOS Y RECOMPENSAS
      </p>
    </div>
  );
};
