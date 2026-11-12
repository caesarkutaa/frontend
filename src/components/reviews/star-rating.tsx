'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Read-only stars with partial fill (e.g. 4.3) */
export function StarRating({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-gold/30" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-gold" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Clickable 1–5 star picker */
export function StarInput({ value, onChange, size = 30 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''} — ${LABELS[i - 1]}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-110"
          >
            <Star size={size} strokeWidth={1.5} className={i <= shown ? 'text-gold' : 'text-navy/25'} fill={i <= shown ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      {shown > 0 && <span className="text-sm font-semibold text-gold-dark">{LABELS[shown - 1]}</span>}
    </div>
  );
}