import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div role="status" className="safe-top fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-2 bg-red-500 px-4 py-2 text-white shadow-smooth-md animate-in slide-in-from-top-full duration-300">
      <WifiOff size={16} aria-hidden="true" />
      <span className="text-sm font-semibold tracking-wide">Sin conexión a Internet. Modo Offline.</span>
    </div>
  );
};
