'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { useCart } from '@/hooks/use-cart';
import { getErrorMessage } from '@/lib/api';
import { MAX_QUANTITY_PER_ITEM } from '@/lib/constants';
import { cn, formatNaira } from '@/lib/utils';
import type { CloudImage, Variant } from '@/types';

interface PurchasePanelProps {
  perfume: {
    _id: string;
    slug: string;
    name: string;
    brandName: string | null;
    images: CloudImage[];
    variants: Variant[];
  };
}

export function PurchasePanel({ perfume }: PurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const variants = useMemo(
    () => [...perfume.variants].sort((a, b) => a.size - b.size),
    [perfume.variants],
  );
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];

  const [variantId, setVariantId] = useState(firstAvailable?._id);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState<'add' | 'buy' | null>(null);

  const variant = variants.find((v) => v._id === variantId) ?? firstAvailable;
  if (!variant) return null;

  const soldOut = variant.stock <= 0;
  const maxQuantity = Math.max(1, Math.min(variant.stock, MAX_QUANTITY_PER_ITEM));
  const discount =
    variant.compareAtPrice && variant.compareAtPrice > variant.price
      ? Math.round((1 - variant.price / variant.compareAtPrice) * 100)
      : 0;

  const selectVariant = (v: Variant) => {
    setVariantId(v._id);
    setQuantity(1);
  };

  const handleAdd = async (mode: 'add' | 'buy') => {
    setPending(mode);
    try {
      await addItem({
        perfumeId: perfume._id,
        variantId: variant._id,
        quantity,
        snapshot: {
          slug: perfume.slug,
          name: perfume.name,
          brandName: perfume.brandName,
          image: perfume.images[0]?.url ?? null,
          size: variant.size,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stock: variant.stock,
        },
      });

      if (mode === 'buy') {
        router.push('/cart');
      } else {
        toast.success(`${perfume.name} (${variant.size}ml) added to your bag`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not add to bag'));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-semibold text-navy sm:text-3xl">
          {formatNaira(variant.price)}
        </span>
        {discount > 0 && (
          <>
            <span className="text-base text-navy/40 line-through">
              {formatNaira(variant.compareAtPrice!)}
            </span>
            <span className="bg-gold px-2 py-0.5 text-xs font-bold uppercase text-navy">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* Size picker */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy/70">
          Size: <span className="text-gold-dark">{variant.size}ml</span>
        </p>
        <div className="grid grid-cols-3 gap-2 xs:grid-cols-4">
          {variants.map((v) => {
            const selected = v._id === variant._id;
            const unavailable = v.stock <= 0;
            return (
              <button
                key={v._id}
                type="button"
                onClick={() => selectVariant(v)}
                aria-pressed={selected}
                className={cn(
                  'flex h-12 items-center justify-center border text-sm font-semibold transition-colors',
                  selected
                    ? 'border-navy bg-navy text-gold'
                    : 'border-navy/20 bg-white text-navy hover:border-gold',
                  unavailable && !selected && 'text-navy/30 line-through',
                )}
              >
                {v.size}ml
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock message */}
      <p
        className={cn(
          'text-sm font-medium',
          soldOut ? 'text-error' : variant.stock <= 5 ? 'text-gold-dark' : 'text-success',
        )}
      >
        {soldOut
          ? 'Sold out in this size'
          : variant.stock <= 5
            ? `Only ${variant.stock} left — order soon`
            : 'In stock, ready to ship'}
      </p>

      {/* Quantity + actions */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 xs:flex-row">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={soldOut || pending !== null}
          />
          <Button
            size="lg"
            className="flex-1"
            disabled={soldOut}
            loading={pending === 'add'}
            onClick={() => handleAdd('add')}
          >
            <ShoppingBag size={18} />
            {soldOut ? 'Sold out' : 'Add to bag'}
          </Button>
        </div>
        {!soldOut && (
          <Button
            variant="gold"
            size="lg"
            fullWidth
            loading={pending === 'buy'}
            disabled={pending !== null}
            onClick={() => handleAdd('buy')}
          >
            Buy now
          </Button>
        )}
      </div>
    </div>
  );
}