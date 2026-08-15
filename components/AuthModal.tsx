'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, PhoneInput } from '@/components/ui';
import { normalizePhoneNumber } from '@/lib/phone';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  confirmPhoneOtp,
} from '@/lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  context?: 'admin' | 'resident';
  /** Show role selection cards at the top of the register tab (for free sign-up). */
  showRoleSelector?: boolean;
  /** If true, the modal only allows registration (hides the login tab). */
  registerOnly?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  context = 'resident',
  showRoleSelector = false,
  registerOnly = false,
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(registerOnly ? 'register' : initialTab);
  const [activeContext, setActiveContext] = useState<'admin' | 'resident'>(context);
  const [step, setStep] = useState<'role' | 'auth'>(showRoleSelector ? 'role' : 'auth');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Toggle between email and phone/password forms
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  // Phone number registration verification (SMS OTP)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loginData, setLoginData] = useState({ email: '', phone: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    setTab(registerOnly ? 'register' : initialTab);
    setActiveContext(context);
    setStep(showRoleSelector ? 'role' : 'auth');
    setError('');
    setSuccess('');
    setShowPhoneForm(false);
    setError('');
    setSuccess('');
  }, [isOpen, initialTab, context, showRoleSelector, registerOnly]);

  if (!isOpen) return null;

  const canRegister = showRoleSelector && activeContext === 'resident';

  const switchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setShowPhoneForm(false);
    setError('');
    setSuccess('');
  };

  const selectRole = (role: 'admin' | 'resident') => {
    setActiveContext(role);
    setStep('auth');
    setShowPhoneForm(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const missing = !showPhoneForm
      ? !loginData.email || !loginData.password
      : !loginData.phone || !loginData.password;

    if (missing) {
      setError(!showPhoneForm ? 'Lütfen e-posta ve şifrenizi girin' : 'Lütfen telefon numarası ve şifrenizi girin');
      setLoading(false);
      return;
    }

    try {
      const body = !showPhoneForm
        ? { idToken: await signInWithEmail(loginData.email, loginData.password) }
        : { phone: loginData.phone, password: loginData.password };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const phoneMode = showPhoneForm;
    const missing = phoneMode
      ? !registerData.name || !registerData.phone || !registerData.password
      : !registerData.name || !registerData.email || !registerData.phone || !registerData.password;

    if (missing) {
      setError('Lütfen tüm alanları doldurun');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      if (phoneMode) {
        const result = await sendPhoneOtp(registerData.phone, 'recaptcha-container');
        setConfirmationResult(result);
        setOtpSent(true);
        setSuccess('Telefonunuza doğrulama kodu gönderildi.');
        setLoading(false);
        return;
      }

      await signUpWithEmail(registerData.email, registerData.password);

      sessionStorage.setItem(
        'pendingRegistration',
        JSON.stringify({
          name: registerData.name,
          phone: registerData.phone,
          role: activeContext,
        })
      );

      setSuccess(
        'E-posta adresinize doğrulama bağlantısı gönderildi. Lütfen e-postanızdaki bağlantıya tıklayarak kaydınızı tamamlayın.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setPhoneLoading(true);
    setError('');
    setSuccess('');

    if (otpCode.length !== 6) {
      setError('6 haneli doğrulama kodunu girin');
      setPhoneLoading(false);
      return;
    }

    try {
      const idToken = await confirmPhoneOtp(confirmationResult, otpCode);

      const response = await fetch('/api/auth/register-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: registerData.name,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kayıt olurken bir hata oluştu');
        setPhoneLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Doğrulama kodu yanlış veya süresi dolmuş');
      setPhoneLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-zinc-900/60 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm transform transition-all">
          <div className="flex items-center justify-between px-6 pt-5">
            <div className="flex items-center gap-2">
              {step === 'auth' && showRoleSelector && (
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label="Geri"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h3 className="text-lg font-medium text-zinc-900">
                  {step === 'role'
                    ? 'Hesap Türü Seçin'
                    : activeContext === 'admin'
                      ? registerOnly
                        ? 'Yönetici Kaydı'
                        : 'Yönetici Girişi'
                      : registerOnly
                        ? 'Site Sakini Kaydı'
                        : 'Site Sakini'}
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {step === 'role' ? 'Devam etmek için hesap türünüzü seçin' : 'LuxDues hesabınıza erişin'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'role' ? (
            <div className="px-6 py-10 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => selectRole('resident')}
                className="text-left p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-colors">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-zinc-900 group-hover:text-zinc-900">
                      Site Sakini
                    </span>
                  </div>
                  <svg
                    className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500">Daire sakinleri için giriş ve kayıt</p>
              </button>

              <button
                type="button"
                onClick={() => selectRole('admin')}
                className="text-left p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-colors">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-zinc-900 group-hover:text-zinc-900">
                      Yönetici
                    </span>
                  </div>
                  <svg
                    className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500">Blok/site yöneticisi için giriş ve kayıt</p>
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              {!registerOnly && (
                <div className="flex gap-1 px-6 mt-3 border-b border-zinc-200">
                  <button
                    onClick={() => switchTab('login')}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
                      className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        tab === 'register'
                          ? 'border-zinc-900 text-zinc-900'
                          : 'border-transparent text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      Kayıt Ol
                    </button>
                  )}
                </div>
              )}

              <div className="px-6 py-5">
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
                  !showPhoneForm ? (
                    <form onSubmit={handleLogin}>
                      <div className="form-group mb-3">
                        <Input
                          type="email"
                          label="E-posta"
                          placeholder="ornek@luxdues.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
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
                      {!registerOnly && canRegister && (
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
                      )}
                    </form>
                  ) : (
                    <form onSubmit={handleLogin}>
                      <div className="form-group mb-3">
                        <PhoneInput
                          label="Telefon Numarası"
                          value={loginData.phone}
                          onChange={(value) => setLoginData({ ...loginData, phone: value })}
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
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
                      {!registerOnly && canRegister && (
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
                      )}
                    </form>
                  )
                ) : !showPhoneForm ? (
                  <form onSubmit={handleRegister}>
                    <div className="form-group mb-3">
                      <Input
                        label="Ad Soyad"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group mb-3">
                      <Input
                        type="email"
                        label="E-posta"
                        placeholder="ornek@luxdues.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group mb-3">
                      <PhoneInput
                        label="Telefon"
                        value={registerData.phone}
                        onChange={(value) => setRegisterData({ ...registerData, phone: value })}
                        required
                      />
                    </div>
                    <div className="form-group mb-3">
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
                    {!registerOnly && (
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
                    )}
                    {activeContext === 'resident' && (
                      <p className="text-center text-xs text-zinc-500 mt-2">
                        Kayıt sonrası yöneticiniz sizi dairenizle eşleştirecektir.
                      </p>
                    )}
                  </form>
                ) : (
                  <form onSubmit={!otpSent ? handleRegister : handleRegisterConfirmOtp}>
                    <div className="form-group mb-3">
                      <Input
                        label="Ad Soyad"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        disabled={otpSent}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <PhoneInput
                        label="Telefon Numarası"
                        value={registerData.phone}
                        onChange={(value) => setRegisterData({ ...registerData, phone: value })}
                        required
                        disabled={otpSent}
                      />
                    </div>
                    <div className="form-group mb-3">
                      <Input
                        type="password"
                        label="Şifre"
                        placeholder="En az 6 karakter"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        disabled={otpSent}
                      />
                    </div>
                    {otpSent && (
                      <div className="form-group mb-3">
                        <Input
                          label="Doğrulama Kodu"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          required
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      loading={!otpSent ? loading : phoneLoading}
                      className="mt-2"
                    >
                      {!otpSent ? 'Doğrulama Kodu Gönder' : 'Kayıt Ol'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      className="mt-2"
                      onClick={() => {
                        setShowPhoneForm(false);
                        setOtpSent(false);
                        setOtpCode('');
                        setConfirmationResult(null);
                      }}
                    >
                      Vazgeç
                    </Button>
                    {!registerOnly && !otpSent && (
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
                    )}
                  </form>
                )}

                {(activeContext === 'resident' || activeContext === 'admin') && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-zinc-400">veya</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 border border-zinc-200 rounded-xl py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
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

                    <button
                      type="button"
                      onClick={() => {
                        setShowPhoneForm((prev) => !prev);
                      }}
                      className="w-full flex items-center justify-center gap-3 border border-zinc-200 rounded-xl py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors mb-3"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showPhoneForm ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        )}
                      </svg>
                      {showPhoneForm
                      ? tab === 'login'
                        ? 'E-posta ile Giriş Yap'
                        : 'E-posta ile Kayıt Ol'
                      : tab === 'login'
                        ? 'Telefon Numarası ile Giriş Yap'
                        : 'Telefon Numarası ile Kayıt Ol'}
                    </button>
                    {/* Invisible reCAPTCHA container required by Firebase phone auth */}
                    <div id="recaptcha-container" />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
