'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { BUILDING_ARCHIVE_IMAGES } from '@/lib/buildingImages';
import { BuildingType } from '@prisma/client';

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  totalBlocks: number;
  address: string;
  createdAt: string;
  image: string | null;
  blockImages: any;
  units: { id: string; doorNo: number; blockName: string }[];
  _count: {
    units: number;
    admins: number;
    specialProjects: number;
    complaints: number;
  };
}

export default function BuildingDetailPage() {
  const params = useParams();
  const buildingId = params.id as string;
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBuilding(params.id as string);
    }
  }, [params.id]);

  const fetchBuilding = async (id: string) => {
    try {
      const response = await fetch(`/api/buildings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBuilding(data);
      }
    } catch (error) {
      console.error('Error fetching building:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBuildingTypeLabel = (type: BuildingType) => {
    return type === BuildingType.APARTMENT ? 'Apartman' : 'Site';
  };

  const isSite = building?.type === 'SITE';
  const blockStats = useMemo(() => {
    if (!building || !isSite || !building.units) return [];
    const stats = new Map<string, number>();
    building.units.forEach((u) => {
      const block = u.blockName || 'A Blok';
      stats.set(block, (stats.get(block) || 0) + 1);
    });
    return Array.from(stats.entries()).map(([name, count]) => ({ name, count }));
  }, [building, isSite]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="page-container">
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Bina bulunamadı
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Aradığınız bina mevcut değil veya silinmiş olabilir.
              </p>
              <Button onClick={() => router.push('/admin/buildings')} className="mt-4">
                Binalara Dön
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    {
      title: 'Daireler ve Sakinler',
      description: 'Bina dairelerini ve sakinlerini yönetin',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: `/admin/buildings/${building.id}/residents`,
      count: building._count.units,
    },
    {
      title: 'Aidat Yönetimi',
      description: 'Aylık aidatları tanımlayın ve ödemeleri takip edin',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: `/admin/buildings/${building.id}/dues`,
      count: null,
    },
    {
      title: 'Ortak Projeler',
      description: 'Garaj kapısı gibi ortak masrafları yönetin',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: `/admin/buildings/${building.id}/projects`,
      count: building._count.specialProjects,
    },
    {
      title: 'Şikayet Kutusu',
      description: 'Sakinlerden gelen şikayetleri yönetin',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      href: `/admin/buildings/${building.id}/complaints`,
      count: building._count.complaints,
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/admin/buildings')}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Binalara Dön
          </Button>
          <div className="h-6 w-px bg-zinc-200" />
          <h1 className="text-3xl font-light text-zinc-900">
            {building.name}
          </h1>
          <Badge
            variant="default"
            leftIcon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {building.type === BuildingType.APARTMENT ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h5V10H3v11zm7 0h5V6h-5v15zm7 0h5V10h-5v11z" />
                )}
              </svg>
            }
          >
            {getBuildingTypeLabel(building.type)}
          </Badge>
        </div>
      </div>

      {/* Building Info Card */}
      <Card className="mb-6 order-0">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900">Bina Bilgileri</h2>
          <div className="flex items-center gap-2">
            {isSite && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowAddBlockModal(true)}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Blok Ekle
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowEditModal(true)}
              leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Düzenle
          </Button>
        </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-40 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100">
              <img
                src={building.image || `https://loremflickr.com/400/400/city,corporate,office,skyscraper,modern,urban,apartment?lock=${building.id}`}
                alt={building.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Bina Adı</p>
                <p className="text-base font-medium text-zinc-900">{building.name}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Bina Türü</p>
                <p className="text-base font-medium text-zinc-900">
                  {getBuildingTypeLabel(building.type)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Blok Sayısı</p>
                <p className="text-base font-medium text-zinc-900">{building.totalBlocks}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Adres</p>
                <p className="text-base font-medium text-zinc-900">{building.address}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 order-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Toplam Daire</p>
                <p className="text-2xl font-medium text-zinc-900">{building._count.units}</p>
              </div>
              <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Yönetici Sayısı</p>
                <p className="text-2xl font-medium text-zinc-900">{building._count.admins}</p>
              </div>
              <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Aktif Projeler</p>
                <p className="text-2xl font-medium text-zinc-900">{building._count.specialProjects}</p>
              </div>
              <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Şikayetler</p>
                <p className="text-2xl font-medium text-zinc-900">{building._count.complaints}</p>
              </div>
              <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navigationItems.map((item) => (
          <Card
            key={item.href}
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => router.push(item.href)}
          >
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-zinc-900 mb-1">
                      {item.title}
                    </h3>
                    {item.count !== null && (
                      <Badge variant="default">{item.count}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 mb-3">{item.description}</p>
                  <div className="flex items-center text-sm text-zinc-500">
                    <span>Yönet</span>
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Blocks */}
      {isSite && blockStats.length > 0 && (
        <div className="mt-8 order-1">
          <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Bloklar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockStats.map((block) => {
              const dayIndex = Math.floor(Date.now() / 86400000);
              const storedBlockImage = building?.blockImages?.[block.name];
              const fallbackImage = `https://loremflickr.com/300/300/city,corporate,office,skyscraper,modern,urban,apartment?lock=${building.id}-${block.name}-${dayIndex}`;
              const imageUrl = storedBlockImage || fallbackImage;
              return (
                <Card
                  key={block.name}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  onClick={() => router.push(`/admin/buildings/${building.id}/residents?block=${encodeURIComponent(block.name)}`)}
                >
                  <CardBody className="p-0">
                    <div className="flex items-stretch h-32">
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-zinc-900">{block.name}</h3>
                            <p className="text-sm text-zinc-500 mt-1">{block.count} daire</p>
                          </div>
                          <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-zinc-500">
                          <span>Sakinleri Yönet</span>
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div
                        className="relative w-28 h-32 flex-shrink-0 overflow-hidden"
                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
                      >
                        <img
                          src={imageUrl}
                          alt={block.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {showAddBlockModal && (
        <AddBlockModal
          buildingId={buildingId}
          existingBlocks={blockStats.map((b) => b.name)}
          onClose={() => setShowAddBlockModal(false)}
          onSuccess={() => {
            setShowAddBlockModal(false);
            fetchBuilding(buildingId);
          }}
        />
      )}

      {showEditModal && building && (
        <EditBuildingModal
          building={building}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updated) => setBuilding(updated)}
          onDeleteClick={() => setShowDeleteConfirm(true)}
        />
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        title="Binayı Sil"
        description={`${building?.name} binasını ve bağlı tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        variant="danger"
        onConfirm={async () => {
          if (!building) return;
          try {
            await fetch(`/api/buildings/${building.id}`, { method: 'DELETE' });
            router.push('/admin/buildings');
          } catch {
            // hata durumunda sayfada kal
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

interface EditBuildingModalProps {
  building: Building;
  onClose: () => void;
  onUpdate: (building: Building) => void;
  onDeleteClick: () => void;
}

function EditBuildingModal({ building, onClose, onUpdate, onDeleteClick }: EditBuildingModalProps) {
  const [formData, setFormData] = useState({
    name: building.name,
    address: building.address,
    image: building.image || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/buildings/${building.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          image: formData.image || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch {
      setError('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <h3 className="text-base font-semibold text-zinc-900">Bina Düzenle</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Bina Görseli</label>
            <div className="grid grid-cols-5 gap-2 mt-1 mb-2">
              {BUILDING_ARCHIVE_IMAGES.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: img.src })}
                  className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    formData.image === img.src
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
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Kendi görsel URL'nizi yapıştırın"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Bina / Site Adı</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Adres</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onDeleteClick}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Binayı Sil
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>İptal</Button>
              <Button type="submit" loading={saving}>Kaydet</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddBlockModalProps {
  buildingId: string;
  existingBlocks: string[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddBlockModal({ buildingId, existingBlocks, onClose, onSuccess }: AddBlockModalProps) {
  const [blockName, setBlockName] = useState('');
  const [unitCount, setUnitCount] = useState('10');
  const [defaultDueAmount, setDefaultDueAmount] = useState('1500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = blockName.trim();
    if (!name) {
      setError('Blok adı gereklidir');
      return;
    }
    if (existingBlocks.includes(name)) {
      setError('Bu blok adı zaten mevcut');
      return;
    }
    const count = parseInt(unitCount) || 0;
    if (count < 1) {
      setError('En az 1 daire eklemelisiniz');
      return;
    }

    setLoading(true);
    try {
      const units = [];
      for (let d = 1; d <= count; d++) {
        const floor = Math.max(1, Math.ceil(d / 4)).toString();
        units.push({
          blockName: name,
          doorNo: String(d),
          floor,
          ownerName: `${name} D:${d}`,
          residentPhone: '',
          defaultDueAmount: parseFloat(defaultDueAmount) || null,
        });
      }

      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, units }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Blok eklenirken bir hata oluştu');
      }
    } catch {
      setError('Blok eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <h3 className="text-base font-semibold text-zinc-900">Yeni Blok Ekle</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Blok Adı</label>
            <input
              type="text"
              className="input-field"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="Örn: E Blok"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="input-label">Daire Sayısı</label>
              <input
                type="number"
                className="input-field"
                min="1"
                max="100"
                value={unitCount}
                onChange={(e) => setUnitCount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label">Varsayılan Aidat (₺)</label>
              <input
                type="number"
                className="input-field"
                min="0"
                step="0.01"
                value={defaultDueAmount}
                onChange={(e) => setDefaultDueAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
            <Button type="button" variant="secondary" onClick={onClose}>İptal</Button>
            <Button type="submit" loading={loading}>Blok Ekle</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
