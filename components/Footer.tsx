'use client';

import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800/60 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-32 bg-gradient-to-b from-zinc-700/25 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-zinc-800/60">
          {/* Brand & Description (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <Logo size={44} variant="dark" />
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-sm">
              LuxDues, modern site ve apartman yönetimlerini tek ekranda toplayan, şeffaf aidat ve finans takip altyapısı sunan yeni nesil yönetim platformudur.
            </p>

            {/* Social Media Link (Instagram) */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/lux.studio.inc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 transition-all text-xs font-medium group"
                title="Instagram'da Bizi Takip Edin"
              >
                <svg className="h-4 w-4 text-zinc-400 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@lux.studio.inc</span>
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Yönetici Portalı
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Sakin Portalı
                </Link>
              </li>
              <li>
                <Link href="/#ozellikler" className="hover:text-white transition-colors">
                  Özellikler
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-white transition-colors flex items-center gap-1.5 text-zinc-300 font-medium">
                  <span>Sıkça Sorulan Sorular</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-zinc-800 text-zinc-200 rounded-full">SSS</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Yasal & Hukuki */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Yasal & Gizlilik</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
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
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">İletişim & Destek</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li>
                <a href="mailto:luxdues@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>luxdues@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>7/24 Online Destek</span>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Aktif & Güvenli
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {currentYear} LuxDues Inc. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
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
