'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Isometric3DBuilding } from './Isometric3DBuilding';

import { formatAccountNumber } from '@/lib/userId';

interface PortalInfo {
  email: string;
  name: string;
  role: string;
  hasAdminRole: boolean;
  hasResidentRole: boolean;
  adminAccountNumber?: number | null;
  residentAccountNumber?: number | null;
  units: { id: string; blockName: string; doorNo: string; building?: { name: string } }[];
  buildingName?: string | null;
  accountNumber: number;
}

interface PortalSwitcherProps {
  current: 'admin' | 'resident';
}

export function PortalSwitcher({ current }: PortalSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState<'admin' | 'resident' | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPortalInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/portals');
      if (res.ok) {
        const data = await res.json();
        setPortalInfo(data);
      }
    } catch (err) {
      console.error('Error fetching portal info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchPortalInfo();
  };

  const handleSwitchTo = (target: 'admin' | 'resident') => {
    setOpen(false);
    if (target === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleActivate = async (portal: 'admin' | 'resident') => {
    setActivating(portal);
    try {
      const res = await fetch('/api/auth/activate-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal }),
      });

      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Hesap aktifleştirilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Activation error:', err);
      alert('İşlem sırasında bağlantı hatası oluştu');
    } finally {
      setActivating(null);
    }
  };

  const modalContent = open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 border border-zinc-200/80">
        {/* Header with Subtle Ambient Glow */}
        <div className="relative px-6 py-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-zinc-200/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-900" />
                <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Panel & Yetki Değiştir</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
                {portalInfo?.email ? (
                  <>
                    <span className="font-medium text-zinc-800">{portalInfo.email}</span>
                    <span>•</span>
                    <span className="text-[11px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200 font-mono">
                      ID: {portalInfo.accountNumber}
                    </span>
                  </>
                ) : (
                  'Hesabınıza bağlı yönetim ve sakin panelleri'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading && !portalInfo ? (
            <div className="py-14 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-medium">Panel yetkileri doğrulanıyor...</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Option 1: Admin Portal Card */}
              {(() => {
                const isAdmin = portalInfo?.hasAdminRole ?? current === 'admin';
                const isCurrentAdmin = current === 'admin';

                return (
                  <div
                    className={`relative rounded-2xl border p-4 sm:p-5 transition-all overflow-hidden ${
                      isCurrentAdmin
                        ? 'bg-zinc-950 text-white border-zinc-900 shadow-xl ring-1 ring-zinc-800'
                        : isAdmin
                        ? 'bg-white hover:bg-zinc-50/80 border-zinc-200 hover:border-zinc-300 shadow-xs cursor-pointer group'
                        : 'bg-zinc-50 border-zinc-200/90'
                    }`}
                    onClick={() => {
                      if (isAdmin && !isCurrentAdmin) handleSwitchTo('admin');
                    }}
                  >
                    {/* Background Graphic Watermark */}
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
                      <Isometric3DBuilding size={140} />
                    </div>

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform ${
                            isCurrentAdmin
                              ? 'bg-zinc-800/90 border border-zinc-700/80'
                              : 'bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 group-hover:scale-105'
                          }`}
                        >
                          <Isometric3DBuilding size={32} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-semibold tracking-tight ${
                                isCurrentAdmin ? 'text-white' : 'text-zinc-900'
                              }`}
                            >
                              Yönetici Portalı
                            </h4>
                            {isCurrentAdmin && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white border border-white/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Şu An Açık
                              </span>
                            )}
                            {!isCurrentAdmin && isAdmin && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                Aktif Yetki
                              </span>
                            )}
                            {!isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 text-zinc-600">
                                Pasif (Kayıt Yok)
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs leading-relaxed max-w-sm ${
                              isCurrentAdmin ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            Binalar, siteler, bloklar, toplu aidat tahakkukları ve yönetici arkadaşlıkları.
                          </p>

                          {isAdmin && (
                            <div className="pt-1.5 flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                  isCurrentAdmin
                                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                                    : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                }`}
                              >
                                Yönetici ID: {formatAccountNumber(portalInfo?.adminAccountNumber || portalInfo?.accountNumber || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isAdmin && !isCurrentAdmin && (
                        <button
                          type="button"
                          onClick={() => handleSwitchTo('admin')}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all flex-shrink-0 self-center"
                        >
                          Panele Geç →
                        </button>
                      )}
                    </div>

                    {!isAdmin && (
                      <div className="mt-3.5 pt-3.5 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Aynı e-posta ile bina/site yöneticisi paneline kaydolun.
                        </p>
                        <button
                          type="button"
                          disabled={activating === 'admin'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate('admin');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-all flex-shrink-0 self-start sm:self-auto shadow-sm"
                        >
                          {activating === 'admin' ? 'Yetkilendiriliyor...' : 'Yönetici Hesabı Oluştur'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Option 2: Resident Portal Card */}
              {(() => {
                const isResident = portalInfo?.hasResidentRole ?? true;
                const isCurrentResident = current === 'resident';
                const unitCount = portalInfo?.units?.length || 0;

                return (
                  <div
                    className={`relative rounded-2xl border p-4 sm:p-5 transition-all overflow-hidden ${
                      isCurrentResident
                        ? 'bg-zinc-950 text-white border-zinc-900 shadow-xl ring-1 ring-zinc-800'
                        : isResident
                        ? 'bg-white hover:bg-zinc-50/80 border-zinc-200 hover:border-zinc-300 shadow-xs cursor-pointer group'
                        : 'bg-zinc-50 border-zinc-200/90'
                    }`}
                    onClick={() => {
                      if (isResident && !isCurrentResident) handleSwitchTo('resident');
                    }}
                  >
                    {/* Background Graphic Watermark */}
                    <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none text-zinc-900">
                      <svg className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform ${
                            isCurrentResident
                              ? 'bg-zinc-800/90 border border-zinc-700/80 text-white'
                              : 'bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 text-zinc-900 group-hover:scale-105'
                          }`}
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-semibold tracking-tight ${
                                isCurrentResident ? 'text-white' : 'text-zinc-900'
                              }`}
                            >
                              Sakin Portalı
                            </h4>
                            {isCurrentResident && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white border border-white/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Şu An Açık
                              </span>
                            )}
                            {!isCurrentResident && isResident && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                Aktif Yetki {unitCount > 0 ? `(${unitCount} Daire)` : ''}
                              </span>
                            )}
                            {!isResident && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 text-zinc-600">
                                Pasif (Kayıt Yok)
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs leading-relaxed max-w-sm ${
                              isCurrentResident ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            Daire aidat borçları, makbuzlar, özel projeler ve şikayet/talep bildirimleri.
                          </p>

                          {isResident && (
                            <div className="pt-1.5 flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                  isCurrentResident
                                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                                    : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                }`}
                              >
                                Sakin ID: {formatAccountNumber(portalInfo?.residentAccountNumber || portalInfo?.accountNumber || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isResident && !isCurrentResident && (
                        <button
                          type="button"
                          onClick={() => handleSwitchTo('resident')}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all flex-shrink-0 self-center"
                        >
                          Panele Geç →
                        </button>
                      )}
                    </div>

                    {!isResident && (
                      <div className="mt-3.5 pt-3.5 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Aynı e-posta ile sakin paneline erişim oluşturun.
                        </p>
                        <button
                          type="button"
                          disabled={activating === 'resident'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate('resident');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-all flex-shrink-0 self-start sm:self-auto shadow-sm"
                        >
                          {activating === 'resident' ? 'Oluşturuluyor...' : 'Sakin Hesabı Oluştur'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tek oturumla tüm yetkilerinize geçiş yapabilirsiniz</span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Clickable Navbar Pill */}
      <button
        type="button"
        onClick={handleOpen}
        className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200/80 hover:border-zinc-300 rounded-full transition-all focus:outline-none cursor-pointer group"
        title="Panel ve Yetki Değiştir"
      >
        <div className="w-7 h-7 rounded-full bg-white shadow-sm border border-zinc-200/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {current === 'admin' ? (
            <Isometric3DBuilding size={26} />
          ) : (
            <svg className="h-4 w-4 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )}
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-zinc-900 leading-tight">
              {current === 'admin' ? 'Yönetici Portalı' : 'Sakin Portalı'}
            </span>
            <svg
              className="h-3 w-3 text-zinc-400 group-hover:text-zinc-700 transition-transform group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="text-[9px] text-zinc-500 leading-none">
            {current === 'admin' ? 'Genel Yönetim' : 'Aidat & Daire'}
          </span>
        </div>
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
