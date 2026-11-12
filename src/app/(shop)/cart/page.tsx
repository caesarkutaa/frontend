'use client';

import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Info, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart, type CartLine } from '@/hooks/use-cart';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { getErrorMessage } from '@/lib/api';
import { formatNaira } from '@/lib/utils';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { PageLoader } from '@/components/ui/spinner';

export default function CartPage() {
  const { lines, summary, notices, isAuthed, isLoading, isMutating, updateQuantity, removeItem, clear } = useCart();
  const { data: settings } = usePublicSettings();

  const run = async (action: () => Promise<void>, errorFallback: string) => {
    try {
      await action();
    } catch (error) {
      toast.error(getErrorMessage(error, errorFallback));
    }
  };

  if (isLoading) return <PageLoader label="Loading your bag..." />;

  if (!lines.length) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center sm:py-32">
        <span className="flex h-16 w-16 items-center justify-center bg-navy text-gold"><ShoppingBag size={28} /></span>
        <h1 className="mt-6 text-3xl font-medium sm:text-4xl">Your bag is empty</h1>
        <div className="mt-3 h-0.5 w-14 bg-gold" />
        <p className="mt-4 max-w-sm text-sm text-navy/60">Discover a fragrance you love and it will appear here.</p>
        <Link href="/perfumes" className="mt-8 inline-flex h-12 items-center bg-navy px-8 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-navy">
          Start shopping
        </Link>
      </div>
    );
  }

  const checkoutHref = isAuthed ? '/checkout' : '/login?redirect=/checkout';
  const freeMin = settings?.delivery.freeShippingMin ?? 0;
  const amountToFree = freeMin > 0 ? freeMin - summary.subtotal : 0;

  return (
    <div className="container-page pb-16 pt-8 sm:pb-24 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">Shopping bag</p>
          <h1 className="mt-2 text-3xl font-medium sm:text-4xl">
            Your bag <span className="text-gold-dark">({summary.totalQuantity})</span>
          </h1>
        </div>
        <button
          type="button"
          disabled={isMutating}
          onClick={() => run(clear, 'Could not clear your bag')}
          className="text-xs font-semibold uppercase tracking-wider text-navy/50 underline underline-offset-4 hover:text-error disabled:opacity-40"
        >
          Clear bag
        </button>
      </div>

      {notices.length > 0 && (
        <div className="mt-6 space-y-1 border-l-4 border-gold bg-gold/10 p-4 text-sm">
          {notices.map((notice) => (
            <p key={notice} className="flex gap-2"><Info size={16} className="mt-0.5 shrink-0 text-gold-dark" /> {notice}</p>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12 xl:grid-cols-[1fr_400px]">
        <ul className="divide-y divide-navy/10 border-y border-navy/10">
          {lines.map((line) => (
            <CartRow
              key={line.key}
              line={line}
              disabled={isMutating}
              onQuantity={(q) => run(() => updateQuantity(line, q), 'Could not update quantity')}
              onRemove={() => run(() => removeItem(line), 'Could not remove item')}
            />
          ))}
        </ul>

        <aside className="h-fit border-t-4 border-gold bg-navy p-5 text-white sm:p-6 lg:sticky lg:top-32">
          <h2 className="text-xl font-medium text-gold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/65">Subtotal</dt>
              <dd className="text-lg font-semibold text-gold">{formatNaira(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/65">Delivery</dt>
              <dd className="text-right text-white/80">Calculated at checkout</dd>
            </div>
            {amountToFree > 0 && <p className="text-xs text-gold-light">Add {formatNaira(amountToFree)} more for free delivery.</p>}
            {freeMin > 0 && amountToFree <= 0 && <p className="text-xs font-semibold text-gold">You qualify for free delivery 🎉</p>}
          </dl>

          {summary.hasUnavailableItems && (
            <p className="mt-4 bg-error p-3 text-xs font-medium text-white">Remove sold-out items to continue to checkout.</p>
          )}

          {summary.hasUnavailableItems ? (
            <span className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center bg-white/10 text-sm font-semibold uppercase tracking-wider text-white/40">Checkout</span>
          ) : (
            <Link href={checkoutHref} className="mt-6 flex h-12 w-full items-center justify-center bg-gold text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-gold-light">
              {isAuthed ? 'Checkout' : 'Log in to checkout'}
            </Link>
          )}

          {!isAuthed && <p className="mt-3 text-center text-xs text-white/60">Your bag is saved and will be waiting after you log in.</p>}

          <Link href="/perfumes" className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-gold underline underline-offset-4 hover:text-gold-light">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function CartRow({ line, disabled, onQuantity, onRemove }: { line: CartLine; disabled: boolean; onQuantity: (q: number) => void; onRemove: () => void }) {
  return (
    <li className="flex gap-4 py-5 sm:gap-6 sm:py-6">
      <Link href={`/perfumes/${line.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden border border-navy/10 bg-surface sm:h-32 sm:w-28">
        {line.image ? (
          <Image src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-2xl italic text-gold-dark">{line.name.charAt(0)}</span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
        <div className="min-w-0">
          {line.brandName && <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark sm:text-xs">{line.brandName}</p>}
          <Link href={`/perfumes/${line.slug}`} className="mt-0.5 line-clamp-2 font-serif text-base hover:text-gold-dark sm:text-lg">{line.name}</Link>
          <p className="mt-1 text-xs text-navy/55 sm:text-sm">{line.size}ml · {formatNaira(line.unitPrice)}</p>
          {!line.inStock && <p className="mt-2 text-xs font-semibold text-error">Sold out — please remove</p>}
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">
          <p className="font-semibold sm:order-2">{formatNaira(line.subtotal)}</p>
          <div className="flex items-center gap-2 sm:order-1">
            {line.inStock && <QuantityStepper size="sm" value={line.quantity} max={Math.max(1, line.maxQuantity)} disabled={disabled} onChange={onQuantity} />}
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label={`Remove ${line.name}`}
              className="flex h-9 w-9 items-center justify-center text-navy/40 hover:text-error disabled:opacity-40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}