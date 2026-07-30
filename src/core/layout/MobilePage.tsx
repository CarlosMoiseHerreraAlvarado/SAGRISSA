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
    <div className={`flex min-h-full w-full min-w-0 justify-center overflow-x-hidden ${bgClass} ${className}`}>
      <div className="relative flex w-full min-w-0 max-w-[1600px] flex-col md:px-8 md:pt-8 xl:max-w-6xl">
        {children}
      </div>
    </div>
  );
}
