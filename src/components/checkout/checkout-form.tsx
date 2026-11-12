'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CreditCard, Landmark, Lock, ShieldCheck, ShoppingBag, Truck, TriangleAlert } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { NIGERIAN_STATES } from '@/lib/constants';
import { calcDeliveryFee } from '@/lib/delivery';
import { cn, formatNaira } from '@/lib/utils';
import { useCart, CART_QUERY_KEY } from '@/hooks/use-cart';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { Button, buttonClasses } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { PageLoader } from '@/components/ui/spinner';
import { StateMessage } from '@/components/ui/state-message';
import type { PaymentMethod, PaymentMethodsResponse, User } from '@/types';
import type { CheckoutResponse } from '@/types/checkout';

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient’s full name').max(80),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{9,15}$/, 'Enter a valid phone number'),
  street: z.string().trim().min(5, 'Enter a full street address').max(200),
  city: z.string().trim().min(2, 'Enter a city or town').max(60),
  state: z.string().trim().min(2, 'Select a state'),
  country: z.string().trim().min(2, 'Enter a country').max(60),
});

type AddressValues = z.infer<typeof addressSchema>;

const METHOD_INFO: Record<PaymentMethod, { icon: typeof CreditCard; title: string; text: string }> = {
  paystack: { icon: CreditCard, title: 'Pay with card (Paystack)', text: 'Card, bank, USSD or transfer. Confirmed instantly.' },
  bank_transfer: { icon: Landmark, title: 'Direct bank transfer', text: 'Transfer to our account and upload your receipt. Confirmed by our team.' },
};

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center bg-navy text-sm font-bold text-gold">{step}</span>
      <h2 className="text-xl font-medium sm:text-2xl">{title}</h2>
    </div>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { lines, summary, isLoading: cartLoading } = useCart();
  const { data: settings } = usePublicSettings();

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['me-profile'],
    queryFn: async () => (await api.get<User>('/users/me')).data,
  });

  const methodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => (await api.get<PaymentMethodsResponse>('/payments/methods')).data,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: '', phone: '', street: '', city: '', state: '', country: 'Nigeria' },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    const a = profile.address;
    reset({
      fullName: a?.fullName ?? profile.name,
      phone: a?.phone ?? profile.phone ?? '',
      street: a?.street ?? '',
      city: a?.city ?? '',
      state: a?.state ?? '',
      country: a?.country ?? 'Nigeria',
    });
    if (a) setSaveAddress(false);
  }, [profileQuery.data, reset]);

  useEffect(() => {
    const methods = methodsQuery.data?.methods;
    if (methods?.length && !method) setMethod(methods[0].method);
  }, [methodsQuery.data, method]);

  /* ---------- Delivery fee for the selected state ---------- */
  const selectedState = watch('state');
  const deliveryFee = selectedState ? calcDeliveryFee(settings?.delivery, selectedState, summary.subtotal) : 0;
  const total = summary.subtotal + deliveryFee;
  const freeMin = settings?.delivery.freeShippingMin ?? 0;
  const amountToFree = freeMin > 0 ? freeMin - summary.subtotal : 0;

  const onSubmit = async (address: AddressValues) => {
    if (!method) {
      toast.error('Choose a payment method');
      return;
    }

    setPlacing(true);
    try {
      const { data } = await api.post<CheckoutResponse>('/orders/checkout', {
        paymentMethod: method,
        shippingAddress: address,
        saveAddress,
        ...(note.trim() ? { note: note.trim() } : {}),
      });

      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (saveAddress) queryClient.invalidateQueries({ queryKey: ['me-profile'] });

      if (data.payment.method === 'paystack') {
        toast.loading('Redirecting to secure payment...');
        window.location.href = data.payment.authorizationUrl;
      } else {
        toast.success(`Order ${data.order.orderNumber} placed`);
        router.push(`/orders/${data.order._id}/payment`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not place your order'));
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      setPlacing(false);
    }
  };

  if (cartLoading || profileQuery.isLoading) return <PageLoader label="Preparing checkout..." />;

  if (!lines.length && !placing) {
    return (
      <StateMessage icon={ShoppingBag} title="Your bag is empty" description="Add a fragrance to your bag before checking out.">
        <Link href="/perfumes" className={buttonClasses({ size: 'lg' })}>Shop perfumes</Link>
      </StateMessage>
    );
  }

  const methods = methodsQuery.data?.methods ?? [];
  const blocked = summary.hasUnavailableItems;

  return (
    <div className="pb-16 sm:pb-24">
      <PageHeader eyebrow="Secure checkout" title="Checkout" backHref="/cart" backLabel="Back to bag" />

      <div className="container-page pt-8 sm:pt-10">
        {blocked && (
          <div className="mb-6 flex items-start gap-3 border-l-4 border-error bg-error/10 p-4 text-sm">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-error" />
            <p>
              Some items in your bag are sold out.{' '}
              <Link href="/cart" className="font-semibold underline">Review your bag</Link> to continue.
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12 xl:grid-cols-[1fr_420px]">
          {/* ===== Form ===== */}
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="min-w-0 space-y-10">
            <section>
              <SectionTitle step={1} title="Delivery address" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" error={errors.phone?.message} {...register('phone')} />
                <div className="sm:col-span-2">
                  <Input label="Street address" autoComplete="street-address" placeholder="House number, street, landmark" error={errors.street?.message} {...register('street')} />
                </div>
                <Input label="City / Town" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
                <div>
                  <label htmlFor="state" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider">State</label>
                  <select
                    id="state"
                    {...register('state')}
                    className={cn('h-11 w-full border bg-white px-3 text-sm text-navy outline-none focus:border-gold', errors.state ? 'border-error' : 'border-navy/20')}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1.5 text-xs text-error">{errors.state.message}</p>}
                </div>
                <Input label="Country" autoComplete="country-name" error={errors.country?.message} {...register('country')} />
              </div>

              {selectedState && (
                <p className="mt-4 flex items-center gap-2 border-l-4 border-gold bg-gold/10 px-3 py-2 text-sm">
                  <Truck size={16} className="text-gold-dark" />
                  Delivery to <strong>{selectedState}</strong>: {deliveryFee === 0 ? <strong className="text-success">Free</strong> : <strong>{formatNaira(deliveryFee)}</strong>}
                  {settings?.delivery.estimatedDays && <span className="text-navy/60">· {settings.delivery.estimatedDays}</span>}
                </p>
              )}

              <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-navy" />
                Save this address for next time
              </label>
            </section>

            <section>
              <SectionTitle step={2} title="Payment method" />
              {methodsQuery.isLoading ? (
                <p className="text-sm text-navy/60">Loading payment options...</p>
              ) : methods.length === 0 ? (
                <p className="border-l-4 border-error bg-error/10 p-4 text-sm text-error">Payments are temporarily unavailable. Please try again later.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {methods.map(({ method: m }) => {
                    const { icon: Icon, title, text } = METHOD_INFO[m];
                    const selected = method === m;
                    return (
                      <label
                        key={m}
                        className={cn('flex cursor-pointer gap-4 border-2 p-4 transition-colors sm:p-5', selected ? 'border-gold bg-navy text-white' : 'border-navy/15 hover:border-gold')}
                      >
                        <input type="radio" name="paymentMethod" value={m} checked={selected} onChange={() => setMethod(m)} className="sr-only" />
                        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center', selected ? 'bg-gold text-navy' : 'bg-navy text-gold')}>
                          <Icon size={20} />
                        </span>
                        <span>
                          <span className={cn('block font-semibold', selected && 'text-gold')}>{title}</span>
                          <span className={cn('mt-1 block text-xs', selected ? 'text-white/75' : 'text-navy/60')}>{text}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <SectionTitle step={3} title="Order note (optional)" />
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Delivery instructions, gift message, etc."
                className="w-full border border-navy/20 bg-white px-3.5 py-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-gold"
              />
            </section>
          </form>

          {/* ===== Summary ===== */}
          <aside className="h-fit border-t-4 border-gold bg-navy p-5 text-white sm:p-6 lg:sticky lg:top-32">
            <h2 className="text-xl font-medium text-gold">Your order</h2>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-gold/30 bg-white">
                    {line.image ? (
                      <Image src={line.image} alt={line.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center font-serif italic text-gold-dark">{line.name.charAt(0)}</span>
                    )}
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-gold px-1 text-[10px] font-bold text-navy">{line.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-white/60">{line.size}ml</p>
                  </div>
                  <p className={cn('text-sm font-semibold', !line.inStock && 'text-error')}>
                    {line.inStock ? formatNaira(line.subtotal) : 'Sold out'}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-gold/30 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/65">Subtotal</dt>
                <dd>{formatNaira(summary.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Delivery{selectedState ? ` (${selectedState})` : ''}</dt>
                <dd className="text-right font-semibold text-gold">
                  {!selectedState ? <span className="font-normal text-white/60">Select a state</span> : deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee)}
                </dd>
              </div>
              {amountToFree > 0 && (
                <p className="text-xs text-gold-light">Add {formatNaira(amountToFree)} more for free delivery.</p>
              )}
              <div className="flex justify-between border-t border-gold/30 pt-3 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="text-xl font-semibold text-gold">{formatNaira(total)}</dd>
              </div>
            </dl>

            <Button
              type="submit"
              form="checkout-form"
              variant="gold"
              size="lg"
              fullWidth
              className="mt-6"
              loading={placing}
              disabled={blocked || !method || methods.length === 0}
            >
              <Lock size={16} />
              {method === 'paystack' ? `Pay ${formatNaira(total)}` : 'Place order'}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
              <ShieldCheck size={14} className="text-gold" />
              {method === 'paystack' ? 'You’ll be redirected to Paystack to pay securely' : 'You’ll see our bank details on the next page'}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}