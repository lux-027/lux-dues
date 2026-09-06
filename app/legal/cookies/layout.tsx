import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez (Cookie) Politikası',
  description:
    'LuxDues platformunda kullanılan çerez türleri, zorunlu oturum çerezleri, tercih çerezleri ve çerezlerin yönetimi hakkında bilgilendirme.',
  alternates: { canonical: '/legal/cookies' },
  robots: { index: true, follow: true },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
