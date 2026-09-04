'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { Button, Input, Badge, CurrencyInput } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

interface Due {
  id: string;
  unitId: string;
  amount: number | string;
  month: number;
  year: number;
  status: 'PAID' | 'UNPAID';
  dueDate: string;
  unit?: {
    id: string;
    blockName: string;
    doorNo: string;
    floor: string;
    ownerName: string;
    residentPhone: string;
  };
}

interface Unit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  ownerName: string;
  residentPhone: string;
  defaultDueAmount?: number | string | null;
}

interface Building {
  id: string;
  name: string;
  type: string;
  totalBlocks: number;
  defaultDueAmount?: number | string | null;
  createdAt: string;
}

export default function BuildingDuesPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  const now = new Date();
  const currentSystemYear = now.getFullYear();
  const currentSystemMonth = now.getMonth() + 1; // 1-12

  const [building, setBuilding] = useState<Building | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [allDuesHistory, setAllDuesHistory] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentSystemMonth);
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');

  // Modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [detailUnit, setDetailUnit] = useState<Unit | null>(null);
  const [detailModalYear, setDetailModalYear] = useState<number>(currentSystemYear);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (buildingId) {
      fetchBuildingData();
    }
  }, [buildingId]);

  useEffect(() => {
    if (buildingId) {
      fetchDues();
    }
  }, [buildingId, selectedYear]);

  const fetchBuildingData = async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        fetch(`/api/buildings/${buildingId}`),
        fetch(`/api/units?buildingId=${buildingId}`),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBuilding(bData);
      }

      if (uRes.ok) {
        const uData = await uRes.json();
        setUnits(uData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDues = async () => {
    try {
      setLoading(true);
      const [yearDuesRes, allDuesRes] = await Promise.all([
        fetch(`/api/dues?buildingId=${buildingId}&year=${selectedYear}`),
        fetch(`/api/dues?buildingId=${buildingId}`),
      ]);

      if (yearDuesRes.ok) {
        const dData = await yearDuesRes.json();
        setDues(dData);
      }

      if (allDuesRes.ok) {
        const allData = await allDuesRes.json();
        setAllDuesHistory(allData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate year range based on building createdAt
  const availableYears = useMemo(() => {
    if (!building?.createdAt) return [currentSystemYear];
    const createdYear = new Date(building.createdAt).getFullYear();
    const minYear = Math.min(createdYear, currentSystemYear);
    const years: number[] = [];
    for (let y = currentSystemYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [building, currentSystemYear]);

  // Derive unique block names
  const blockNames = useMemo(() => {
    const list = Array.from(new Set(units.map((u) => u.blockName))).filter(Boolean);
    return list.sort();
  }, [units]);

  // Filter units by block
  const filteredUnits = useMemo(() => {
    if (selectedBlock === 'ALL') return units;
    return units.filter((u) => u.blockName === selectedBlock);
  }, [units, selectedBlock]);

  // Calculate overdue status for a given unit
  const getUnitOverdueInfo = (unitId: string) => {
    const unitUnpaidDues = allDuesHistory.filter((d) => {
      if (d.unitId !== unitId || d.status === 'PAID') return false;
      if (d.year < currentSystemYear) return true;
      if (d.year === currentSystemYear && d.month < currentSystemMonth) return true;
      return false;
    });

    const overdueCount = unitUnpaidDues.length;
    const overdueTotal = unitUnpaidDues.reduce((acc, d) => acc + Number(d.amount), 0);

    return {
      hasOverdue: overdueCount > 0,
      overdueCount,
      overdueTotal,
      unpaidDues: unitUnpaidDues,
    };
  };

  // Toggle due status (PAID <-> UNPAID)
  const handleToggleStatus = async (dueId: string, currentStatus: 'PAID' | 'UNPAID') => {
    try {
      setActionLoadingId(dueId);
      const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
      const res = await fetch(`/api/dues/${dueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchDues();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick create single due if not defined yet
  const handleQuickCreateDue = async (unitId: string, month: number, year: number, amount: number) => {
    try {
      const defaultDueDate = new Date(year, month - 1, 20).toISOString();
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          amount,
          month,
          year,
          dueDate: defaultDueDate,
        }),
      });

      if (res.ok) {
        fetchDues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Financial Stats for selected year & month
  const stats = useMemo(() => {
    const monthDues = dues.filter((d) => d.month === selectedMonth);
    const totalExpected = monthDues.reduce((acc, d) => acc + Number(d.amount), 0);
    const totalCollected = monthDues.filter((d) => d.status === 'PAID').reduce((acc, d) => acc + Number(d.amount), 0);
    const totalUnpaid = totalExpected - totalCollected;
    const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return { totalExpected, totalCollected, totalUnpaid, rate, count: monthDues.length };
  }, [dues, selectedMonth]);

  if (loading && !building) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header & Back Button */}
      <div className="section-header mb-6">
        <div className="flex items-center gap-4 mb-4">
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
            Bina Detayına Dön
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-light text-zinc-900">
                Aidat Yönetimi
              </h1>
              <Badge variant="default">{building?.name}</Badge>
            </div>
            <p className="text-zinc-500 font-light text-sm">
              Aylık aidatları tanımlayın, gecikmiş borçları takip edin ve tahsilat durumlarını yönetin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowSingleModal(true)}
              disabled={units.length === 0}
            >
              Tekil Aidat Ekle
            </Button>
            <Button
              onClick={() => setShowBulkModal(true)}
              disabled={units.length === 0}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            >
              Toplu Aidat Tanımla
            </Button>
          </div>
        </div>
      </div>

      {/* Year and Month Selection Bar */}
      <Card className="mb-6 border border-zinc-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Year Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Yıl:
              </span>
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr);
                      setDetailModalYear(yr);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      selectedYear === yr
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                (Kayıt: {availableYears[availableYears.length - 1]})
              </span>
            </div>

            {/* Block Filter if multiple blocks exist */}
            {blockNames.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Blok:
                </span>
                <select
                  className="input-field text-xs py-1.5 w-auto"
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                >
                  <option value="ALL">Tüm Bloklar ({units.length} Daire)</option>
                  {blockNames.map((blk) => (
                    <option key={blk} value={blk}>
                      {blk} ({units.filter((u) => u.blockName === blk).length} Daire)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Month Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-zinc-100 overflow-x-auto pb-1">
            {MONTH_NAMES.map((name, idx) => {
              const monthNum = idx + 1;
              const isSelected = selectedMonth === monthNum;
              const monthDuesCount = dues.filter((d) => d.month === monthNum).length;
              const isPast = selectedYear === currentSystemYear && monthNum < currentSystemMonth;

              return (
                <button
                  key={monthNum}
                  onClick={() => !isPast && setSelectedMonth(monthNum)}
                  disabled={isPast}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : isPast
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  <span>{name}</span>
                  {monthDuesCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                        isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {monthDuesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Overview Stats for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Toplam
            </p>
            <p className="text-2xl font-light text-zinc-900">
              {stats.totalExpected.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-xs text-zinc-400 mt-1">{stats.count} daire</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Tahsil Edilen
            </p>
            <p className="text-2xl font-light text-zinc-900">
              {stats.totalCollected.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-xs text-zinc-500 mt-1">%{stats.rate} tahsilat oranı</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Kalan Tutar
            </p>
            <p className="text-2xl font-light text-zinc-900">
              {stats.totalUnpaid.toLocaleString('tr-TR')} ₺
            </p>
            <p className="text-xs text-zinc-400 mt-1">Ödeme bekleyen</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Gecikmiş Borçlu
            </p>
            <p className="text-2xl font-light text-zinc-900">
              {units.filter((u) => getUnitOverdueInfo(u.id).hasOverdue).length} Daire
            </p>
            <p className="text-xs text-zinc-400 mt-1">Geçmiş aydan borcu olan</p>
          </CardBody>
        </Card>
      </div>

      {/* Dues Table */}
      {filteredUnits.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state py-12 text-center">
              <h3 className="text-sm font-medium text-zinc-900">Bu binada henüz daire eklenmemiş</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Aidat tanımlamadan önce Daireler ve Sakinler sayfasından daireleri ekleyin.
              </p>
              <Button className="mt-4" onClick={() => router.push(`/admin/buildings/${buildingId}/residents`)}>
                Daire Ekle →
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-zinc-900">
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Aidat Durumu
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Dairelerin ödeme durumu ve geçmiş borç kayıtları
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Daire / Blok</TableHead>
                  <TableHead>Malik / Sakin</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Bu Ay ({MONTH_NAMES[selectedMonth - 1]})</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Geçmiş Borç</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => {
                  const currentMonthDue = dues.find(
                    (d) => d.unitId === unit.id && d.month === selectedMonth
                  );
                  const overdueInfo = getUnitOverdueInfo(unit.id);

                  return (
                    <TableRow key={unit.id}>
                      {/* Daire / Blok */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs px-2 py-0.5 bg-zinc-100 rounded text-zinc-700">
                            {unit.blockName}
                          </span>
                          <span className="font-medium text-zinc-900">
                            No: {unit.doorNo}
                          </span>
                          <span className="text-xs text-zinc-400">({unit.floor}. Kat)</span>
                        </div>
                      </TableCell>

                      {/* Malik */}
                      <TableCell className="font-medium text-zinc-800">
                        {unit.ownerName}
                      </TableCell>

                      {/* Telefon */}
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {formatPhoneNumber(unit.residentPhone)}
                      </TableCell>

                      {/* Bu Ay Durumu */}
                      <TableCell>
                        {currentMonthDue ? (
                          currentMonthDue.status === 'PAID' ? (
                            <Badge variant="success">Ödendi</Badge>
                          ) : (
                            <Badge variant="default">Ödenmedi</Badge>
                          )
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Tanımsız</span>
                        )}
                      </TableCell>

                      {/* Tutar */}
                      <TableCell className="font-medium text-zinc-900">
                        {currentMonthDue ? (
                          `${Number(currentMonthDue.amount).toLocaleString('tr-TR')} ₺`
                        ) : (
                          <button
                            onClick={() => {
                              const autoDue = Number(unit.defaultDueAmount || building?.defaultDueAmount || 1500);
                              handleQuickCreateDue(unit.id, selectedMonth, selectedYear, autoDue);
                            }}
                            className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                          >
                            + Aidat Belirle ({Number(unit.defaultDueAmount || building?.defaultDueAmount || 1500).toLocaleString('tr-TR')} ₺)
                          </button>
                        )}
                      </TableCell>

                      {/* Geçmiş Borç Uyarısı */}
                      <TableCell>
                        {overdueInfo.hasOverdue ? (
                          <div
                            onClick={() => {
                              setDetailUnit(unit);
                              setDetailModalYear(selectedYear);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                            title="Detaylı yıllık geçmişi görmek için tıklayın"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                            <span>{overdueInfo.overdueCount} Ay Gecikmiş ({overdueInfo.overdueTotal.toLocaleString('tr-TR')} ₺)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">Borç Yok</span>
                        )}
                      </TableCell>

                      {/* İşlemler */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {currentMonthDue && (
                            <Button
                              size="sm"
                              variant={currentMonthDue.status === 'PAID' ? 'secondary' : 'primary'}
                              loading={actionLoadingId === currentMonthDue.id}
                              onClick={() => handleToggleStatus(currentMonthDue.id, currentMonthDue.status)}
                            >
                              {currentMonthDue.status === 'PAID' ? 'İptal Et' : 'Ödendi'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDetailUnit(unit);
                              setDetailModalYear(selectedYear);
                            }}
                          >
                            Detay →
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: DETAILED YEARLY DUES HISTORY FOR A SINGLE UNIT       */}
      {/* ------------------------------------------------------------- */}
      {detailUnit && (
        <UnitDuesDetailModal
          unit={detailUnit}
          building={building}
          selectedYear={detailModalYear}
          availableYears={availableYears}
          allDues={allDuesHistory.filter((d) => d.unitId === detailUnit.id)}
          onYearChange={(yr) => setDetailModalYear(yr)}
          onClose={() => setDetailUnit(null)}
          onStatusChange={() => fetchDues()}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: BULK DUES CREATION                                  */}
      {/* ------------------------------------------------------------- */}
      {showBulkModal && (
        <BulkCreateDuesModal
          buildingId={buildingId}
          building={building}
          units={units}
          availableBlocks={blockNames}
          defaultYear={selectedYear}
          defaultMonth={selectedMonth}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false);
            fetchDues();
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SINGLE DUE CREATION                                 */}
      {/* ------------------------------------------------------------- */}
      {showSingleModal && (
        <SingleCreateDueModal
          units={units}
          building={building}
          defaultYear={selectedYear}
          defaultMonth={selectedMonth}
          onClose={() => setShowSingleModal(false)}
          onSuccess={() => {
            setShowSingleModal(false);
            fetchDues();
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: UNIT DUES YEARLY DETAIL MODAL
// -------------------------------------------------------------
interface UnitDuesDetailModalProps {
  unit: Unit;
  building: Building | null;
  selectedYear: number;
  availableYears: number[];
  allDues: Due[];
  onYearChange: (year: number) => void;
  onClose: () => void;
  onStatusChange: () => void;
}

function UnitDuesDetailModal({
  unit,
  building,
  selectedYear,
  availableYears,
  allDues,
  onYearChange,
  onClose,
  onStatusChange,
}: UnitDuesDetailModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const yearDues = useMemo(() => {
    return allDues.filter((d) => d.year === selectedYear);
  }, [allDues, selectedYear]);

  const yearTotalExpected = yearDues.reduce((acc, d) => acc + Number(d.amount), 0);
  const yearTotalPaid = yearDues.filter((d) => d.status === 'PAID').reduce((acc, d) => acc + Number(d.amount), 0);
  const yearTotalUnpaid = yearTotalExpected - yearTotalPaid;

  const handleToggle = async (dueId: string, currentStatus: 'PAID' | 'UNPAID') => {
    try {
      setLoadingId(dueId);
      const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
      const res = await fetch(`/api/dues/${dueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onStatusChange();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const defaultDue = Number(unit.defaultDueAmount ?? building?.defaultDueAmount ?? 1500);

  const handleCreateMonthDue = async (month: number) => {
    try {
      setLoadingId(`create-${month}`);
      const defaultDueDate = new Date(selectedYear, month - 1, 20).toISOString();
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: unit.id,
          amount: defaultDue,
          month,
          year: selectedYear,
          dueDate: defaultDueDate,
        }),
      });
      if (res.ok) {
        onStatusChange();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div>
              <h3 className="text-lg font-medium text-zinc-900">
                {unit.blockName} - No: {unit.doorNo} Aidat Geçmişi
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Malik / Sakin: <strong>{unit.ownerName}</strong> • Tel: {formatPhoneNumber(unit.residentPhone)}
              </p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Year Selector within allowed bounds */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 uppercase">Yıl:</span>
                <div className="flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-lg">
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => onYearChange(yr)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        selectedYear === yr
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Yıllık Toplam: </span>
                  <strong className="text-zinc-900">{yearTotalExpected.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Ödenen: </span>
                  <strong className="text-emerald-700">{yearTotalPaid.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Kalan: </span>
                  <strong className={yearTotalUnpaid > 0 ? 'text-zinc-900 font-semibold' : 'text-zinc-500'}>
                    {yearTotalUnpaid.toLocaleString('tr-TR')} ₺
                  </strong>
                </div>
              </div>
            </div>

            {/* 12 Months Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MONTH_NAMES.map((mName, idx) => {
                const monthNum = idx + 1;
                const due = yearDues.find((d) => d.month === monthNum);
                const isPaid = due?.status === 'PAID';
                const isUnpaid = due && due.status === 'UNPAID';

                return (
                  <div
                    key={monthNum}
                    className="border border-zinc-200 rounded-xl p-3.5 bg-white flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-zinc-900">
                        {monthNum}. {mName} {selectedYear}
                      </span>
                      {isPaid ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          Ödendi
                        </span>
                      ) : isUnpaid ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                          Ödenmedi
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
                          Tanımsız
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      {due ? (
                        <div className="text-xs text-zinc-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Tutar:</span>
                            <span className="font-medium text-zinc-900">
                              {Number(due.amount).toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Son Gün:</span>
                            <span>{new Date(due.dueDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">Aidat kaydı açılmamış</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-100 mt-1">
                      {due ? (
                        <Button
                          size="sm"
                          variant={isPaid ? 'secondary' : 'primary'}
                          className="w-full text-xs py-1"
                          loading={loadingId === due.id}
                          onClick={() => handleToggle(due.id, due.status)}
                        >
                          {isPaid ? 'İptal Et' : 'Ödendi Yap'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs py-1 text-zinc-700 hover:bg-zinc-100"
                          loading={loadingId === `create-${monthNum}`}
                          onClick={() => handleCreateMonthDue(monthNum)}
                        >
                          + {defaultDue.toLocaleString('tr-TR')} ₺ Aidat Ekle
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Kapat
            </Button>
          </div>
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
  building: Building | null;
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
  const [month, setMonth] = useState(defaultMonth);
  const [blockName, setBlockName] = useState('ALL');
  const [amount, setAmount] = useState(
    building?.defaultDueAmount ? String(building.defaultDueAmount) : '1500'
  );
  const [dueDate, setDueDate] = useState(
    new Date(defaultYear, defaultMonth - 1, 20).toISOString().split('T')[0]
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
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          buildingId,
          blockName,
          amount: parseFloat(amount),
          month: parseInt(String(month)),
          year: parseInt(String(year)),
          dueDate: new Date(dueDate).toISOString(),
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Toplu Aidat Tanımla</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Yıl</label>
                <input
                  type="number"
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Ay</label>
                <select
                  className="input-field"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  required
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} - {m}
                    </option>
                  ))}
                </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <CurrencyInput
                  label="Aidat Tutarı (₺)"
                  placeholder="Örn: 1.500"
                  value={amount}
                  onChange={(value) => setAmount(value)}
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  label="Son Ödeme Tarihi"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600">
              Seçilen kriterlere göre <strong>{affectedCount} daireye</strong>, <strong>{amount} ₺</strong> tutarında aidat kaydı açılacaktır.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Toplu Aidatları Ata
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: SINGLE CREATE DUE MODAL
// -------------------------------------------------------------
interface SingleCreateDueModalProps {
  units: Unit[];
  building: Building | null;
  defaultYear: number;
  defaultMonth: number;
  onClose: () => void;
  onSuccess: () => void;
}

function SingleCreateDueModal({
  units,
  building,
  defaultYear,
  defaultMonth,
  onClose,
  onSuccess,
}: SingleCreateDueModalProps) {
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [amount, setAmount] = useState(
    building?.defaultDueAmount ? String(building.defaultDueAmount) : '1500'
  );
  const [dueDate, setDueDate] = useState(
    new Date(defaultYear, defaultMonth - 1, 20).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const selected = units.find((u) => u.id === unitId);
    if (selected?.defaultDueAmount != null) {
      setAmount(String(selected.defaultDueAmount));
    } else if (building?.defaultDueAmount != null) {
      setAmount(String(building.defaultDueAmount));
    } else {
      setAmount('1500');
    }
  }, [unitId, units, building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          amount: parseFloat(amount),
          month: parseInt(String(month)),
          year: parseInt(String(year)),
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Aidat oluşturulurken hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Tekil Daireye Aidat Ekle</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Daire Seçin</label>
              <select
                className="input-field"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                required
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.blockName} - No: {u.doorNo} ({u.ownerName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Yıl</label>
                <input
                  type="number"
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Ay</label>
                <select
                  className="input-field"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  required
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} - {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <CurrencyInput
                  label="Aidat Tutarı (₺)"
                  placeholder="Örn: 1.500"
                  value={amount}
                  onChange={(value) => setAmount(value)}
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  label="Son Ödeme Tarihi"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Aidat Ekle
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
