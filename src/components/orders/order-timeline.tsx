import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { cn, formatDate } from '@/lib/utils';
import type { StatusHistoryEntry } from '@/types';

const LABELS: Record<string, string> = {
  ...PAYMENT_STATUS_LABELS,
  ...ORDER_STATUS_LABELS,
  pending: 'Order placed',
};

export function OrderTimeline({ history }: { history?: StatusHistoryEntry[] }) {
  if (!history?.length) return null;
  const entries = [...history].reverse(); // newest first

  return (
    <ol className="relative ml-2 border-l-2 border-gold/40">
      {entries.map((entry, i) => (
        <li key={`${entry.status}-${entry.at}-${i}`} className="relative pb-6 pl-6 last:pb-0">
          <span
            className={cn(
              'absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2',
              i === 0 ? 'border-gold bg-gold' : 'border-gold/60 bg-white',
            )}
          />
          <p className={cn('text-sm font-semibold', i === 0 ? 'text-navy' : 'text-navy/70')}>
            {LABELS[entry.status] ?? entry.status}
          </p>
          {entry.note && <p className="mt-0.5 text-sm text-navy/65">{entry.note}</p>}
          <p className="mt-1 text-xs text-navy/45">{formatDate(entry.at, true)}</p>
        </li>
      ))}
    </ol>
  );
}