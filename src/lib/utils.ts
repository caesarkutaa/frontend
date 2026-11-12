import { twMerge } from 'tailwind-merge';

/**
 * Joins class names, skipping falsy values, and resolves Tailwind conflicts
 * so the LAST class wins (e.g. 'text-navy' + 'text-gold' -> 'text-gold').
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** 95000 -> ₦95,000 */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount ?? 0);
}

export function formatDate(value: string | Date, withTime = false): string {
  return new Date(value).toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

/** Only allow internal paths after login (prevents open-redirect attacks) */
export function safeRedirect(path: string | null | undefined, fallback = '/'): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}