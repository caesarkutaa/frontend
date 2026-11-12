'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Hourglass, Package, ShoppingCart, TrendingUp, TriangleAlert, Users, Wallet } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { formatDate, formatNaira } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/status-badge';
import { AdminTitle, EmptyRow, ErrorBox, Panel, StatCard, TableHead, TableWrap, td } from './admin-ui';
import type { AdminDashboard } from '@/types/admin';
import type { OrderStatus, PaymentMethod } from '@/types';

export function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get<AdminDashboard>('/admin/dashboard')).data,
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader label="Loading dashboard..." />;
  if (isError || !data) return <ErrorBox message={getErrorMessage(error, 'Could not load dashboard')} />;

  const { orders, users, perfumes } = data;
  const statusEntries = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => ({ status: s, count: orders.ordersByStatus[s] ?? 0 }));
  const maxCount = Math.max(1, ...statusEntries.map((e) => e.count));

  return (
    <div className="space-y-6">
      <AdminTitle title="Dashboard" description={`Overview as of ${formatDate(new Date(), true)}`} />

      {orders.refundRequired > 0 && (
        <Link href="/admin/orders?orderStatus=cancelled" className="flex items-center gap-3 border-l-4 border-error bg-error/10 p-4 text-sm font-medium text-error">
          <TriangleAlert size={18} /> {orders.refundRequired} cancelled order(s) were paid and need a refund.
        </Link>
      )}

      <div className="grid gap-4 xs:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="navy" label="Total revenue" value={formatNaira(orders.totalRevenue)} hint={`${orders.paidOrders} paid orders`} icon={TrendingUp} />
        <StatCard tone="gold" label="This month" value={formatNaira(orders.revenueThisMonth)} hint={`${orders.paidOrdersThisMonth} paid orders`} icon={Wallet} />
        <StatCard
          tone={orders.awaitingConfirmation ? 'error' : 'white'}
          label="Payments to review"
          value={orders.awaitingConfirmation}
          hint="Bank transfer proofs"
          icon={Hourglass}
          href="/admin/payments?paymentStatus=awaiting_confirmation"
        />
        <StatCard label="Customers" value={users.totalCustomers} hint={`+${users.newCustomersThisMonth} this month · ${users.blockedUsers} blocked`} icon={Users} href="/admin/users" />
        <StatCard label="Active perfumes" value={perfumes.active} hint={`${perfumes.total} total`} icon={Package} href="/admin/perfumes" />
        <StatCard tone={perfumes.outOfStock ? 'error' : 'white'} label="Out of stock" value={perfumes.outOfStock} hint="Active perfumes with no stock" icon={TriangleAlert} href="/admin/perfumes?lowStock=true" />
        <StatCard label="Processing" value={orders.ordersByStatus.processing ?? 0} hint="Paid, ready to ship" icon={ShoppingCart} href="/admin/orders?orderStatus=processing" />
        <StatCard label="Shipped" value={orders.ordersByStatus.shipped ?? 0} hint="On the way" icon={ShoppingCart} href="/admin/orders?orderStatus=shipped" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Awaiting review" actions={<Link href="/admin/payments?paymentStatus=awaiting_confirmation" className="text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-navy">View all</Link>}>
          {data.awaitingReview.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy/55">No payments waiting. 🎉</p>
          ) : (
            <ul className="divide-y divide-navy/10">
              {data.awaitingReview.map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-navy/55">{o.user?.name ?? 'Customer'} · {formatDate(o.createdAt, true)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatNaira(o.total)}</span>
                    <Link href={`/admin/orders/${o._id}`} className="bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy">Review</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Orders by status">
          <ul className="space-y-3">
            {statusEntries.map(({ status, count }) => (
              <li key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{ORDER_STATUS_LABELS[status]}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 bg-navy/5">
                  <div className={status === 'cancelled' ? 'h-2 bg-error/70' : 'h-2 bg-gold'} style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {Object.keys(orders.revenueByMethod).length > 0 && (
            <div className="mt-6 grid gap-3 border-t border-navy/10 pt-4 xs:grid-cols-2">
              {Object.entries(orders.revenueByMethod).map(([method, v]) => (
                <div key={method} className="bg-surface p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-dark">{PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method}</p>
                  <p className="mt-1 font-semibold">{formatNaira(v.total)}</p>
                  <p className="text-xs text-navy/55">{v.orders} orders</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent orders" bodyClassName="p-0 sm:p-0" actions={<Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-navy">All orders</Link>}>
        <TableWrap>
          <TableHead columns={['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', '']} />
          <tbody className="divide-y divide-navy/10">
            {data.recentOrders.length === 0 && <EmptyRow colSpan={7} message="No orders yet" />}
            {data.recentOrders.map((o) => (
              <tr key={o._id} className="hover:bg-surface">
                <td className={`${td} font-mono font-semibold`}>{o.orderNumber}</td>
                <td className={td}>{o.user?.name ?? '—'}</td>
                <td className={`${td} whitespace-nowrap text-navy/60`}>{formatDate(o.createdAt)}</td>
                <td className={`${td} font-semibold`}>{formatNaira(o.total)}</td>
                <td className={td}><PaymentStatusBadge status={o.paymentStatus} /></td>
                <td className={td}><OrderStatusBadge status={o.orderStatus} /></td>
                <td className={td}><Link href={`/admin/orders/${o._id}`} className="text-xs font-semibold uppercase text-gold-dark hover:text-navy">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      <Panel title={`Low stock (≤ ${perfumes.lowStockThreshold})`} bodyClassName="p-0 sm:p-0">
        <TableWrap>
          <TableHead columns={['Perfume', 'Size', 'Stock', '']} />
          <tbody className="divide-y divide-navy/10">
            {perfumes.lowStockItems.length === 0 && <EmptyRow colSpan={4} message="All sizes are well stocked" />}
            {perfumes.lowStockItems.map((item) => (
              <tr key={`${item._id}-${item.variantId}`} className="hover:bg-surface">
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-surface">
                      {item.image && <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className={td}>{item.size}ml</td>
                <td className={td}>
                  <span className={item.stock === 0 ? 'font-bold text-error' : 'font-bold text-gold-dark'}>{item.stock}</span>
                </td>
                <td className={td}><Link href={`/admin/perfumes/${item._id}`} className="text-xs font-semibold uppercase text-gold-dark hover:text-navy">Restock</Link></td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>
    </div>
  );
}