'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui';
import { Button, Badge, Input, Textarea } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currency';

interface Project {
  id: string;
  title: string;
  description: string | null;
  totalAmount: string;
  perUnitAmount: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  _count: { payments: number };
  payments: { status: 'PAID' | 'UNPAID' }[];
}

interface UnitWithBlock {
  id: string;
  blockName: string;
}

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<UnitWithBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (buildingId) fetchData();
  }, [buildingId]);

  const fetchData = async () => {
    try {
      const [projectsRes, unitsRes] = await Promise.all([
        fetch(`/api/projects?buildingId=${buildingId}`),
        fetch(`/api/units?buildingId=${buildingId}`),
      ]);
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (unitsRes.ok) {
        const fetchedUnits: UnitWithBlock[] = await unitsRes.json();
        setUnits(fetchedUnits);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaidCount = (project: Project) =>
    project.payments.filter((p) => p.status === 'PAID').length;

  if (loading) {
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
      <div className="section-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/admin/buildings/${buildingId}`)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Bina Detayına Dön
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-zinc-900 mb-2">
              Ortak Masraf / Proje Yönetimi
            </h1>
            <p className="text-zinc-600 font-light">
              Garaj kapısı gibi ortak masrafları oluşturun, otomatik olarak dairelere bölüştürün
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={units.length === 0}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Yeni Proje Ekle
          </Button>
        </div>
        {units.length === 0 && (
          <p className="mt-3 text-sm text-amber-600">
            Proje ekleyebilmek için önce bu binaya en az bir daire eklemelisiniz.
          </p>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Henüz ortak proje eklenmedi
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                İlk projeyi eklemek için "Yeni Proje Ekle" butonuna tıklayın.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proje Adı</TableHead>
                  <TableHead>Toplam Tutar</TableHead>
                  <TableHead>Daire Başı Tutar</TableHead>
                  <TableHead>Ödeme Durumu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium text-zinc-900">{project.title}</TableCell>
                    <TableCell>
                      {parseFloat(project.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </TableCell>
                    <TableCell>
                      {parseFloat(project.perUnitAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </TableCell>
                    <TableCell>
                      {getPaidCount(project)} / {project.payments.length} ödendi
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'ACTIVE' ? 'info' : 'success'}>
                        {project.status === 'ACTIVE' ? 'Aktif' : 'Tamamlandı'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/buildings/${buildingId}/projects/${project.id}`)}
                      >
                        Ödeme Tablosu
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {showCreateModal && (
        <CreateProjectModal
          buildingId={buildingId}
          units={units}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  buildingId: string;
  units: UnitWithBlock[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateProjectModal({ buildingId, units, onClose, onSuccess }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    totalAmount: '',
    description: '',
  });
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(() => {
    return Array.from(new Set(units.map((u) => u.blockName))).sort((a, b) => a.localeCompare(b));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const blockNames = useMemo(() => {
    return Array.from(new Set(units.map((u) => u.blockName))).sort((a, b) => a.localeCompare(b));
  }, [units]);

  const selectedUnitCount = useMemo(() => {
    return units.filter((u) => selectedBlocks.includes(u.blockName)).length;
  }, [units, selectedBlocks]);

  const perUnitPreview =
    formData.totalAmount && selectedUnitCount > 0
      ? (parseFloat(formData.totalAmount) / selectedUnitCount)
      : 0;

  const toggleBlock = (block: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          ...formData,
          blockNames: selectedBlocks,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Proje oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError('Proje oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Yeni Ortak Masraf / Proje</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="form-group">
              <Input
                label="Proje Başlığı"
                placeholder="Örn: Garaj Kapısı Yenileme"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Input
                type="text"
                inputMode="decimal"
                label="Toplam Tutar (₺)"
                placeholder="Örn: 15.000"
                value={formatCurrencyInput(formData.totalAmount)}
                onChange={(e) => {
                  const raw = parseCurrencyInput(e.target.value);
                  setFormData({ ...formData, totalAmount: raw });
                }}
                required
              />
              {formData.totalAmount && selectedUnitCount > 0 && (
                <p className="mt-2 text-sm text-zinc-600">
                  Seçili <strong>{selectedUnitCount}</strong> daireye{' '}
                  <strong>
                    {perUnitPreview.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </strong>{' '}
                  borç yansıtılacak.
                </p>
              )}
              {formData.totalAmount && selectedUnitCount === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Borç yansıtabilmek için en az bir blok seçmelisiniz.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Dahil Bloklar</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                {blockNames.map((block) => {
                  const count = units.filter((u) => u.blockName === block).length;
                  const isSelected = selectedBlocks.includes(block);
                  return (
                    <label
                      key={block}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => toggleBlock(block)}
                      />
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-white border-white' : 'bg-white border-zinc-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{block}</span>
                      <span className={`text-xs ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <Textarea
                label="Açıklama (opsiyonel)"
                placeholder="Proje ile ilgili ek bilgi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading} disabled={selectedUnitCount === 0}>
                Proje Oluştur ve Borçları Yansıt
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
