'use client';

import { useState } from 'react';
import { Button, PhoneInput } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';

interface PhonePromptModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PhonePromptModal({ onClose, onSuccess }: PhonePromptModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/update-phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Telefon numarası kaydedilemedi');
      }
    } catch (err) {
      setError('Telefon numarası kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-zinc-900/60 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div className="px-6 pt-6">
            <h3 className="text-lg font-medium text-zinc-900">İletişim Bilginizi Ekleyin</h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Yönetici ve site sakinleriyle iletişim için telefon numaranızı ekleyin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="form-group">
              <PhoneInput
                label="Telefon Numarası"
                value={phone}
                onChange={(value) => setPhone(value)}
                required
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button type="submit" fullWidth loading={loading}>
                {loading ? 'Kaydediliyor...' : `Kaydet ${phone ? `(${formatPhoneNumber(phone)})` : ''}`}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Daha Sonra
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
