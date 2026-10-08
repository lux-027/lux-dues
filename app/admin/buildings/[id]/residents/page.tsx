'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody } from '@/components/ui';
import { Button, Input, Badge, CurrencyInput, DatePicker } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { BLOCK_ARCHIVE_IMAGES } from '@/lib/buildingImages';
import { UserAvatar } from '@/components/UserAvatar';
import EditUnitModal from './EditUnitModal';
import { LoadingScreen } from '@/components/LoadingScreen';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

interface Resident {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
}

interface Due {
  id: string;
  unitId: string;
  amount: number | string;
  month: number;
  year: number;
  status: 'PAID' | 'UNPAID';
  dueDate: string;
}

interface Unit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  ownerName: string;
  residentPhone: string;
  defaultDueAmount?: string | number | null;
  isVacant?: boolean;
  residents: Resident[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  blockName?: string | null;
}

interface BuildingInfo {
  id: string;
  name: string;
  type: 'SITE' | 'APARTMENT';
  totalBlocks: number;
  blockImages: Record<string, string> | null;
  image?: string | null;
  defaultDueAmount?: number | string | null;
  admins?: AdminUser[];
}

export default function ResidentsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildingId = params.id as string;

  const [building, setBuilding] = useState<BuildingInfo | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [duesLoading, setDuesLoading] = useState(false);
  const [duesYear, setDuesYear] = useState<number>(new Date().getFullYear());
  const [duesMonth, setDuesMonth] = useState<number>(new Date().getMonth() + 1);
  const [actionLoadingDueId, setActionLoadingDueId] = useState<string | null>(null);
  const [customBlocks, setCustomBlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showBulkDueModal, setShowBulkDueModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    loading: boolean;
  }>({ open: false, title: '', description: '', action: async () => {}, loading: false });

  useEffect(() => {
    const blockParam = searchParams.get('block');
    if (blockParam) {
      setSelectedBlock(blockParam);
    } else {
      setSelectedBlock('ALL');
    }
  }, [searchParams]);

  useEffect(() => {
    if (buildingId) {
      fetchData();
    }
  }, [buildingId]);

  const fetchData = async () => {
    try {
      const [bRes, uRes, dRes] = await Promise.all([
        fetch(`/api/buildings/${buildingId}`),
        fetch(`/api/units?buildingId=${buildingId}`),
        fetch(`/api/dues?buildingId=${buildingId}&year=${duesYear}&month=${duesMonth}`),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBuilding(bData);
      }

      if (uRes.ok) {
        const uData = await uRes.json();
        setUnits(uData);
      }

      if (dRes.ok) {
        const dData = await dRes.json();
        setDues(dData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuesOnly = async (year = duesYear, month = duesMonth) => {
    setDuesLoading(true);
    try {
      const res = await fetch(`/api/dues?buildingId=${buildingId}&year=${year}&month=${month}`);
      if (res.ok) {
        const dData = await res.json();
        setDues(dData);
      }
    } catch (err) {
      console.error('Error fetching dues:', err);
    } finally {
      setDuesLoading(false);
    }
  };

  const handleToggleDue = async (dueId: string, currentStatus: 'PAID' | 'UNPAID') => {
    try {
      setActionLoadingDueId(dueId);
      const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
      const res = await fetch(`/api/dues/${dueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchDuesOnly();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingDueId(null);
    }
  };

  // Derive all available block names
  const allBlockNames = useMemo(() => {
    const set = new Set<string>();

    units.forEach((u) => {
      if (u.blockName) set.add(u.blockName);
    });

    customBlocks.forEach((b) => set.add(b));

    if (set.size === 0 && building && building.totalBlocks > 0) {
      for (let i = 0; i < building.totalBlocks; i++) {
        set.add(`${String.fromCharCode(65 + i)} Blok`);
      }
    }

    return Array.from(set).sort();
  }, [units, customBlocks, building]);

  useEffect(() => {
    if (building && building.type === 'APARTMENT' && selectedBlock === null && !searchParams.get('block')) {
      setSelectedBlock('ALL');
    }
  }, [building, selectedBlock, searchParams]);

  const filteredUnits = useMemo(() => {
    if (!selectedBlock || selectedBlock === 'ALL') return units;
    return units.filter((u) => u.blockName === selectedBlock);
  }, [units, selectedBlock]);

  const createInitialUnitsForBlock = async (blockName: string, count: number) => {
    const unitsToCreate = [];
    for (let d = 1; d <= count; d++) {
      const floor = Math.max(1, Math.ceil(d / 4)).toString();
      unitsToCreate.push({
        blockName,
        doorNo: String(d),
        floor,
        ownerName: '',
        residentPhone: '',
      });
    }

    try {
      await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          units: unitsToCreate,
        }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBatchModal = () => {
    setShowBatchModal(true);
  };

  const handleAddUnit = () => {
    setShowAddUnitModal(true);
  };

  const handleDeleteBlock = async () => {
    if (!selectedBlock || selectedBlock === 'ALL') return;
    setConfirmModal({
      open: true,
      title: `"${selectedBlock}" Bloğunu Silmek İstiyor musunuz?`,
      description: `"${selectedBlock}" bloğuna bağlı tüm daireler ve kayıtlı aidat bilgileri kalıcı olarak silinecektir. Bu işlem geri alınamaz.`,
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const response = await fetch(
            `/api/units?buildingId=${buildingId}&blockName=${encodeURIComponent(selectedBlock)}`,
            { method: 'DELETE' }
          );
          if (response.ok) {
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
            setSelectedBlock('ALL');
            fetchData();
          } else {
            alert('Blok silinirken bir hata oluştu');
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
          }
        } catch (error) {
          console.error('Error deleting block:', error);
          alert('Blok silinirken bir hata oluştu');
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
      loading: false,
    });
  };

  if (loading) {
    return <LoadingScreen label="Daireler yükleniyor" />;
  }

  // -------------------------------------------------------------
  // VIEW: UNITS & RESIDENTS TABLE (and Block Dues)
  // -------------------------------------------------------------
  const assignedAdminForSelected = building?.admins?.find((a) => a.blockName === selectedBlock);

  return (
    <div className="page-container">
      {/* Back Button & Top Navigation */}
      <div className="section-header mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/admin/buildings/${buildingId}`)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Bina Genel Bakışına Dön
          </Button>
        </div>

        <Card className="mb-4 sm:mb-6 shadow-sm border-zinc-200">
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-4 sm:gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100 hidden lg:block">
                    <img
                      src={building?.image || `https://loremflickr.com/400/400/city,corporate,office,skyscraper,modern,urban,apartment?lock=${buildingId}`}
                      alt={building?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h1 className="text-lg sm:text-3xl font-light text-zinc-900 tracking-tight">
                        {selectedBlock === 'ALL' || !selectedBlock ? 'Tüm Bloklar ve Daireler' : `${selectedBlock} Daireleri`}
                      </h1>
                      <Badge variant="default" className="text-xs px-3 py-1 font-semibold">{filteredUnits.length} Daire</Badge>
                      {selectedBlock && selectedBlock !== 'ALL' && (
                        <button
                          type="button"
                          title="Blok adını düzenle"
                          onClick={() => setShowEditBlockModal(true)}
                          className="ml-auto p-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-500 flex-wrap">
                      <span>Site: <strong className="text-zinc-800">{building?.name}</strong></span>
                      {selectedBlock && selectedBlock !== 'ALL' && (
                        <>
                          <span className="text-zinc-300">•</span>
                          <span>
                            Sorumlu Yönetici:{' '}
                            <strong className="text-zinc-800">
                              {assignedAdminForSelected ? assignedAdminForSelected.name : 'Ana Yönetici (Siz)'}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto">
                {selectedBlock && selectedBlock !== 'ALL' && (
                  assignedAdminForSelected ? (
                    <div className="w-full lg:w-auto flex items-center gap-2 pl-1.5 pr-1.5 py-1.5 bg-zinc-900 text-white rounded-lg shadow-sm">
                      <UserAvatar
                        name={assignedAdminForSelected.name}
                        avatarUrl={(assignedAdminForSelected as any).avatarUrl}
                        size={28}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400 leading-none">{selectedBlock} Yöneticisi</p>
                        <p className="text-xs font-semibold truncate mt-0.5">{assignedAdminForSelected.name}</p>
                      </div>
                      <button
                        type="button"
                        title="Yöneticiyi düzenle / kaldır"
                        onClick={() => setShowAssignAdminModal(true)}
                        className="flex-shrink-0 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full lg:w-auto"
                      onClick={() => setShowAssignAdminModal(true)}
                      leftIcon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    >
                      {selectedBlock} Yöneticisi
                    </Button>
                  )
                )}
                <div className="flex flex-col items-stretch lg:items-end gap-2 mt-auto w-full lg:w-auto">
                  <div className="grid grid-cols-3 lg:flex lg:items-center gap-1.5 sm:gap-2.5 w-full lg:w-auto">
                    <Button
                      size="sm"
                      className="!px-2 lg:!px-4 !py-1.5 lg:!py-2 !text-[10px] lg:!text-xs w-full lg:w-auto"
                      onClick={handleAddUnit}
                      leftIcon={
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      }
                    >
                      Yeni Daire
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="!px-2 lg:!px-4 !py-1.5 lg:!py-2 !text-[10px] lg:!text-xs w-full lg:w-auto col-start-auto"
                      onClick={() => setShowBulkDueModal(true)}
                      leftIcon={
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    >
                      Aidat Belirle
                    </Button>
                    {(building?.type === 'APARTMENT' || (selectedBlock && selectedBlock !== 'ALL')) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="!px-2 lg:!px-4 !py-1.5 lg:!py-2 !text-[10px] lg:!text-xs w-full lg:w-auto"
                        onClick={handleOpenBatchModal}
                        leftIcon={
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5 a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        }
                      >
                        Toplu Daire
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Units Table */}
      {filteredUnits.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state py-12 text-center">
              <h3 className="text-base font-medium text-zinc-900 mb-1">
                {selectedBlock !== 'ALL'
                  ? `${selectedBlock} için henüz daire eklenmemiş`
                  : 'Henüz daire bulunmuyor'}
              </h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                {selectedBlock !== 'ALL'
                  ? 'Bu bloğa tek tek daire ekleyebilir veya toplu olarak birden fazla daireyi tek seferde oluşturabilirsiniz.'
                  : building?.type === 'APARTMENT'
                  ? 'Bu apartmana tek tek daire ekleyebilir veya toplu olarak birden fazla daireyi tek seferde oluşturabilirsiniz.'
                  : 'Site genelinde toplu daire oluşturulamaz. Lütfen önce bir blok seçin veya tek tek daire ekleyin.'}
              </p>
              <div className="flex justify-center gap-3">
                {(building?.type === 'APARTMENT' || (selectedBlock && selectedBlock !== 'ALL')) && (
                  <Button variant="secondary" onClick={() => setShowBatchModal(true)}>
                    Toplu Daire Oluştur (1-10)
                  </Button>
                )}
                <Button onClick={handleAddUnit}>
                  + Tek Daire Ekle
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><span className="sr-only">Profil</span></TableHead>
                    <TableHead>Blok</TableHead>
                    <TableHead>Kapı No</TableHead>
                    <TableHead>Malik / Sakin Adı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Kayıtlı Sakin</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <UserAvatar
                          name={unit.residents[0]?.name || unit.ownerName || (unit.isVacant ? 'Boş Daire' : 'Bilinmeyen')}
                          avatarUrl={unit.residents[0]?.avatarUrl}
                          size={32}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-zinc-900 px-2.5 py-1 bg-zinc-100 rounded-md text-xs">
                          {unit.blockName}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 text-sm">
                        Daire {unit.doorNo}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-800">{unit.ownerName}</TableCell>
                      <TableCell className="font-mono text-xs text-zinc-600">
                        {formatPhoneNumber(unit.residentPhone)}
                      </TableCell>
                      <TableCell>
                        {unit.isVacant ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Boş Daire (Aidatsız)
                          </span>
                        ) : unit.residents.length > 0 ? (
                          <Badge variant="success" leftIcon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}>
                            Kullanıcı Aktif
                          </Badge>
                        ) : unit.residentPhone ? (
                          <Badge variant="warning" leftIcon={<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}>
                            Kullanıcı Bekleniyor
                          </Badge>
                        ) : (
                          <Badge variant="danger" leftIcon={<span className="h-1.5 w-1.5 rounded-full bg-red-500" />}>
                            Kullanıcı Aktif Değil
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setEditingUnit(unit);
                            setShowEditModal(true);
                          }}
                        >
                          Düzenle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2 p-3 bg-zinc-100">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                  {/* Card top: identity */}
                  <div className="flex items-center gap-3 px-3.5 pt-3 pb-2.5">
                    <UserAvatar
                      name={unit.residents[0]?.name || unit.ownerName || (unit.isVacant ? 'Boş Daire' : 'Bilinmeyen')}
                      avatarUrl={unit.residents[0]?.avatarUrl}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 text-sm">
                          Daire {unit.doorNo}
                        </span>
                        <span className="font-medium text-zinc-600 px-1.5 py-0.5 bg-zinc-100 rounded-md text-[10px] leading-none">
                          {unit.blockName}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{unit.ownerName || 'İsim girilmedi'}</p>
                    </div>
                    <button
                      type="button"
                      title="Daireyi düzenle"
                      onClick={() => {
                        setEditingUnit(unit);
                        setShowEditModal(true);
                      }}
                      className="flex-shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card bottom: status + phone */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-zinc-50/80 border-t border-zinc-100">
                    {unit.isVacant ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Boş Daire
                      </span>
                    ) : unit.residents.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Kullanıcı Aktif
                      </span>
                    ) : unit.residentPhone ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Kullanıcı Bekleniyor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Kullanıcı Aktif Değil
                      </span>
                    )}
                    {unit.residentPhone ? (
                      <span className="font-mono text-[10px] text-zinc-500 truncate">{formatPhoneNumber(unit.residentPhone)}</span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Telefon yok</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      {showBulkDueModal && (
        <BulkCreateDuesModal
          buildingId={buildingId}
          building={building}
          units={units}
          availableBlocks={allBlockNames}
          defaultYear={duesYear}
          defaultMonth={duesMonth}
          onClose={() => setShowBulkDueModal(false)}
          onSuccess={() => {
            setShowBulkDueModal(false);
            fetchDuesOnly();
          }}
        />
      )}

      {showAddUnitModal && (
        <AddUnitModal
          buildingId={buildingId}
          existingBlocks={allBlockNames}
          defaultBlock={selectedBlock && selectedBlock !== 'ALL' ? selectedBlock : allBlockNames[0] || 'A Blok'}
          units={units}
          onClose={() => setShowAddUnitModal(false)}
          onSuccess={() => {
            setShowAddUnitModal(false);
            fetchData();
          }}
        />
      )}

      {showBatchModal && (
        <BatchCreateUnitsModal
          buildingId={buildingId}
          existingBlocks={allBlockNames}
          defaultBlock={selectedBlock && selectedBlock !== 'ALL' ? selectedBlock : allBlockNames[0] || 'A Blok'}
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            setShowBatchModal(false);
            fetchData();
          }}
        />
      )}

      {showAddBlockModal && (
        <AddBlockModal
          existingBlocks={allBlockNames}
          onClose={() => setShowAddBlockModal(false)}
          onSave={(newBlockName, autoUnitsCount) => {
            setCustomBlocks((prev) => [...prev, newBlockName]);
            setShowAddBlockModal(false);
            setSelectedBlock(newBlockName);
            if (autoUnitsCount && autoUnitsCount > 0) {
              createInitialUnitsForBlock(newBlockName, autoUnitsCount);
            }
          }}
        />
      )}

      {showEditModal && editingUnit && (
        <EditUnitModal
          buildingId={buildingId}
          unit={editingUnit}
          onClose={() => {
            setShowEditModal(false);
            setEditingUnit(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingUnit(null);
            fetchData();
          }}
        />
      )}

      {showEditBlockModal && selectedBlock && selectedBlock !== 'ALL' && building && (
        <EditBlockModal
          buildingId={buildingId}
          blockName={selectedBlock}
          blockImages={building.blockImages}
          existingBlocks={allBlockNames}
          onClose={() => setShowEditBlockModal(false)}
          onSuccess={(newBlockName) => {
            setShowEditBlockModal(false);
            setCustomBlocks((prev) => prev.map((b) => (b === selectedBlock ? newBlockName : b)));
            setSelectedBlock(newBlockName);
            fetchData();
          }}
        />
      )}

      {showAssignAdminModal && allBlockNames.length > 0 && (
        <AssignAdminModal
          buildingId={buildingId}
          blocks={allBlockNames}
          initialBlock={selectedBlock && selectedBlock !== 'ALL' ? selectedBlock : (allBlockNames[0] || '')}
          currentAdmins={building?.admins}
          onClose={() => setShowAssignAdminModal(false)}
          onSuccess={() => {
            setShowAssignAdminModal(false);
            fetchData();
          }}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        loading={confirmModal.loading}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: RENAME AN EXISTING BLOCK
// -------------------------------------------------------------
interface EditBlockModalProps {
  buildingId: string;
  blockName: string;
  blockImages: Record<string, string> | null;
  existingBlocks: string[];
  onClose: () => void;
  onSuccess: (newBlockName: string) => void;
}

function EditBlockModal({ buildingId, blockName, blockImages, existingBlocks, onClose, onSuccess }: EditBlockModalProps) {
  const [newName, setNewName] = useState(blockName);
  const [blockImage, setBlockImage] = useState(blockImages?.[blockName] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Blok adı boş olamaz');
      return;
    }
    if (trimmed !== blockName && existingBlocks.includes(trimmed)) {
      setError('Bu isimde bir blok zaten mevcut');
      return;
    }

    setLoading(true);
    try {
      const updatedBlockImages: Record<string, string> = { ...(blockImages || {}) };

      if (trimmed !== blockName) {
        delete updatedBlockImages[blockName];
      }

      if (blockImage.trim()) {
        updatedBlockImages[trimmed] = blockImage.trim();
      } else {
        delete updatedBlockImages[trimmed];
      }

      const imageRes = await fetch(`/api/buildings/${buildingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockImages: updatedBlockImages }),
      });

      if (!imageRes.ok) {
        const data = await imageRes.json();
        setError(data.error || 'Blok görseli güncellenirken bir hata oluştu');
        setLoading(false);
        return;
      }

      if (trimmed !== blockName) {
        const renameRes = await fetch('/api/units', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buildingId, oldBlockName: blockName, newBlockName: trimmed }),
        });

        if (!renameRes.ok) {
          const data = await renameRes.json();
          setError(data.error || 'Blok adı güncellenirken bir hata oluştu');
          setLoading(false);
          return;
        }
      }

      onSuccess(trimmed);
    } catch (err) {
      setError('Blok güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Blok Düzenle</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <p>{error}</p>
                {(error.includes('yetki') || error.includes('Oturum') || error.includes('bina için yetki')) && (
                  <p className="mt-1 text-xs text-red-500">
                    Bu işlem için SUPER_ADMIN veya bu binaya atanmış BLOCK_ADMIN olmalısınız.
                  </p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Blok Adı</label>
              <input
                type="text"
                className="input-field"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Blok Görseli</label>
              <div className="grid grid-cols-5 gap-2 mt-1 mb-2">
                {BLOCK_ARCHIVE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setBlockImage(img.src)}
                    className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      blockImage === img.src
                        ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-1'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="input-field"
                value={blockImage}
                onChange={(e) => setBlockImage(e.target.value)}
                placeholder="Kendi görsel URL'nizi yapıştırın"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Kaydet
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: ADD A NEW BLOCK TO THIS SITE
// -------------------------------------------------------------
interface AddBlockModalProps {
  existingBlocks: string[];
  onClose: () => void;
  onSave: (blockName: string, autoUnitsCount?: number) => void;
}

function AddBlockModal({ existingBlocks, onClose, onSave }: AddBlockModalProps) {
  const nextLetter = String.fromCharCode(65 + existingBlocks.length);
  const [blockName, setBlockName] = useState(`${nextLetter} Blok`);
  const [unitsCount, setUnitsCount] = useState('10');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = blockName.trim();
    if (!cleanName) {
      setError('Lütfen geçerli bir blok adı girin');
      return;
    }
    if (existingBlocks.includes(cleanName)) {
      setError('Bu blok adı zaten mevcut');
      return;
    }

    onSave(cleanName, parseInt(unitsCount) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Yeni Blok Ekle</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <p>{error}</p>
                {(error.includes('yetki') || error.includes('Oturum') || error.includes('bina için yetki')) && (
                  <p className="mt-1 text-xs text-red-500">
                    Bu işlem için SUPER_ADMIN veya bu binaya atanmış BLOCK_ADMIN olmalısınız.
                  </p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Blok Adı</label>
              <input
                type="text"
                className="input-field"
                placeholder="Örn: D Blok"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="input-label">Başlangıç Daire Sayısı (İsteğe bağlı)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-field"
                placeholder="Örn: 10 (1'den 10'a kadar otomatik oluşturur)"
                value={unitsCount}
                onChange={(e) => setUnitsCount(e.target.value)}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Sayı girilirse daireler otomatik oluşturulup bloğun içine aktarılır.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit">
                Bloğu Oluştur
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: BATCH CREATE UNITS FOR SELECTED BLOCK
// -------------------------------------------------------------
interface BatchCreateUnitsModalProps {
  buildingId: string;
  existingBlocks: string[];
  defaultBlock: string;
  onClose: () => void;
  onSuccess: () => void;
}

function BatchCreateUnitsModal({
  buildingId,
  existingBlocks,
  defaultBlock,
  onClose,
  onSuccess,
}: BatchCreateUnitsModalProps) {
  const [blockName, setBlockName] = useState(defaultBlock);
  const [startNo, setStartNo] = useState('1');
  const [endNo, setEndNo] = useState('10');
  const [defaultDueAmount, setDefaultDueAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const start = parseInt(startNo);
    const end = parseInt(endNo);
    const perFloor = 4;

    if (isNaN(start) || isNaN(end) || start > end || end - start > 100) {
      setError('Geçerli bir kapı numarası aralığı girin (maksimum 100 daire)');
      setLoading(false);
      return;
    }

    const targetBlock = blockName.trim() || 'A Blok';

    try {
      // Mevcut daireleri çek — sadece olmayan kapı numaraları eklenecek
      const existingRes = await fetch(`/api/units?buildingId=${buildingId}`);
      if (!existingRes.ok) {
        setError('Mevcut daireler kontrol edilirken bir hata oluştu');
        setLoading(false);
        return;
      }
      const existingUnits = await existingRes.json();
      const existingDoorNos = new Set(
        existingUnits
          .filter((u: any) => u.blockName === targetBlock)
          .map((u: any) => String(u.doorNo))
      );

      const unitsToCreate = [];
      for (let d = start; d <= end; d++) {
        if (existingDoorNos.has(String(d))) continue;
        const floor = Math.max(1, Math.ceil(d / perFloor)).toString();
        unitsToCreate.push({
          blockName: targetBlock,
          doorNo: String(d),
          floor,
          ownerName: '',
          residentPhone: '',
          defaultDueAmount,
        });
      }

      if (unitsToCreate.length === 0) {
        setError('Bu aralıktaki tüm kapı numaraları zaten mevcut. Eklenecek yeni daire yok.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          units: unitsToCreate,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Toplu daire oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError('Toplu daire oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-lg transform transition-all max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-zinc-200 shrink-0">
            <h3 className="text-sm sm:text-lg font-medium text-zinc-900">Toplu Daire Oluştur</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-3.5 sm:px-6 py-3 sm:py-4 space-y-2.5 sm:space-y-4 overflow-y-auto">
            {error && (
              <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600">
                <p>{error}</p>
                {(error.includes('yetki') || error.includes('Oturum') || error.includes('bina için yetki')) && (
                  <p className="mt-1 text-[10px] sm:text-xs text-red-500">
                    Bu işlem için SUPER_ADMIN veya bu binaya atanmış BLOCK_ADMIN olmalısınız.
                  </p>
                )}
              </div>
            )}

            <div className="p-2.5 sm:p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] sm:text-xs text-zinc-600 flex items-start gap-2">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                <strong>{blockName.trim() || 'A Blok'}</strong> bloğunda aralıktaki <strong>eksik</strong> kapı numaraları eklenir. Zaten kayıtlı daireler ve sakin bilgileri korunur.
              </p>
            </div>

            <div className="form-group">
              <label className="input-label">Blok İsmi</label>
              <select
                className="input-field"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
              >
                <option value="" disabled>Blok seçin</option>
                {existingBlocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <div className="form-group">
                <Input
                  label="Başlangıç Kapı No"
                  type="number"
                  min="1"
                  value={startNo}
                  onChange={(e) => setStartNo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <Input
                  label="Bitiş Kapı No"
                  type="number"
                  min="1"
                  value={endNo}
                  onChange={(e) => setEndNo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <CurrencyInput
                label="Varsayılan Aidat Tutarı (₺)"
                min="0"
                step="0.01"
                value={defaultDueAmount}
                onChange={(value) => setDefaultDueAmount(value)}
                helperText="Oluşturulan her daire için varsayılan aylık aidat tutarı. Sonradan düzenlenebilir."
                required
              />
            </div>

            <div className="p-2.5 sm:p-3 bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-zinc-600">
              {blockName || 'Blok'} için <strong>No: {startNo}</strong> ile <strong>No: {endNo}</strong> arası (toplam {Math.max(0, (parseInt(endNo) || 0) - (parseInt(startNo) || 0) + 1)} adet) daire taslağı oluşturulacaktır.
              <br />
              Her daire için varsayılan aidat tutarı: <strong>{Number(defaultDueAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" size="sm" loading={loading}>
                Daireleri Oluştur
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface AssignAdminModalProps {
  buildingId: string;
  blocks: string[];
  initialBlock: string;
  currentAdmins?: AdminUser[];
  onClose: () => void;
  onSuccess: () => void;
}

function AssignAdminModal({ buildingId, blocks, initialBlock, currentAdmins, onClose, onSuccess }: AssignAdminModalProps) {
  const [selectedBlock, setSelectedBlock] = useState(initialBlock);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const currentAdmin = currentAdmins?.find((a) => a.blockName === selectedBlock);

  const handleInvite = async (receiverId: string) => {
    setInviting(true);
    setError('');
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, blockName: selectedBlock, receiverId }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Davet gönderilemedi');
      }
    } catch {
      setError('Davet gönderilemedi');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!currentAdmin) return;
    setInviting(true);
    setError('');
    try {
      const res = await fetch(`/api/admins/${currentAdmin.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Yönetici kaldırılamadı');
      }
    } catch {
      setError('Yönetici kaldırılamadı');
    } finally {
      setInviting(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  const handleSelectAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setSearch(admin.name);
    setShowDropdown(false);
  };

  const handleInviteSelected = async () => {
    if (!selectedAdmin) return;
    await handleInvite(selectedAdmin.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <h3 className="text-base font-semibold text-zinc-900">{selectedBlock} - Yönetici Belirle</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {blocks.length > 1 && (
            <div className="form-group">
              <label className="input-label">Blok Seçin</label>
              <select
                className="input-field"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
              >
                {blocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentAdmin && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Mevcut Yönetici</p>
                  <p className="text-base font-semibold text-zinc-900">{currentAdmin.name}</p>
                  <p className="text-sm text-zinc-600 mt-1">{currentAdmin.email}</p>
                  <p className="text-sm text-zinc-600">{currentAdmin.phone}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveAdmin}
                  loading={inviting}
                  disabled={inviting}
                >
                  Yöneticiyi Kaldır
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2 relative">
            <div>
              <label className="input-label">Yönetici Ara</label>
              <div className="relative">
                <input
                  type="text"
                  className="input-field mt-1"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="İsim, e-posta veya telefon ile ara..."
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedAdmin(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {showDropdown && (search || filteredAdmins.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-sm text-zinc-500">Yükleniyor...</div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="p-3 text-sm text-zinc-500">Sonuç bulunamadı.</div>
                ) : (
                  filteredAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectAdmin(admin)}
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{admin.name}</p>
                        <p className="text-xs text-zinc-500">{admin.email} • {admin.phone}</p>
                      </div>
                      <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedAdmin && !showDropdown && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{selectedAdmin.name}</p>
                    <p className="text-xs text-zinc-500">{selectedAdmin.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleInviteSelected}
                    loading={inviting}
                    disabled={inviting}
                  >
                    Davet Gönder
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500">
            Seçtiğiniz yöneticiye <strong>{selectedBlock}</strong> için davet gönderilecektir. Kabul ettiğinde sorumlu olarak atanacaktır.
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <svg className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            Aradığınız yönetici listede yoksa veya yeni bir yönetici eklemek istiyorsanız{' '}
            <a href="/admin/admins" className="font-semibold underline hover:text-amber-900">
              Yöneticiler sayfasına gidin
            </a>
            . Davet gönderdikten sonra tekrar buradan atama yapabilirsiniz.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-zinc-200">
          <a
            href="/admin/admins"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 rounded-xl shadow-sm transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Yöneticiler Sayfasına Git
          </a>
          <Button type="button" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: ADD A SINGLE UNIT TO A SELECTED BLOCK
// -------------------------------------------------------------
interface AddUnitModalProps {
  buildingId: string;
  existingBlocks: string[];
  defaultBlock: string;
  units: Unit[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddUnitModal({
  buildingId,
  existingBlocks,
  defaultBlock,
  units,
  onClose,
  onSuccess,
}: AddUnitModalProps) {
  const [blockName, setBlockName] = useState(defaultBlock);
  const [count, setCount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allBlocks = blockName === 'ALL';
  const targetBlocks = allBlocks ? existingBlocks : [blockName];
  const nextDoorNoFor = (block: string) =>
    units
      .filter((u) => u.blockName === block)
      .reduce((max, u) => {
        const n = parseInt(String(u.doorNo), 10);
        return isNaN(n) ? max : Math.max(max, n);
      }, 0) + 1;
  const existingCount = units.filter((u) => targetBlocks.includes(u.blockName)).length;
  const nextDoorNo = nextDoorNoFor(blockName);
  const addCount = Math.min(100, Math.max(1, parseInt(count) || 1));
  const totalNew = addCount * targetBlocks.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockName) {
      setError('Lütfen bir blok seçin');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const unitsToCreate = targetBlocks.flatMap((block) => {
        const start = nextDoorNoFor(block);
        return Array.from({ length: addCount }, (_, i) => ({
          blockName: block,
          doorNo: String(start + i),
          ownerName: '',
          residentPhone: '',
        }));
      });

      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          units: unitsToCreate,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Daire eklenirken bir hata oluştu');
      }
    } catch {
      setError('Daire eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md transform transition-all max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-zinc-200 shrink-0">
            <h3 className="text-sm sm:text-lg font-medium text-zinc-900">Yeni Daire Ekle</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-3.5 sm:px-6 py-3 sm:py-4 space-y-2.5 sm:space-y-4 overflow-y-auto">
            {error && (
              <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600">
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Blok</label>
              <select
                className="input-field"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
              >
                {existingBlocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                {existingBlocks.length > 1 && <option value="ALL">Tüm Bloklar</option>}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Eklenecek Daire Sayısı</label>
              <input
                type="number"
                className="input-field"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />
            </div>

            <div className="p-2.5 sm:p-3 bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-zinc-600 space-y-1">
              {allBlocks ? (
                <p>
                  <strong>Her bloğa</strong> {addCount} daire eklenecek — toplam{' '}
                  <strong>{totalNew} daire</strong> ({targetBlocks.length} blok × {addCount}).
                </p>
              ) : (
                <p>
                  <strong>{blockName || '—'}</strong> bloğuna{' '}
                  <strong>
                    Daire {nextDoorNo}
                    {addCount > 1 ? ` – ${nextDoorNo + addCount - 1}` : ''}
                  </strong>{' '}
                  ({addCount} daire) eklenecek.
                </p>
              )}
              <p className="text-zinc-500">
                Mevcut: {existingCount} daire → İşlem sonrası toplam:{' '}
                <strong className="text-zinc-800">{existingCount + totalNew} daire</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" size="sm" loading={loading}>
                {totalNew > 1 ? 'Daireleri Oluştur' : 'Daireyi Oluştur'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: BULK CREATE DUES MODAL
// -------------------------------------------------------------
interface BulkCreateDuesModalProps {
  buildingId: string;
  building: BuildingInfo | null;
  units: Unit[];
  availableBlocks: string[];
  defaultYear: number;
  defaultMonth: number;
  onClose: () => void;
  onSuccess: () => void;
}

function BulkCreateDuesModal({
  buildingId,
  building,
  units,
  availableBlocks,
  defaultYear,
  defaultMonth,
  onClose,
  onSuccess,
}: BulkCreateDuesModalProps) {
  const [year, setYear] = useState(defaultYear);
  const [date, setDate] = useState(`${defaultYear}-${String(defaultMonth).padStart(2, '0')}-05`);
  const [blockName, setBlockName] = useState('ALL');
  const [amount, setAmount] = useState(
    building?.defaultDueAmount ? String(building.defaultDueAmount) : '1500'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const affectedCount = useMemo(() => {
    if (blockName === 'ALL') return units.length;
    return units.filter((u) => u.blockName === blockName).length;
  }, [units, blockName]);

  useEffect(() => {
    const blockUnits = blockName === 'ALL' ? units : units.filter((u) => u.blockName === blockName);
    const dueAmounts = blockUnits.map((u) => u.defaultDueAmount).filter(Boolean) as (string | number)[];
    if (dueAmounts.length > 0) {
      const first = dueAmounts[0];
      const allSame = dueAmounts.every((v) => v === first);
      if (allSame) {
        setAmount(String(first));
        return;
      }
    }
    setAmount(building?.defaultDueAmount ? String(building.defaultDueAmount) : '1500');
  }, [blockName, units, building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [dateYear, dateMonth] = date.split('-').map(Number);
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          buildingId,
          blockName,
          amount: parseFloat(amount),
          month: dateMonth,
          year: dateYear,
          dueDate: new Date(date).toISOString(),
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Toplu aidat oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-lg transform transition-all max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-zinc-200 shrink-0">
            <h3 className="text-sm sm:text-lg font-medium text-zinc-900">Toplu Aidat Tanımla</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-3.5 sm:px-6 py-3 sm:py-4 space-y-2.5 sm:space-y-4 overflow-y-auto">
            {error && (
              <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <div className="form-group">
                <label className="input-label">Yıl</label>
                <input
                  type="number"
                  className="input-field"
                  value={year}
                  onChange={(e) => {
                    const y = parseInt(e.target.value) || defaultYear;
                    setYear(y);
                    const [_, m, d] = date.split('-');
                    setDate(`${y}-${m}-${d}`);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <DatePicker
                  label="Tarih (GG.AA.YYYY)"
                  value={date}
                  onChange={(v) => {
                    if (v) {
                      const [y] = v.split('-');
                      setYear(parseInt(y));
                      setDate(v);
                    }
                  }}
                  placeholder="GG.AA.YYYY"
                  required
                />
              </div>
            </div>

            {availableBlocks.length > 1 && (
              <div className="form-group">
                <label className="input-label">Hangi Bloklara Uygulansın?</label>
                <select
                  className="input-field"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                >
                  <option value="ALL">Tüm Bloklar (Tüm Daireler)</option>
                  {availableBlocks.map((b) => (
                    <option key={b} value={b}>
                      Sadece {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <CurrencyInput
                label="Aidat Tutarı (₺)"
                placeholder="Örn: 1.500"
                value={amount}
                onChange={(value) => setAmount(value)}
                required
              />
            </div>

            <div className="p-2.5 sm:p-3 bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs text-zinc-600">
              Seçilen kriterlere göre <strong>{affectedCount} daireye</strong>, <strong>{amount} ₺</strong> tutarında aidat kaydı açılacaktır.
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" size="sm" loading={loading}>
                Aidatları Ata
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
