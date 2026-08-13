'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  context?: 'admin' | 'resident';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login', context = 'resident' }: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin self-registration is only possible before the very first SUPER_ADMIN
  // exists (fresh install bootstrap). We check this once when the modal opens.
  const [adminRegisterAvailable, setAdminRegisterAvailable] = useState<boolean | null>(null);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (isOpen && context === 'admin' && adminRegisterAvailable === null) {
      fetch('/api/auth/register-admin')
        .then((res) => res.json())
        .then((data) => setAdminRegisterAvailable(Boolean(data.available)))
        .catch(() => setAdminRegisterAvailable(false));
    }
  }, [isOpen, context, adminRegisterAvailable]);

  // If admin registration turns out to be unavailable while the register tab
  // is active (e.g. a SUPER_ADMIN already exists), fall back to the login tab.
  useEffect(() => {
    if (context === 'admin' && adminRegisterAvailable === false && tab === 'register') {
      setTab('login');
    }
  }, [context, adminRegisterAvailable, tab]);

  if (!isOpen) return null;

  const canRegister = context === 'resident' || adminRegisterAvailable === true;

  const switchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'BLOCK_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Giriş yapılırken bir hata oluştu');
      }
    } catch {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = context === 'admin' ? '/api/auth/register-admin' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();

      if (response.ok) {
        router.push(context === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.error || 'Kayıt olurken bir hata oluştu');
      }
    } catch {
      setError('Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-zinc-900/60 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between px-6 pt-6">
            <div>
              <h3 className="text-lg font-medium text-zinc-900">
                {context === 'admin' ? 'Yönetici Girişi' : 'Site Sakini'}
              </h3>
              <p className="text-sm text-zinc-500 mt-0.5">LuxDues hesabınıza erişin</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 mt-5 border-b border-zinc-200">
            <button
              onClick={() => switchTab('login')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === 'login'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Giriş Yap
            </button>
            {canRegister && (
              <button
                onClick={() => switchTab('register')}
                className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === 'register'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Kayıt Ol
              </button>
            )}
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {success}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@luxdues.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Input
                    type="password"
                    label="Şifre"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" fullWidth loading={loading} className="mt-2">
                  Giriş Yap
                </Button>
                {context === 'admin' && !canRegister && (
                  <p className="text-center text-xs text-zinc-500 mt-4">
                    Yönetici hesabınız yoksa sistem yöneticinizle iletişime geçin.
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                {context === 'admin' && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
                    Sistemde henüz bir yönetici hesabı yok. Oluşturacağınız hesap
                    otomatik olarak <strong>Ana Yönetici</strong> yetkisi alacak.
                  </div>
                )}
                <div className="form-group">
                  <Input
                    label="Ad Soyad"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Input
                    type="email"
                    label="E-posta"
                    placeholder="ornek@luxdues.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Input
                    label="Telefon"
                    placeholder="+905551234567"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Input
                    type="password"
                    label="Şifre"
                    placeholder="En az 6 karakter"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" fullWidth loading={loading} className="mt-2">
                  Kayıt Ol
                </Button>
                <p className="text-center text-xs text-zinc-500 mt-4">
                  {context === 'admin'
                    ? 'Bu adım sadece ilk kurulumda kullanılabilir.'
                    : 'Kayıt sonrası yöneticiniz sizi dairenizle eşleştirecektir.'}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
