'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui';
import { Button, Input, Badge, PhoneInput } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Unit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  ownerName: string;
  residentPhone: string;
  residents: Resident[];
}

export default function ResidentsPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (buildingId) fetchUnits();
  }, [buildingId]);

  const fetchUnits = async () => {
    try {
      const response = await fetch(`/api/units?buildingId=${buildingId}`);
      if (response.ok) {
        setUnits(await response.json());
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="page-container">
      <div className="section-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
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
              Daireler ve Sakinler
            </h1>
            <p className="text-zinc-600 font-light">
              Bu binaya ait daireleri ve sakinlerini yönetin
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Yeni Daire Ekle
          </Button>
        </div>
      </div>

      {units.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Henüz daire eklenmedi
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                İlk daireyi eklemek için "Yeni Daire Ekle" butonuna tıklayın.
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
                  <TableHead>Blok</TableHead>
                  <TableHead>Kapı No</TableHead>
                  <TableHead>Kat</TableHead>
                  <TableHead>Malik Adı</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Kayıtlı Sakin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium text-zinc-900">{unit.blockName}</TableCell>
                    <TableCell>{unit.doorNo}</TableCell>
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>{unit.ownerName}</TableCell>
                    <TableCell>{formatPhoneNumber(unit.residentPhone)}</TableCell>
                    <TableCell>
                      {unit.residents.length > 0 ? (
                        <Badge variant="success">Var ({unit.residents.length})</Badge>
                      ) : (
                        <Badge variant="default">Kayıtlı Kullanıcı Yok</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {showCreateModal && (
        <CreateUnitModal
          buildingId={buildingId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUnits();
          }}
        />
      )}
    </div>
  );
}

interface CreateUnitModalProps {
  buildingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateUnitModal({ buildingId, onClose, onSuccess }: CreateUnitModalProps) {
  const [formData, setFormData] = useState({
    blockName: '',
    doorNo: '',
    floor: '',
    ownerName: '',
    residentPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, ...formData }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Daire oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError('Daire oluşturulurken bir hata oluştu');
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
            <h3 className="text-lg font-medium text-zinc-900">Yeni Daire Ekle</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Input
                  label="Blok Adı"
                  placeholder="Örn: A"
                  value={formData.blockName}
                  onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <Input
                  label="Kapı No"
                  placeholder="Örn: 5"
                  value={formData.doorNo}
                  onChange={(e) => setFormData({ ...formData, doorNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <Input
                label="Kat"
                placeholder="Örn: 2"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Malik Adı"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <PhoneInput
                label="Telefon"
                value={formData.residentPhone}
                onChange={(value) => setFormData({ ...formData, residentPhone: value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Daire Ekle
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
