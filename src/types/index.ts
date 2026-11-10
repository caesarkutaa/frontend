/* =================== Auth & Users =================== */
export type Role = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: Address;
  isActive: boolean;
  blockedAt?: string;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

/* =================== Catalog =================== */
export interface CloudImage {
  url: string;
  publicId: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: CloudImage;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CloudImage;
  isActive: boolean;
  createdAt: string;
}

export type Gender = 'men' | 'women' | 'unisex';
export type Concentration =
  | 'parfum'
  | 'extrait_de_parfum'
  | 'eau_de_parfum'
  | 'eau_de_toilette'
  | 'eau_de_cologne'
  | 'body_mist'
  | 'perfume_oil';
export type Longevity = 'weak' | 'moderate' | 'long_lasting' | 'eternal';
export type Sillage = 'intimate' | 'moderate' | 'strong' | 'enormous';

export interface Variant {
  _id: string;
  size: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
}

export interface FragranceNotes {
  top: string[];
  middle: string[];
  base: string[];
}

/** Shape returned by the gallery */
export interface PerfumeCard {
  _id: string;
  name: string;
  slug: string;
  brand: { _id: string; name: string; slug: string; logo?: CloudImage };
  category?: { _id: string; name: string; slug: string };
  gender: Gender;
  concentration: Concentration;
  shortDescription?: string;
  fragranceFamily?: string;
  images: CloudImage[];
  variants: Variant[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  inStock: boolean;
  isFeatured: boolean;
  totalSold: number;
  createdAt: string;
}

/** Full perfume (detail page / admin) */
export interface Perfume extends Omit<PerfumeCard, 'brand' | 'category'> {
  brand: { _id: string; name: string; slug: string; logo?: CloudImage; description?: string };
  category: { _id: string; name: string; slug: string };
  description: string;
  notes: FragranceNotes;
  longevity?: Longevity;
  sillage?: Sillage;
  isActive: boolean;
  qrCode?: CloudImage;
  qrLink?: string;
  qrDownloadUrl?: string | null;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/* =================== Cart =================== */
export interface CartItem {
  _id: string;
  perfume: {
    _id: string;
    name: string;
    slug: string;
    image: string | null;
    brand: { _id: string; name: string; slug: string } | null;
  };
  variant: Variant;
  quantity: number;
  inStock: boolean;
  maxQuantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    hasUnavailableItems: boolean;
  };
  notices: string[];
}

/* =================== Orders & Payments =================== */
export type PaymentMethod = 'bank_transfer' | 'paystack';
export type PaymentStatus =
  | 'pending'
  | 'awaiting_confirmation'
  | 'paid'
  | 'rejected'
  | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  note?: string;
  isActive?: boolean;
}

export interface OrderItem {
  perfume: string;
  variantId: string;
  name: string;
  brandName?: string;
  image?: string;
  size: number;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PaymentProof {
  _id: string;
  image: CloudImage;
  bankAccount: Omit<BankAccount, '_id' | 'note' | 'isActive'>;
  senderName: string;
  amountPaid?: number;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface StatusHistoryEntry {
  status: string;
  note?: string;
  changedBy?: { _id: string; name: string } | string;
  at: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | Pick<User, '_id' | 'name' | 'email' | 'phone'>;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentDeadline: string;
  paymentProofs?: PaymentProof[];
  paymentRejectionReason?: string;
  paidAt?: string;
  paidReference?: string;
  paymentChannel?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  statusHistory?: StatusHistoryEntry[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodsResponse {
  methods: { method: PaymentMethod; label: string }[];
  bankAccounts: BankAccount[];
}