import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'energy' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: string;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'kid-button inline-flex items-center justify-center gap-2';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-lg',
    lg: 'px-8 py-4 text-xl',
  };

  const variants = {
    primary: 'kid-button-primary',
    secondary: 'kid-button-secondary',
    accent: 'kid-button-accent',
    energy: 'kid-button-energy',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 shadow-none',
    outline: 'bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 shadow-sm',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}