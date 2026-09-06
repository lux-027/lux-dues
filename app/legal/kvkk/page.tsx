'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { LegalPageHeader } from '@/components/LegalPageHeader';

export default function KVKKPage() {
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
          badge="Kişisel Verilerin Korunması"
          title="KVKK Aydınlatma Metni"
          subtitle="6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme"
          accent="emerald"
          icon={
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 11V7a4 4 0 118 0v4" />
              <circle cx="14" cy="9" r="1.5" fill="currentColor" />
            </svg>
          }
        />

        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-8">

          {/* KVKK Content */}
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">1. Veri Sorumlusunun Kimliği</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, <strong>LuxDues Inc.</strong> ("LuxDues") olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda, hukuka ve dürüstlük kurallarına uygun olarak işlemekte, saklamakta ve korumaktayız.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">2. İşlenen Kişisel Verileriniz ve Toplanma Yöntemleri</h2>
              <p>Platformumuz üzerinden toplanan kişisel verileriniz şunlardır:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, 9 haneli Kullanıcı ID numarası.</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, cep telefonu numarası.</li>
                <li><strong>Mülk ve Konum Bilgileri:</strong> Bina/site adı, blok adı, kat ve kapı numarası, adres bilgisi.</li>
                <li><strong>Finansal Bilgiler:</strong> Aidat tutarı, borç durumu, ödeme kayıtları ve proje ödemeleri.</li>
                <li><strong>İşlem Güvenliği Bilgileri:</strong> Giriş IP adresi, oturum çerezleri, şifrelenmiş parola özetleri.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bina ve site yönetim hizmetlerinin dijital ortamda eksiksiz yürütülmesi,</li>
                <li>Daire sakinlerinin aidat ve proje borçlarının takibi, makbuzlandırılması ve şeffaf biçimde görüntülenmesi,</li>
                <li>Yönetici ve sakinler arasında yetkilendirme, davet ve bildirim mekanizmalarının çalıştırılması,</li>
                <li>Kullanıcı hesap güvenliğinin sağlanması ve yetkisiz erişimlerin önlenmesi,</li>
                <li>Mevzuattan doğan yasal yükümlülüklerin yerine getirilmesi.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">4. Kişisel Verilerin Aktarımı</h2>
              <p>
                Kişisel verileriniz; yasal zorunluluklar ve platform hizmetlerinin sunulması haricinde üçüncü şahıslara satılmaz, kiralanmaz veya ticari amaçla devredilmez. Verileriniz, yalnızca mevzuatın izin verdiği yetkili kamu kurum ve kuruluşları ile teknik altyapı sağlayıcılarımız (güvenli sunucu ve veritabanı sağlayıcıları) ile sınırlı olarak paylaşılabilir.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">5. Veri Sahibinin KVKK Madde 11 Kapsamındaki Hakları</h2>
              <p>KVKK'nın 11. maddesi uyarınca veri sahipleri olarak aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK'ya uygun olarak kişisel verilerinizin silinmesini veya yok edilmesini talep etme.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">6. Başvuru ve İletişim</h2>
              <p>
                Yukarıda belirtilen haklarınızı kullanmak için taleplerinizi kayıtlı e-posta adresiniz üzerinden <a href="mailto:luxdues@gmail.com" className="text-zinc-900 font-semibold underline">luxdues@gmail.com</a> adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
