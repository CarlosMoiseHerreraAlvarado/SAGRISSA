import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(element => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const content = (
    <div 
      role="presentation" 
      className="fixed inset-0 z-[100] flex items-end bg-slate-950/70 backdrop-blur-sm p-0 md:items-center md:justify-center md:p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <section 
        ref={dialogRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="bottom-sheet-title" 
        onClick={event => event.stopPropagation()} 
        className="w-full max-h-[90dvh] flex flex-col rounded-t-[36px] bg-white dark:bg-slate-900 border-t md:border border-surface-border dark:border-slate-800 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:max-w-lg md:rounded-[36px] shadow-2xl animate-in slide-in-from-bottom-6 duration-200"
      >
        <div className="mb-4 flex items-center justify-between gap-4 pb-2 border-b border-surface-border dark:border-slate-800">
          <h2 id="bottom-sheet-title" className="text-base font-black text-ink dark:text-white truncate">{title}</h2>
          <button 
            ref={closeButtonRef} 
            type="button" 
            onClick={onClose} 
            aria-label="Cerrar" 
            className="min-h-10 min-w-10 rounded-full text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface-soft dark:hover:bg-slate-800 flex items-center justify-center text-xl transition-colors"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </section>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}
