'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { CurrencyInput } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { BuildingType } from '@prisma/client';
import { BUILDING_ARCHIVE_IMAGES } from '@/lib/buildingImages';
import Link from 'next/link';

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
  };
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
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
      <img
        src="/bannerbina.jpg"
        alt="Site görseli"
        className="w-full h-44 object-cover rounded-2xl mb-6 border border-zinc-200"
      />
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
          <div className="flex items-center gap-2">
            {session?.name === 'Ahmet Çelik' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCreateInitialType(BuildingType.APARTMENT);
                    setShowCreateModal(true);
                  }}
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                >
                  Demo Apartman Ekle
                </Button>
                <Button
                  onClick={() => {
                    setCreateInitialType(BuildingType.SITE);
                    setShowCreateModal(true);
                  }}
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Demo Site Ekle
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setCreateInitialType(undefined);
                  setShowCreateModal(true);
                }}
                leftIcon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Yeni Bina Ekle
              </Button>
            )}
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building, index) => (
            <div
              key={building.id}
              className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Header Image Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={building.image || getBuildingImageUrl(building.id, index % 10)}
                    alt={building.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
                  
                  {/* Building Type Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-zinc-900 shadow-sm">
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
                  </div>

                  {/* Title and Address on Image */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <Link
                      href={`/admin/buildings/${building.id}`}
                      className="block text-lg font-semibold truncate hover:underline hover:text-zinc-100 transition-colors"
                    >
                      {building.name}
                    </Link>
                    <p className="text-xs text-zinc-300 truncate mt-0.5">
                      {building.address}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-4 grid grid-cols-3 gap-2 bg-zinc-50/70 border-b border-zinc-100 text-center">
                  <div className="bg-white p-2 rounded-xl border border-zinc-100">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Blok</p>
                    <p className="text-base font-semibold text-zinc-900">{building.totalBlocks}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-zinc-100">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Daire</p>
                    <p className="text-base font-semibold text-zinc-900">{building._count.units}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-zinc-100">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-0.5">Yönetici</p>
                    <p className="text-base font-semibold text-zinc-900">{building._count.admins}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-white flex items-center gap-2">
                <Link href={`/admin/buildings/${building.id}`} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    <span>Yönet & Detaylar</span>
                    <svg className="h-3.5 w-3.5 ml-1.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-zinc-900 mb-1">LuxDues ile neler yapabilirsiniz?</h2>
          <p className="text-zinc-600 font-light">
            Bina ve site yönetiminizi kolaylaştıran özellikleri keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1723132827600-0d99ea14795d?auto=format&fit=crop&w=800&q=80"
              alt="Lüks site güvenlikli giriş"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/30 to-transparent transition-colors duration-300 group-hover:from-zinc-900/95" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="text-white text-lg font-medium mb-1">Güvenli Erişim</h3>
              <p className="text-zinc-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                Rol tabanlı yetkilendirme ile yönetici ve sakin verileriniz güvende kalır.
              </p>
            </div>
          </div>

          <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1770048532658-14834b7acef8?auto=format&fit=crop&w=800&q=80"
              alt="Lüks ofis toplantı odası"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/30 to-transparent transition-colors duration-300 group-hover:from-zinc-900/95" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="text-white text-lg font-medium mb-1">Otomatik Aidat Takibi</h3>
              <p className="text-zinc-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                Blok bazlı aidat tutarlarını tanımlayın, ödemeleri tek ekrandan takip edin.
              </p>
            </div>
          </div>

          <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1773558061377-fd3fa0cc2447?auto=format&fit=crop&w=800&q=80"
              alt="Modern apartman binaları ve balkonlar"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/30 to-transparent transition-colors duration-300 group-hover:from-zinc-900/95" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="text-white text-lg font-medium mb-1">Kolay Sakin Yönetimi</h3>
              <p className="text-zinc-200 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                Daireleri, blokları ve sakinleri tek bir yerden davet edip yönetin.
              </p>
            </div>
          </div>
        </div>
      </div>

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
