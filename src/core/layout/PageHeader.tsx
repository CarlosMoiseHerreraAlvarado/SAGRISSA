import type { ReactNode } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  actions?: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backPath,
  actions,
  sticky = true,
  transparent = false,
  className = '',
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleSettings = () => {
    navigate('/app/config');
  };

  return (
    <header
      className={`
        px-6 py-5 flex items-center justify-between z-40
        ${sticky ? 'sticky top-0' : ''}
        ${transparent ? 'bg-transparent' : 'bg-white'}
        border-b border-slate-100
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={handleSettings}
          className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
