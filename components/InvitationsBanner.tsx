'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

interface Invitation {
  id: string;
  sender: {
    id: string;
    name: string;
    accountNumber: number;
  };
  building: {
    id: string;
    name: string;
    address: string;
  };
  blockName: string | null;
  createdAt: string;
}

export function InvitationsBanner() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.received || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleRespond = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        if (action === 'ACCEPT') {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        alert(data.error || 'İşlem başarısız');
      }
    } catch (err) {
      console.error(err);
      alert('İşlem sırasında bağlantı hatası oluştu');
    } finally {
      setLoadingId(null);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="space-y-3">
        {invitations.map((invite) => (
          <div
            key={invite.id}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Yeni Yönetici Daveti / Talebi
                </h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  <strong>{invite.sender.name}</strong>, sizi <strong>{invite.building.name}</strong> {invite.blockName ? `(${invite.blockName})` : '(Tüm Bloklar)'} için yönetici olarak yetkilendirmek istiyor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="secondary"
                size="sm"
                disabled={loadingId === invite.id}
                onClick={() => handleRespond(invite.id, 'REJECT')}
              >
                Reddet
              </Button>
              <Button
                size="sm"
                loading={loadingId === invite.id}
                onClick={() => handleRespond(invite.id, 'ACCEPT')}
              >
                Kabul Et ve Yönetici Ol
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
