import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 text-center">
      <Logo size={56} />
      <h1 className="mt-6 text-6xl font-bold text-zinc-900 tracking-tight">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-zinc-900">Sayfa Bulunamadı</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors shadow-sm"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
