'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, reload, getIdToken } from 'firebase/auth';
import { verifyEmailActionCode } from '@/lib/firebase';

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
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setStatus('error');
      setMessage('Doğrulama kodu eksik.');
      return;
    }

    const code = oobCode;
    let cancelled = false;

    async function run() {
      try {
        const verifiedEmail = await verifyEmailActionCode(code);

        const auth = getAuth();
        if (auth.currentUser) {
          await reload(auth.currentUser);
        }

        const idToken = auth.currentUser ? await getIdToken(auth.currentUser, true) : null;

        if (cancelled) return;

        const pendingRaw = localStorage.getItem('pendingRegistration');
        const pending: PendingRegistration | null = pendingRaw ? JSON.parse(pendingRaw) : null;

        if (!pending || !idToken) {
          setStatus('success');
          setMessage(
            verifiedEmail
              ? `${verifiedEmail} adresi doğrulandı. Şimdi giriş yapabilirsiniz.`
              : 'E-posta adresiniz doğrulandı. Şimdi giriş yapabilirsiniz.'
          );
          return;
        }

        const endpoint =
          pending.role === 'admin' ? '/api/auth/register-admin' : '/api/auth/register';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            name: pending.name,
            phone: pending.phone,
          }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Kayıt tamamlanırken bir hata oluştu.');
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
