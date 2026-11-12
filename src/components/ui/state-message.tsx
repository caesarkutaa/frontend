import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'error' | 'navy' | 'gold';

const tones: Record<Tone, string> = {
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  navy: 'bg-navy text-gold',
  gold: 'bg-gold text-navy',
};

interface StateMessageProps {
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  description?: ReactNode;
  children?: ReactNode; // action buttons
}

/** Centered full-page message: success, error, empty or waiting states */
export function StateMessage({ icon: Icon, tone = 'navy', title, description, children }: StateMessageProps) {
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      <span className={cn('flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20', tones[tone])}>
        <Icon size={32} />
      </span>
      <h1 className="mt-6 text-2xl font-medium sm:text-3xl">{title}</h1>
      <div className="mx-auto mt-3 h-0.5 w-14 bg-gold" />
      {description && (
        <div className="mt-4 max-w-md text-sm leading-relaxed text-navy/65 sm:text-base">
          {description}
        </div>
      )}
      {children && (
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 xs:w-auto xs:flex-row xs:items-center">
          {children}
        </div>
      )}
    </div>
  );
}