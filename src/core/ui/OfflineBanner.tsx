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
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-smooth-md animate-in slide-in-from-top-full duration-300">
      <WifiOff size={16} />
      <span className="text-sm font-semibold tracking-wide">Sin conexión a Internet. Modo Offline.</span>
    </div>
  );
};
