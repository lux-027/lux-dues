'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Button, Badge, Input, Textarea } from '@/components/ui';
import { PhonePromptModal } from '@/components/PhonePromptModal';

interface Due {
  id: string;
  amount: string;
  month: number;
  year: number;
  status: 'PAID' | 'UNPAID';
  dueDate: string;
  unitId?: string;
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

interface ProjectPayment {
  id: string;
  unitId: string;
  status: 'PAID' | 'UNPAID';
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  perUnitAmount: string;
  status: 'ACTIVE' | 'COMPLETED';
  buildingId: string;
  payments: ProjectPayment[];
}

interface UserUnit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  buildingId: string;
  buildingName: string;
  buildingImage?: string | null;
  buildingAddress?: string | null;
  buildingType?: string | null;
  blockImages?: any;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  units: UserUnit[];
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

interface ResidentHomeProps {
  user: UserProfile;
  units: UserUnit[];
  onSelectUnit: (unitId: string) => void;
}

function ResidentHome({ user, units, onSelectUnit }: ResidentHomeProps) {
  return (
    <div className="page-container">
      <div className="section-header mb-8">
        <h1 className="text-3xl sm:text-4xl font-light text-zinc-900 mb-2">
          Merhaba, {user.name.split(' ')[0]}
        </h1>
        <p className="text-zinc-500 font-light text-sm max-w-2xl">
          Sahip olduğunuz dairelere tıklayarak aidat, şikayet, duyuru ve proje bilgilerini görüntüleyebilirsiniz.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900">Dairelerim</h2>
        <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg">
          {units.length} {units.length === 1 ? 'daire' : 'daire'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const unitImg = unit.blockImages?.[unit.blockName] || unit.buildingImage;
          return (
            <button
              key={unit.id}
              onClick={() => onSelectUnit(unit.id)}
              className="group relative h-56 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 text-left transition-all duration-300 hover:shadow-lg hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
            >
              {unitImg ? (
                <img
                  src={unitImg}
                  alt={unit.buildingName}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
                  <svg className="w-16 h-16 text-zinc-700 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/45 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <p className="text-white text-xl font-medium truncate mb-1">{unit.buildingName}</p>
                <div className="flex items-center gap-2 text-zinc-200 text-sm">
                  <span>{unit.blockName}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>No: {unit.doorNo}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>Kat: {unit.floor}</span>
                </div>
                <div className="mt-4 flex items-center text-white text-xs font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Detayları Gör
                  <svg className="h-3.5 w-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ResidentDashboard() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const router = useRouter();
  const [dues, setDues] = useState<Due[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [showDuesDetail, setShowDuesDetail] = useState(false);
  const [duesDetailYear, setDuesDetailYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (selectedUnitId) {
      fetchUnitData(selectedUnitId);
    }
  }, [selectedUnitId]);

  const fetchMe = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        const user: UserProfile | null = meData.user || null;
        setCurrentUser(user);

        if (user?.role === 'SUPER_ADMIN' || user?.role === 'BLOCK_ADMIN') {
          router.push('/admin');
          return;
        }

        const phone = user?.phone;
        if (!phone || phone.startsWith('google:')) {
          setShowPhonePrompt(true);
        }

        // Do not auto-select; always start on the resident home page so the
        // user can choose which unit they want to view.
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitData = async (unitId: string) => {
    const unit = currentUser?.units.find((u) => u.id === unitId);
    setDataLoading(true);
    try {
      const [duesRes, complaintsRes, projectsRes] = await Promise.all([
        fetch(`/api/dues?unitId=${unitId}`),
        fetch('/api/complaints'),
        fetch(`/api/projects${unit ? `?buildingId=${unit.buildingId}` : ''}`),
      ]);

      if (duesRes.ok) setDues(await duesRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Ödendi</Badge>;
      case 'UNPAID':
        return <Badge variant="danger">Ödenmedi</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Beklemede</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">İnceleniyor</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Çözüldü</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectedUnit = useMemo(
    () => currentUser?.units.find((u) => u.id === selectedUnitId) || null,
    [currentUser, selectedUnitId]
  );

  const duesAvailableYears = useMemo(() => {
    const years = Array.from(new Set(dues.map((d) => d.year)));
    return years.sort((a, b) => b - a);
  }, [dues]);

  const openDuesDetail = () => {
    const currentYear = new Date().getFullYear();
    setDuesDetailYear(
      duesAvailableYears.includes(currentYear) ? currentYear : (duesAvailableYears[0] || currentYear)
    );
    setShowDuesDetail(true);
  };

  const totalDebt = dues
    .filter((d) => d.status === 'UNPAID')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // No home linked to this account yet.
  if (currentUser && currentUser.units.length === 0) {
    return (
      <div className="page-container">
        <Card>
          <CardBody>
            <div className="empty-state">
              <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                Henüz bir daireye bağlı değilsiniz
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Bina yöneticiniz sizi bir daireye atadığında burada görünecektir.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Resident home page — shown whenever the user hasn't picked a unit yet,
  // regardless of whether they own one or many.
  if (currentUser && !selectedUnitId) {
    return <ResidentHome user={currentUser} units={currentUser.units} onSelectUnit={setSelectedUnitId} />;
  }

  return (
    <div className="page-container">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setSelectedUnitId(null)}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dairelerime Dön
        </button>

        {currentUser && currentUser.units.length > 1 && (
          <button
            onClick={() => setSelectedUnitId(null)}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2 transition-colors"
          >
            Evlerimi Değiştir ({currentUser.units.length} Daire)
          </button>
        )}
      </div>

      {/* Building Header Card */}
      <Card className="mb-6 overflow-hidden">
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Building / Block Image in Left Corner */}
            <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100 relative">
              {(() => {
                const imgUrl = selectedUnit?.blockImages?.[selectedUnit.blockName] || selectedUnit?.buildingImage;
                if (imgUrl) {
                  return (
                    <img
                      src={imgUrl}
                      alt={selectedUnit?.buildingName || 'Bina'}
                      className="w-full h-full object-cover"
                    />
                  );
                }
                return (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-200/70 to-zinc-200 flex flex-col items-center justify-center text-zinc-500 select-none p-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-zinc-200/80 flex items-center justify-center">
                      <svg className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 tracking-wider uppercase mt-1.5 truncate max-w-[120px] text-center">
                      {selectedUnit?.blockName || 'Bina'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Building & Unit Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-light text-zinc-900 truncate">
                    {selectedUnit?.buildingName}
                  </h1>
                  <Badge variant="success" size="sm">Aktif Daire</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-700 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200">
                    {selectedUnit?.blockName}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200">
                    Kapı No: {selectedUnit?.doorNo}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200">
                    Kat: {selectedUnit?.floor}
                  </span>
                </div>
              </div>

              {selectedUnit?.buildingAddress && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                  <svg className="h-4 w-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{selectedUnit.buildingAddress}</span>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {dataLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Toplam Aidat Borcu</p>
                  <p className="text-3xl font-light text-zinc-900">
                    {totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </p>
                </div>
                <div className="h-12 w-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Borçlarım */}
            <Card
              className="cursor-pointer hover:border-zinc-300 hover:shadow-sm transition-all"
              onClick={() => dues.length > 0 && openDuesDetail()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-zinc-900">Aidat Borçlarım</h2>
                  {dues.length > 0 && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      Detay
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {dues.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-4">Henüz bir aidat kaydınız bulunmuyor.</p>
                ) : (
                  <div className="space-y-3">
                    {dues.map((due) => (
                      <div
                        key={due.id}
                        className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-zinc-900">
                            {MONTH_NAMES[due.month - 1]} {due.year}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {parseFloat(due.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </p>
                        </div>
                        {getStatusBadge(due.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Şikayet ve İstek / Yorum Kutusu */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-zinc-900">Şikayet ve İstek Kutusu</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Bina yönetimine talep veya öneri iletin</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setShowComplaintForm(true)}>
                    Yeni Talep / Yorum
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {complaints.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-zinc-500 mb-3">Henüz ilettiğiniz bir talep veya yorum bulunmuyor.</p>
                    <Button size="sm" variant="ghost" onClick={() => setShowComplaintForm(true)}>
                      + İlk Talebinizi İletin
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="p-3 bg-zinc-50/70 border border-zinc-100 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-zinc-900 text-sm">{complaint.subject}</p>
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-xs text-zinc-600 whitespace-pre-line">{complaint.description}</p>
                        <p className="text-[11px] text-zinc-400 pt-1">
                          {new Date(complaint.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Duyurular */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-medium text-zinc-900">Bina Duyuruları</h2>
              </CardHeader>
              <CardBody>
                <div className="empty-state py-4 text-center">
                  <p className="text-sm text-zinc-500">Şu anda aktif bir duyuru bulunmuyor.</p>
                </div>
              </CardBody>
            </Card>

            {/* Ortak Proje Katılımları */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-medium text-zinc-900">Ortak Projeler</h2>
              </CardHeader>
              <CardBody>
                {projects.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-4">Aktif bir ortak proje bulunmuyor.</p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => {
                      const payment = project.payments.find((p) => p.unitId === selectedUnitId) || project.payments[0];
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-zinc-900">{project.title}</p>
                            <p className="text-sm text-zinc-500">
                              {parseFloat(project.perUnitAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </p>
                          </div>
                          {payment ? getStatusBadge(payment.status) : (
                            <Badge variant="danger">Ödenmedi</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {showComplaintForm && (
        <ComplaintFormModal
          userBuildingId={selectedUnit?.buildingId}
          onClose={() => setShowComplaintForm(false)}
          onSuccess={() => {
            setShowComplaintForm(false);
            if (selectedUnitId) fetchUnitData(selectedUnitId);
          }}
        />
      )}

      {showPhonePrompt && (
        <PhonePromptModal
          onClose={() => setShowPhonePrompt(false)}
          onSuccess={() => {
            setShowPhonePrompt(false);
            fetchMe();
          }}
        />
      )}

      {showDuesDetail && selectedUnit && (
        <ResidentDuesDetailModal
          unit={selectedUnit}
          dues={dues}
          selectedYear={duesDetailYear}
          availableYears={duesAvailableYears}
          onYearChange={setDuesDetailYear}
          onClose={() => setShowDuesDetail(false)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: RESIDENT'S OWN YEARLY DUES HISTORY (READ-ONLY)
// -------------------------------------------------------------
interface ResidentDuesDetailModalProps {
  unit: UserUnit;
  dues: Due[];
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onClose: () => void;
}

function ResidentDuesDetailModal({
  unit,
  dues,
  selectedYear,
  availableYears,
  onYearChange,
  onClose,
}: ResidentDuesDetailModalProps) {
  const yearDues = useMemo(() => dues.filter((d) => d.year === selectedYear), [dues, selectedYear]);

  const yearTotalExpected = yearDues.reduce((acc, d) => acc + parseFloat(d.amount), 0);
  const yearTotalPaid = yearDues.filter((d) => d.status === 'PAID').reduce((acc, d) => acc + parseFloat(d.amount), 0);
  const yearTotalUnpaid = yearTotalExpected - yearTotalPaid;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div>
              <h3 className="text-lg font-medium text-zinc-900">
                {unit.blockName} - No: {unit.doorNo} Aidat Geçmişi
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">{unit.buildingName}</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Year Selector — only shown when dues exist from more than one year */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
              {availableYears.length > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase">Yıl:</span>
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-lg">
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => onYearChange(yr)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          selectedYear === yr
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-xs font-medium text-zinc-500">{selectedYear} Yılı</span>
              )}

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Yıllık Toplam: </span>
                  <strong className="text-zinc-900">{yearTotalExpected.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Ödenen: </span>
                  <strong className="text-emerald-700">{yearTotalPaid.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div>
                  <span className="text-zinc-500">Kalan: </span>
                  <strong className={yearTotalUnpaid > 0 ? 'text-zinc-900 font-semibold' : 'text-zinc-500'}>
                    {yearTotalUnpaid.toLocaleString('tr-TR')} ₺
                  </strong>
                </div>
              </div>
            </div>

            {/* 12 Months Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MONTH_NAMES.map((mName, idx) => {
                const monthNum = idx + 1;
                const due = yearDues.find((d) => d.month === monthNum);
                const isPaid = due?.status === 'PAID';
                const isUnpaid = due && due.status === 'UNPAID';

                return (
                  <div
                    key={monthNum}
                    className="border border-zinc-200 rounded-xl p-3.5 bg-white flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-zinc-900">
                        {monthNum}. {mName} {selectedYear}
                      </span>
                      {isPaid ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          Ödendi
                        </span>
                      ) : isUnpaid ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                          Ödenmedi
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded">
                          Tanımsız
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      {due ? (
                        <div className="text-xs text-zinc-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Tutar:</span>
                            <span className="font-medium text-zinc-900">
                              {parseFloat(due.amount).toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Son Gün:</span>
                            <span>{new Date(due.dueDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">Bu ay için aidat kaydı bulunmuyor</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplaintFormModalProps {
  userBuildingId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ComplaintFormModal({ userBuildingId, onClose, onSuccess }: ComplaintFormModalProps) {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: userBuildingId || undefined,
          subject: formData.subject,
          description: formData.description,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Talep gönderilirken bir hata oluştu');
      }
    } catch (err) {
      setError('Talep gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Yeni Talep / Yorum İlet</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="form-group">
              <Input
                label="Konu / Başlık"
                placeholder="Örn: Asansör Arızası, Bahçe Temizliği vb."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Textarea
                label="Açıklama / Mesajınız"
                placeholder="Bina yönetimine iletmek istediğiniz detayları buraya yazın..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Talebi Gönder
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
