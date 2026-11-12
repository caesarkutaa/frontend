export interface StateFee {
  state: string;
  fee: number;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  instagram?: string;
  businessHours?: string;
}

export interface DeliveryPricing {
  defaultFee: number;
  freeShippingMin: number;
  stateFees: StateFee[];
  estimatedDays?: string;
}

/** GET /settings/public */
export interface PublicSettings {
  announcement: string | null;
  whatsapp: { number: string; message: string } | null;
  contact: ContactInfo;
  delivery: DeliveryPricing;
}

/** GET /settings (admin) */
export interface StoreSettings {
  announcement: { enabled: boolean; text: string };
  whatsapp: { enabled: boolean; number?: string; message: string };
  contact: ContactInfo;
  delivery: DeliveryPricing;
  updatedAt?: string;
}