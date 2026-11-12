import type {
  Concentration,
  Gender,
  Longevity,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Sillage,
} from '@/types';

export const GENDER_LABELS: Record<Gender, string> = {
  men: 'Men',
  women: 'Women',
  unisex: 'Unisex',
};

export const CONCENTRATION_LABELS: Record<Concentration, string> = {
  parfum: 'Parfum',
  extrait_de_parfum: 'Extrait de Parfum',
  eau_de_parfum: 'Eau de Parfum',
  eau_de_toilette: 'Eau de Toilette',
  eau_de_cologne: 'Eau de Cologne',
  body_mist: 'Body Mist',
  perfume_oil: 'Perfume Oil',
};

export const LONGEVITY_LABELS: Record<Longevity, string> = {
  weak: 'Weak (1–3 hrs)',
  moderate: 'Moderate (3–6 hrs)',
  long_lasting: 'Long lasting (6–10 hrs)',
  eternal: 'Eternal (10+ hrs)',
};

export const SILLAGE_LABELS: Record<Sillage, string> = {
  intimate: 'Intimate',
  moderate: 'Moderate',
  strong: 'Strong',
  enormous: 'Enormous',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'best_selling', label: 'Best selling' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'name_asc', label: 'Name: A–Z' },
] as const;

/* ---------- Orders & payments ---------- */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  awaiting_confirmation: 'Under review',
  paid: 'Paid',
  rejected: 'Payment rejected',
  refunded: 'Refunded',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  paystack: 'Card / Paystack',
};