'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { BuildingIllustration } from '@/components/BuildingIllustration';
import { Logo } from '@/components/Logo';
import { Input, Textarea, Button } from '@/components/ui';

// Central contact address for the whole site. Always route contact/support
// messages here, with the subject line indicating they came from the LuxDues page.
const CONTACT_EMAIL = 'lux.studio.tr@gmail.com';

const FEATURES = [
  {
    title: 'Aidat Takibi',
    description: 'Aylık aidatları tanımlayın, ödeme durumlarını tek ekrandan anlık olarak takip edin.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Çoklu Blok Yönetimi',
    description: 'Her bloğa ayrı yönetici atayın; her yönetici sadece kendi bloğunu görsün ve yönetsin.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    title: 'Ortak Masraf Bölüşümü',
    description: 'Garaj kapısı gibi ortak masrafları girin, sistem daire sayısına göre otomatik bölüştürsün.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
  },
  {
    title: 'Şikayet ve İstek Kutusu',
    description: 'Sakinler taleplerini iletsin, yöneticiler durumlarını kolayca güncelleyip takip etsin.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    ),
  },
  {
    title: 'Telefon Bildirimleri',
    description: 'Borç eklendiğinde veya duyuru yapıldığında sakinlere otomatik bildirim gönderilsin.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-1.414 1.414A9 9 0 1119.9 12M15 8.5a4 4 0 11-6 3.46" />
    ),
  },
  {
    title: 'Güvenli Erişim',
    description: 'Roller bazlı yetkilendirme ile her kullanıcı yalnızca kendi verilerine erişebilir.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
];

export default function LandingPage() {
  const searchParams = useSearchParams();
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    context: 'admin' | 'resident';
    tab: 'login' | 'register';
  }>({ open: false, context: 'resident', tab: 'login' });

  // Support deep-linking to the auth modal, e.g. /?auth=login or /?auth=register
  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'login' || auth === 'register') {
      setAuthModal({ open: true, context: 'resident', tab: auth });
    }
  }, [searchParams]);

  const openAuth = (context: 'admin' | 'resident', tab: 'login' | 'register' = 'login') => {
    setAuthModal({ open: true, context, tab });
  };

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  // Live platform stats — real counts from the database, grow automatically
  // as buildings/units/admins are added or projects are completed.
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalUnits: 0,
    totalAdmins: 0,
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `LuxDues Sayfasından: ${contactForm.name} tarafından yeni mesaj`;
    const body = [
      'Bu mesaj LuxDues web sitesindeki İletişim formu üzerinden gönderildi.',
      '',
      `Ad Soyad: ${contactForm.name}`,
      `E-posta: ${contactForm.email}`,
      '',
      'Mesaj:',
      contactForm.message,
    ].join('\n');

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setContactSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size={48} />

            <nav className="hidden md:flex items-center gap-8">
              <a href="#ozellikler" className="nav-link">Özellikler</a>
              <a href="#nasil-calisir" className="nav-link">Nasıl Çalışır</a>
              <a href="#iletisim" className="nav-link">İletişim</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth('admin', 'login')}
                className="btn-secondary hidden sm:inline-flex"
              >
                Yönetici Girişi
              </button>
              <button
                onClick={() => openAuth('resident', 'login')}
                className="btn-primary"
              >
                Site Sakini Girişi
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 mb-6">
              Site ve Aidat Yönetiminde Yeni Nesil Çözüm
            </span>
            <h1 className="text-4xl sm:text-5xl font-light text-zinc-900 leading-tight mb-6">
              Sitenizi ve aidatlarınızı
              <br />
              <span className="font-medium">tek panelden</span> yönetin
            </h1>
            <p className="text-lg text-zinc-600 font-light mb-8 max-w-lg">
              LuxDues; çoklu blok desteği, otomatik ortak masraf bölüşümü ve
              şikayet takibiyle apartman ve site yönetimini kurumsal bir
              deneyime taşır.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuth('resident', 'register')}
                className="btn-primary"
              >
                Ücretsiz Hesap Oluştur
              </button>
              <button
                onClick={() => openAuth('admin', 'login')}
                className="btn-secondary"
              >
                Yönetici Olarak Devam Et
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-transparent rounded-3xl -z-10" />
            <BuildingIllustration />
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="border-t border-b border-zinc-800 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-light text-white">
                {stats.totalBuildings}
              </p>
              <p className="text-sm text-zinc-400 mt-1">Site Sayısı</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-light text-white">
                {stats.totalUnits}
              </p>
              <p className="text-sm text-zinc-400 mt-1">Daire Sayısı</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-light text-white">
                {stats.totalAdmins}
              </p>
              <p className="text-sm text-zinc-400 mt-1">Yönetici Sayısı</p>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-6">
            Rakamlar LuxDues platformundaki gerçek verilerden anlık olarak hesaplanır.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-light text-zinc-900 mb-3">
              Yönetimi Basitleştiren Özellikler
            </h2>
            <p className="text-zinc-600 font-light">
              Tek bir platformda aidat, ortak masraf, şikayet ve yönetici
              yetkilendirmesi ihtiyaçlarınızı karşılayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6">
                <div className="h-11 w-11 bg-zinc-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-base font-medium text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-light text-zinc-900 mb-3">Nasıl Çalışır?</h2>
          <p className="text-zinc-600 font-light">
            Üç adımda binanızı LuxDues ile dijitalleştirin.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Binanızı Tanımlayın',
              description: 'Apartman veya site bilgilerinizi girin, blok ve daireleri sisteme ekleyin.',
            },
            {
              step: '02',
              title: 'Yöneticileri Atayın',
              description: 'Her bloğa özel yöneticiler atayarak yetkilendirmeyi kolayca yapılandırın.',
            },
            {
              step: '03',
              title: 'Takibe Başlayın',
              description: 'Aidat, ortak masraf ve şikayetleri tek panelden anlık olarak yönetin.',
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <span className="text-5xl font-light text-zinc-200">{item.step}</span>
              <h3 className="text-lg font-medium text-zinc-900 mt-2 mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-600 font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-light text-white mb-4">
            Yönetimi kolaylaştırmaya hazır mısınız?
          </h2>
          <p className="text-zinc-400 font-light mb-8 max-w-xl mx-auto">
            LuxDues ile sitenizin aidat ve masraf süreçlerini dijitalleştirin,
            şeffaflığı ve tahsilat oranınızı artırın.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => openAuth('resident', 'register')}
              className="bg-white text-zinc-900 px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors duration-200 font-medium text-sm"
            >
              Ücretsiz Başlayın
            </button>
            <button
              onClick={() => openAuth('admin', 'login')}
              className="border border-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors duration-200 font-medium text-sm"
            >
              Yönetici Girişi
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="iletisim" className="bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-light text-zinc-900 mb-3">İletişim</h2>
              <p className="text-zinc-600 font-light mb-8 max-w-md">
                Sorularınız, talepleriniz veya demo talebiniz için bize yazın.
                Ekibimiz en kısa sürede size geri dönüş yapacaktır.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-3 text-zinc-900 font-medium hover:text-indigo-600 transition-colors"
              >
                <span className="h-10 w-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="card p-6">
              {contactSent && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  Mail uygulamanız açıldı. Mesajınızı göndermek için e-posta
                  istemcinizden "Gönder"e basmanız yeterli.
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <Input
                    label="Ad Soyad"
                    placeholder="Adınız Soyadınız"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@eposta.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Textarea
                    label="Mesajınız"
                    placeholder="Size nasıl yardımcı olabiliriz?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" fullWidth>
                  Mesaj Gönder
                </Button>
                <p className="text-center text-xs text-zinc-500 mt-4">
                  Mesajınız "LuxDues Sayfasından" başlığıyla {CONTACT_EMAIL} adresine iletilecektir.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={36} wordmarkClassName="text-sm" />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="text-sm text-zinc-500">
                © 2026 LuxDues. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        key={`${authModal.context}-${authModal.tab}-${authModal.open}`}
        isOpen={authModal.open}
        context={authModal.context}
        initialTab={authModal.tab}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
