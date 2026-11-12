'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  Landmark,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  ShoppingCart,
  SprayCan,
  Store,
  Tags,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
  { href: '/admin/perfumes', label: 'Perfumes', icon: SprayCan },
  { href: '/admin/brands', label: 'Brands', icon: Tags },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/bank-accounts', label: 'Bank accounts', icon: Landmark },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (status === 'guest') router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    else if (status === 'authenticated' && user?.role !== 'admin') router.replace('/');
  }, [status, user, router, pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (status !== 'authenticated' || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-gold">
        <Spinner size="lg" />
      </div>
    );
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      {open && <div className="fixed inset-0 z-40 bg-navy-dark/60 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-4 border-gold bg-navy text-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gold/30 px-5">
          <Link href="/admin" className="font-serif text-xl font-semibold text-gold">
            {SITE_NAME}
            <span className="text-white">.</span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center hover:text-gold lg:hidden">
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">Admin panel</p>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                      active ? 'bg-gold font-semibold text-navy' : 'text-white/80 hover:bg-white/5 hover:text-gold',
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-gold/30 p-3">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-gold">
            <Store size={18} /> View store
          </Link>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white/80 hover:text-error">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center bg-navy text-gold lg:hidden">
              <Menu size={20} />
            </button>
            <span className="font-serif text-lg lg:hidden">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-navy/55">{user.email}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center bg-gold font-bold uppercase text-navy">{user.name.charAt(0)}</span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}