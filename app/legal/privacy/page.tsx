'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { LegalPageHeader } from '@/components/LegalPageHeader';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size={36} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <LegalPageHeader
          badge="Gizlilik Standartları"
          title="Gizlilik ve Veri Güvenliği Taahhüdü"
          subtitle="LuxDues Platformunda Bilgi Güvenliği Standartları"
          accent="indigo"
          icon={
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-8">

          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">1. Veri Gizliliği Prensibimiz</h2>
              <p>
                LuxDues, kullanıcılarının ve site sakinlerinin verilerini en üst düzey şifreleme ve güvenlik önlemleriyle korumaktadır. Sakin ve yönetici verileri hiçbir koşulda ticari amaçla üçüncü taraflara satılmaz veya paylaşılmaz.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">2. Şifreleme ve Altyapı Güvenliği</h2>
              <p>
                Tüm veri transferleri SSL/TLS 256-bit şifreleme protokolü üzerinden gerçekleştirilir. Kullanıcı parolaları tek yönlü güçlü kriptografik özetleme algoritmaları (bcrypt/hash) ile saklanır ve sistem yöneticileri dahil hiç kimse tarafından açık metin olarak görülemez.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">3. İletişim</h2>
              <p>
                Gizlilik politikamızla ilgili her türlü geri bildirim ve sorularınız için <a href="mailto:luxdues@gmail.com" className="text-zinc-900 font-semibold underline">luxdues@gmail.com</a> adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
