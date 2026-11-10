'use client';

import { useId, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
  hint?: string;
}

const fieldBase =
  'h-11 w-full border bg-white text-sm text-navy outline-none transition-colors placeholder:text-navy/35 focus:border-gold';

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        className={cn(fieldBase, 'px-3.5', error ? 'border-error' : 'border-navy/20', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-navy/50">{hint}</p>
      ) : null}
    </div>
  );
}

/** Same as Input, with a show/hide toggle */
export function PasswordInput({ label, error, hint, className, id, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error}
          className={cn(
            fieldBase,
            'pl-3.5 pr-11',
            error ? 'border-error' : 'border-navy/20',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-navy/50 hover:text-gold-dark"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-navy/50">{hint}</p>
      ) : null}
    </div>
  );
}