'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ProfileMenu } from '@/components/ProfileMenu';
import { NotificationMenu } from '@/components/NotificationMenu';
import { PortalSwitcher } from '@/components/PortalSwitcher';
import { PortalLogoHint } from '@/components/PortalLogoHint';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isBuildingsActive = pathname.startsWith('/admin/buildings') || pathname === '/admin';
  const isAdminsActive = pathname.startsWith('/admin/admins');

  return (
    <div className="min-h-screen bg-zinc-50 relative">
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-zinc-200/40 via-zinc-100/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between min-h-16 py-2 sm:h-16 sm:py-0 sm:flex-nowrap">
            {/* Left: Brand, 3D Visual Portal Title & Navigation */}
            <div className="flex flex-1 min-w-0 flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 sm:flex-nowrap">
              <Link href="/" className="flex items-center group">
                <Logo size={40} />
              </Link>
              <PortalLogoHint portal="admin" />

              <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

              {/* Portal Switcher Pill — on mobile drops to a full-width row under the logo */}
              <div className="w-full sm:w-auto order-last sm:order-none">
                <PortalSwitcher current="admin" />
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/admin/buildings"
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isBuildingsActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Binalar</span>
                </Link>
                <Link
                  href="/admin/admins"
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isAdminsActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span>Yöneticiler</span>
                </Link>
              </div>
            </div>

            {/* Right: Actions — stays pinned to the top row on mobile */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center pt-1 sm:pt-0 flex-shrink-0">
              <NotificationMenu />
              <ProfileMenu />
              
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Small Modal */}
              <div className="fixed top-[6.75rem] right-3 z-50 sm:hidden bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-52 border border-zinc-200/50 animate-in slide-in-from-top-2 fade-in duration-200">
                {/* Menu Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100/50 bg-gradient-to-r from-zinc-50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 text-xs">Menü</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Menu Content */}
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/admin/buildings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                      isBuildingsActive
                        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isBuildingsActive ? 'bg-white/20' : 'bg-zinc-100'}`}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span>Binalar</span>
                  </Link>
                  <Link
                    href="/admin/admins"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                      isAdminsActive
                        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isAdminsActive ? 'bg-white/20' : 'bg-zinc-100'}`}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <span>Yöneticiler</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}
