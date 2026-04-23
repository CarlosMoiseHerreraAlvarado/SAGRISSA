import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'dark-outline';
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}: ButtonProps) {
  const baseClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    'dark-outline': 'btn-dark-outline'
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClass} ${widthClass} ${className}`.trim()} 
      {...props}
    >
      {children}
    </button>
  );
};
