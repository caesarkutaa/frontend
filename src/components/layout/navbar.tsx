'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { useAuthStore } from '@/store/auth.store';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative flex h-10 w-10 items-center justify-center text-white hover:text-gold"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('font-serif font-semibold tracking-wide text-gold', className)}>
      {SITE_NAME}
      <span className="text-white">.</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    router.replace('/');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href.split('?')[0];
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 border-b-2 border-gold bg-navy">
      {/* Announcement bar — gold */}
      <div className="bg-gold px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-navy sm:text-xs">
        Free delivery on every order · 100% authentic
      </div>

      <nav className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
        {/* Left: menu button (mobile) + logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="-ml-2 flex h-10 w-10 items-center justify-center text-white hover:text-gold lg:hidden"
          >
            <Menu size={22} />
          </button>

          <Link href="/">
            <Logo className="text-xl xs:text-2xl" />
          </Link>
        </div>

        {/* Center: desktop links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'border-b-2 py-1 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:text-gold',
                  isActive(link.href)
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/85',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/perfumes?focus=search"
            aria-label="Search perfumes"
            className="flex h-10 w-10 items-center justify-center text-white hover:text-gold"
          >
            <Search size={20} />
          </Link>

          <CartButton />

          {status === 'authenticated' && user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
                className="flex h-10 w-10 items-center justify-center bg-gold text-sm font-bold uppercase text-navy hover:bg-gold-light"
              >
                {user.name.charAt(0)}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 border-t-2 border-gold bg-white text-navy shadow-xl">
                  <div className="border-b border-navy/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-navy/50">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gold-dark hover:bg-surface"
                      >
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface hover:text-gold-dark"
                    >
                      <User size={16} /> My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface hover:text-gold-dark"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-error hover:bg-error/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Log in"
              className="flex h-10 items-center justify-center px-2 text-white hover:text-gold"
            >
              <User size={20} className="sm:hidden" />
              <span className="hidden border border-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-navy sm:inline">
                Log in
              </span>
            </Link>
          )}
        </div>
      </nav>

      {/* ============ Mobile drawer ============ */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-navy-dark/60 transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
        />

        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white text-navy transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between border-b-2 border-gold bg-navy px-4">
            <Logo className="text-xl" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center text-white hover:text-gold"
            >
              <X size={22} />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto py-2">
            {[...NAV_LINKS, { href: '/cart', label: 'Cart' }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center border-b border-navy/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.15em]',
                    isActive(link.href)
                      ? 'border-l-4 border-l-gold bg-gold/15 text-navy'
                      : 'text-navy hover:text-gold-dark',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-navy/10 bg-surface p-4">
            {status === 'authenticated' && user ? (
              <div className="space-y-1">
                <p className="mb-3 truncate text-sm text-navy/70">
                  Signed in as <span className="font-semibold text-navy">{user.name}</span>
                </p>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 py-2.5 text-sm font-medium text-gold-dark"
                  >
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                )}
                <Link href="/account" className="flex items-center gap-3 py-2.5 text-sm">
                  <User size={16} /> My Account
                </Link>
                <Link href="/orders" className="flex items-center gap-3 py-2.5 text-sm">
                  <Package size={16} /> My Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 py-2.5 text-left text-sm text-error"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center border border-navy text-xs font-semibold uppercase tracking-wider text-navy"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="flex h-11 items-center justify-center bg-navy text-xs font-semibold uppercase tracking-wider text-gold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}