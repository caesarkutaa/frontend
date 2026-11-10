'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  size = 'md',
}: QuantityStepperProps) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11 sm:h-12 sm:w-12';
  const text = size === 'sm' ? 'w-9 text-sm' : 'w-11 text-base sm:w-12';

  return (
    <div
      className={cn(
        'inline-flex items-center border border-navy/25 bg-white',
        disabled && 'opacity-50',
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={cn(
          'flex items-center justify-center text-navy hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40',
          box,
        )}
      >
        <Minus size={14} />
      </button>
      <span
        className={cn('text-center font-semibold tabular-nums text-navy', text)}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(
          'flex items-center justify-center text-navy hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40',
          box,
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}