import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik ve Veri Güvenliği',
  description:
    'LuxDues platformunda veri gizliliği prensipleri, SSL/TLS şifreleme, parola güvenliği ve bilgi güvenliği standartları hakkında taahhüt metni.',
  alternates: { canonical: '/legal/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
