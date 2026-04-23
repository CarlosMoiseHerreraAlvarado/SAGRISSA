import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardShadow = 'none' | 'sm' | 'md' | 'hover';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: CardShadow;
  interactive?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const shadowClasses: Record<CardShadow, string> = {
  none: '',
  sm: 'shadow-card',
  md: 'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  hover: 'shadow-card hover:shadow-card-hover',
};

const radiusClasses: Record<string, string> = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  xl: 'rounded-[32px]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    padding = 'md', 
    shadow = 'sm', 
    interactive = false,
    radius = 'lg',
    ...props 
  }, ref) => {
    const classes = [
      'bg-white border border-slate-100',
      paddingClasses[padding],
      shadowClasses[shadow],
      radiusClasses[radius],
      interactive ? 'cursor-pointer transition-all duration-300 hover:border-brand-blue/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
