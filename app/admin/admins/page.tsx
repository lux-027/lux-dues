'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody } from '@/components/ui';
import { Button, Badge, Select } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { formatAccountNumber } from '@/lib/userId';

interface Building {
  id: string;
  name: string;
  type?: string;
  totalBlocks?: number;
}

interface Admin {
  id: string;
  accountNumber?: number;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'BLOCK_ADMIN';
  buildingId: string | null;
  blockName?: string | null;
  building?: { id: string; name: string } | null;
  createdAt: string;
}

interface SentInvitation {
  id: string;
  receiver: {
    id: string;
    accountNumber: number;
    name: string;
    email: string;
    phone: string;
  };
  building: {
    id: string;
    name: string;
  };
  blockName: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [redirectAdmin, setRedirectAdmin] = useState<Admin | null>(null);
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    loading: boolean;
  }>({ open: false, title: '', description: '', action: async () => {}, loading: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, buildingsRes, invitesRes] = await Promise.all([
        fetch('/api/admins'),
        fetch('/api/buildings'),
        fetch('/api/invitations'),
      ]);
      if (adminsRes.ok) setAdmins(await adminsRes.json());
      if (buildingsRes.ok) setBuildings(await buildingsRes.json());
      if (invitesRes.ok) {
        const invData = await invitesRes.json();
        setSentInvitations(invData.sent || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      open: true,
      title: 'Yöneticinin Yetkisini Kaldırmak İstiyor musunuz?',
      description: 'Bu yöneticinin yönetici yetkileri kaldırılacaktır. Kullanıcı hesabı silinmeyecek, sadece atanmış olduğu site ve blok yetkisi kaldırılacaktır.',
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const response = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
          if (response.ok) {
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
            fetchData();
          } else {
            alert('Yetki kaldırılırken bir hata oluştu');
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
          }
        } catch (error) {
          console.error('Error removing admin permissions:', error);
          alert('Yetki kaldırılırken bir hata oluştu');
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
      loading: false,
    });
  };

  const handleCancelInvite = async (id: string) => {
    setConfirmModal({
      open: true,
      title: 'Daveti İptal Etmek İstiyor musunuz?',
      description: 'Bu davet bağlantısı iptal edilecek ve artık kullanılamayacaktır.',
      action: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const response = await fetch(`/api/invitations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'CANCEL' }),
          });
          if (response.ok) {
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
            fetchData();
          } else {
            alert('Davet iptal edilirken bir hata oluştu');
            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
          }
        } catch (error) {
          console.error('Error cancelling invite:', error);
          alert('Davet iptal edilirken bir hata oluştu');
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
      loading: false,
    });
  };

  const pendingInvites = sentInvitations.filter((i) => i.status === 'PENDING');

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.replace(/\D/g, '').includes(q) ||
      (a.accountNumber !== undefined && formatAccountNumber(a.accountNumber).toLowerCase().includes(q))
    );
  }, [admins, search]);

  const stats = useMemo(() => ({
    total: admins.length,
    super: admins.filter((a) => a.role === 'SUPER_ADMIN').length,
    block: admins.filter((a) => a.role === 'BLOCK_ADMIN').length,
  }), [admins]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-zinc-900 mb-1">Yöneticiler</h1>
            <p className="text-sm text-zinc-500">Site ve blok yöneticilerini görüntüleyin, davet edin ve yetkilerini yönetin.</p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Yönetici Davet Et
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{stats.total}</p>
              <p className="text-xs text-zinc-500">Toplam Yönetici</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{stats.super}</p>
              <p className="text-xs text-zinc-500">Ana Yönetici</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{stats.block}</p>
              <p className="text-xs text-zinc-500">Blok Yöneticisi</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bekleyen Davetler */}
      {pendingInvites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-zinc-900">Bekleyen Davetler</h2>
            <Badge variant="warning" size="sm">{pendingInvites.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvites.map((inv) => (
              <Card key={inv.id}>
                <CardBody className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {inv.receiver.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{inv.receiver.name}</p>
                        <p className="text-xs text-zinc-500 font-mono truncate">{formatAccountNumber(inv.receiver.accountNumber)}</p>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm">Onay Bekliyor</Badge>
                  </div>
                  <div className="mt-3 text-sm text-zinc-600">
                    <span className="font-medium">{inv.building.name}</span>
                    {inv.blockName ? ` · ${inv.blockName}` : ' · Tüm Bloklar'}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(inv.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      İptal Et
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Aktif Yöneticiler */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-medium text-zinc-900">Aktif Yöneticiler</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input-field w-60 sm:w-72"
            placeholder="Ara (isim, e-posta, telefon, ID)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSearch(search.trim())}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          >
            Ara
          </Button>
        </div>
      </div>

      {filteredAdmins.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <h3 className="mt-2 text-sm font-medium text-zinc-900">
                {search ? 'Aramaya uygun yönetici bulunamadı' : 'Henüz yönetici bulunmuyor'}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {search ? 'Farklı bir arama terimi deneyin.' : 'İlk blok yöneticisini davet etmek için yukarıdaki butona tıklayın.'}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAdmins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onRedirect={() => {
                setRedirectAdmin(admin);
                setShowInviteModal(true);
              }}
              onRemove={() => handleDelete(admin.id)}
            />
          ))}
        </div>
      )}

      {showInviteModal && (
        <InviteAdminModal
          buildings={buildings}
          prefillAccountNumber={redirectAdmin?.accountNumber}
          onClose={() => {
            setShowInviteModal(false);
            setRedirectAdmin(null);
          }}
          onSuccess={() => {
            setShowInviteModal(false);
            setRedirectAdmin(null);
            fetchData();
          }}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        loading={confirmModal.loading}
        confirmText="Evet, Onayla"
        cancelText="Vazgeç"
        variant="danger"
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: ADMIN CARD
// -------------------------------------------------------------
function AdminCard({
  admin,
  onRedirect,
  onRemove,
}: {
  admin: Admin;
  onRedirect: () => void;
  onRemove: () => void;
}) {
  const isSuper = admin.role === 'SUPER_ADMIN';
  const initials = admin.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="h-full flex flex-col">
      <CardBody className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3">
          <div
            className="h-12 w-12 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-semibold text-sm flex-shrink-0"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{admin.name}</p>
                <p className="text-xs text-zinc-500 truncate">{admin.email}</p>
              </div>
              <Badge variant={isSuper ? 'info' : 'default'} size="sm">
                {isSuper ? 'Ana Yönetici' : 'Blok Yöneticisi'}
              </Badge>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{formatPhoneNumber(admin.phone)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-1 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v1m6 4h.01M6 10h.01M18 10h.01M14 14h.01M10 14h.01M6 14h.01" />
                </svg>
                <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 font-mono">
                  {admin.accountNumber ? formatAccountNumber(admin.accountNumber) : '-'}
                </code>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="truncate">
                  {admin.building ? (
                    <>
                      <span className="font-medium">{admin.building.name}</span>
                      {admin.blockName ? ` · ${admin.blockName}` : ' · Tüm Bloklar'}
                    </>
                  ) : isSuper ? (
                    'Tüm Siteler ve Bloklar'
                  ) : (
                    'Atanmadı'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        {admin.role === 'BLOCK_ADMIN' && (
          <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onRedirect}>
              Yeni Siteye Yönlendir
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Yetkiyi Kaldır
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// -------------------------------------------------------------
// MODAL: INVITE ADMIN BY USER ID
// -------------------------------------------------------------
interface InviteAdminModalProps {
  buildings: Building[];
  prefillAccountNumber?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface LookedUpUser {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

function InviteAdminModal({ buildings, prefillAccountNumber, onClose, onSuccess }: InviteAdminModalProps) {
  const [accountNumberInput, setAccountNumberInput] = useState(prefillAccountNumber ? formatAccountNumber(prefillAccountNumber) : '');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [blockName, setBlockName] = useState('');
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);

  const [lookedUpUser, setLookedUpUser] = useState<LookedUpUser | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill edilmiş kullanıcı varsa açılışta otomatik arat
  useEffect(() => {
    if (prefillAccountNumber) {
      const fetchUser = async () => {
        setLookupLoading(true);
        setLookupError('');
        try {
          const res = await fetch(`/api/users/lookup?accountNumber=${encodeURIComponent(String(prefillAccountNumber))}`);
          const data = await res.json();
          if (res.ok && data.user) {
            setLookedUpUser(data.user);
          } else {
            setLookedUpUser(null);
            setLookupError(data.error || 'Kullanıcı bulunamadı');
          }
        } catch (err) {
          setLookupError('Bağlantı hatası oluştu');
          setLookedUpUser(null);
        } finally {
          setLookupLoading(false);
        }
      };
      fetchUser();
    }
  }, [prefillAccountNumber]);

  useEffect(() => {
    if (buildingId) {
      fetch(`/api/buildings/${buildingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.units) {
            const uniqueBlocks = Array.from(new Set(data.units.map((u: any) => u.blockName))).filter(Boolean) as string[];
            if (uniqueBlocks.length > 0) {
              setAvailableBlocks(uniqueBlocks);
            } else if (data.totalBlocks > 1) {
              setAvailableBlocks(Array.from({ length: data.totalBlocks }, (_, i) => `${String.fromCharCode(65 + i)} Blok`));
            } else {
              setAvailableBlocks(['A Blok']);
            }
          }
        })
        .catch(() => {});
    }
  }, [buildingId]);

  const handleLookup = async () => {
    const trimmed = accountNumberInput.trim();
    if (!trimmed) {
      setLookupError('Lütfen bir Kullanıcı ID girin');
      setLookedUpUser(null);
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch(`/api/users/lookup?accountNumber=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (res.ok && data.user) {
        setLookedUpUser(data.user);
      } else {
        setLookedUpUser(null);
        setLookupError(data.error || 'Kullanıcı bulunamadı');
      }
    } catch (err) {
      setLookupError('Bağlantı hatası oluştu');
      setLookedUpUser(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookedUpUser) {
      setError('Lütfen önce geçerli bir kullanıcı bulun');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverAccountNumber: lookedUpUser.accountNumber,
          buildingId,
          blockName: blockName || undefined,
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
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <div>
              <h3 className="text-lg font-medium text-zinc-900">
                {prefillAccountNumber ? 'Yöneticiyi Yeni Siteye Yönlendir' : 'Yönetici Davet Et'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {prefillAccountNumber
                  ? 'Yöneticinin yeni atanacağı site ve bloğu seçin'
                  : "Kullanıcının 9 haneli ID kodunu girerek talep gönderin"}
              </p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {buildings.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">
                Yönetici atamak için önce bir bina oluşturmalısınız.
              </p>
            ) : (
              <>
                {/* Kullanıcı ID Arama */}
                <div>
                  <label className="input-label">Kullanıcı ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      className="input-field font-mono"
                      placeholder="Örn: 000 000 002"
                      value={accountNumberInput}
                      readOnly={!!prefillAccountNumber}
                      disabled={!!prefillAccountNumber}
                      onChange={(e) => {
                        setAccountNumberInput(e.target.value);
                        setLookedUpUser(null);
                        setLookupError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !prefillAccountNumber) {
                          e.preventDefault();
                          handleLookup();
                        }
                      }}
                    />
                    {!prefillAccountNumber && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleLookup}
                        loading={lookupLoading}
                      >
                        Kullanıcıyı Bul
                      </Button>
                    )}
                  </div>
                  {lookupError && (
                    <p className="text-xs text-red-600 mt-1.5">{lookupError}</p>
                  )}
                </div>

                {/* Bulunan Kullanıcı Önizleme Kartı */}
                {lookedUpUser && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900">{lookedUpUser.name}</span>
                        <Badge variant="success">Kayıtlı Kullanıcı</Badge>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {lookedUpUser.email} • {formatPhoneNumber(lookedUpUser.phone)}
                      </p>
                    </div>
                    <code className="text-xs bg-white px-2 py-1 rounded border border-emerald-200 font-mono text-emerald-800">
                      {formatAccountNumber(lookedUpUser.accountNumber)}
                    </code>
                  </div>
                )}

                {/* Hedef Bina & Blok Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="form-group">
                    <Select
                      label="Yetkilendirilecek Bina / Site"
                      value={buildingId}
                      onChange={(e) => {
                        setBuildingId(e.target.value);
                        setBlockName('');
                      }}
                      options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <Select
                      label="Yetkili Blok"
                      value={blockName}
                      onChange={(e) => setBlockName(e.target.value)}
                      options={[
                        { value: '', label: 'Tüm Bloklar (Tüm Site)' },
                        ...availableBlocks.map((blk) => ({ value: blk, label: `${blk}` })),
                      ]}
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 space-y-1">
                  <p className="font-medium text-zinc-800">İşlem Bilgisi:</p>
                  <p>
                    Talep gönderildikten sonra ilgili kullanıcı siteye giriş yaptığında bir bildirim paneli görür.
                    Kullanıcı talebi <strong>Kabul Et</strong> butonuna basarak onayladığında ilgili bloğun yöneticisi olur.
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitLoading}>
                İptal
              </Button>
              <Button
                type="submit"
                loading={submitLoading}
                disabled={buildings.length === 0 || !lookedUpUser}
              >
                Yöneticilik Talebi Gönder
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

