'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { BUILDING_ARCHIVE_IMAGES } from '@/lib/buildingImages';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BuildingType } from '@prisma/client';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- PDF helpers: Turkish-capable font + logo (loaded once, cached) ---
let pdfAssetsPromise: Promise<{ reg: string; bold: string; logo: string }> | null = null;

async function loadPdfAssets() {
  if (!pdfAssetsPromise) {
    pdfAssetsPromise = (async () => {
      const toB64 = (buf: ArrayBuffer) => {
        let bin = '';
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i += 0x8000) {
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return btoa(bin);
      };
      const toDataUrl = async (url: string) => {
        const blob = await (await fetch(url)).blob();
        return await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(blob);
        });
      };
      const [regBuf, boldBuf, logo] = await Promise.all([
        fetch('https://cdn.jsdelivr.net/npm/@expo-google-fonts/roboto@0.4.3/400Regular/Roboto_400Regular.ttf').then((r) => r.arrayBuffer()),
        fetch('https://cdn.jsdelivr.net/npm/@expo-google-fonts/roboto@0.4.3/700Bold/Roboto_700Bold.ttf').then((r) => r.arrayBuffer()),
        toDataUrl('/logo-white.png'),
      ]);
      return { reg: toB64(regBuf), bold: toB64(boldBuf), logo };
    })();
  }
  return pdfAssetsPromise;
}

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  totalBlocks: number;
  address: string;
  createdAt: string;
  image: string | null;
  blockImages: any;
  units: { id: string; doorNo: number; blockName: string; residents?: any[] }[];
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
  const [reportPreview, setReportPreview] = useState<{ url: string; fileName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportLoading, setReportLoading] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<number[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchBuilding(params.id as string);
      fetchActivityData(params.id as string);
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

  const fetchActivityData = async (id: string) => {
    try {
      const response = await fetch(`/api/buildings/${id}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivityData(data.daily.map((d: any) => d.value));
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // Fallback to empty array if API fails
      setActivityData([]);
    }
  };

  const getBuildingTypeLabel = (type: BuildingType) => {
    return type === BuildingType.APARTMENT ? 'Apartman' : 'Site';
  };

  const isSite = building?.type === 'SITE';
  const blockStats = useMemo(() => {
    if (!building || !isSite || !building.units) return [];
    const stats = new Map<string, { count: number; occupied: number }>();
    building.units.forEach((u) => {
      const block = u.blockName || 'A Blok';
      const current = stats.get(block) || { count: 0, occupied: 0 };
      current.count += 1;
      if (u.residents && u.residents.length > 0) {
        current.occupied += 1;
      }
      stats.set(block, current);
    });
    return Array.from(stats.entries()).map(([name, data]) => ({ 
      name, 
      count: data.count,
      occupied: data.occupied,
      occupancyRate: data.count > 0 ? Math.round((data.occupied / data.count) * 100) : 0
    }));
  }, [building, isSite]);

  const exportBlockReport = async (blockName: string) => {
    if (!building) return;
    setReportLoading(blockName);

    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const res = await fetch(
        `/api/reports/dues?buildingId=${building.id}&year=${currentYear}&month=${currentMonth}&block=${encodeURIComponent(blockName)}`
      );
      
      if (res.ok) {
        const data = await res.json();

        {
          const assets = await loadPdfAssets();
          const doc = new jsPDF();

          // Register Turkish-capable Roboto font
          doc.addFileToVFS('Roboto-Regular.ttf', assets.reg);
          doc.addFileToVFS('Roboto-Bold.ttf', assets.bold);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

          const pageW = doc.internal.pageSize.getWidth();

          // Header band (black)
          doc.setFillColor(24, 24, 27);
          doc.rect(0, 0, pageW, 34, 'F');
          try { doc.addImage(assets.logo, 'PNG', 14, 9, 16, 16); } catch { /* logo optional */ }
          doc.setFont('Roboto', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(15);
          doc.text('LuxDues', 34, 17);
          doc.setFont('Roboto', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(212, 212, 216);
          doc.text(`${building.name} — ${blockName} Aidat Raporu`, 34, 24);
          doc.setFontSize(8);
          doc.text(new Date().toLocaleDateString('tr-TR'), pageW - 14, 16, { align: 'right' });

          // Meta info
          doc.setTextColor(39, 39, 42);
          doc.setFont('Roboto', 'normal');
          doc.setFontSize(10);
          doc.text(`Bina: ${building.name}`, 14, 46);
          doc.text(`Dönem: ${String(currentMonth).padStart(2, '0')}/${currentYear}`, 14, 53);

          // Summary
          const paid = data.filter((i: any) => i.status === 'PAID');
          const total = data.reduce((s: number, i: any) => s + i.amount, 0);
          const collected = paid.reduce((s: number, i: any) => s + i.amount, 0);
          doc.setFont('Roboto', 'bold');
          doc.setFontSize(10);
          doc.text(`${data.length} daire`, pageW - 14, 46, { align: 'right' });
          doc.text(`Tahsilat: ₺${collected.toLocaleString('tr-TR')} / ₺${total.toLocaleString('tr-TR')}`, pageW - 14, 53, { align: 'right' });

          const tableData = data.map((item: any) => [
            item.blockName,
            item.doorNo,
            item.ownerName,
            `₺${item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            item.status === 'PAID' ? 'Ödendi' : 'Ödenmedi',
            new Date(item.dueDate).toLocaleDateString('tr-TR'),
          ]);

          autoTable(doc, {
            head: [['Blok', 'Daire', 'Sahibi', 'Tutar', 'Durum', 'Son Ödeme']],
            body: tableData,
            startY: 60,
            styles: { font: 'Roboto', fontSize: 8.5, cellPadding: 2.5, textColor: [63, 63, 70] },
            headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [24, 24, 27], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            didParseCell: (c: any) => {
              if (c.section === 'body' && c.column.index === 4) {
                c.cell.styles.textColor = c.cell.raw === 'Ödendi' ? [4, 120, 87] : [185, 28, 28];
                c.cell.styles.fontStyle = 'bold';
              }
            },
          });

          // Footer
          const pageH = doc.internal.pageSize.getHeight();
          doc.setFont('Roboto', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(161, 161, 170);
          doc.text('LuxDues — Apartman & Site Aidat Yönetimi', 14, pageH - 8);
          doc.text(`Sayfa 1`, pageW - 14, pageH - 8, { align: 'right' });

          const fileName = `${blockName}-aidat-raporu-${currentYear}-${currentMonth}.pdf`;
          const url = URL.createObjectURL(doc.output('blob'));
          setReportPreview({ url, fileName });
        }
      }
    } catch (error) {
      console.error('Rapor hatası:', error);
    } finally {
      setReportLoading(null);
    }
  };

  if (loading) {
    return (
      <LoadingScreen label="Bina bilgileri yükleniyor" />
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
    <div className="page-container pb-20">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <h1 className="text-xl sm:text-3xl font-light text-zinc-900 truncate">
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
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => router.push('/admin/buildings')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] sm:text-xs font-medium transition-colors"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Binalara Dön
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          {building.name} {building.type === BuildingType.SITE ? 'sitesinin' : 'binasının'} aidat ve takip bilgileri
        </p>

        {/* Graphical Stat Cards — pinned to the header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
          {[
            {
              label: 'Toplam Daire',
              value: building._count.units,
              icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            },
            {
              label: 'Yönetici Sayısı',
              value: building._count.admins,
              icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            },
            {
              label: 'Aktif Projeler',
              value: building._count.specialProjects,
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            },
            {
              label: 'Şikayetler',
              value: building._count.complaints,
              icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl sm:rounded-2xl bg-white border border-zinc-200 px-3 py-2.5 sm:px-4 sm:py-3.5 shadow-sm"
            >
              <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-semibold leading-none text-zinc-900">{stat.value}</p>
                <p className="mt-1 text-[10px] sm:text-xs text-zinc-500 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Info Card */}
      <Card className="mb-6 order-0">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 sm:h-7 sm:w-7 rounded-md sm:rounded-lg bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="text-sm sm:text-lg font-medium text-zinc-900">Bina Bilgileri</h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isSite && (
              <Button
                size="sm"
                variant="secondary"
                className="!px-2.5 !py-1.5 !text-[10px] sm:!px-4 sm:!py-2 sm:!text-xs"
                onClick={() => setShowAddBlockModal(true)}
                leftIcon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Blok Ekle
              </Button>
            )}
            <Button
              size="sm"
              className="!px-2.5 !py-1.5 !text-[10px] sm:!px-4 sm:!py-2 sm:!text-xs"
              onClick={() => setShowEditModal(true)}
              leftIcon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Düzenle
          </Button>
        </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-48 h-28 sm:h-40 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100">
              <img
                src={building.image || `https://loremflickr.com/400/400/city,corporate,office,skyscraper,modern,urban,apartment?lock=${building.id}`}
                alt={building.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 flex-1">
              <div>
                <p className="text-[10px] sm:text-sm text-zinc-500 mb-0.5 sm:mb-1">Bina Adı</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900">{building.name}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-zinc-500 mb-0.5 sm:mb-1">Bina Türü</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900">
                  {getBuildingTypeLabel(building.type)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-zinc-500 mb-0.5 sm:mb-1">Blok Sayısı</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900">{building.totalBlocks}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-zinc-500 mb-0.5 sm:mb-1">Adres</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 break-words">{building.address}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {navigationItems.map((item) => (
          <Card
            key={item.href}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-zinc-900 border-zinc-800"
            onClick={() => router.push(item.href)}
          >
            <CardBody>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon.props.children}
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-1">
                      {item.title}
                    </h3>
                    {item.count !== null && (
                      <Badge variant="dark">{item.count}</Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3">{item.description}</p>
                  <div className="flex items-center text-sm text-zinc-300">
                    <span>Yönet</span>
                    <svg className="h-4 w-4 ml-1 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mt-6 sm:mt-8 order-1">
          <h2 className="text-base sm:text-lg font-medium text-zinc-900 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Bloklar
          </h2>
          <Card className="bg-zinc-50 border-zinc-200">
            <CardBody className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {blockStats.map((block) => {
                  const storedBlockImage = building?.blockImages?.[block.name];
                  return (
                    <Card
                      key={block.name}
                      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-zinc-50 border-zinc-200 group"
                      onClick={() => router.push(`/admin/buildings/${building.id}/residents?block=${encodeURIComponent(block.name)}`)}
                    >
                      <CardBody className="p-0">
                        <div className="relative">
                          {/* Header with gradient */}
                          <div className="bg-gradient-to-r from-zinc-900 to-zinc-700 px-2.5 sm:px-4 py-2 sm:py-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center justify-between relative z-10">
                              <div>
                                <h3 className="text-base sm:text-lg font-bold text-white">{block.name}</h3>
                                <p className="text-[10px] sm:text-xs text-zinc-300 mt-0.5">{block.count} daire</p>
                              </div>
                              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-4">
                            {/* Stats */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Aktif</p>
                                  <p className="text-xs sm:text-sm font-bold text-zinc-900">{block.occupied}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200">
                                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Boş</p>
                                  <p className="text-xs sm:text-sm font-bold text-zinc-900">{block.count - block.occupied}</p>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                <span>Doluluk</span>
                                <span>%{block.occupancyRate}</span>
                              </div>
                              <div className="h-1.5 sm:h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                                  style={{ width: `${block.occupancyRate}%` }}
                                />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 text-xs py-2 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportBlockReport(block.name);
                                }}
                                disabled={reportLoading === block.name}
                                leftIcon={<FileText className="h-3.5 w-3.5" />}
                              >
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                className="flex-1 text-xs py-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/admin/buildings/${building.id}/residents?block=${encodeURIComponent(block.name)}`);
                                }}
                              >
                                Yönet
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
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

      {reportPreview && (
        <PdfPreviewModal
          url={reportPreview.url}
          fileName={reportPreview.fileName}
          onClose={() => {
            URL.revokeObjectURL(reportPreview.url);
            setReportPreview(null);
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

      {/* Bottom Graph Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Aktivite Grafiği</p>
                <p className="text-xs text-zinc-300">Son 30 gün</p>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-0.5 h-12 max-w-md">
              {activityData.length > 0 ? activityData.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      idx >= activityData.length - 5 ? 'bg-zinc-600 group-hover:bg-zinc-500' : 'bg-zinc-800 group-hover:bg-zinc-700'
                    }`}
                    style={{ height: `${Math.max(4, (val / Math.max(...activityData)) * 40)}px` }}
                  />
                </div>
              )) : (
                <p className="w-full text-center text-[10px] text-zinc-500 self-center">Henüz aktivite verisi yok</p>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-zinc-600" />
                <span>Bugün</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-zinc-800" />
                <span>Geçmiş</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

// -------------------------------------------------------------
// COMPONENT: BLOCK VISUAL (Image or Clean Building Placeholder)
// -------------------------------------------------------------
function BlockVisual({ src, name }: { src?: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200/70 to-zinc-200 flex flex-col items-center justify-center text-zinc-600 pl-3 pr-1 select-none">
      <div className="h-10 w-10 rounded-xl bg-white/90 shadow-sm border border-zinc-200/80 flex items-center justify-center">
        <svg className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <span className="text-[10px] font-semibold text-zinc-600 tracking-wider uppercase mt-1.5 truncate max-w-[80px] text-center">
        {name}
      </span>
    </div>
  );
}

function PdfPreviewModal({ url, fileName, onClose }: { url: string; fileName: string; onClose: () => void }) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-zinc-700 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-900 truncate">Rapor Önizleme</h3>
              <p className="text-[11px] text-zinc-500 truncate">{fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 flex-shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-zinc-100">
          <iframe src={url} title="PDF Önizleme" className="w-full h-[55vh] sm:h-[65vh]" />
        </div>

        <div className="flex items-center justify-end gap-2.5 px-4 py-3 border-t border-zinc-200">
          <Button variant="secondary" size="sm" onClick={onClose}>Kapat</Button>
          <Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download className="h-3.5 w-3.5" />}>
            İndir
          </Button>
        </div>
      </div>
    </div>
  );
}
