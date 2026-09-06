'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { ProfileMenu } from '@/components/ProfileMenu';

interface FAQItem {
  id: string;
  category: 'general' | 'admin' | 'resident' | 'security';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // Genel
  {
    id: 'g1',
    category: 'general',
    question: 'LuxDues nedir ve kimler kullanabilir?',
    answer: 'LuxDues, apartman ve site yönetimleri için geliştirilmiş modern, bulut tabanlı bir aidat ve mülk yönetim platformudur. Hem profesyonel site yöneticileri hem de daire sakinleri kendi panelleri üzerinden şeffaf şekilde borç, makbuz, duyuru ve talepleri takip edebilir.',
  },
  {
    id: 'g2',
    category: 'general',
    question: 'Aynı e-posta adresi ile hem Yönetici hem de Sakin paneli kullanılabilir mi?',
    answer: 'Evet! LuxDues çift panel mimarisi sunar. Aynı e-posta adresiyle hem bir veya birden fazla binanın yöneticisi olabilir hem de oturduğunuz dairenin sakini olarak aidatlarınızı takip edebilirsiniz. Üst menüdeki Portal Değiştirici ile iki panel arasında tek tıkla geçiş yapabilirsiniz.',
  },
  {
    id: 'g3',
    category: 'general',
    question: '9 Haneli Kullanıcı ID nedir ve nasıl çalışır?',
    answer: 'Her kullanıcıya kayıt olduğunda benzersiz 9 haneli bir Kullanıcı ID atanır (ör. 123 456 789). Yönetici paneli ve Sakin paneli için ayrı bağımsız ID numaraları üretilir. Yöneticiniz dairenizi sizinle eşlemek için Sakin ID\'nizi kullanır; diğer yöneticilerle arkadaşlık kurmak için ise Yönetici ID\'nizi paylaşırsınız.',
  },

  // Yöneticiler İçin
  {
    id: 'a1',
    category: 'admin',
    question: 'Toplu aidat tahakkuku nasıl yapılır?',
    answer: 'Yönetici panelinde ilgili binaya girdikten sonra "Aidat Takibi" bölümünden "Toplu Aidat Ekle" butonuna tıklayarak ay, yıl, tutar ve son ödeme tarihini seçmeniz yeterlidir. Sistem tüm blok ve dairelere otomatik olarak aidat borçlandırması yapar.',
  },
  {
    id: 'a2',
    category: 'admin',
    question: 'Boş dairelere aidat hesaplanır mı?',
    answer: 'Hayır. Daire düzenleme ekranında "Boş Daire (Sakin Yok)" seçeneği işaretlenen daireler, toplu aidat tahakkuklarında otomatik olarak hariç tutulur ve bu dairelere borç çıkarılmaz.',
  },
  {
    id: 'a3',
    category: 'admin',
    question: 'Bir daireye yeni sakin nasıl bağlanır veya sakin nasıl kaldırılır?',
    answer: 'Bina içindeki "Daireler & Sakinler" tablosunda ilgili dairenin "Düzenle" butonuna basın. "Kayıtlı Daire Sakini" alanına sakinin 9 haneli Sakin ID\'sini girip kaydedin. Mevcut sakini çıkarmak için ise kırmızı "Kayıtlı Sakini Kaldır" butonuna basmanız yeterlidir.',
  },
  {
    id: 'a4',
    category: 'admin',
    question: 'Başka yöneticileri bloklara yetkilendirebilir miyim?',
    answer: 'Evet. "Yöneticiler" menüsünden diğer yöneticilerin 9 haneli Yönetici ID\'sini aratarak arkadaşlık isteği gönderebilir ve kabul edildiğinde onları belirli bir bloğa veya binanın geneline ortak yönetici olarak yetkilendirebilirsiniz.',
  },

  // Sakinler İçin
  {
    id: 'r1',
    category: 'resident',
    question: 'Sakin panelinde hangi bilgilere erişebilirim?',
    answer: 'Sakin panelinizde dairenizin aylık aidat borçlarını, geçmiş ödeme makbuzlarını, sitenizdeki ortak proje ödemelerini (çatı onarımı, asansör yenileme vb.) ve bina yönetimine ilettiğiniz talep/şikayetlerin durumunu canlı olarak izleyebilirsiniz.',
  },
  {
    id: 'r2',
    category: 'resident',
    question: 'Daireden taşındığımda sistemden nasıl ayrılırım?',
    answer: 'Sakin panelinizdeki aktif daire kartının sağ alt kısmında yer alan "Daireden Ayrıl" butonuna tıklayıp onaylayarak daire takibini anında sonlandırabilirsiniz. Ayrılma işlemi gerçekleştiğinde bina yöneticinize otomatik bildirim iletilir.',
  },
  {
    id: 'r3',
    category: 'resident',
    question: 'Birden fazla evim veya dükkanım varsa tek hesaptan görebilir miyim?',
    answer: 'Evet. Farklı bina veya bloklardaki tüm daireleriniz aynı Sakin ID ile hesabınıza bağlanabilir. Sakin panelinizdeki "Evlerimi Değiştir" butonuyla tüm mülkleriniz arasında kolayca geçiş yapabilirsiniz.',
  },

  // Güvenlik & Ödemeler
  {
    id: 's1',
    category: 'security',
    question: 'Verilerimiz ve finansal kayıtlarımız nasıl korunuyor?',
    answer: 'LuxDues, 256-bit SSL/TLS şifreleme protokolleri ve güvenli bulut veritabanı altyapısı kullanır. Parolalarınız tek yönlü hash algoritmalarıyla korunur ve 6698 sayılı KVKK standartlarına tam uyum sağlanır.',
  },
  {
    id: 's2',
    category: 'security',
    question: 'Mobil cihazlardan veya telefonumdan LuxDues\'u kullanabilir miyim?',
    answer: 'Evet. LuxDues %100 mobil uyumlu (responsive) bir arayüze sahiptir. Telefon veya tablet tarayıcınızdan giriş yaparak uygulama konforunda tüm işlemleri gerçekleştirebilirsiniz.',
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'admin' | 'resident' | 'security'>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    g1: true,
    g2: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return FAQ_DATA;
    return FAQ_DATA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

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
            <ProfileMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-950 text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Background gradient accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-zinc-800/50 via-zinc-800/15 to-transparent blur-3xl" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-lg">
              <svg className="h-7 w-7 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 backdrop-blur-sm">
              Yardım & Bilgi Merkezi
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-5">
            Sıkça Sorulan Sorular
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
            LuxDues apartman ve site yönetim platformu hakkında merak ettiğiniz her konuya hızlı ve net yanıtlar.
          </p>
        </div>
      </div>

      {/* Main FAQ Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Tüm Sorular ({FAQ_DATA.length})
          </button>
          <button
            onClick={() => setSelectedCategory('admin')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'admin'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Yöneticiler İçin
          </button>
          <button
            onClick={() => setSelectedCategory('resident')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'resident'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Sakinler İçin
          </button>
          <button
            onClick={() => setSelectedCategory('security')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'security'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Güvenlik & Ödemeler
          </button>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOpen = Boolean(openItems[item.id]);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors focus:outline-none"
                >
                  <span className="text-sm font-semibold text-zinc-900 leading-snug">
                    {item.question}
                  </span>
                  <span
                    className={`h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-600 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-zinc-900 text-white' : ''
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 border-t border-zinc-100 text-xs sm:text-sm text-zinc-600 leading-relaxed animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-10 p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Sorunuzun yanıtını bulamadınız mı?</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Teknik destek ekibimiz ve müşteri temsilcilerimiz sorularınızı yanıtlamaktan memnuniyet duyar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <a
              href="https://www.instagram.com/lux.studio.inc/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>
            <a
              href="mailto:lux.studio.tr@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-semibold transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>E-posta Gönder</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
