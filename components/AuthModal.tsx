'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, PhoneInput } from '@/components/ui';
import { formatPhoneNumber } from '@/lib/phone';
import { signInWithGoogle, sendPhoneOtp, confirmPhoneOtp } from '@/lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  context?: 'admin' | 'resident';
  /** Show role selection cards at the top of the register tab (for free sign-up). */
  showRoleSelector?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  context = 'resident',
  showRoleSelector = false,
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [activeContext, setActiveContext] = useState<'admin' | 'resident'>(context);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Phone number sign-in (SMS OTP via Firebase)
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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
    if (isOpen && activeContext === 'admin' && adminRegisterAvailable === null) {
      fetch('/api/auth/register-admin')
        .then((res) => res.json())
        .then((data) => setAdminRegisterAvailable(Boolean(data.available)))
        .catch(() => setAdminRegisterAvailable(false));
    }
  }, [isOpen, activeContext, adminRegisterAvailable]);

  // Reset admin availability when switching role in the role selector.
  useEffect(() => {
    setAdminRegisterAvailable(null);
  }, [activeContext]);

  if (!isOpen) return null;

  const canRegister = true;

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

  // Google sign-in is only offered to residents. Admin accounts are always
  // created explicitly (bootstrap or by an existing SUPER_ADMIN), never
  // auto-provisioned via a third-party identity provider.
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const idToken = await signInWithGoogle();

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Google ile giriş yapılamadı');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google ile giriş yapılamadı');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Phone sign-in is only offered to residents, same rationale as Google.
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    setError('');

    try {
      const result = await sendPhoneOtp(phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(
        err?.code === 'auth/invalid-phone-number'
          ? 'Geçersiz telefon numarası. Örn: +905551234567'
          : 'Doğrulama kodu gönderilemedi'
      );
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setPhoneLoading(true);
    setError('');

    try {
      const idToken = await confirmPhoneOtp(confirmationResult, otpCode);

      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Telefon ile giriş yapılamadı');
      }
    } catch {
      setError('Doğrulama kodu yanlış veya süresi dolmuş');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = activeContext === 'admin' ? '/api/auth/register-admin' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();

      if (response.ok) {
        router.push(activeContext === 'admin' ? '/admin' : '/dashboard');
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
                {activeContext === 'admin' ? 'Yönetici Girişi' : 'Site Sakini'}
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
            {tab === 'register' && showRoleSelector && (
              <div className="mb-5">
                <p className="text-sm text-zinc-500 mb-3">Kayıt türünü seçin</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveContext('resident')}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      activeContext === 'resident'
                        ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-900">Site Sakini</span>
                      {activeContext === 'resident' && (
                        <span className="h-2 w-2 rounded-full bg-zinc-900" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">Daire sakinleri için kayıt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContext('admin')}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      activeContext === 'admin'
                        ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-900">Yönetici</span>
                      {activeContext === 'admin' && (
                        <span className="h-2 w-2 rounded-full bg-zinc-900" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">Blok/site yöneticisi kaydı</span>
                  </button>
                </div>
              </div>
            )}

            {activeContext === 'resident' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 border border-zinc-200 rounded-xl py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {googleLoading ? (
                    <span className="h-4 w-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.08 3.56-5.16 3.56-8.8z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.09C3.21 21.3 7.26 24 12 24z" />
                      <path fill="#FBBC05" d="M5.27 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.24C.45 8.24 0 10.06 0 12s.45 3.76 1.24 5.4l4.03-3.09z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.26 0 3.21 2.7 1.24 6.6l4.03 3.09c.95-2.85 3.6-4.94 6.73-4.94z" />
                    </svg>
                  )}
                  Google ile Giriş Yap
                </button>

                {!showPhoneForm ? (
                  <button
                    type="button"
                    onClick={() => setShowPhoneForm(true)}
                    className="w-full flex items-center justify-center gap-3 border border-zinc-200 rounded-xl py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors mb-4"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Telefon Numarası ile Giriş Yap
                  </button>
                ) : (
                  <div className="border border-zinc-200 rounded-xl p-4 mb-4">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                          <PhoneInput
                            label="Telefon Numarası"
                            value={phoneNumber}
                            onChange={(value) => setPhoneNumber(value)}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="submit" fullWidth loading={phoneLoading} size="sm">
                            Doğrulama Kodu Gönder
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPhoneForm(false)}
                          >
                            Vazgeç
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleConfirmOtp}>
                        <p className="text-xs text-zinc-500 mb-3">
                          {formatPhoneNumber(phoneNumber)} numarasına gönderilen 6 haneli kodu girin.
                        </p>
                        <div className="form-group">
                          <Input
                            label="Doğrulama Kodu"
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={6}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="submit" fullWidth loading={phoneLoading} size="sm">
                            Doğrula ve Giriş Yap
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPhoneForm(false);
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                          >
                            Vazgeç
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
                {/* Invisible reCAPTCHA container required by Firebase phone auth */}
                <div id="recaptcha-container" />

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-zinc-400">veya e-posta ile</span>
                  </div>
                </div>
              </>
            )}

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
                <p className="text-center text-sm text-zinc-500 mt-4">
                  Hesabın yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-zinc-900 font-medium hover:underline"
                  >
                    Kayıt Ol
                  </button>
                </p>
                {activeContext === 'admin' && !canRegister && (
                  <p className="text-center text-xs text-zinc-500 mt-2">
                    Yönetici hesabınız yoksa sistem yöneticinizle iletişime geçin.
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                {activeContext === 'admin' && adminRegisterAvailable === true && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
                    Sistemde henüz bir yönetici hesabı yok. Oluşturacağınız hesap
                    otomatik olarak <strong>Ana Yönetici</strong> yetkisi alacak.
                  </div>
                )}
                {activeContext === 'admin' && adminRegisterAvailable === false && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
                    Sistemde zaten bir yönetici hesabı varsa kendi başınıza kayıt yapamazsınız.
                    Yeni yönetici eklenmesi için mevcut yöneticinizle iletişime geçin.
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
                  <PhoneInput
                    label="Telefon"
                    value={registerData.phone}
                    onChange={(value) => setRegisterData({ ...registerData, phone: value })}
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
                <p className="text-center text-sm text-zinc-500 mt-4">
                  Hesabın var mı?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-zinc-900 font-medium hover:underline"
                  >
                    Giriş Yap
                  </button>
                </p>
                <p className="text-center text-xs text-zinc-500 mt-2">
                  {activeContext === 'admin'
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
