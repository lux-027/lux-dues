'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 text-center">
      <Logo size={56} />
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Bir Şeyler Ters Gitti</h1>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm">
        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin; sorun devam ederse bizimle iletişime geçin.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 text-sm font-semibold transition-colors shadow-sm"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
