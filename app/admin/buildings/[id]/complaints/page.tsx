'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';

interface ComplaintUser {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  units?: {
    blockName: string;
    doorNo: string;
    floor: string;
  }[];
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  user?: ComplaintUser | null;
}

interface Building {
  id: string;
  name: string;
  type: string;
}

export default function BuildingComplaintsPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (buildingId) {
      fetchData();
    }
  }, [buildingId]);

  const fetchData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`/api/buildings/${buildingId}`),
        fetch(`/api/complaints?buildingId=${buildingId}`),
      ]);

      if (bRes.ok) {
        setBuilding(await bRes.json());
      }

      if (cRes.ok) {
        setComplaints(await cRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    if (selectedStatus === 'ALL') return complaints;
    return complaints.filter((c) => c.status === selectedStatus);
  }, [complaints, selectedStatus]);

  const counts = useMemo(() => {
    return {
      all: complaints.length,
      pending: complaints.filter((c) => c.status === 'PENDING').length,
      inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
      resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    };
  }, [complaints]);

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      {/* Header */}
      <div className="section-header mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/admin/buildings/${buildingId}`)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Bina Detayına Dön
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light text-zinc-900">
                Şikayet ve İstek Kutusu
              </h1>
              <Badge variant="default">{building?.name}</Badge>
            </div>
            <p className="text-zinc-500 font-light text-sm">
              Sakinlerden gelen talepleri, önerileri ve arıza bildirimlerini inceleyin
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Toplam Talep</p>
            <p className="text-2xl font-light text-zinc-900">{counts.all}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Çözülenler</p>
            <p className="text-2xl font-light text-emerald-800">{counts.resolved}</p>
          </CardBody>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Tümü ({counts.all})
        </button>
        <button
          onClick={() => setSelectedStatus('PENDING')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedStatus === 'PENDING'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Beklemede ({counts.pending})
        </button>
        <button
          onClick={() => setSelectedStatus('IN_PROGRESS')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedStatus === 'IN_PROGRESS'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          İnceleniyor ({counts.inProgress})
        </button>
        <button
          onClick={() => setSelectedStatus('RESOLVED')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedStatus === 'RESOLVED'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Çözüldü ({counts.resolved})
        </button>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-base font-medium text-zinc-900 mb-1">
                {selectedStatus === 'ALL'
                  ? 'Henüz bir talep veya şikayet bulunmuyor'
                  : 'Bu filtreye uygun talep bulunamadı'}
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Sakinler panellerinden şikayet veya öneri gönderdiğinde burada listelenecektir.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((item) => {
            const user = item.user;
            const unit = user?.units?.[0];
            const formattedDate = new Date(item.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card key={item.id} className="border border-zinc-200">
                <CardBody className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top Meta info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {unit ? (
                          <span className="font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
                            {unit.blockName} • Daire {unit.doorNo}
                          </span>
                        ) : (
                          <span className="font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                            Site Sakini
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-medium text-zinc-800">{user?.name || 'Anonim'}</span>
                        {user?.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{formatPhoneNumber(user.phone)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>

                      {/* Subject and Description */}
                      <h3 className="text-base font-medium text-zinc-900 pt-1">
                        {item.subject}
                      </h3>
                      <p className="text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Status and Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-zinc-100">
                      <div>{getStatusBadge(item.status)}</div>

                      <div className="flex items-center gap-1.5">
                        {item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                          >
                            İncelemeye Al
                          </Button>
                        )}
                        {item.status !== 'RESOLVED' && (
                          <Button
                            size="sm"
                            loading={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                          >
                            Çözüldü
                          </Button>
                        )}
                        {item.status === 'RESOLVED' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, 'PENDING')}
                          >
                            Yeniden Aç
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
