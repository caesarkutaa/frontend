import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
}

/** Navy banner used at the top of account / order pages */
export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = 'Back',
  children,
}: PageHeaderProps) {
  return (
    <section className="border-b-4 border-gold bg-navy text-white">
      <div className="container-page py-8 sm:py-10 lg:py-12">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light"
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
        )}
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        )}
        <h1 className="mt-2 break-words text-3xl font-medium sm:text-4xl lg:text-5xl">{title}</h1>
        {description && (
          <div className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">{description}</div>
        )}
        {children}
      </div>
    </section>
  );
}