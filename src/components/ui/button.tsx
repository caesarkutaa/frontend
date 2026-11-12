import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  /** Navy with gold text — main call to action */
  primary: 'bg-navy text-gold hover:bg-gold hover:text-navy',
  /** Solid gold */
  gold: 'bg-gold text-navy hover:bg-navy hover:text-gold',
  /** Navy outline */
  outline: 'border border-navy text-navy hover:bg-navy hover:text-gold',
  ghost: 'text-navy hover:bg-surface hover:text-gold-dark',
  danger: 'bg-error text-white hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs sm:text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm sm:h-14 sm:px-8 sm:text-base',
};

/** Use on <Link> to make it look exactly like a Button */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}