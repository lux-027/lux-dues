'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui';
import { Button, Badge, Input, Select } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';

interface Building {
  id: string;
  name: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'BLOCK_ADMIN';
  buildingId: string | null;
  building?: { id: string; name: string } | null;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, buildingsRes] = await Promise.all([
        fetch('/api/admins'),
        fetch('/api/buildings'),
      ]);
      if (adminsRes.ok) setAdmins(await adminsRes.json());
      if (buildingsRes.ok) setBuildings(await buildingsRes.json());
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yöneticiyi silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting admin:', error);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-zinc-900 mb-2">
              Yöneticiler
            </h1>
            <p className="text-zinc-600 font-light">
              Bloklara özel yöneticiler atayın ve yetkilendirmeleri yönetin
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
            Yeni Blok Yöneticisi Ekle
          </Button>
        </div>
      </div>

      {admins.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Henüz yönetici bulunmuyor
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                İlk blok yöneticisini eklemek için yukarıdaki butona tıklayın.
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
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Atanan Bina</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium text-zinc-900">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === 'SUPER_ADMIN' ? 'info' : 'default'}>
                        {admin.role === 'SUPER_ADMIN' ? 'Ana Yönetici' : 'Blok Yöneticisi'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.building ? admin.building.name : (
                        <span className="text-zinc-400">Atanmadı</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {admin.role === 'BLOCK_ADMIN' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(admin.id)}>
                          Sil
                        </Button>
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
        <CreateAdminModal
          buildings={buildings}
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

interface CreateAdminModalProps {
  buildings: Building[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAdminModal({ buildings, onClose, onSuccess }: CreateAdminModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    buildingId: buildings[0]?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Yönetici oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError('Yönetici oluşturulurken bir hata oluştu');
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
            <h3 className="text-lg font-medium text-zinc-900">Yeni Blok Yöneticisi Ekle</h3>
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

            {buildings.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">
                Yönetici atamak için önce bir bina oluşturmalısınız.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <Input
                    label="Ad Soyad"
                    placeholder="Örn: Mehmet Demir"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@luxdues.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Telefon"
                    placeholder="Örn: +905551234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    type="password"
                    label="Geçici Şifre"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <Select
                    label="Atanacak Bina / Blok"
                    value={formData.buildingId}
                    onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                    options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading} disabled={buildings.length === 0}>
                Yönetici Ekle
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
