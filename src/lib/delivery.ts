import { formatNaira } from './utils';
import type { DeliveryPricing } from '@/types/settings';

/** Mirrors the backend calculation (the backend is still the source of truth) */
export function calcDeliveryFee(delivery: DeliveryPricing | undefined, state: string | undefined, subtotal: number) {
  if (!delivery) return 0;
  if (delivery.freeShippingMin > 0 && subtotal >= delivery.freeShippingMin) return 0;
  const match = delivery.stateFees.find((f) => f.state.toLowerCase() === (state ?? '').trim().toLowerCase());
  return match ? match.fee : delivery.defaultFee;
}

export function isAlwaysFree(d: DeliveryPricing) {
  return d.defaultFee === 0 && d.stateFees.every((f) => f.fee === 0);
}

/** Short human summary, e.g. "Free on orders over ₦150,000 · 2–5 working days" */
export function deliveryHeadline(d: DeliveryPricing): { title: string; text: string } {
  if (isAlwaysFree(d)) {
    return { title: 'Free delivery', text: d.estimatedDays ? `On every order · ${d.estimatedDays}` : 'On every order, no minimum.' };
  }
  const parts = ['Fee depends on your state — shown at checkout'];
  if (d.freeShippingMin > 0) parts.unshift(`Free on orders over ${formatNaira(d.freeShippingMin)}`);
  if (d.estimatedDays) parts.push(d.estimatedDays);
  return { title: 'Nationwide delivery', text: parts.join(' · ') };
}