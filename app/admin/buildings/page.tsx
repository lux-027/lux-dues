'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { BuildingType } from '@prisma/client';
import Link from 'next/link';

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  totalBlocks: number;
  address: string;
  createdAt: string;
  _count: {
    units: number;
    admins: number;
  };
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBuildings();
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

  const getBuildingTypeBadge = (type: BuildingType) => {
    return type === BuildingType.APARTMENT ? 'info' : 'success';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-zinc-900 mb-2">
              Binalar
            </h1>
            <p className="text-zinc-600 font-light">
              Sistemdeki tüm binaları ve siteleri yönetin
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
            Yeni Bina Ekle
          </Button>
        </div>
      </div>

      {buildings.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
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
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Henüz bina eklenmedi
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                İlk binanızı eklemek için "Yeni Bina Ekle" butonuna tıklayın.
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
                  <TableHead>Bina Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Blok Sayısı</TableHead>
                  <TableHead>Daire Sayısı</TableHead>
                  <TableHead>Yönetici Sayısı</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map((building) => (
                  <TableRow key={building.id}>
                    <TableCell>
                      <Link 
                        href={`/admin/buildings/${building.id}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
                      >
                        {building.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBuildingTypeBadge(building.type)}>
                        {getBuildingTypeLabel(building.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{building.totalBlocks}</TableCell>
                    <TableCell>{building._count.units}</TableCell>
                    <TableCell>{building._count.admins}</TableCell>
                    <TableCell className="text-zinc-600 max-w-xs truncate">
                      {building.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/buildings/${building.id}`}>
                          <Button variant="ghost" size="sm">
                            Detay
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {showCreateModal && (
        <CreateBuildingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBuildings();
          }}
        />
      )}
    </div>
  );
}

interface CreateBuildingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateBuildingModal({ onClose, onSuccess }: CreateBuildingModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    type: BuildingType;
    totalBlocks: string;
    address: string;
  }>({
    name: '',
    type: BuildingType.APARTMENT,
    totalBlocks: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        body: JSON.stringify(formData),
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
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Yeni Bina Ekle</h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
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
              <label className="input-label">Bina Adı</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Lux Sitesi A Blok"
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Bina Türü</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as BuildingType })}
                required
              >
                <option value={BuildingType.APARTMENT}>Apartman</option>
                <option value={BuildingType.SITE}>Site</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Blok Sayısı</label>
              <input
                type="number"
                className="input-field"
                value={formData.totalBlocks}
                onChange={(e) => setFormData({ ...formData, totalBlocks: e.target.value })}
                placeholder="Örn: 3"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Adres</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Örn: Atatürk Mah. Cumhuriyet Cad. No:123"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Bina Oluştur
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
