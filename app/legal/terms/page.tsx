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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
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

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">

          {/* Legal Content */}
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-600 leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">1. Sözleşmenin Tarafları ve Kabulü</h2>
              <p>
                İşbu Kullanıcı ve Hizmet Sözleşmesi ("Sözleşme"), LuxDues Inc. ("LuxDues" veya "Hizmet Sağlayıcı") ile LuxDues web platformuna (www.luxdues.com) erişim sağlayan, platformu kullanan, bina/site yöneticisi ("Yönetici") veya bağımsız bölüm sakini ("Sakin") sıfatıyla kayıt olan gerçek veya tüzel kişiler ("Kullanıcı") arasında akdedilmiştir.
              </p>
              <p>
                Kullanıcı, platforma kayıt olurken veya platformu kullanırken işbu sözleşme hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan eder. Platformu kullanmaya başlamakla birlikte, işbu sözleşmenin tüm hükümlerini eksiksiz kabul etmiş sayılır.
              </p>
              <p>
                Sözleşmenin konusu; LuxDues tarafından sunulan apartman, site, blok, aidat tahakkuku, gider paylaşımı, bağımsız bölüm sakini yönetimi, bildirim ve iletişim panelleri hizmetlerinin kullanım şart ve kurallarının belirlenmesidir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">2. Hizmet Kapsamı ve Tanımlar</h2>
              <p>LuxDues tarafından sunulan hizmetler kapsamında aşağıdaki tanımlar uygulanır:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Platform:</strong> LuxDues'a ait tüm web uygulaması, mobil uyumlu arayüz, yönetim portalları ve servisleri.</li>
                <li><strong>Yönetici:</strong> Apartman veya site yönetim kurulu kararı, yönetim planı veya yetkilendirme ile sistemi kuran, bina/site bilgilerini giren, aidat ve gider tahakkuklarını gerçekleştiren yetkili hesap sahibi.</li>
                <li><strong>Sakin:</strong> İlgili bağımsız bölümlere (daire, dükkan, ofis vb.) yönetici tarafından atanan veya 9 haneli Kullanıcı ID veya davet kodu ile sisteme bağlanan mülk sahibi veya kiracı.</li>
                <li><strong>Aidat ve Proje Kayıtları:</strong> Yöneticiler tarafından bağımsız bölümler adına oluşturulan aylık aidat, özel proje, ortak gider ve harcama kayıtları.</li>
                <li><strong>Hesap:</strong> Kullanıcı adı, e-posta veya telefon numarası ve şifre ile tanımlanan, platforma erişim sağlayan kullanıcı kimliği.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">3. Kullanım Koşulları ve Hesap Güvenliği</h2>
              <p><strong>3.1. Bilgi Doğruluğu:</strong> Kullanıcı, platforma kayıt olurken ve platformu kullanırken verdiği tüm bilgilerin (ad, soyad, T.C. kimlik numarası veya vergi numarası, e-posta, telefon, bina adresi, kapı numarası, mülk sahipliği durumu vb.) doğru, güncel ve eksiksiz olduğunu kabul ve taahhüt eder. Bilgilerde değişiklik olması durumunda en geç 7 gün içinde güncelleme yapılması zorunludur.</p>
              <p><strong>3.2. Hesap Güvenliği:</strong> Kullanıcı hesabı kişiye özeldir. Kullanıcı, şifresinin ve hesap güvenliğinin korunmasından bizzat sorumludur. Hesabın üçüncü kişilere devredilmesi, paylaşılması veya izinsiz kullanılması kesinlikle yasaktır. Şifre güvenliğinden doğacak zararlardan Kullanıcı sorumludur.</p>
              <p><strong>3.3. KVKK Uyumu:</strong> Yöneticiler, sisteme kaydettikleri sakinlerin telefon numaralarını, adreslerini ve kişisel bilgilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu mevzuatına uygun şekilde açık rıza alarak edinmek ve işlemekle yükümlüdür. Kişisel verilerin korunması için gerekli teknik ve idari önlemler alınmalıdır.</p>
              <p><strong>3.4. Yasak Faaliyetler:</strong> Kullanıcı, platformu aşağıdaki amaçlarla kullanamaz: (a) Yasalara aykırı faaliyetler, (b) Diğer kullanıcıların haklarını ihlal etmek, (c) Platformun güvenliğini tehdit etmek, (d) Veri madenciliği veya otomatik erişim, (e) Zararlı yazılım yaymak, (f) Platformun ticari amaçla başkalarına kiralanması veya satılması.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">4. Finansal İşlemler ve Sorumluluk Reddi</h2>
              <p><strong>4.1. Hizmetin Niteliği:</strong> LuxDues, bir banka, ödeme kuruluşu veya finansal aracı kurum olmayıp; yöneticiler ve sakinler arasındaki aidat, proje ve gider kayıtlarının dijital ortamda takip edilmesini, raporlanmasını ve yönetilmesini sağlayan bir yönetim yazılımıdır. LuxDues, ödeme alım satımı yapmaz, para transferi gerçekleştirmez veya finansal danışmanlık hizmeti sunmaz.</p>
              <p><strong>4.2. Veri Doğruluğu Sorumluluğu:</strong> Yöneticiler tarafından girilen aidat tutarları, gecikme zamları, ödeme durumları, harcama belgeleri ve finansal kayıtların doğruluğundan, kanuni uygunluğundan ve güncelliğinden tamamen ilgili bina/site yönetimi sorumludur. LuxDues, yöneticilerin hatalı veya eksik veri girişinden doğacak zararlardan sorumlu tutulamaz.</p>
              <p><strong>4.3. Ödeme İşlemleri:</strong> Platform üzerindeki ödeme kayıtları sadece bilgi amaçlıdır. Gerçek ödeme işlemleri (nakit, banka havalesi, EFT vb.) yönetici ve sakin arasında doğrudan gerçekleştirilir. LuxDues, ödeme alım satımına aracılık etmez ve ödeme işlemlerinden sorumlu değildir.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">5. Fikri Mülkiyet Hakları</h2>
              <p>Platformun yazılımı, tasarımı, logosu, markası, arayüzü, 3D görsel modelleri, veritabanı mimarisi, kaynak kodları ve tüm fikri mülkiyet hakları (telif hakları, marka hakları, patent hakları, ticari sır vb.) münhasıran LuxDues Inc.'e aittir. Platformun kaynak kodlarının kopyalanması, tersine mühendislik yapılması, değiştirilmesi, çoğaltılması veya izinsiz kullanılması yasaktır ve hukuki ve cezai yaptırla mükelleftir.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">6. Gizlilik ve Veri Koruması</h2>
              <p>Kullanıcıların kişisel verileri, 6698 sayılı KVKK kapsamında işlenir. LuxDues, kişisel verilerin güvenliği için gerekli teknik ve idari önlemleri alır. Kişisel verilerin korunması, işlenmesi, aktarılması ve silinmesi hakkında detaylı bilgi için KVKK Aydınlatma Metni ve Gizlilik Politikası incelenmelidir.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">7. Sözleşmenin Feshi ve Değişiklikler</h2>
              <p><strong>7.1. Feshi Hakkı:</strong> Kullanıcı, istediği zaman hesabını silebilir veya platform kullanımını durdurabilir. LuxDues, işbu sözleşmeyi Kullanıcı'nın sözleşme hükümlerini ihlal etmesi, yasal zorunluluklar veya platformun işletilmesinin mümkün olmaması durumunda tek taraflı olarak feshedebilir.</p>
              <p><strong>7.2. Değişiklikler:</strong> LuxDues, işbu sözleşme koşullarını mevzuat değişiklikleri, platform güncellemeleri veya hizmet kapsamındaki değişiklikler doğrultusunda tek taraflı olarak güncelleme hakkını saklı tutar. Güncel sözleşme platform üzerinde yayımlandığı tarihte yürürlüğe girer. Kullanıcı, güncellenen sözleşmeyi kabul etmezse platform kullanımını durdurabilir.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">8. Sorumluluk Sınırları ve Feragat</h2>
              <p>LuxDues, platformun kesintisiz, hatasız veya virüssüz çalışacağını garanti etmez. İnternet bağlantısı, sunucu sorunları, bakım çalışmaları veya teknik arızalar nedeniyle platformun geçici olarak kullanılamamasından doğacak zararlardan sorumlu değildir. LuxDues, dolaylı, arızi, cezai veya özel zararlardan sorumlu tutulamaz.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">9. İletişim ve Yetkili Mahkeme</h2>
              <p>İşbu sözleşmenin uygulanmasından doğabilecek uyuşmazlıklarda Türk Hukuku uygulanacak olup, Gaziantep Merkez Mahkemeleri ve İcra Daireleri yetkilidir. Her türlü soru, bildirim ve uyuşmazlık için <a href="mailto:lux.studio.tr@gmail.com" className="text-zinc-900 font-semibold underline">lux.studio.tr@gmail.com</a> adresinden yazılı iletişime geçebilirsiniz.</p>
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
