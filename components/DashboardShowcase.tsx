'use client';

import { useState } from 'react';

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<'overview' | 'dues' | 'cashflow'>('overview');

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-zinc-50/70 to-white relative overflow-hidden border-t border-zinc-200/80">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-zinc-200/40 via-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-zinc-900 tracking-tight leading-tight">
            Kolay, Güvenli, Pratik, <br className="hidden sm:inline" />
            <span className="font-semibold text-zinc-900">Hesaplı Site Yönetimi!</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed max-w-2xl mx-auto">
            Temel ilkemiz KMK (Kat Mülkiyeti Kanunu) ve karmaşık muhasebe kodlarını bilmeyen site yöneticilerinin de kolaylıkla yönetim ve muhasebe işlemlerini yapmasını sağlamaktır.
          </p>
        </div>

        {/* Mockup Browser Container */}
        <div className="relative mx-auto max-w-5xl rounded-3xl bg-zinc-900 p-2 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-zinc-900/10">
          <div className="rounded-2xl bg-white overflow-hidden border border-zinc-200 shadow-inner">
            {/* macOS Browser Header */}
            <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 flex items-center justify-between gap-4 select-none">
              {/* Traffic light dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs inline-block" />
              </div>

              {/* Address bar */}
              <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-center gap-2 px-3 py-1 bg-white rounded-lg border border-zinc-200/80 text-xs text-zinc-600 font-mono shadow-2xs">
                <svg className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">https://app.luxdues.com/admin/dashboard</span>
              </div>

              {/* Right Status */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Canlı Sistem
                </span>
              </div>
            </div>

            {/* Application Inside Layout */}
            <div className="flex flex-col lg:flex-row min-h-[460px] bg-zinc-50/50">
              {/* Left Mini Sidebar */}
              <div className="w-full lg:w-48 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 p-3 flex lg:flex-col justify-between flex-shrink-0">
                <div className="space-y-4 w-full">
                  <div className="px-2 pt-1 hidden lg:block">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mülk Portalı</p>
                    <p className="text-xs font-semibold text-zinc-900 truncate">Lux Apartment</p>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex lg:flex-col gap-1 w-full overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl text-left flex items-center gap-2 transition-colors whitespace-nowrap ${
                        activeTab === 'overview'
                          ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Genel Bakış</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('dues')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl text-left flex items-center gap-2 transition-colors whitespace-nowrap ${
                        activeTab === 'dues'
                          ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Aidat Takibi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('cashflow')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl text-left flex items-center gap-2 transition-colors whitespace-nowrap ${
                        activeTab === 'cashflow'
                          ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <span>Kasa & Bankalar</span>
                    </button>
                  </div>
                </div>

                <div className="hidden lg:block pt-4 border-t border-zinc-100">
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/70 text-[11px] text-zinc-500">
                    <p className="font-semibold text-zinc-800">7/24 Online</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Otomatik Mutabakat</p>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Panel Body */}
              <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-x-auto">
                {/* Top Metrics Row (Donut Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Tahsil Edilecekler */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Tahsil Edilecekler</h4>
                      <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        501 Daire / Hesap
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* CSS / SVG Donut */}
                      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                          <path
                            className="text-zinc-100"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-sky-500"
                            strokeDasharray="78, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-rose-500"
                            strokeDasharray="22, 100"
                            strokeDashoffset="-78"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-bold text-zinc-900">2.42M ₺</span>
                          <span className="text-[9px] text-zinc-400">Toplam</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-600">
                            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 flex-shrink-0" />
                            Vadesi Gelmemiş
                          </span>
                          <span className="font-semibold text-zinc-900 font-mono">1.903.377 ₺</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-600">
                            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 flex-shrink-0" />
                            Geciken Borçlar
                          </span>
                          <span className="font-semibold text-rose-600 font-mono">518.290 ₺</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ödenecekler (Giderler) */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Ödenecekler (Giderler)</h4>
                      <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        22 Hizmet & Tedarikçi
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* CSS / SVG Donut */}
                      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                          <path
                            className="text-zinc-100"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-500"
                            strokeDasharray="20, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-amber-500"
                            strokeDasharray="80, 100"
                            strokeDashoffset="-20"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-bold text-zinc-900">1.08M ₺</span>
                          <span className="text-[9px] text-zinc-400">Gider</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-600">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
                            Vadesi Gelmemiş
                          </span>
                          <span className="font-semibold text-zinc-900 font-mono">212.971 ₺</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-600">
                            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0" />
                            Planlanan Ödemeler
                          </span>
                          <span className="font-semibold text-amber-700 font-mono">867.698 ₺</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank & Cash Flow Integrations Card */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">30 Günlük Nakit Akışı & Banka Entegrasyonları</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Otomatik hesap hareketleri ve anlık bakiye mutabakatı</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      +1.340.997 ₺ Net Kasa
                    </span>
                  </div>

                  {/* Graph Visual Mock */}
                  <div className="relative h-24 w-full pt-2 flex items-end justify-between gap-1 border-b border-zinc-100">
                    {[35, 42, 40, 55, 60, 48, 70, 65, 80, 75, 90, 85, 95, 110, 105, 120, 130, 125, 140, 150].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            idx >= 15 ? 'bg-zinc-900 group-hover:bg-zinc-700' : 'bg-zinc-200 group-hover:bg-zinc-300'
                          }`}
                          style={{ height: `${(val / 150) * 60}px` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bank Accounts Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
                      <p className="text-[10px] text-zinc-400 uppercase font-semibold">Banka Hesabı 1</p>
                      <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">106.249 ₺</p>
                    </div>
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
                      <p className="text-[10px] text-zinc-400 uppercase font-semibold">Banka Hesabı 2</p>
                      <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">822.348 ₺</p>
                    </div>
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
                      <p className="text-[10px] text-zinc-400 uppercase font-semibold">Nakit Kasa</p>
                      <p className="text-xs font-bold text-zinc-900 font-mono mt-0.5">67.700 ₺</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
