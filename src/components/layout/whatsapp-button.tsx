'use client';

import { usePathname } from 'next/navigation';
import type { PublicSettings } from '@/types/settings';

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.78 9.78 0 0 1-1.5-5.22c0-5.41 4.41-9.81 9.83-9.81 2.62 0 5.09 1.02 6.94 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.41-4.41 9.81-9.81 9.81zm8.35-18.16A11.73 11.73 0 0 0 12.05.2C5.54.2.24 5.5.24 12a11.7 11.7 0 0 0 1.58 5.9L.15 24l6.25-1.64a11.8 11.8 0 0 0 5.64 1.44h.01c6.5 0 11.8-5.3 11.8-11.8 0-3.15-1.22-6.11-3.45-8.35z" />
    </svg>
  );
}

/** Floating chat button — admin turns it on/off in Settings */
export function WhatsAppButton({ whatsapp }: { whatsapp: PublicSettings['whatsapp'] }) {
  const pathname = usePathname();
  if (!whatsapp) return null;

  const baseHref = `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.message)}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!pathname.startsWith('/perfumes/')) return;
    e.preventDefault();
    const text = `${whatsapp.message}\n\nI'm looking at: ${window.location.href}`;
    window.open(`https://wa.me/${whatsapp.number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <a
      href={baseHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border-2 border-gold bg-navy p-3 text-gold shadow-xl transition-all hover:bg-gold hover:text-navy sm:bottom-6 sm:right-6 sm:px-5"
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}