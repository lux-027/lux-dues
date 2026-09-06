'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, PhoneInput, CurrencyInput, ConfirmModal } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { formatAccountNumber, parseAccountNumber } from '@/lib/userId';

interface Resident {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
}

interface Unit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  ownerName: string;
  residentPhone: string;
  defaultDueAmount?: string | number | null;
  isVacant?: boolean;
  residents: Resident[];
}

interface EditUnitModalProps {
  buildingId: string;
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUnitModal({ unit, onClose, onSuccess }: EditUnitModalProps) {
  const [formData, setFormData] = useState({
    blockName: unit.blockName,
    doorNo: unit.doorNo,
    floor: unit.floor,
    ownerName: unit.ownerName,
    residentPhone: unit.residentPhone,
    defaultDueAmount: unit.defaultDueAmount ? String(unit.defaultDueAmount) : '',
  });
  const [isVacant, setIsVacant] = useState(Boolean(unit.isVacant));
  const [activeResident, setActiveResident] = useState<Resident | null>(unit.residents[0] || null);
  const [residentUserId, setResidentUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removingResident, setRemovingResident] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleToggleVacant = (checked: boolean) => {
    setIsVacant(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        ownerName: 'Boş Daire',
        residentPhone: '',
      }));
      setActiveResident(null);
      setResidentUserId('');
    } else {
      if (formData.ownerName === 'Boş Daire') {
        setFormData((prev) => ({
          ...prev,
          ownerName: `${prev.blockName} D:${prev.doorNo}`,
        }));
      }
    }
  };

  const handleRemoveResident = async () => {
    setRemovingResident(true);
    setError('');
    try {
      const response = await fetch(`/api/units/${unit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentAccountNumber: 'remove',
        }),
      });

      if (response.ok) {
        setShowRemoveConfirm(false);
        setActiveResident(null);
        setResidentUserId('');
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Sakin kaldırılırken bir hata oluştu');
      }
    } catch {
      setError('Sakin kaldırılırken bir hata oluştu');
    } finally {
      setRemovingResident(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: any = {
        blockName: formData.blockName,
        doorNo: formData.doorNo,
        floor: formData.floor,
        ownerName: isVacant ? (formData.ownerName || 'Boş Daire') : formData.ownerName,
        residentPhone: isVacant ? '' : formData.residentPhone,
        isVacant,
        defaultDueAmount: formData.defaultDueAmount === '' ? null : parseFloat(formData.defaultDueAmount),
      };

      const trimmedResidentId = residentUserId.trim();
      if (trimmedResidentId) {
        if (trimmedResidentId.toLowerCase() === 'remove') {
          body.residentAccountNumber = 'remove';
        } else {
          const parsed = parseAccountNumber(trimmedResidentId);
          if (!parsed) {
            setError('Geçerli bir kullanıcı ID girin (Örn: 000 000 001)');
            setLoading(false);
            return;
          }
          body.residentAccountNumber = parsed;
        }
      }

      const response = await fetch(`/api/units/${unit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Daire güncellenirken bir hata oluştu');
      }
    } catch {
      setError('Daire güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 flex-shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-900" />
            <h3 className="text-base font-semibold text-zinc-900">Daire Düzenle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="editUnitForm" className="px-5 py-3.5 space-y-3 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Blok & Kapı No */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="input-label text-xs">Blok</label>
              <input
                type="text"
                className="input-field text-xs py-1.5"
                value={formData.blockName}
                onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Kapı No"
                value={formData.doorNo}
                onChange={(e) => setFormData({ ...formData, doorNo: e.target.value })}
                required
                type="text"
              />
            </div>
          </div>

          {/* Row 2: Malik Adı & Telefon */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Input
                label="Malik / Sakin Adı"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder={isVacant ? 'Boş Daire' : 'Ad Soyad'}
                required={!isVacant}
                type="text"
              />
            </div>
            <div>
              <PhoneInput
                label={isVacant ? 'Telefon (İsteğe Bağlı)' : 'Telefon'}
                value={formData.residentPhone}
                onChange={(value) => setFormData({ ...formData, residentPhone: value })}
                required={!isVacant}
              />
            </div>
          </div>

          {/* Row 3: Varsayılan Aidat & Boş Daire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
            <div>
              <CurrencyInput
                label="Varsayılan Aidat (₺)"
                value={formData.defaultDueAmount}
                onChange={(value) => setFormData({ ...formData, defaultDueAmount: value })}
              />
            </div>
            <div className={`p-2.5 border rounded-xl flex items-center justify-between h-[42px] mt-auto transition-colors ${isVacant ? 'bg-amber-50 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
              <label htmlFor="isVacantToggle" className="cursor-pointer">
                <p className={`text-xs font-semibold ${isVacant ? 'text-amber-900' : 'text-zinc-900'}`}>Boş Daire</p>
                <p className={`text-[10px] ${isVacant ? 'text-amber-700' : 'text-zinc-500'}`}>Aidat hesaplanmaz</p>
              </label>
              <input
                type="checkbox"
                id="isVacantToggle"
                checked={isVacant}
                onChange={(e) => handleToggleVacant(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Kayıtlı Sakin Alanı */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider">Kayıtlı Daire Sakini</h4>
              {isVacant ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                  Boş Daire
                </span>
              ) : activeResident ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Aktif Bağlantı
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200 text-zinc-700">
                  Sakin Yok
                </span>
              )}
            </div>

            {isVacant ? (
              <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-amber-800 leading-relaxed">
                Bu daire boş olarak ayarlandı. Sakin oturumu ve telefon bilgisi aranmaz; toplu aidat listesine dahil edilmez.
              </div>
            ) : activeResident ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-zinc-200">
                  {activeResident.avatarUrl ? (
                    <img
                      src={activeResident.avatarUrl}
                      alt={activeResident.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 flex-shrink-0"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {activeResident.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1 text-xs">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{activeResident.name}</p>
                    <p className="text-zinc-500 font-mono text-[11px]">{formatPhoneNumber(activeResident.phone)}</p>
                    <p className="text-zinc-500 text-[11px]">
                      ID: <code className="bg-zinc-100 px-1 py-0.2 rounded border border-zinc-200 text-zinc-800 font-mono font-semibold">{formatAccountNumber(activeResident.accountNumber)}</code>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Kayıtlı Sakini Kaldır
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 pt-0.5">
                <label className="text-xs font-medium text-zinc-700 block">Sakin Ata / Bağla (Kullanıcı ID)</label>
                <input
                  type="text"
                  className="input-field text-xs py-1.5"
                  value={residentUserId}
                  onChange={(e) => setResidentUserId(e.target.value)}
                  placeholder="Örn: 000 000 001"
                />
                <p className="text-[10px] text-zinc-500">
                  Daireyi hesabına bağlamak istediğiniz kullanıcının 9 haneli Kullanıcı ID&apos;sini girin ve Kaydet&apos;e tıklayın.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5 flex-shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" form="editUnitForm" size="sm" loading={loading}>
            Kaydet
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={showRemoveConfirm}
        title="Kayıtlı Sakini Kaldır"
        description={`${activeResident?.name} kullanıcısını bu dairenin takibinden çıkarmak istediğinize emin misiniz? Sakinin panelinden bu daire kaldırılacak ve sakine yetkisinin sonlandırıldığına dair bildirim gönderilecektir.`}
        variant="danger"
        confirmText="Evet, Sakini Kaldır"
        cancelText="Vazgeç"
        loading={removingResident}
        onConfirm={handleRemoveResident}
        onCancel={() => setShowRemoveConfirm(false)}
      />
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

