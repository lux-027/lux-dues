'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { CurrencyInput } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { BuildingType } from '@prisma/client';
import { BUILDING_ARCHIVE_IMAGES } from '@/lib/buildingImages';
import Link from 'next/link';

interface UnitBrief {
  id: string;
  isVacant: boolean;
  residents: { id: string }[];
}

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  totalBlocks: number;
  address: string;
  image: string | null;
  createdAt: string;
  _count: {
    units: number;
    admins: number;
    complaints?: number;
    specialProjects?: number;
  };
  units?: UnitBrief[];
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SITE' | 'APARTMENT'>('ALL');
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<BuildingType | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    loading: boolean;
  }>({ open: false, title: '', description: '', action: async () => {}, loading: false });

  useEffect(() => {
    fetchBuildings();
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings');
      if (response.ok) {
        const data = await response.json();
        setBuildings(data);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBuildingTypeLabel = (type: BuildingType) => {
    return type === BuildingType.APARTMENT ? 'Apartman' : 'Site';
  };

  const getBuildingImageUrl = (buildingId: string, index?: number) => {
    const dayIndex = Math.floor(Date.now() / 86400000);
    const imageSet = index ?? 0;
    const seed = `${buildingId}-${dayIndex}-${imageSet}`;
    return `https://loremflickr.com/800/400/city,corporate,office,skyscraper,modern,urban,apartment?lock=${seed}`;
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [buildings, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const totalBuildings = buildings.length;
    const siteCount = buildings.filter((b) => b.type === BuildingType.SITE).length;
    const aptCount = buildings.filter((b) => b.type === BuildingType.APARTMENT).length;
    const totalUnits = buildings.reduce((acc, b) => acc + (b._count?.units || 0), 0);
    const vacantUnits = buildings.reduce(
      (acc, b) => acc + (b.units?.filter((u) => u.isVacant).length || 0),
      0
    );
    const occupiedUnits = Math.max(0, totalUnits - vacantUnits);
    const registeredResidents = buildings.reduce(
      (acc, b) => acc + (b.units?.filter((u) => u.residents && u.residents.length > 0).length || 0),
      0
    );
    const totalAdmins = buildings.reduce((acc, b) => acc + (b._count?.admins || 0), 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 100;
    const residentLinkRate = totalUnits > 0 ? Math.round((registeredResidents / totalUnits) * 100) : 0;

    return {
      totalBuildings,
      siteCount,
      aptCount,
      totalUnits,
      vacantUnits,
      occupiedUnits,
      registeredResidents,
      totalAdmins,
      occupancyRate,
      residentLinkRate,
    };
  }, [buildings]);

  const handleDeleteBuilding = async (building: Building) => {
    setConfirmModal({
      open: true,
      title: `${building.type === BuildingType.SITE ? 'Siteyi' : 'Apartmanı'} Silmek İstiyor musunuz?`,
      description: `"${building.name}" ve bağlı tüm bloklar, daireler, aidatlar ve proje kayıtları kalıcı olarak silinecektir. Bu işlem geri alınamaz.`,
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const response = await fetch(`/api/buildings/${building.id}`, { method: 'DELETE' });
          if (response.ok) {
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
            fetchBuildings();
          } else {
            alert('Bina silinirken bir hata oluştu');
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
          }
        } catch (error) {
          console.error('Error deleting building:', error);
          alert('Bina silinirken bir hata oluştu');
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
      loading: false,
    });
  };

  return (
    <div className="page-container space-y-6">
      {/* Banner */}
      <img
        src="/bannerbina.jpg"
        alt="Site görseli"
        className="w-full h-44 object-cover rounded-2xl border border-zinc-200 shadow-sm"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Binalar & Siteler</h1>
          <p className="text-zinc-600 font-light text-sm mt-0.5">
            Portföyünüzdeki tüm mülkleri, blokları, daireleri ve aidat akışlarını tek merkezden yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {session?.name === 'Ahmet Çelik' ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setCreateInitialType(BuildingType.APARTMENT);
                  setShowCreateModal(true);
                }}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              >
                Demo Apartman
              </Button>
              <Button
                onClick={() => {
                  setCreateInitialType(BuildingType.SITE);
                  setShowCreateModal(true);
                }}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Demo Site
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setCreateInitialType(undefined);
                setShowCreateModal(true);
              }}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Yeni Bina Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Buildings */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Yönetilen Yapı</span>
            <span className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-zinc-900">{stats.totalBuildings}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-900">{stats.siteCount} Site</span>
              <span>•</span>
              <span className="font-medium text-zinc-900">{stats.aptCount} Apartman</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Total Units & Vacancy */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Toplam Daire</span>
            <span className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-zinc-900">{stats.totalUnits}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-900">{stats.occupiedUnits} Dolu</span>
              <span>•</span>
              <span className="font-medium text-zinc-900">{stats.vacantUnits} Boş Daire</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Registered Residents */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sakin Bağlantısı</span>
            <span className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-zinc-900">{stats.registeredResidents}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-900">%{stats.residentLinkRate}</span>
              <span>online takip oranı</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Admins */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Yönetici Kadrosu</span>
            <span className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-zinc-900">{stats.totalAdmins}</div>
            <div className="mt-1 text-xs text-zinc-500">
              <span>Bina & Blok Yöneticileri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bina adı veya adres ara..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              typeFilter === 'ALL'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Tümü ({stats.totalBuildings})
          </button>
          <button
            onClick={() => setTypeFilter('SITE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              typeFilter === 'SITE'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Siteler ({stats.siteCount})
          </button>
          <button
            onClick={() => setTypeFilter('APARTMENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              typeFilter === 'APARTMENT'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Apartmanlar ({stats.aptCount})
          </button>
        </div>
      </div>

      {/* Building Grid */}
      {filteredBuildings.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-3 text-base font-medium text-zinc-900">
                {searchQuery || typeFilter !== 'ALL' ? 'Aramaya uygun bina bulunamadı' : 'Henüz bina eklenmedi'}
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery || typeFilter !== 'ALL'
                  ? 'Arama kriterlerinizi temizleyerek tekrar deneyebilirsiniz.'
                  : 'Yeni bir bina veya site ekleyerek yönetime hemen başlayabilirsiniz.'}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building, index) => {
            const buildingUnits = building.units || [];
            const bTotalUnits = building._count.units || 0;
            const bVacantUnits = buildingUnits.filter((u) => u.isVacant).length;
            const bOccupiedUnits = Math.max(0, bTotalUnits - bVacantUnits);
            const bRegisteredResidents = buildingUnits.filter((u) => u.residents && u.residents.length > 0).length;
            const bOccupancyPercent = bTotalUnits > 0 ? Math.round((bOccupiedUnits / bTotalUnits) * 100) : 100;

            return (
              <div
                key={building.id}
                className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Visual Header Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={building.image || getBuildingImageUrl(building.id, index % 10)}
                      alt={building.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/30 to-transparent" />
                    
                    {/* Building Type & Blocks Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-zinc-900 shadow-sm">
                        {building.type === BuildingType.APARTMENT ? (
                          <svg className="h-3.5 w-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h5V10H3v11zm7 0h5V6h-5v15zm7 0h5V10h-5v11z" />
                          </svg>
                        )}
                        {getBuildingTypeLabel(building.type)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-black/40 backdrop-blur-md text-white border border-white/20">
                        {building.totalBlocks} Blok
                      </span>
                    </div>

                    {/* Title and Address on Image */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <Link
                        href={`/admin/buildings/${building.id}`}
                        className="block text-lg font-semibold truncate hover:underline hover:text-zinc-100 transition-colors"
                      >
                        {building.name}
                      </Link>
                      <p className="text-xs text-zinc-300 truncate mt-0.5 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{building.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="p-4 space-y-3 bg-zinc-50/50 border-b border-zinc-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-xs">
                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Daire</p>
                        <p className="text-base font-semibold text-zinc-900">{bTotalUnits}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-xs">
                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Sakin</p>
                        <p className="text-base font-semibold text-zinc-900">{bRegisteredResidents}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-xs">
                        <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Yönetici</p>
                        <p className="text-base font-semibold text-zinc-900">{building._count.admins}</p>
                      </div>
                    </div>

                    {/* Occupancy Indicator Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-600">
                        <span>Doluluk Durumu</span>
                        <span className="font-semibold text-zinc-900">
                          {bOccupiedUnits} Dolu {bVacantUnits > 0 ? `(${bVacantUnits} Boş)` : ''}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                          style={{ width: `${bOccupancyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="p-3.5 bg-white space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/admin/buildings/${building.id}/residents`} className="w-full">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                      >
                        <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Sakinler ({bTotalUnits})</span>
                      </button>
                    </Link>

                    <Link href={`/admin/buildings/${building.id}/dues`} className="w-full">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                      >
                        <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Aidat Takibi</span>
                      </button>
                    </Link>
                  </div>

                  <Link href={`/admin/buildings/${building.id}`} className="w-full block">
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      <span>Bina Yönetim Paneli</span>
                      <svg className="h-3.5 w-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info & Feature Highlights Section */}
      <div className="pt-4">
        <div className="mb-5">
          <h2 className="text-xl font-light text-zinc-900 tracking-tight">LuxDues Yönetim & İşlem Rehberi</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Bina ve site operasyonlarınızı kolaylaştıran gelişmiş yönetim fonksiyonları
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Toplu Aidat & Makbuzlandırma</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Her ay tüm bloklara veya belirli dairelere tek tıkla toplu aidat tahakkuk ettirin. Boş daireler otomatik olarak muaf tutulur.
            </p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Sakin Daveti & ID Eşleme</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Sakinleri 9 haneli Kullanıcı ID ile dairelerine bağlayın. Sakinler borçlarını ve duyuruları kendi panellerinden anında izlesin.
            </p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Anlık Bildirim & Yönetici Ağı</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Daireden ayrılma, sakin yetkilendirme ve yönetici arkadaşlık talepleri sistem bildirim kutusunda gerçek zamanlı olarak güncellenir.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateBuildingModal
          initialType={createInitialType}
          onClose={() => {
            setShowCreateModal(false);
            setCreateInitialType(undefined);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setCreateInitialType(undefined);
            fetchBuildings();
          }}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        variant="danger"
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        loading={confirmModal.loading}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// -------------------------------------------------------------
// MODALS
// -------------------------------------------------------------
interface CreateBuildingModalProps {
  initialType?: BuildingType;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateBuildingModal({ initialType, onClose, onSuccess }: CreateBuildingModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    type: BuildingType;
    totalBlocks: string;
    address: string;
    image: string;
    blocks: string[];
    unitsPerBlock: string;
    defaultDueAmount: string;
    blockDues: Record<string, string>;
  }>({
    name: '',
    type: BuildingType.APARTMENT,
    totalBlocks: '1',
    address: '',
    image: '',
    blocks: ['A Blok'],
    unitsPerBlock: '',
    defaultDueAmount: '1500',
    blockDues: { 'A Blok': '1500' },
  });

  useEffect(() => {
    if (initialType && initialType !== formData.type) {
      handleTypeChange(initialType);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleTypeChange = (newType: BuildingType) => {
    if (newType === BuildingType.APARTMENT) {
      setFormData((prev) => ({
        ...prev,
        type: newType,
        totalBlocks: '1',
        blocks: ['A Blok'],
        blockDues: { 'A Blok': prev.defaultDueAmount || '1500' },
      }));
    } else {
      const count = parseInt(formData.totalBlocks) || 3;
      const initialBlocks = Array.from({ length: Math.max(2, count) }, (_, i) => `${String.fromCharCode(65 + i)} Blok`);
      const initialDues: Record<string, string> = {};
      initialBlocks.forEach((b) => {
        initialDues[b] = formData.defaultDueAmount || '1500';
      });

      setFormData((prev) => ({
        ...prev,
        type: newType,
        totalBlocks: String(initialBlocks.length),
        blocks: initialBlocks,
        blockDues: initialDues,
      }));
    }
  };

  const handleTotalBlocksChange = (val: string) => {
    const count = Math.min(26, Math.max(1, parseInt(val) || 1));
    const newBlocks = Array.from({ length: count }, (_, i) => {
      return formData.blocks[i] || `${String.fromCharCode(65 + i)} Blok`;
    });
    const updatedDues = { ...formData.blockDues };
    newBlocks.forEach((b) => {
      if (!updatedDues[b]) updatedDues[b] = formData.defaultDueAmount || '1500';
    });

    setFormData((prev) => ({
      ...prev,
      totalBlocks: val,
      blocks: newBlocks,
      blockDues: updatedDues,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          totalBlocks: formData.totalBlocks,
          address: formData.address,
          image: formData.image,
          blocks: formData.blocks,
          unitsPerBlock: formData.unitsPerBlock ? parseInt(formData.unitsPerBlock) : undefined,
          defaultDueAmount: formData.defaultDueAmount ? parseFloat(formData.defaultDueAmount) : undefined,
          blockDues: formData.blockDues,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Bina oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      setError('Bina oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all my-8 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">
              {formData.type === BuildingType.SITE ? 'Yeni Site / Kompleks Ekle' : 'Yeni Apartman Ekle'}
            </h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="input-label">Bina Görseli</label>
              <div className="flex items-center gap-3">
                {formData.image ? (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-200">
                    <img src={formData.image} alt="Bina görseli" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-zinc-900/70 text-white rounded-full hover:bg-zinc-900"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(formData.image);
                    setShowImagePicker(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {formData.image ? 'Görseli Değiştir' : 'Görsel Ekle'}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-1.5">Boş bırakırsanız sistem rastgele bir arşiv görseli atar.</p>
            </div>

            <div className="form-group">
              <label className="input-label">Bina / Site Adı</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Kardelen Sitesi"
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Yapı Türü</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange(BuildingType.APARTMENT)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    formData.type === BuildingType.APARTMENT
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Tek Apartman
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange(BuildingType.SITE)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    formData.type === BuildingType.SITE
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h5V10H3v11zm7 0h5V6h-5v15zm7 0h5V10h-5v11z" />
                  </svg>
                  Çoklu Bloklu Site
                </button>
              </div>
            </div>

            {formData.type === BuildingType.SITE && (
              <div className="form-group">
                <label className="input-label">Blok Sayısı</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.totalBlocks}
                  onChange={(e) => handleTotalBlocksChange(e.target.value)}
                  placeholder="Örn: 3"
                  min="1"
                  max="26"
                  required
                />
              </div>
            )}

            {formData.type === BuildingType.APARTMENT && (
              <div className="form-group">
                <CurrencyInput
                  label="Aylık Standart Aidat Tutarı (₺)"
                  value={formData.defaultDueAmount}
                  onChange={(value) => setFormData({ ...formData, defaultDueAmount: value })}
                  placeholder="Örn: 1.500"
                  min="0"
                  required
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Aidat yönetimi sayfasında bu tutar otomatik olarak kullanılır.
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="input-label">
                Otomatik Daire Oluşturma <span className="text-xs font-normal text-zinc-500">(İsteğe bağlı)</span>
              </label>
              <input
                type="number"
                className="input-field"
                value={formData.unitsPerBlock}
                onChange={(e) => setFormData({ ...formData, unitsPerBlock: e.target.value })}
                placeholder="Her blok için oluşturulacak daire sayısı (Örn: 12)"
                min="1"
                max="100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Boş bırakırsanız daireleri daha sonra tek tek veya toplu olarak ekleyebilirsiniz.
              </p>
            </div>

            <div className="form-group">
              <label className="input-label">Adres</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Örn: Atatürk Mah. Cumhuriyet Cad. No:123"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                {formData.type === BuildingType.SITE ? 'Siteyi Oluştur' : 'Binayı Oluştur'}
              </Button>
            </div>
          </form>

          {/* Image Picker Modal */}
          {showImagePicker && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm"
                onClick={() => setShowImagePicker(false)}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
                <div className="flex items-center justify-between p-5 border-b border-zinc-200">
                  <h3 className="text-base font-semibold text-zinc-900">Bina Görseli Seç</h3>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Upload / Camera */}
                  <div>
                    <label className="input-label">Galeri veya Kamera</label>
                    <label className="flex items-center justify-center gap-2 w-full p-3 mt-1 bg-zinc-50 border border-zinc-200 border-dashed rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                      <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-zinc-600">Fotoğraf Yükle veya Çek</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {previewImage && (
                      <div className="mt-3 h-40 rounded-xl overflow-hidden border border-zinc-200">
                        <img src={previewImage} alt="Önizleme" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Archive */}
                  <div>
                    <label className="input-label">Arşiv</label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {BUILDING_ARCHIVE_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setPreviewImage(img.src)}
                          className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            previewImage === img.src
                              ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-1'
                              : 'border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="input-label">Kendi URL</label>
                    <input
                      type="text"
                      className="input-field mt-1"
                      value={previewImage.startsWith('data:') ? '' : previewImage}
                      onChange={(e) => setPreviewImage(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowImagePicker(false)}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: previewImage });
                      setShowImagePicker(false);
                    }}
                    disabled={!previewImage}
                  >
                    Seç
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
