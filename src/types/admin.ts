import type { Order, Paginated, PaymentStatus, User } from './index';

export type OrderUser = Pick<User, '_id' | 'name' | 'email' | 'phone'>;

/** Orders as returned to admins (user populated) */
export type AdminOrder = Omit<Order, 'user'> & {
  user: OrderUser | null;
  paymentReviewedBy?: { _id: string; name: string; email?: string } | null;
};

export interface OrderStats {
  ordersByStatus: Record<string, number>;
  ordersByPaymentStatus: Record<string, number>;
  revenueByMethod: Record<string, { orders: number; total: number }>;
  awaitingConfirmation: number;
  refundRequired: number;
  totalRevenue: number;
  paidOrders: number;
  revenueThisMonth: number;
  paidOrdersThisMonth: number;
}

export interface LowStockItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  variantId: string;
  size: number;
  stock: number;
}

export interface AdminDashboard {
  orders: OrderStats;
  users: { totalCustomers: number; blockedUsers: number; newCustomersThisMonth: number };
  perfumes: {
    total: number;
    active: number;
    outOfStock: number;
    lowStockThreshold: number;
    lowStockItems: LowStockItem[];
  };
  recentOrders: AdminOrder[];
  awaitingReview: AdminOrder[];
}

export interface AdminUserRow extends User {
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
}

export interface AdminUserDetail {
  user: User;
  stats: {
    totalOrders: number;
    paidOrders: number;
    totalSpent: number;
    pendingPayments: number;
    cancelledOrders: number;
    lastOrderAt: string | null;
  };
  recentOrders: Order[];
}

export interface AdminPaymentsResponse extends Paginated<AdminOrder> {
  summary: Record<PaymentStatus, { count: number; amount: number }>;
}