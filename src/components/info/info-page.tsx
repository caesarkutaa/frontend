import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';

/** Navy header + readable content column for info/policy pages */
export function InfoPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="container-page pt-10 sm:pt-14">{children}</div>
    </div>
  );
}

/** Styled long-form text (no typography plugin needed) */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="max-w-3xl text-sm leading-relaxed text-navy/80 sm:text-base
        [&_a]:font-semibold [&_a]:text-navy [&_a]:underline [&_a]:decoration-gold [&_a]:decoration-2 [&_a]:underline-offset-4 hover:[&_a]:text-gold-dark
        [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-navy first:[&_h2]:mt-0
        [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-navy
        [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3
        [&_strong]:text-navy [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-gold"
    >
      {children}
    </div>
  );
}