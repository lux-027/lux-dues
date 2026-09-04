'use client';

import { useState } from 'react';
import { Button, Input, PhoneInput, CurrencyInput } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { formatAccountNumber, parseAccountNumber } from '@/lib/userId';

interface Resident {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
}

interface Unit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  ownerName: string;
  residentPhone: string;
  defaultDueAmount?: string | number | null;
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
  const [residentUserId, setResidentUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentResident = unit.residents[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: any = {
        blockName: formData.blockName,
        doorNo: formData.doorNo,
        floor: formData.floor,
        ownerName: formData.ownerName,
        residentPhone: formData.residentPhone,
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
    } catch (err) {
      setError('Daire güncellenirken bir hata oluştu');
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
            <h3 className="text-lg font-medium text-zinc-900">Daire Düzenle</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Blok</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.blockName}
                  onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <Input
                  label="Kapı No"
                  value={formData.doorNo}
                  onChange={(e) => setFormData({ ...formData, doorNo: e.target.value })}
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Input
                  label="Kat"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  required
                  type="text"
                />
              </div>
              <div className="form-group">
                <CurrencyInput
                  label="Varsayılan Aidat (₺)"
                  value={formData.defaultDueAmount}
                  onChange={(value) => setFormData({ ...formData, defaultDueAmount: value })}
                />
              </div>
            </div>

            <div className="form-group">
              <Input
                label="Malik / Sakin Adı"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
                type="text"
              />
            </div>

            <div className="form-group">
              <PhoneInput
                label="Telefon"
                value={formData.residentPhone}
                onChange={(value) => setFormData({ ...formData, residentPhone: value })}
                required
              />
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <h4 className="text-sm font-medium text-zinc-900">Kayıtlı Sakin</h4>
              {currentResident ? (
                <div className="text-sm text-zinc-700 space-y-1">
                  <p><span className="font-medium">Ad:</span> {currentResident.name}</p>
                  <p><span className="font-medium">Telefon:</span> {formatPhoneNumber(currentResident.phone)}</p>
                  <p><span className="font-medium">Kullanıcı ID:</span> <code className="text-xs bg-white px-1 rounded border">{formatAccountNumber(currentResident.accountNumber)}</code></p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Henüz kayıtlı sakin yok.</p>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Sakin Ata / Davet (Kullanıcı ID)</label>
              <input
                type="text"
                className="input-field"
                value={residentUserId}
                onChange={(e) => setResidentUserId(e.target.value)}
                placeholder="Örn: 000 000 001 veya 'remove'"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Mevcut bir kullanıcının 9 haneli ID'sini girin; boş bırakırsanız değişmez, "remove" yazarsanız mevcut sakin kaldırılır.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" loading={loading}>
                Kaydet
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
