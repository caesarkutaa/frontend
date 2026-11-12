'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatNaira } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { ActiveBadge, AdminPagination, AdminTitle, EmptyRow, ErrorBox, FilterSelect, SearchBox, TableHead, TableWrap, td } from './admin-ui';
import type { AdminUserRow } from '@/types/admin';
import type { Paginated } from '@/types';

export function UsersTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const params = { page, limit: 20, sort, ...(search && { search }), ...(status && { isActive: status }), ...(role && { role }) };
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => (await api.get<Paginated<AdminUserRow>>('/admin/users', { params })).data,
  });

  return (
    <div>
      <AdminTitle title="Users" description="Customers and admins. Open a user to block, unblock or change role." />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchBox value={search} onChange={reset(setSearch)} placeholder="Name, email or phone..." />
        <FilterSelect label="Status" value={status} onChange={reset(setStatus)} options={[{ value: '', label: 'All statuses' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Blocked' }]} />
        <FilterSelect label="Role" value={role} onChange={reset(setRole)} options={[{ value: '', label: 'All roles' }, { value: 'customer', label: 'Customers' }, { value: 'admin', label: 'Admins' }]} />
        <FilterSelect label="Sort" value={sort} onChange={reset(setSort)} options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'top_spenders', label: 'Top spenders' }, { value: 'most_orders', label: 'Most orders' }]} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorBox message={getErrorMessage(error)} />
      ) : (
        <>
          <TableWrap>
            <TableHead columns={['User', 'Phone', 'Role', 'Orders', 'Spent', 'Joined', 'Status', '']} />
            <tbody className="divide-y divide-navy/10">
              {data?.data.length === 0 && <EmptyRow colSpan={8} message="No users found" />}
              {data?.data.map((u) => (
                <tr key={u._id} className="hover:bg-surface">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-navy text-sm font-bold uppercase text-gold">{u.name.charAt(0)}</span>
                      <div className="min-w-0">
                        <p className="font-medium">{u.name}</p>
                        <p className="max-w-[220px] truncate text-xs text-navy/55">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>{u.phone ?? '—'}</td>
                  <td className={td}>
                    <span className={u.role === 'admin' ? 'bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-navy' : 'text-xs capitalize text-navy/70'}>{u.role}</span>
                  </td>
                  <td className={td}>{u.orderCount}</td>
                  <td className={`${td} font-semibold`}>{formatNaira(u.totalSpent)}</td>
                  <td className={`${td} whitespace-nowrap text-navy/60`}>{formatDate(u.createdAt)}</td>
                  <td className={td}><ActiveBadge active={u.isActive} inactiveLabel="Blocked" /></td>
                  <td className={td}>
                    <Link href={`/admin/users/${u._id}`} className="bg-navy px-3 py-1.5 text-xs font-semibold uppercase text-gold hover:bg-gold hover:text-navy">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <AdminPagination meta={data?.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}