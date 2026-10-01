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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
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

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">

          {/* KVKK Content */}
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">1. Veri Sorumlusunun Kimliği</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, <strong>LuxDues Inc.</strong> ("LuxDues" veya "Veri Sorumlusu") olarak, kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda, hukuka ve dürüstlük kurallarına uygun olarak işlemekte, saklamakta ve korumaktayız. İşbu aydınlatma metni, KVKK'nın 10. maddesi gereğince hazırlanmıştır.
              </p>
              <p>
                <strong>Veri Sorumlusu:</strong> LuxDues Inc.<br/>
                <strong>Adres:</strong> Gaziantep, Türkiye<br/>
                <strong>İletişim:</strong> <a href="mailto:lux.studio.tr@gmail.com" className="text-zinc-900 font-semibold underline">lux.studio.tr@gmail.com</a>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">2. İşlenen Kişisel Verileriniz ve Toplanma Yöntemleri</h2>
              <p>Platformumuz üzerinden toplanan kişisel verileriniz aşağıdaki yöntemlerle işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası veya vergi numarası (veri girişi sırasında), 9 haneli Kullanıcı ID numarası.</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, cep telefonu numarası, adres bilgisi.</li>
                <li><strong>Mülk ve Konum Bilgileri:</strong> Bina/site adı, blok adı, kat ve kapı numarası, mülk tipi (daire, dükkan, ofis), adres bilgisi.</li>
                <li><strong>Finansal Bilgiler:</strong> Aidat tutarı, borç durumu, ödeme kayıtları, proje ödemeleri, banka hesap bilgileri (sadece yönetici tarafından girilirse).</li>
                <li><strong>İşlem Güvenliği Bilgileri:</strong> Giriş IP adresi, oturum çerezleri, şifrelenmiş parola özetleri, cihaz bilgileri.</li>
                <li><strong>Üyelik Bilgileri:</strong> Kayıt tarihi, son giriş tarihi, hesap aktivite durumu.</li>
              </ul>
              <p>Kişisel verileriniz, platform kullanımı sırasında elektronik ortamda, açık rıza, sözleşme gerekçesi veya yasal zorunluluk kapsamında toplanmaktadır.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>Kişisel verileriniz aşağıdaki amaçlarla KVKK'ya uygun olarak işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bina ve site yönetim hizmetlerinin dijital ortamda eksiksiz, şeffaf ve yasalara uygun şekilde yürütülmesi,</li>
                <li>Bağımsız bölüm sakinlerinin aidat, proje ve gider borçlarının takibi, hesaplanması, makbuzlandırılması ve görüntülenmesi,</li>
                <li>Yönetici ve sakinler arasında yetkilendirme, davet, bildirim ve iletişim mekanizmalarının çalıştırılması,</li>
                <li>Kullanıcı hesap güvenliğinin sağlanması, yetkisiz erişimlerin önlenmesi ve şifre yönetimi,</li>
                <li>Mevzuattan doğan yasal yükümlülüklerin (muhtasar beyanname, vergi vb.) yerine getirilmesi,</li>
                <li>Platformun geliştirilmesi, kullanıcı deneyiminin iyileştirilmesi ve istatistiksel analizler yapılması,</li>
                <li>Hukuki uyuşmazlıkların çözümü ve delil oluşturma amaçlarıyla kullanılması.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">4. Kişisel Verilerin Aktarımı</h2>
              <p>
                Kişisel verileriniz; yasal zorunluluklar ve platform hizmetlerinin sunulması haricinde üçüncü şahıslara satılmaz, kiralanmaz veya ticari amaçla devredilmez. Verileriniz, aşağıdaki durumlarda ve sınırlarla aktarılabilir:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Yasal zorunluluklar: Mahkeme kararı, savcılık talebi veya resmi kurum talepleri doğrultusunda ilgili makamlara aktarım.</li>
                <li>Teknik altyapı sağlayıcıları: Güvenli sunucu, veritabanı ve bulut hizmetleri sağlayıcıları ile KVKK uyumlu sözleşmeler kapsamında aktarım.</li>
                <li>Yetkili kişiler: Yöneticiler, sadece kendi yönetimindeki sakinlerin verilerine KVKK uyumlu şekilde erişebilir.</li>
              </ul>
              <p>Yurt dışına veri aktarımı yapılmamaktadır. Tüm veriler Türkiye'de bulunan güvenli sunucularda saklanmaktadır.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">5. Veri Saklama Süresi</h2>
              <p>Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen veri işleme şartlarından herhangi birinin mevcut olduğu süre boyunca saklanacaktır. Hesap silinmesi veya veri işleme şartlarının ortadan kalkması durumunda, kişisel verileriniz KVKK'nın 7. maddesi uyarınca silinmek, yok edilmek veya anonimleştirilmek üzere işleme tabi tutulacaktır. Yasal saklama süreleri (ticari defterler, vergi kayıtları vb.) saklıdır.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">6. Veri Sahibinin KVKK Madde 11 Kapsamındaki Hakları</h2>
              <p>KVKK'nın 11. maddesi uyarınca veri sahipleri olarak aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı kişileri bilme,</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK'ya uygun olarak kişisel verilerinizin silinmesini veya yok edilmesini talep etme,</li>
                <li>İşlenen verilerinizin exclusively otomatik sistemler ile analiz edilmesi durumunda aleyhinize olan sonucun itiraz etme,</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">7. Başvuru ve İletişim</h2>
              <p>
                Yukarıda belirtilen haklarınızı kullanmak için taleplerinizi kayıtlı e-posta adresiniz üzerinden <a href="mailto:lux.studio.tr@gmail.com" className="text-zinc-900 font-semibold underline">lux.studio.tr@gmail.com</a> adresine veya platform üzerindeki hesap ayarları bölümünden iletebilirsiniz. Başvurularınız, KVKK'nın 13. maddesi uyarınca en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. Başvurunuzun reddedilmesi veya tamamen yerine getirilmemesi durumunda, gerekçesi ile birlikte bildirim yapılacaktır.
              </p>
              <p><strong>Yürürlük Tarihi:</strong> 1 Ocak 2026</p>
              <p><strong>Sürüm:</strong> v1.4</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
