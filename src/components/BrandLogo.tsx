import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  withGlow = false,
}) => {
  const baseSize = sizeClasses[size];
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const svgUrl = `${base}/assets/brand-logo.svg`;
  const pngUrl = `${base}/assets/brand-logo.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${baseSize} ${className}`}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full bg-blue-500/20 blur-md scale-110 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <img
        src={svgUrl}
        alt="Shubham Sonale - Brand Logo"
        width={500}
        height={500}
        className="w-full h-full object-contain drop-shadow-2xs transition-transform duration-200 group-hover:scale-105"
        referrerPolicy="no-referrer"
        loading="eager"
        onError={(e) => {
          // Fallback to PNG if SVG encounters any issues
          const target = e.currentTarget;
          if (target.src !== pngUrl) {
            target.src = pngUrl;
          }
        }}
      />
    </div>
  );
};
