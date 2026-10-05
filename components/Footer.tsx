'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isHomePage, setIsHomePage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsHomePage(window.location.pathname === '/');
    const token = document.cookie.includes('auth-token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1500;
        let startTimestamp: number | null = null;

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, startPosition + distance * easeProgress);
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };

        window.requestAnimationFrame(step);
      }
    }
  };

  const handlePortalClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, path: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.push('/?auth=login');
    }
  };

  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800/60 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-32 bg-gradient-to-b from-zinc-700/25 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-8 pb-8 sm:pb-10 lg:pb-12 border-b border-zinc-800/60">
          {/* Brand & Description (2 cols on lg) */}
          <div className="col-span-3 lg:col-span-2 space-y-3 sm:space-y-4">
            <Link href="/" className="inline-block group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11">
                <Logo size={36} variant="dark" className="w-full h-full" />
              </div>
            </Link>
            <p className="text-xs sm:text-xs lg:text-sm text-zinc-400 font-light leading-relaxed max-w-sm">
              LuxDues, modern site ve apartman yönetimlerini tek ekranda toplayan, şeffaf aidat ve finans takip altyapısı sunan yeni nesil yönetim platformudur.
            </p>

            {/* Social Media Link (Instagram) */}
            <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
              <a
                href="https://www.instagram.com/lux.studio.inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 transition-all text-[10px] sm:text-xs font-medium group"
                title="Instagram'da Bizi Takip Edin"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@lux.studio.inc</span>
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-semibold text-white tracking-wider uppercase">Platform</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs lg:text-sm text-zinc-400">
              <li>
                <Link
                  href="/admin"
                  className="hover:text-white transition-colors"
                  onClick={(e) => handlePortalClick(e, '/admin')}
                >
                  Yönetici Portalı
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white transition-colors"
                  onClick={(e) => handlePortalClick(e, '/dashboard')}
                >
                  Sakin Portalı
                </Link>
              </li>
              <li>
                <Link
                  href="/#ozellikler"
                  className="hover:text-white transition-colors"
                  onClick={(e) => handleSmoothScroll(e, 'ozellikler')}
                >
                  Özellikler
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-white transition-colors flex items-center gap-1 sm:gap-1.5 text-zinc-300 font-medium">
                  <span>Sıkça Sorulan Sorular</span>
                  <span className="px-1 sm:px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold bg-zinc-800 text-zinc-200 rounded-full">SSS</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Yasal & Hukuki */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-semibold text-white tracking-wider uppercase">Yasal & Gizlilik</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs lg:text-sm text-zinc-400">
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Kullanıcı Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/legal/kvkk" className="hover:text-white transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white transition-colors">
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Gizlilik Güvencesi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: İletişim */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-semibold text-white tracking-wider uppercase">İletişim & Destek</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs lg:text-sm text-zinc-400">
              <li>
                <a href="mailto:lux.studio.tr@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 break-all">
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>lux.studio.tr@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2 text-zinc-400">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>7/24 Online Destek</span>
              </li>
              <li className="pt-0.5 sm:pt-1">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.75 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Aktif & Güvenli
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-500">
          <p>© {currentYear} LuxDues Inc. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <Link href="/legal/terms" className="hover:text-zinc-300 transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/legal/kvkk" className="hover:text-zinc-300 transition-colors">
              KVKK
            </Link>
            <Link href="/legal/cookies" className="hover:text-zinc-300 transition-colors">
              Çerezler
            </Link>
            <Link href="/sss" className="hover:text-zinc-300 transition-colors">
              SSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
