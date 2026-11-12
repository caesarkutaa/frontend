import type { BankAccount, Order, OrderStatus, PaymentMethod, PaymentStatus } from './index';

export interface BankTransferInstructions {
  amount: number;
  reference: string;
  deadline: string;
  bankAccounts: BankAccount[];
  message: string;
}

export interface PaystackStart {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  amount: number;
}

export interface CheckoutResponse {
  order: Order;
  payment:
    | ({ method: 'paystack' } & PaystackStart)
    | ({ method: 'bank_transfer' } & BankTransferInstructions);
}

/** GET /orders/:id/payment */
export interface PaymentInfo {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  rejectionReason: string | null;
  amount: number;
  deadline: string;
  payable: boolean;
  paystackEnabled: boolean;
  bankTransfer: BankTransferInstructions | null;
}

/** GET /orders/paystack/verify?reference= */
export interface PaystackVerifyResult {
  orderId: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paid: boolean;
}