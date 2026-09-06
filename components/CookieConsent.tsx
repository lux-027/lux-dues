'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('luxdues-cookie-consent');
    if (consent !== 'accepted') {
      // Delay banner slightly for better UX
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('luxdues-cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-950 text-white border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-3 fade-in duration-300">
          {/* Icon + Text */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="h-10 w-10 rounded-xl bg-zinc-800/90 flex items-center justify-center flex-shrink-0 border border-zinc-700">
              <svg className="h-5 w-5 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-white leading-snug">
                Çerezler Kullanıyoruz
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Web sitemizdeki çerezler (cookie), kullanıcı deneyimini artıran teknik özellikleri desteklemek için kullanılır. Çerez kullanımına ilişkin ayrıntılı bilgi için lütfen{' '}
                <Link
                  href="/legal/cookies"
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                >
                  Aydınlatma Metnimizi
                </Link>{' '}
                inceleyin.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
            >
              Kabul Et
            </button>

            <Link
              href="/legal/cookies"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl border border-zinc-700 transition-colors"
            >
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
