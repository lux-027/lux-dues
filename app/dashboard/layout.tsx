'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ProfileMenu } from '@/components/ProfileMenu';
import { NotificationMenu } from '@/components/NotificationMenu';
import { PortalSwitcher } from '@/components/PortalSwitcher';
import { PortalLogoHint } from '@/components/PortalLogoHint';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 relative">
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-zinc-200/40 via-zinc-100/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between min-h-16 py-2 sm:h-16 sm:py-0 sm:flex-nowrap">
            {/* Left: Brand & Portal Switcher */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 sm:gap-4 sm:flex-nowrap">
              <Link href="/" className="flex items-center group">
                <Logo size={40} />
              </Link>
              <PortalLogoHint portal="resident" />

              <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

              {/* Portal Switcher — on mobile drops to a full-width row under the logo */}
              <div className="w-full sm:w-auto order-last sm:order-none">
                <PortalSwitcher current="resident" />
              </div>
            </div>

            {/* Right: Actions — stays pinned to the top row on mobile */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center pt-1 sm:pt-0">
              <NotificationMenu />
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}
