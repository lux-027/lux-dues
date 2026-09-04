'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ProfileMenu } from '@/components/ProfileMenu';
import { NotificationMenu } from '@/components/NotificationMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size={44} />
            </Link>
            <div className="flex items-center gap-3">
              <NotificationMenu />
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
