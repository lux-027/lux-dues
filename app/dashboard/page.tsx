'use client';

import { useEffect, useState } from 'react';
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
  status: 'PAID' | 'UNPAID';
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  perUnitAmount: string;
  status: 'ACTIVE' | 'COMPLETED';
  payments: ProjectPayment[];
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export default function ResidentDashboard() {
  const [dues, setDues] = useState<Due[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [duesRes, complaintsRes, projectsRes, meRes] = await Promise.all([
        fetch('/api/dues'),
        fetch('/api/complaints'),
        fetch('/api/projects'),
        fetch('/api/auth/me'),
      ]);

      if (duesRes.ok) setDues(await duesRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());

      if (meRes.ok) {
        const meData = await meRes.json();
        const phone = meData.user?.phone;
        if (!phone || phone.startsWith('google:')) {
          setShowPhonePrompt(true);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
        return <Badge variant="info">İşlemde</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Çözüldü</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="text-3xl font-light text-zinc-900 mb-2">
          Sakin Paneli
        </h1>
        <p className="text-zinc-600 font-light">
          Aidat borçlarınızı, duyuruları ve taleplerinizi buradan takip edebilirsiniz
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Toplam Borç</p>
              <p className="text-3xl font-light text-zinc-900">
                {totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </p>
            </div>
            <div className="h-14 w-14 bg-zinc-100 rounded-lg flex items-center justify-center">
              <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borçlarım */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-zinc-900">Borçlarım</h2>
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

        {/* Duyurular */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-zinc-900">Duyurular</h2>
          </CardHeader>
          <CardBody>
            <div className="empty-state">
              <p className="text-sm text-zinc-500">Şu anda aktif bir duyuru bulunmuyor.</p>
            </div>
          </CardBody>
        </Card>

        {/* Ortak Proje Katılımları */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-zinc-900">Ortak Proje Katılımları</h2>
          </CardHeader>
          <CardBody>
            {projects.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">Aktif bir ortak proje bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
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
                    {project.payments[0] ? getStatusBadge(project.payments[0].status) : (
                      <Badge variant="danger">Ödenmedi</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Şikayet Kutusu */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-900">Şikayet Kutusu</h2>
              <Button size="sm" variant="secondary" onClick={() => setShowComplaintForm(true)}>
                Yeni Talep
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {complaints.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">Henüz bir talebiniz bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="py-3 border-b border-zinc-100 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-zinc-900">{complaint.subject}</p>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p className="text-sm text-zinc-500">{complaint.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {showComplaintForm && (
        <ComplaintFormModal
          onClose={() => setShowComplaintForm(false)}
          onSuccess={() => {
            setShowComplaintForm(false);
            fetchAll();
          }}
        />
      )}

      {showPhonePrompt && (
        <PhonePromptModal
          onClose={() => setShowPhonePrompt(false)}
          onSuccess={() => {
            setShowPhonePrompt(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

interface ComplaintFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ComplaintFormModal({ onClose, onSuccess }: ComplaintFormModalProps) {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch current session to obtain buildingId
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meRes.ok || !meData.user.buildingId) {
        setError('Bina bilgisi bulunamadı. Lütfen yöneticinizle iletişime geçin.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: meData.user.buildingId,
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

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Yeni Talep / Şikayet</h3>
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

            <div className="form-group">
              <Input
                label="Konu"
                placeholder="Örn: Asansör Arızası"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Textarea
                label="Açıklama"
                placeholder="Talebinizi detaylandırın..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Gönder
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
