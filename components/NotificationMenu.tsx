'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';

interface Invitation {
  id: string;
  sender: {
    id: string;
    name: string;
    accountNumber: number;
    email: string;
    phone: string;
  };
  building: {
    id: string;
    name: string;
    address: string;
  };
  blockName: string | null;
  createdAt: string;
}

interface GeneralNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('requests');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondInvitation = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    setLoadingActionId(id);
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
      setLoadingActionId(null);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const totalUnread = invitations.length + unreadNotifications;

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchInvitations();
        }}
        className="relative p-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors focus:outline-none"
        title="Bildirimler ve İstekler"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50">
          {/* Header with 2 tabs */}
          <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span>İstek Kutusu</span>
              {invitations.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                  {invitations.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'notifications'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span>Bildirimler</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100">
            {activeTab === 'requests' && (
              <div>
                {invitations.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="h-10 w-10 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-zinc-800">Gelen İstek Bulunmuyor</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Başka bir yönetici Kullanıcı ID'nizi kullanarak sizi yetkilendirdiğinde talepler burada listelenir.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {invitations.map((invite) => (
                      <div
                        key={invite.id}
                        className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md mb-1">
                              Yöneticilik Talebi
                            </span>
                            <h5 className="text-xs font-semibold text-zinc-900">
                              {invite.building.name}
                            </h5>
                            <p className="text-[11px] text-zinc-600 mt-0.5">
                              {invite.blockName ? `Yetkili: ${invite.blockName}` : 'Tüm Bloklar (Genel Yönetim)'}
                            </p>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(invite.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-500 bg-white p-2 rounded-lg border border-zinc-100">
                          <strong>{invite.sender.name}</strong> tarafından talep gönderildi.
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            disabled={loadingActionId === invite.id}
                            onClick={() => handleRespondInvitation(invite.id, 'REJECT')}
                            className="px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          >
                            Reddet
                          </button>
                          <Button
                            size="sm"
                            loading={loadingActionId === invite.id}
                            onClick={() => handleRespondInvitation(invite.id, 'ACCEPT')}
                            className="text-xs py-1 px-3"
                          >
                            Onayla
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs text-zinc-400">Henüz bir bildiriminiz bulunmuyor.</p>
                  </div>
                ) : (
                  <div>
                    {unreadNotifications > 0 && (
                      <div className="p-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 font-medium">{unreadNotifications} okunmamış bildirim</span>
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium underline"
                        >
                          Tümünü Okundu İşaretle
                        </button>
                      </div>
                    )}
                    <div className="divide-y divide-zinc-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-zinc-50 transition-colors ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />}
                              <p className="text-xs font-semibold text-zinc-900">{notif.title}</p>
                            </div>
                            <span className="text-[10px] text-zinc-400 flex-shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
