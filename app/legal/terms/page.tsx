'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { LegalPageHeader } from '@/components/LegalPageHeader';

export default function TermsPage() {
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
          badge="Hukuki Dokümantasyon"
          title="Kullanıcı ve Hizmet Sözleşmesi"
          subtitle="Son Güncelleme: 1 Ocak 2026 | Yürürlük Sürümü: v1.4"
          accent="zinc"
          icon={
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
        />

        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-8">

          {/* Legal Content */}
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">1. Taraflar ve Sözleşmenin Konusu</h2>
              <p>
                İşbu Kullanıcı Sözleşmesi ("Sözleşme"), <strong>LuxDues Inc.</strong> ("LuxDues" veya "Hizmet Sağlayıcı") ile LuxDues web platformuna (www.luxdues.com) erişim sağlayan, platformu kullanan, bina/site yöneticisi ("Yönetici") veya daire sakini ("Sakin") sıfatıyla kayıt olan gerçek veya tüzel kişiler ("Kullanıcı") arasında akdedilmiştir.
              </p>
              <p>
                Sözleşmenin konusu; LuxDues tarafından sunulan apartman, site, blok, aidat tahakkuku, gider paylaşımı, daire sakini yönetimi ve iletişim panelleri hizmetlerinin kullanım şart ve kurallarının belirlenmesidir.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">2. Hizmet Kapsamı ve Tanımlar</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Platform:</strong> LuxDues'a ait tüm web uygulaması, yönetim portalları ve servisleri.</li>
                <li><strong>Yönetici:</strong> Apartman veya site yönetim kurulu kararı veya yetkilendirme ile sistemi kuran ve veri girişini sağlayan yetkili hesap.</li>
                <li><strong>Sakin:</strong> İlgili bağımsız bölümlere (daire/dükkan) yönetici tarafından atanan veya 9 haneli Kullanıcı ID ile bağlanan mülk sahibi veya kiracı.</li>
                <li><strong>Aidat ve Proje Kayıtları:</strong> Yöneticiler tarafından bağımsız bölümler adına oluşturulan finansal borçlandırma ve gider kayıtları.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">3. Kullanım Koşulları ve Hesap Güvenliği</h2>
              <p>
                3.1. Kullanıcı, platforma kayıt olurken ve platformu kullanırken verdiği tüm bilgilerin (ad, soyad, e-posta, telefon, bina adresi, kapı numarası vb.) doğru ve güncel olduğunu kabul ve taahhüt eder.
              </p>
              <p>
                3.2. Kullanıcı hesabı kişiye özeldir. Kullanıcı, şifresinin ve hesap güvenliğinin korunmasından bizzat sorumludur. Hesabın üçüncü kişilere devredilmesi veya paylaşılması kesinlikle yasaktır.
              </p>
              <p>
                3.3. Yöneticiler, sisteme kaydettikleri sakinlerin telefon numaralarını ve kişisel bilgilerini 6698 sayılı KVKK mevzuatına uygun şekilde edinmek ve işlemekle yükümlüdür.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">4. Finansal İşlemler ve Sorumluluk Reddi</h2>
              <p>
                4.1. LuxDues, bir banka veya ödeme kuruluşu olmayıp; yöneticiler ve sakinler arasındaki aidat, proje ve gider kayıtlarının dijital ortamda takip edilmesini sağlayan bir yönetim yazılımıdır.
              </p>
              <p>
                4.2. Yöneticiler tarafından girilen aidat tutarları, gecikme zamları, ödeme durumları ve harcama belgelerinin doğruluğundan tamamen ilgili bina/site yönetimi sorumludur. LuxDues, yöneticilerin hatalı veya eksik veri girişinden sorumlu tutulamaz.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">5. Fikri Mülkiyet Hakları</h2>
              <p>
                Platformun yazılımı, tasarımı, logosu, 3D görsel modelleri, veritabanı mimarisi ve tüm fikri mülkiyet hakları münhasıran LuxDues Inc.'e aittir. Platformun kaynak kodlarının kopyalanması, tersine mühendislik yapılması veya izinsiz kullanılması yasaktır.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">6. Sözleşmenin Feshi ve Değişiklikler</h2>
              <p>
                LuxDues, işbu sözleşme koşullarını mevzuat değişiklikleri veya platform güncellemeleri doğrultusunda tek taraflı olarak güncelleme hakkını saklı tutar. Güncel sözleşme platform üzerinde yayımlandığı tarihte yürürlüğe girer.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">7. İletişim ve Yetkili Mahkeme</h2>
              <p>
                Sözleşmenin uygulanmasından doğabilecek uyuşmazlıklarda Türk Hukuku uygulanacak olup, Gaziantep Mahkemeleri ve İcra Daireleri yetkilidir. Her türlü soru ve bildirim için <a href="mailto:luxdues@gmail.com" className="text-zinc-900 font-semibold underline">luxdues@gmail.com</a> adresinden iletişime geçebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
