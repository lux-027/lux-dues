'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';

interface Payment {
  id: string;
  status: 'PAID' | 'UNPAID';
  unit: {
    id: string;
    blockName: string;
    doorNo: string;
    ownerName: string;
    residentPhone: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  totalAmount: string;
  perUnitAmount: string;
  status: 'ACTIVE' | 'COMPLETED';
  building: { id: string; name: string };
  payments: Payment[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        setProject(await response.json());
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (payment: Payment) => {
    const newStatus = payment.status === 'PAID' ? 'UNPAID' : 'PAID';
    setUpdatingId(payment.id);
    try {
      const response = await fetch(`/api/project-payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                payments: prev.payments.map((p) =>
                  p.id === payment.id ? { ...p, status: newStatus } : p
                ),
              }
            : prev
        );
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container">
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">Proje bulunamadı</h3>
              <Button onClick={() => router.push(`/admin/buildings/${buildingId}/projects`)} className="mt-4">
                Projelere Dön
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Sadece bu projeye dahil edilen blokların listesi
  const includedBlockNames = useMemo(() => {
    if (!project) return [];
    const set = new Set(project.payments.map((p) => p.unit.blockName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [project]);

  // Seçili blok filtresine göre ödemeler
  const filteredPayments = useMemo(() => {
    if (!project) return [];
    if (selectedBlockFilter === 'ALL') return project.payments;
    return project.payments.filter((p) => p.unit.blockName === selectedBlockFilter);
  }, [project, selectedBlockFilter]);

  const perUnitVal = project ? parseFloat(project.perUnitAmount) : 0;
  const filteredTotalCount = filteredPayments.length;
  const filteredPaidCount = filteredPayments.filter((p) => p.status === 'PAID').length;
  const filteredCollectedAmount = filteredPaidCount * perUnitVal;
  const filteredTargetAmount = filteredTotalCount * perUnitVal;
  const filteredProgressPercent = filteredTotalCount > 0 ? Math.round((filteredPaidCount / filteredTotalCount) * 100) : 0;

  return (
    <div className="page-container">
      <div className="section-header mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/buildings/${buildingId}/projects`)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Projelere Dön
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-light text-zinc-900">{project.title}</h1>
              <Badge variant={project.status === 'ACTIVE' ? 'info' : 'success'}>
                {project.status === 'ACTIVE' ? 'Aktif' : 'Tamamlandı'}
              </Badge>
            </div>
            {project.description && (
              <p className="text-zinc-600 font-light mt-2">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Blok Filtreleme Sekmeleri - Sadece Projeye Dahil Edilen Bloklar Listelenir */}
      {includedBlockNames.length > 1 && (
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedBlockFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedBlockFilter === 'ALL'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Tüm Bloklar ({project.payments.length})
          </button>
          {includedBlockNames.map((bName) => {
            const count = project.payments.filter((p) => p.unit.blockName === bName).length;
            const isSelected = selectedBlockFilter === bName;
            return (
              <button
                key={bName}
                type="button"
                onClick={() => setSelectedBlockFilter(bName)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {bName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Summary Cards - Seçili Bloğa Göre Dinamik Değişir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {selectedBlockFilter === 'ALL' ? 'Toplam Tutar' : `${selectedBlockFilter} Hedefi`}
            </p>
            <p className="text-2xl font-light text-zinc-900">
              {filteredTargetAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">{filteredTotalCount} daire dahil</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Daire Başı Tutar</p>
            <p className="text-2xl font-light text-zinc-900">
              {perUnitVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Sabit pay</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">Tahsil Edilen</p>
            <p className="text-2xl font-light text-emerald-800">
              {filteredCollectedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">{filteredPaidCount} daire ödedi</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Ödeme Oranı</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-light text-zinc-900">{filteredProgressPercent}%</p>
              <span className="text-xs text-zinc-500 font-medium">({filteredPaidCount}/{filteredTotalCount})</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${filteredProgressPercent}%` }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-zinc-900">
              {selectedBlockFilter === 'ALL' ? 'Tüm Dairelerin Ödeme Tablosu' : `${selectedBlockFilter} Ödeme Tablosu`}
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
              {filteredPayments.length} Kayıt
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blok</TableHead>
                <TableHead>Kapı No</TableHead>
                <TableHead>Malik Adı</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-zinc-900">{payment.unit.blockName}</TableCell>
                  <TableCell className="font-medium text-zinc-900">Daire {payment.unit.doorNo}</TableCell>
                  <TableCell className="text-zinc-800">{payment.unit.ownerName}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-600">
                    {payment.unit.residentPhone ? formatPhoneNumber(payment.unit.residentPhone) : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900">
                    {perUnitVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'PAID' ? 'success' : 'danger'}>
                      {payment.status === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={payment.status === 'PAID' ? 'ghost' : 'secondary'}
                      size="sm"
                      loading={updatingId === payment.id}
                      onClick={() => togglePaymentStatus(payment)}
                      className={payment.status === 'PAID' ? 'text-zinc-500 hover:text-red-600 hover:bg-red-50' : ''}
                    >
                      {payment.status === 'PAID' ? 'Ödenmedi Yap' : 'Ödendi İşaretle'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
