'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { LegalPageHeader } from '@/components/LegalPageHeader';

export default function CookiesPage() {
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
          badge="Gizlilik ve Çerezler"
          title="Çerez (Cookie) Politikası"
          subtitle="LuxDues Platformunda Çerez Kullanımı Hakkında Bilgilendirme"
          accent="amber"
          icon={
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a8 8 0 00-8 8c0 1.737.5 3.36 1.364 4.724L4 17l2.276-1.364A8 8 0 1012 2z" />
              <circle cx="9.5" cy="9.5" r="1.25" fill="currentColor" />
              <circle cx="14.5" cy="8.5" r="1.25" fill="currentColor" />
              <circle cx="13" cy="13.5" r="1.25" fill="currentColor" />
              <circle cx="9" cy="14.5" r="1.25" fill="currentColor" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 5l2-2" />
            </svg>
          }
        />

        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-8">

          {/* Cookies Content */}
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">1. Çerez Nedir?</h2>
              <p>
                Çerezler (Cookies), web sitelerini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin güvenli şekilde çalışmasını, kullanıcı oturumunun korunmasını ve kullanıcı deneyiminin iyileştirilmesini sağlar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">2. LuxDues Hangi Çerezleri Kullanır?</h2>
              <p>Platformumuzda yalnızca hizmetin zorunlu olarak çalışmasını sağlayan çerezler kullanılmaktadır:</p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <h3 className="font-semibold text-zinc-900 text-xs">A. Zorunlu Oturum Çerezleri (auth-token)</h3>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Kullanıcıların sisteme güvenli şekilde giriş yapmasını, yönetici veya sakin paneli oturumunun korunmasını sağlayan şifrelenmiş HTTP-Only çerezlerdir.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <h3 className="font-semibold text-zinc-900 text-xs">B. Tercih ve Güvenlik Çerezleri</h3>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Aktif bina seçimi, seçili blok filtreleri ve oturum güvenliği doğrulama parametrelerini saklamak amacıyla kullanılır.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">3. Çerezlerin Yönetimi ve Devre Dışı Bırakılması</h2>
              <p>
                Tarayıcı ayarlarınızı değiştirerek çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz. Ancak zorunlu oturum çerezleri devre dışı bırakıldığında, LuxDues platformuna giriş yapamayabilir ve yönetim panellerine erişemezsiniz.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">4. İletişim</h2>
              <p>
                Çerez politikamız ile ilgili sorularınız için <a href="mailto:luxdues@gmail.com" className="text-zinc-900 font-semibold underline">luxdues@gmail.com</a> adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
