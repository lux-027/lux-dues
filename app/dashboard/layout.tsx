'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ProfileMenu } from '@/components/ProfileMenu';
import { NotificationMenu } from '@/components/NotificationMenu';
import { Isometric3DBuilding } from '@/components/Isometric3DBuilding';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 relative">
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-zinc-200/40 via-zinc-100/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Glassmorphic Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & 3D Visual Portal Title */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <Link href="/" className="flex items-center group">
                <Logo size={40} />
              </Link>

              <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

              {/* 3D Visual & Resident Portal Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 bg-zinc-100/80 hover:bg-zinc-100 border border-zinc-200/80 rounded-full transition-all">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm border border-zinc-200/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Isometric3DBuilding size={26} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-900">Sakin Portalı</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
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
