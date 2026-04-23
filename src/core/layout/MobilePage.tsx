import type { ReactNode } from 'react';

interface MobilePageProps {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
  bgClass?: string;
}

export function MobilePage({
  children,
  className = '',
  bgClass = 'bg-white md:bg-transparent',
}: MobilePageProps) {
  return (
    <div className={`w-full min-h-full flex justify-center overflow-x-hidden ${bgClass} ${className}`}>

      <div className="w-full xl:max-w-6xl flex flex-col relative md:pt-8 md:px-8">
        {children}
      </div>
    </div>
  );
}
