import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  onClear,
  className = '',
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div
      className={`
        flex items-center bg-slate-50 border border-slate-200 rounded-2xl 
        px-4 py-3 transition-all focus-within:ring-2 
        focus-within:ring-brand-blue/15 focus-within:bg-white focus-within:border-brand-blue/30
        ${className}
      `}
    >
      <Search size={18} className="text-slate-400 mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
      />
      {value && (
        <button
          onClick={handleClear}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
