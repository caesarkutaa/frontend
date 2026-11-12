'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, ShieldCheck, ShoppingCart, UserCog, Wallet } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatNaira } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Button, buttonClasses } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/status-badge';
import { ActiveBadge, AdminTitle, ConfirmDialog, EmptyRow, ErrorBox, Panel, StatCard, TableHead, TableWrap, td } from './admin-ui';
import type { AdminUserDetail } from '@/types/admin';

type Action = null | 'block' | 'unblock' | 'make-admin' | 'make-customer';

export function UserDetail({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [action, setAction] = useState<Action>(null);
  const key = ['admin-user', userId];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<AdminUserDetail>(`/admin/users/${userId}`)).data,
  });

  const mutation = useMutation({
    mutationFn: async ({ type, reason }: { type: Exclude<Action, null>; reason: string }) => {
      if (type === 'block') return api.patch(`/admin/users/${userId}/block`, reason ? { reason } : {});
      if (type === 'unblock') return api.patch(`/admin/users/${userId}/unblock`);
      return api.patch(`/admin/users/${userId}/role`, { role: type === 'make-admin' ? 'admin' : 'customer' });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setAction(null);
      toast.success((res.data as { message?: string })?.message ?? 'User updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading user..." />;
  if (isError || !data) return <ErrorBox message={getErrorMessage(error, 'User not found')} />;

  const { user, stats, recentOrders } = data;
  const isSelf = me?.id === user._id;

  const dialogs = {
    block: { title: `Block ${user.name}?`, message: 'They will be logged out immediately and won’t be able to log in or place orders.', confirmLabel: 'Block user', tone: 'danger' as const, reason: { label: 'Reason', placeholder: 'e.g. Fake payment proofs' } },
    unblock: { title: `Unblock ${user.name}?`, message: 'They will be able to log in and order again.', confirmLabel: 'Unblock', tone: 'gold' as const },
    'make-admin': { title: 'Make this user an admin?', message: 'Admins can manage products, orders, payments and users.', confirmLabel: 'Make admin', tone: 'primary' as const },
    'make-customer': { title: 'Remove admin access?', message: 'This user will become a regular customer.', confirmLabel: 'Make customer', tone: 'danger' as const },
  };
  const dialog = action ? dialogs[action] : null;

  return (
    <div className="space-y-6">
      <AdminTitle
        title={user.name}
        description={<span className="break-all">{user.email}</span>}
        actions={
          <>
            <ActiveBadge active={user.isActive} inactiveLabel="Blocked" />
            <span className={user.role === 'admin' ? 'bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-navy' : 'border border-navy/20 px-2 py-0.5 text-[10px] font-semibold uppercase'}>{user.role}</span>
          </>
        }
      />

      {!user.isActive && (
        <div className="border-l-4 border-error bg-error/10 p-4 text-sm">
          <p className="font-semibold text-error">Blocked {user.blockedAt ? `on ${formatDate(user.blockedAt, true)}` : ''}</p>
          {user.blockedReason && <p className="mt-1">Reason: {user.blockedReason}</p>}
        </div>
      )}

      <div className="grid gap-4 xs:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="navy" label="Total spent" value={formatNaira(stats.totalSpent)} icon={Wallet} />
        <StatCard tone="gold" label="Orders" value={stats.totalOrders} hint={`${stats.paidOrders} paid`} icon={ShoppingCart} />
        <StatCard label="Pending payments" value={stats.pendingPayments} />
        <StatCard label="Cancelled" value={stats.cancelledOrders} hint={stats.lastOrderAt ? `Last order ${formatDate(stats.lastOrderAt)}` : 'No orders yet'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Recent orders" bodyClassName="p-0 sm:p-0">
          <TableWrap>
            <TableHead columns={['Order', 'Date', 'Total', 'Payment', 'Status', '']} />
            <tbody className="divide-y divide-navy/10">
              {recentOrders.length === 0 && <EmptyRow colSpan={6} message="No orders yet" />}
              {recentOrders.map((o) => (
                <tr key={o._id} className="hover:bg-surface">
                  <td className={`${td} font-mono font-semibold`}>{o.orderNumber}</td>
                  <td className={`${td} text-navy/60`}>{formatDate(o.createdAt)}</td>
                  <td className={`${td} font-semibold`}>{formatNaira(o.total)}</td>
                  <td className={td}><PaymentStatusBadge status={o.paymentStatus} /></td>
                  <td className={td}><OrderStatusBadge status={o.orderStatus} /></td>
                  <td className={td}><Link href={`/admin/orders/${o._id}`} className="text-xs font-semibold uppercase text-gold-dark hover:text-navy">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>

        <aside className="space-y-6">
          <Panel title="Details">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-navy/55">Phone</dt><dd>{user.phone ?? '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-navy/55">Joined</dt><dd>{formatDate(user.createdAt)}</dd></div>
            </dl>
            {user.address && (
              <address className="mt-4 border-t border-navy/10 pt-4 text-sm not-italic leading-relaxed">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Saved address</span><br />
                {user.address.fullName}<br />{user.address.street}<br />{user.address.city}, {user.address.state}<br />{user.address.phone}
              </address>
            )}
          </Panel>

          <section className="border-t-4 border-gold bg-navy p-5 text-white">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gold">Actions</h2>
            {isSelf ? (
              <p className="mt-3 text-sm text-white/70">This is your own account.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {user.isActive ? (
                  <Button variant="danger" fullWidth disabled={user.role === 'admin'} onClick={() => setAction('block')}><Ban size={16} /> Block user</Button>
                ) : (
                  <Button variant="gold" fullWidth onClick={() => setAction('unblock')}><ShieldCheck size={16} /> Unblock user</Button>
                )}
                {user.role === 'customer' ? (
                  <Button variant="outline" fullWidth className="border-gold text-gold hover:bg-gold hover:text-navy" disabled={!user.isActive} onClick={() => setAction('make-admin')}><UserCog size={16} /> Make admin</Button>
                ) : (
                  <Button variant="outline" fullWidth className="border-gold text-gold hover:bg-gold hover:text-navy" onClick={() => setAction('make-customer')}><UserCog size={16} /> Make customer</Button>
                )}
                {user.role === 'admin' && <p className="text-xs text-white/60">Admins must be changed to customer before they can be blocked.</p>}
              </div>
            )}
          </section>

          <Link href="/admin/users" className={buttonClasses({ variant: 'outline', fullWidth: true })}>All users</Link>
        </aside>
      </div>

      {dialog && (
        <ConfirmDialog
          open={!!action}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          reason={'reason' in dialog ? dialog.reason : undefined}
          loading={mutation.isPending}
          onClose={() => setAction(null)}
          onConfirm={(reason) => action && mutation.mutate({ type: action, reason })}
        />
      )}
    </div>
  );
}