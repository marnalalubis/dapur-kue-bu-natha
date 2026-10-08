'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cookie,
  LayoutDashboard,
  ChefHat,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoginPage) {
      setIsAdmin(true);
      return;
    }

    async function verify() {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
        } else {
          setIsAdmin(true);
        }
      } catch {
        router.replace('/admin/login');
      }
    }
    verify();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-stone-100">{children}</div>;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Kebutuhan Stok Produksi',
      href: '/admin/production',
      icon: ChefHat,
    },
    {
      label: 'Rekap Pelanggan',
      href: '/admin/customers',
      icon: Users,
    },
    {
      label: 'Daftar Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Kelola Katalog Kue',
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Pengaturan Toko',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-stone-900 text-stone-200 flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-5 border-b border-stone-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold">
            <Cookie className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-black text-sm text-white tracking-tight">
              Admin Dapur Bu Natha
            </div>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Panel Pemilik Toko</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat Toko Publik</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900">
            <Cookie className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">Admin Dapur Bu Natha</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 space-y-2 z-40 fixed top-16 left-0 right-0 shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-amber-400 font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Toko</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
