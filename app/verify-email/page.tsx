'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PendingRegistration {
  name: string;
  phone: string;
  role: 'resident' | 'admin';
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Doğrulama kodu eksik.');
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Doğrulama başarısız oldu.');
          return;
        }

        const pendingRaw = localStorage.getItem('pendingRegistration');
        const pending: PendingRegistration | null = pendingRaw ? JSON.parse(pendingRaw) : null;

        if (!pending) {
          setStatus('success');
          setMessage('E-posta adresiniz doğrulandı. Şimdi giriş yapabilirsiniz.');
          return;
        }

        const endpoint =
          pending.role === 'admin' ? '/api/auth/register-admin' : '/api/auth/register';

        const registerRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: data.idToken,
            name: pending.name,
            phone: pending.phone,
          }),
        });

        const registerData = await registerRes.json();

        if (cancelled) return;

        if (!registerRes.ok) {
          setStatus('error');
          setMessage(registerData.error || 'Kayıt tamamlanırken bir hata oluştu.');
          return;
        }

        localStorage.removeItem('pendingRegistration');
        setStatus('success');
        setMessage('Hesabınız oluşturuldu. Yönlendiriliyorsunuz...');

        if (pending.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Doğrulama başarısız oldu.');
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 mb-2">E-posta Doğrulama</h1>
      <p
        className={`text-sm ${
          status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-600' : 'text-zinc-500'
        }`}
      >
        {message}
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
