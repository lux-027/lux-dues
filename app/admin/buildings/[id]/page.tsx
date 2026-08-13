'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { BuildingType } from '@prisma/client';

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
    specialProjects: number;
    complaints: number;
  };
}

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

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
            variant="ghost"
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
          <Badge variant={getBuildingTypeBadge(building.type)}>
            {getBuildingTypeLabel(building.type)}
          </Badge>
        </div>
      </div>

      {/* Building Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium text-zinc-900">Bina Bilgileri</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
    </div>
  );
}
