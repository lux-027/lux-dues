'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { BuildingIllustration } from '@/components/BuildingIllustration';
import { Logo } from '@/components/Logo';
import { Input, Textarea, Button } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { DashboardShowcase } from '@/components/DashboardShowcase';
import { ProfileMenu } from '@/components/ProfileMenu';

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

// useSearchParams() opts a component out of static rendering unless it is
// wrapped in a <Suspense> boundary — isolated here so only this tiny piece
// of the page is dynamic, per Next.js's recommended pattern.
function AuthQueryHandler({
  onAuthParam,
}: {
  onAuthParam: (tab: 'login' | 'register') => void;
}) {
  const searchParams = useSearchParams();
  const auth = searchParams.get('auth');

  useEffect(() => {
    if (auth === 'login' || auth === 'register') {
      onAuthParam(auth);
    }
  }, [auth, onAuthParam]);

  return null;
}

function StatCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTs: number | null = null;
          const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const progress = Math.min((ts - startTs) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString('tr-TR')}</span>;
}

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  return (
    <div className="card p-4 sm:p-5 lg:p-6 h-full">
      <div className="h-9 w-9 sm:h-11 sm:w-11 bg-zinc-900 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {feature.icon}
        </svg>
      </div>
      <h3 className="text-sm sm:text-base font-medium text-zinc-900 mb-1.5 sm:mb-2">
        {feature.title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

function FeaturesCarousel() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = FEATURES.length;

  const goTo = useCallback((idx: number) => {
    setActive(((idx % total) + total) % total);
  }, [total]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const dragging = useRef(false);

  const handleDragEnd = (endX: number) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? active + 1 : active - 1);
      resetTimer();
    }
    touchStartX.current = null;
    dragging.current = false;
  };

  return (
    <>
      {/* Mobile carousel */}
      <div className="sm:hidden">
        <div
          className="relative cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => { touchStartX.current = e.clientX; dragging.current = true; }}
          onPointerUp={(e) => handleDragEnd(e.clientX)}
          onPointerCancel={() => { touchStartX.current = null; dragging.current = false; }}
          onPointerLeave={() => { if (dragging.current) { touchStartX.current = null; dragging.current = false; } }}
        >
          {/* Stacked background cards */}
          <div className="absolute inset-x-4 top-3 bottom-0 card p-4 opacity-40 scale-[0.97] pointer-events-none" aria-hidden />
          <div className="absolute inset-x-8 top-6 bottom-0 card p-4 opacity-20 scale-[0.94] pointer-events-none" aria-hidden />

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {FEATURES.map((feature) => (
                <div key={feature.title} className="w-full shrink-0 px-1">
                  <FeatureCard feature={feature} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetTimer(); }}
              aria-label={`Kart ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-5 bg-zinc-900' : 'w-1.5 bg-zinc-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tablet/desktop grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </>
  );
}

interface SessionSummary {
  name: string;
  role: string;
  avatarUrl?: string | null;
}

interface PlatformStats {
  totalBuildings: number;
  totalUnits: number;
  totalAdmins: number;
}

export default function HomeClient({
  initialSession,
  initialStats,
}: {
  initialSession: SessionSummary | null;
  initialStats: PlatformStats;
}) {
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    context: 'admin' | 'resident';
    tab: 'login' | 'register';
    showRoleSelector: boolean;
    registerOnly: boolean;
  }>({ open: false, context: 'resident', tab: 'login', showRoleSelector: false, registerOnly: false });

  const openAuth = (
    context: 'admin' | 'resident',
    tab: 'login' | 'register' = 'login',
    showRoleSelector: boolean = false,
    registerOnly: boolean = false
  ) => {
    setAuthModal({ open: true, context, tab, showRoleSelector, registerOnly });
  };

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Platform stats are resolved server-side and passed as initial props so the
  // numbers are present on the first paint without an extra client fetch.
  const [stats] = useState(initialStats);

  // Seeded from the server (via getSession()) so the header never flashes
  // the logged-out state before the client re-checks the session.
  const [session, setSession] = useState<SessionSummary | null>(initialSession);

  const handleStart = () => {
    if (!session) return;
    if (session.role === 'SUPER_ADMIN' || session.role === 'BLOCK_ADMIN') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  };

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

  const handleAuthParam = useCallback((tab: 'login' | 'register') => {
    setAuthModal({ open: true, context: 'resident', tab, showRoleSelector: false, registerOnly: false });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <AuthQueryHandler onAuthParam={handleAuthParam} />
      </Suspense>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size={48} />

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#ozellikler"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('ozellikler');
                  if (element) {
                    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 1500;
                    let startTimestamp: number | null = null;

                    const step = (timestamp: number) => {
                      if (!startTimestamp) startTimestamp = timestamp;
                      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                      const easeProgress = 1 - Math.pow(1 - progress, 3);
                      window.scrollTo(0, startPosition + distance * easeProgress);
                      if (progress < 1) {
                        window.requestAnimationFrame(step);
                      }
                    };

                    window.requestAnimationFrame(step);
                  }
                }}
              >
                Özellikler
              </a>
              <a
                href="#nasil-calisir"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('nasil-calisir');
                  if (element) {
                    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 1500;
                    let startTimestamp: number | null = null;

                    const step = (timestamp: number) => {
                      if (!startTimestamp) startTimestamp = timestamp;
                      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                      const easeProgress = 1 - Math.pow(1 - progress, 3);
                      window.scrollTo(0, startPosition + distance * easeProgress);
                      if (progress < 1) {
                        window.requestAnimationFrame(step);
                      }
                    };

                    window.requestAnimationFrame(step);
                  }
                }}
              >
                Nasıl Çalışır
              </a>
              <a
                href="#iletisim"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('iletisim');
                  if (element) {
                    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 1500;
                    let startTimestamp: number | null = null;

                    const step = (timestamp: number) => {
                      if (!startTimestamp) startTimestamp = timestamp;
                      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                      const easeProgress = 1 - Math.pow(1 - progress, 3);
                      window.scrollTo(0, startPosition + distance * easeProgress);
                      if (progress < 1) {
                        window.requestAnimationFrame(step);
                      }
                    };

                    window.requestAnimationFrame(step);
                  }
                }}
              >
                İletişim
              </a>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {session && <ProfileMenu />}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 relative z-[60]"
                aria-label="Menü"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <>
              <div className="fixed inset-0 bg-zinc-900/60 z-50 md:hidden transition-opacity duration-300 ease-in-out" onClick={() => setMobileMenuOpen(false)} />
              <div className="md:hidden fixed top-0 right-0 left-0 bg-white z-50 transition-all duration-300 ease-in-out">
                {/* Header in Menu */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 z-10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                      <Logo size={48} />
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
                        aria-label="Kapat"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Menu Content */}
                <div className="py-3 px-5">
                  <nav className="flex flex-col gap-2">
                    <a
                      href="#ozellikler"
                      className="text-zinc-600 hover:text-zinc-900 py-1.5 text-base"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          const element = document.getElementById('ozellikler');
                          if (element) {
                            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                            const startPosition = window.pageYOffset;
                            const distance = targetPosition - startPosition;
                            const duration = 1500;
                            let startTimestamp: number | null = null;

                            const step = (timestamp: number) => {
                              if (!startTimestamp) startTimestamp = timestamp;
                              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                              const easeProgress = 1 - Math.pow(1 - progress, 3);
                              window.scrollTo(0, startPosition + distance * easeProgress);
                              if (progress < 1) {
                                window.requestAnimationFrame(step);
                              }
                            };

                            window.requestAnimationFrame(step);
                          }
                        }, 350);
                      }}
                    >
                      Özellikler
                    </a>
                    <a
                      href="#nasil-calisir"
                      className="text-zinc-600 hover:text-zinc-900 py-1.5 text-base"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          const element = document.getElementById('nasil-calisir');
                          if (element) {
                            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                            const startPosition = window.pageYOffset;
                            const distance = targetPosition - startPosition;
                            const duration = 1500;
                            let startTimestamp: number | null = null;

                            const step = (timestamp: number) => {
                              if (!startTimestamp) startTimestamp = timestamp;
                              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                              const easeProgress = 1 - Math.pow(1 - progress, 3);
                              window.scrollTo(0, startPosition + distance * easeProgress);
                              if (progress < 1) {
                                window.requestAnimationFrame(step);
                              }
                            };

                            window.requestAnimationFrame(step);
                          }
                        }, 350);
                      }}
                    >
                      Nasıl Çalışır
                    </a>
                    <a
                      href="#iletisim"
                      className="text-zinc-600 hover:text-zinc-900 py-1.5 text-base"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          const element = document.getElementById('iletisim');
                          if (element) {
                            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                            const startPosition = window.pageYOffset;
                            const distance = targetPosition - startPosition;
                            const duration = 1500;
                            let startTimestamp: number | null = null;

                            const step = (timestamp: number) => {
                              if (!startTimestamp) startTimestamp = timestamp;
                              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                              const easeProgress = 1 - Math.pow(1 - progress, 3);
                              window.scrollTo(0, startPosition + distance * easeProgress);
                              if (progress < 1) {
                                window.requestAnimationFrame(step);
                              }
                            };

                            window.requestAnimationFrame(step);
                          }
                        }, 350);
                      }}
                    >
                      İletişim
                    </a>
                  </nav>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-zinc-100 text-zinc-600 mb-2 sm:mb-4 lg:mb-6">
              Site ve Aidat Yönetiminde Yeni Nesil Çözüm
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-zinc-900 leading-tight mb-4 sm:mb-6">
              Sitenizi ve aidatlarınızı
              <br />
              <span className="font-medium">tek panelden</span> yönetin
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-zinc-600 font-light mb-6 sm:mb-8 max-w-lg">
              LuxDues; çoklu blok desteği, otomatik ortak masraf bölüşümü ve
              şikayet takibiyle apartman ve site yönetimini kurumsal bir
              deneyime taşır.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {session ? (
                <button
                  onClick={handleStart}
                  className="btn-primary"
                >
                  Hemen Başla
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('resident', 'register', true, true)}
                    className="btn-primary"
                  >
                    Ücretsiz Hesap Oluştur
                  </button>
                  <button
                    onClick={() => openAuth('admin', 'login', true, false)}
                    className="btn-secondary"
                  >
                    Hemen Giriş Yap
                  </button>
                </>
              )}
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
                <StatCounter target={29 + stats.totalBuildings} />
              </p>
              <p className="text-sm text-zinc-400 mt-1">Site Sayısı</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-light text-white">
                <StatCounter target={324 + stats.totalUnits} />
              </p>
              <p className="text-sm text-zinc-400 mt-1">Daire Sayısı</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-light text-white">
                <StatCounter target={47 + stats.totalAdmins} />
              </p>
              <p className="text-sm text-zinc-400 mt-1">Yönetici Sayısı</p>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-6">
            Rakamlar LuxDues platformundaki gerçek verilerden anlık olarak hesaplanır.
          </p>
        </div>
      </section>

      {/* Modern Dashboard Showcase Mockup */}
      <DashboardShowcase />

      {/* Features */}
      <section id="ozellikler" className="bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-14">
            <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 mb-2 sm:mb-3">
              Yönetimi Basitleştiren Özellikler
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-light">
              Tek bir platformda aidat, ortak masraf, şikayet ve yönetici
              yetkilendirmesi ihtiyaçlarınızı karşılayın.
            </p>
          </div>

          <FeaturesCarousel />
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-14">
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 mb-2 sm:mb-3">Nasıl Çalışır?</h2>
          <p className="text-sm sm:text-base text-zinc-600 font-light">
            Üç adımda binanızı LuxDues ile dijitalleştirin.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
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
              <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-zinc-400">{item.step}</span>
              <h3 className="text-base sm:text-lg font-medium text-zinc-900 mt-1.5 sm:mt-2 mb-1.5 sm:mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-3 sm:mb-4">
            Yönetimi kolaylaştırmaya hazır mısınız?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light mb-6 sm:mb-8 max-w-xl mx-auto">
            LuxDues ile sitenizin aidat ve masraf süreçlerini dijitalleştirin,
            şeffaflığı ve tahsilat oranınızı artırın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {session ? (
              <a
                href={
                  session.role === 'SUPER_ADMIN' || session.role === 'BLOCK_ADMIN'
                    ? '/admin'
                    : '/dashboard'
                }
                className="bg-white text-zinc-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-zinc-100 transition-colors duration-200 font-medium text-xs sm:text-sm w-full sm:w-auto"
              >
                Hemen Başlıyalım
              </a>
            ) : (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  openAuth('resident', 'register', true, true);
                }}
                className="bg-white text-zinc-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-zinc-100 transition-colors duration-200 font-medium text-xs sm:text-sm w-full sm:w-auto"
              >
                Ücretsiz Başlayın
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="iletisim" className="bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 mb-2 sm:mb-3">İletişim</h2>
              <p className="text-sm sm:text-base text-zinc-600 font-light mb-6 sm:mb-8 max-w-md">
                Sorularınız, talepleriniz veya demo talebiniz için bize yazın.
                Ekibimiz en kısa sürede size geri dönüş yapacaktır.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 sm:gap-3 text-zinc-900 font-medium hover:text-indigo-600 transition-colors"
              >
                <span className="h-8 w-8 sm:h-10 sm:w-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="card p-4 sm:p-5 lg:p-6">
              {contactSent && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700">
                  Mail uygulamanız açıldı. Mesajınızı göndermek için e-posta
                  istemcinizden "Gönder"e basmanız yeterli.
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="form-group mb-3 sm:mb-4">
                  <Input
                    label="Ad Soyad"
                    placeholder="Adınız Soyadınız"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3 sm:mb-4">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@eposta.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3 sm:mb-4">
                  <Textarea
                    label="Mesajınız"
                    placeholder="Size nasıl yardımcı olabiliriz?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" fullWidth className="text-xs sm:text-sm">
                  Mesaj Gönder
                </Button>
                <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-3 sm:mt-4">
                  Mesajınız "LuxDues Sayfasından" başlığıyla {CONTACT_EMAIL} adresine iletilecektir.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <AuthModal
        key={`${authModal.context}-${authModal.tab}-${authModal.open}-${authModal.showRoleSelector}-${authModal.registerOnly}`}
        isOpen={authModal.open}
        context={authModal.context}
        initialTab={authModal.tab}
        showRoleSelector={authModal.showRoleSelector}
        registerOnly={authModal.registerOnly}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onSuccess={() => {
          setAuthModal((prev) => ({ ...prev, open: false }));
          fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
              if (data.user) setSession(data.user);
              const role = data.user?.role;
              if (role === 'SUPER_ADMIN' || role === 'BLOCK_ADMIN') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/dashboard';
              }
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}
