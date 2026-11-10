'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CloudImage } from '@/types';

export function ImageGallery({ images, name }: { images: CloudImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  const go = (direction: 1 | -1) => setIndex((i) => (i + direction + total) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || total < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (!total) {
    return (
      <div className="flex aspect-square items-center justify-center border border-navy/10 bg-surface font-serif text-6xl italic text-gold-dark sm:aspect-[4/5]">
        {name.charAt(0)}
      </div>
    );
  }

  const current = images[index];

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:sticky lg:top-32">
      <div
        className="relative aspect-square overflow-hidden border border-navy/10 bg-surface sm:aspect-[4/5]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={current.publicId}
          src={current.url}
          alt={`${name} — image ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-navy text-gold hover:bg-gold hover:text-navy sm:left-4"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-navy text-gold hover:bg-gold hover:text-navy sm:right-4"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 bg-navy px-2.5 py-1 text-xs font-semibold text-gold">
              {index + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
          {images.map((image, i) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden border-2 bg-surface transition-colors sm:h-20 sm:w-20',
                i === index ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}