'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';

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

  const paidCount = project.payments.filter((p) => p.status === 'PAID').length;
  const totalCount = project.payments.length;
  const collectedAmount = paidCount * parseFloat(project.perUnitAmount);
  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/buildings/${buildingId}/projects`)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Projelere Dön
          </Button>
        </div>
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-zinc-500 mb-1">Toplam Tutar</p>
            <p className="text-2xl font-medium text-zinc-900">
              {parseFloat(project.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-zinc-500 mb-1">Daire Başı Tutar</p>
            <p className="text-2xl font-medium text-zinc-900">
              {parseFloat(project.perUnitAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-zinc-500 mb-1">Tahsil Edilen</p>
            <p className="text-2xl font-medium text-zinc-900">
              {collectedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-zinc-500 mb-1">Ödeme Oranı</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-medium text-zinc-900">{progressPercent}%</p>
              <span className="text-sm text-zinc-500">({paidCount}/{totalCount})</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-zinc-900">Daire Bazlı Ödeme Tablosu</h2>
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
              {project.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-zinc-900">{payment.unit.blockName}</TableCell>
                  <TableCell>{payment.unit.doorNo}</TableCell>
                  <TableCell>{payment.unit.ownerName}</TableCell>
                  <TableCell>{payment.unit.residentPhone}</TableCell>
                  <TableCell>
                    {parseFloat(project.perUnitAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'PAID' ? 'success' : 'danger'}>
                      {payment.status === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={updatingId === payment.id}
                      onClick={() => togglePaymentStatus(payment)}
                    >
                      {payment.status === 'PAID' ? 'Ödenmedi İşaretle' : 'Ödendi İşaretle'}
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
