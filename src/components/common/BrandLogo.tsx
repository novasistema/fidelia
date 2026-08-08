import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import fideliaLogoImg from '../../assets/images/fidelia_system_logo_1786191017639.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '', showTagline = false }) => {
  const { storeSettings } = useLoyalty();

  // Size mapping
  const sizeClasses = {
    sm: { img: 'h-9 max-w-[130px]', icon: 'w-6 h-6', text: 'text-lg', subtext: 'text-[10px]' },
    md: { img: 'h-12 max-w-[180px]', icon: 'w-8 h-8', text: 'text-2xl', subtext: 'text-xs' },
    lg: { img: 'h-20 max-w-[240px]', icon: 'w-11 h-11', text: 'text-3xl', subtext: 'text-sm' },
    xl: { img: 'h-28 max-w-[300px]', icon: 'w-14 h-14', text: 'text-4xl', subtext: 'text-base' }
  }[size];

  // Effective logo URL: if missing or unsplash placeholder, default to Fidelia logo image
  const logoSrc = (storeSettings.logoUrl && !storeSettings.logoUrl.includes('unsplash.com'))
    ? storeSettings.logoUrl
    : fideliaLogoImg;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={logoSrc}
        alt={storeSettings.brandName || storeSettings.name || 'FIDELIA Logo'}
        className={`${sizeClasses.img} object-contain rounded-xl transition-all duration-300`}
        referrerPolicy="no-referrer"
      />
      {showTagline && (
        <p className={`${sizeClasses.subtext} text-slate-500 font-semibold mt-1 text-center`}>
          {storeSettings.name || 'Tu App de Fidelización'}
        </p>
      )}
    </div>
  );
};
